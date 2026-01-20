import { z } from 'zod'

export const BentoConfigSchema = z.object({
  openRouterKey: z.string().min(1, 'OpenRouter API key is required'),
  port: z.number().default(3001),
  corsOrigins: z.array(z.string()).optional(),
  isolation: z.union([
    z.literal('none'),      // No isolation - shared DB (default)
    z.literal('session'),   // Automatic session-based isolation
    z.literal('custom')     // User provides isolation key via context
  ]).default('none'),
  vectorDB: z.object({
    path: z.string().default('./data/vectors'),
  }).optional(),
  upload: z.object({
    dir: z.string().default('./data/uploads'),
    maxFileSize: z.number().default(10 * 1024 * 1024), // 10MB
  }).optional(),
  siteUrl: z.string().optional(),
})

export type BentoConfig = z.infer<typeof BentoConfigSchema>