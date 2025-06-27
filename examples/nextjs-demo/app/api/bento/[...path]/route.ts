import { createBentoServer } from 'bento-core'
import { NextRequest } from 'next/server'

let bentoServer: ReturnType<typeof createBentoServer> | null = null

function getBentoServer() {
  if (!bentoServer) {
    bentoServer = createBentoServer({
      openRouterKey: process.env.OPENROUTER_API_KEY!,
      isolation: 'session',
      vectorDB: {
        path: './data/vectors'
      },
      upload: {
        dir: './data/uploads',
        maxFileSize: 10 * 1024 * 1024 // 10MB
      },
      siteUrl: process.env.SITE_URL
    })
  }
  return bentoServer
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const server = getBentoServer()
  const path = '/' + resolvedParams.path.join('/')
  
  // Create a Request object that includes the path
  const url = new URL(request.url)
  url.pathname = path
  
  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
  })
  
  return server.fetch(modifiedRequest)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const server = getBentoServer()
  const path = '/' + resolvedParams.path.join('/')
  
  // Create a Request object that includes the path and body
  const url = new URL(request.url)
  url.pathname = path
  
  // Handle different content types
  const contentType = request.headers.get('content-type') || ''
  let body
  
  if (contentType.includes('multipart/form-data')) {
    // For file uploads, pass the request directly
    body = request.body
  } else {
    // For JSON requests, read the body
    body = await request.text()
  }
  
  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: body,
  })
  
  return server.fetch(modifiedRequest)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  const server = getBentoServer()
  const path = '/' + resolvedParams.path.join('/')
  
  // Create a Request object that includes the path
  const url = new URL(request.url)
  url.pathname = path
  
  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
  })
  
  return server.fetch(modifiedRequest)
}