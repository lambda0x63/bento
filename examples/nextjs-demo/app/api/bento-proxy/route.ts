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

export async function POST(request: NextRequest) {
  try {
    const server = getBentoServer()
    
    // Get the path from query parameter
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || ''
    
    console.log(`Handling POST request to ${path}`)
    
    // Create a Request object that includes the path
    const url = new URL(request.url)
    url.pathname = path
    
    const contentType = request.headers.get('content-type') || ''
    let body
    
    if (contentType.includes('multipart/form-data')) {
      body = request.body
    } else {
      body = await request.text()
    }
    
    const modifiedRequest = new Request(url.toString(), {
      method: 'POST',
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

export async function GET(request: NextRequest) {
  try {
    const server = getBentoServer()
    
    // Get the path from query parameter
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || ''
    
    console.log(`Handling GET request to ${path}`)
    
    // Create a Request object that includes the path
    const url = new URL(request.url)
    url.pathname = path
    
    const modifiedRequest = new Request(url.toString(), {
      method: 'GET',
      headers: request.headers,
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

export async function DELETE(request: NextRequest) {
  try {
    const server = getBentoServer()
    
    // Get the path from query parameter
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || ''
    
    console.log(`Handling DELETE request to ${path}`)
    
    // Create a Request object that includes the path
    const url = new URL(request.url)
    url.pathname = path
    
    const modifiedRequest = new Request(url.toString(), {
      method: 'DELETE',
      headers: request.headers,
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

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}