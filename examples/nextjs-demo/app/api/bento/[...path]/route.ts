import { createBentoServer } from '@/lib/bento-core/src'
import { NextRequest, NextResponse } from 'next/server'

let bentoServer: ReturnType<typeof createBentoServer> | null = null

function getBentoServer() {
  if (!bentoServer) {
    try {
      bentoServer = createBentoServer({
        openRouterKey: process.env.OPENROUTER_API_KEY!,
        isolation: 'session',
        vectorDB: {
          path: process.env.VERCEL ? '/tmp/vectors' : './data/vectors'
        },
        upload: {
          dir: process.env.VERCEL ? '/tmp/uploads' : './data/uploads',
          maxFileSize: 10 * 1024 * 1024 // 10MB
        },
        siteUrl: process.env.SITE_URL || process.env.VERCEL_URL
      })
    } catch (error) {
      console.error('Failed to create Bento server:', error)
      throw error
    }
  }
  return bentoServer
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] }
) {
  try {
    const server = getBentoServer()
    const path = '/' + params.path.join('/')
    
    console.log(`Handling ${request.method} request to ${path}`)
    
    // Create a Request object that includes the path
    const url = new URL(request.url)
    url.pathname = path
    
    let body = undefined
    
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type') || ''
      
      if (contentType.includes('multipart/form-data')) {
        body = request.body
      } else {
        body = await request.text()
      }
    }
    
    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: body,
    })
    
    const response = await server.fetch(modifiedRequest)
    
    // Clone the response to add CORS headers
    const headers = new Headers(response.headers)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    })
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return handleRequest(request, resolvedParams)
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}