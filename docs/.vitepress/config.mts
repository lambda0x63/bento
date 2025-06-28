import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Bento",
  description: "Add AI-powered chat to any app in minutes",
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/bento-icon.svg' }],
  ],
  
  themeConfig: {
    // Logo and branding
    logo: '🍱',
    
    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started' },
      { text: 'API', link: '/api-reference' },
      { text: 'GitHub', link: 'https://github.com/lambda0x63/bento' }
    ],

    // Sidebar
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is Bento?', link: '/' },
          { text: 'Getting Started', link: '/getting-started' },
          { text: 'Quick Start', link: '/quick-start' }
        ]
      },
      {
        text: 'Core Concepts',
        items: [
          { text: 'User Isolation', link: '/user-isolation' },
          { text: 'RAG System', link: '/rag-system' },
          { text: 'Configuration', link: '/configuration' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api-reference' },
          { text: 'Chat API', link: '/api/chat' },
          { text: 'Documents API', link: '/api/documents' }
        ]
      }
    ],

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lambda0x63/bento' },
      { icon: 'discord', link: 'https://discord.gg/bento' }
    ],

    // Search
    search: {
      provider: 'local'
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/lambda0x63/bento/edit/main/docs/:path'
    }
  }
})