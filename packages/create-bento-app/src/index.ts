#!/usr/bin/env node

import { program } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import fs from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

interface ProjectOptions {
  projectName: string
  framework: 'react' | 'nextjs' | 'sveltekit' | 'vue' | 'custom'
  installDeps: boolean
}

const FRAMEWORK_COMMANDS = {
  react: 'npm create vite@latest {{PROJECT_NAME}} -- --template react-ts',
  nextjs: 'npx create-next-app@latest {{PROJECT_NAME}} --typescript --tailwind --app',
  sveltekit: 'npx sv create {{PROJECT_NAME}}',
  vue: 'npm create vue@latest {{PROJECT_NAME}}',
}

const FRAMEWORK_INTEGRATION_GUIDES = {
  react: `
// src/services/bento.ts
import { createBentoServer } from 'bento-core';

// Run Bento on a separate port
const server = createBentoServer({
  openRouterKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  port: 3001,
  corsOrigins: ['http://localhost:5173'],
});

server.start();

// Use in your components
const response = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
});
`,

  nextjs: `
// app/api/bento/[...path]/route.ts
import { createBentoServer } from 'bento-core';
import { NextRequest } from 'next/server';

const server = createBentoServer({
  openRouterKey: process.env.OPENROUTER_API_KEY!,
  corsOrigins: ['http://localhost:3000'],
});

export async function GET(request: NextRequest) {
  return server.fetch(request as any);
}

export async function POST(request: NextRequest) {
  return server.fetch(request as any);
}
`,

  sveltekit: `
// src/hooks.server.ts
import { createBentoServer } from 'bento-core';
import type { Handle } from '@sveltejs/kit';

const server = createBentoServer({
  openRouterKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  corsOrigins: ['http://localhost:5173'],
});

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api/bento')) {
    return server.fetch(event.request);
  }
  
  return resolve(event);
};
`,

  vue: `
// src/services/bento.ts
import { createBentoServer } from 'bento-core';

// Run Bento on a separate port
const server = createBentoServer({
  openRouterKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  port: 3001,
  corsOrigins: ['http://localhost:5173'],
});

server.start();

// Use in your components
const response = await fetch('http://localhost:3001/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages })
});
`
}

async function createIntegrationGuide(projectPath: string, framework: string) {
  const guidePath = path.join(projectPath, 'BENTO_INTEGRATION.md')
  
  const guide = `# Bento Integration Guide

Welcome to Bento! Here's how to integrate Bento into your ${framework} app.

## 1. Install Bento

\`\`\`bash
npm install bento-core
\`\`\`

## 2. Set up environment variables

Create or update your \`.env\` file:

\`\`\`
# Required
${framework === 'nextjs' ? 'OPENROUTER_API_KEY' : 'VITE_OPENROUTER_API_KEY'}=your-api-key-here

# Optional
PORT=3001
VECTOR_DB_PATH=./data/vectors
UPLOAD_DIR=./data/uploads
MAX_FILE_SIZE=10485760
SITE_URL=http://localhost:3001
\`\`\`

Get your API key at: https://openrouter.ai/keys

## 3. Add Bento to your app

${FRAMEWORK_INTEGRATION_GUIDES[framework as keyof typeof FRAMEWORK_INTEGRATION_GUIDES] || '// Custom integration code here'}

## 4. Create your chat UI

You can now use the Bento API endpoints:
- POST /api/chat - Send chat messages
- POST /api/documents/upload - Upload documents for RAG
- GET /api/documents - List uploaded documents
- POST /api/documents/search - Search documents

## Example Chat Component

\`\`\`typescript
const sendMessage = async (message: string) => {
  const response = await fetch('${framework === 'nextjs' ? '/api/bento' : 'http://localhost:3001'}/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: message }],
      stream: true
    })
  });

  // Handle streaming response
  const reader = response.body?.getReader();
  // ... process stream
};
\`\`\`

## Features

- ✅ 100+ AI models via OpenRouter
- ✅ Streaming responses
- ✅ RAG (Retrieval-Augmented Generation)
- ✅ Document upload and search
- ✅ Zero external dependencies (uses LanceDB)

## Need Help?

- Documentation: https://github.com/lambda0x63/bento
- Examples: Check the examples folder in the Bento repository

Happy coding! 🚀
`

  await fs.writeFile(guidePath, guide)
}

async function createProject(options: ProjectOptions) {
  const spinner = ora('Creating your project...').start()

  try {
    // Run framework-specific create command
    if (options.framework !== 'custom') {
      const command = FRAMEWORK_COMMANDS[options.framework].replace('{{PROJECT_NAME}}', options.projectName)
      
      spinner.text = `Running ${options.framework} setup...`
      execSync(command, { stdio: 'inherit' })
    } else {
      // For custom, just create the directory
      await fs.mkdir(options.projectName, { recursive: true })
    }

    spinner.text = 'Adding Bento integration...'
    
    // Create integration guide
    await createIntegrationGuide(options.projectName, options.framework)

    // Update package.json to include bento-core
    const packageJsonPath = path.join(options.projectName, 'package.json')
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
      packageJson.dependencies = packageJson.dependencies || {}
      packageJson.dependencies['bento-core'] = '^0.1.0'
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
    } catch {
      // If no package.json, framework setup might have failed
    }

    spinner.succeed('Project created successfully!')

    // Install dependencies
    if (options.installDeps && options.framework !== 'custom') {
      const installSpinner = ora('Installing dependencies...').start()
      try {
        execSync('npm install', {
          cwd: options.projectName,
          stdio: 'ignore'
        })
        installSpinner.succeed('Dependencies installed!')
      } catch (error) {
        installSpinner.fail('Failed to install dependencies')
        console.log(chalk.yellow('\nYou can install them manually by running:'))
        console.log(chalk.cyan(`cd ${options.projectName} && npm install`))
      }
    }

    // Success message
    console.log('\n' + chalk.green('✨ Your Bento-powered app is ready!'))
    console.log('\nNext steps:')
    console.log(chalk.cyan(`  cd ${options.projectName}`))
    if (!options.installDeps) {
      console.log(chalk.cyan('  npm install'))
    }
    console.log(chalk.cyan('  # Add your OpenRouter API key to .env'))
    console.log(chalk.cyan('  # Check BENTO_INTEGRATION.md for setup instructions'))
    console.log(chalk.cyan('  npm run dev'))

  } catch (error) {
    spinner.fail('Failed to create project')
    console.error(error)
    process.exit(1)
  }
}

async function main() {
  console.log(chalk.bold.green('\n🚀 Create Bento App\n'))
  console.log(chalk.gray('Add AI-powered chat to any app in minutes\n'))

  // Get project details
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      default: 'my-bento-app',
      validate: (input: string) => {
        if (/^[a-zA-Z0-9-_]+$/.test(input)) return true
        return 'Project name can only contain letters, numbers, hyphens, and underscores'
      }
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Which framework would you like to use?',
      choices: [
        { name: '⚛️  React (Vite)', value: 'react' },
        { name: '▲ Next.js', value: 'nextjs' },
        { name: '🟧 SvelteKit', value: 'sveltekit' },
        { name: '💚 Vue', value: 'vue' },
        { name: '🛠️  Custom (I\'ll set up my own framework)', value: 'custom' }
      ]
    }
  ])

  // Check if directory exists
  try {
    await fs.access(answers.projectName)
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Directory ${answers.projectName} already exists. Overwrite?`,
        default: false
      }
    ])

    if (!overwrite) {
      console.log(chalk.red('Cancelled'))
      process.exit(0)
    }

    await fs.rm(answers.projectName, { recursive: true })
  } catch {
    // Directory doesn't exist, which is good
  }

  // Install dependencies?
  const { installDeps } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'installDeps',
      message: 'Install dependencies now?',
      default: true
    }
  ])

  // Create the project
  await createProject({
    projectName: answers.projectName,
    framework: answers.framework,
    installDeps
  })
}

program
  .name('create-bento-app')
  .description('Add AI-powered chat to any app')
  .version('0.1.0')
  .action(main)

program.parse()