'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { 
  PlusIcon, 
  MoonIcon, 
  SunIcon, 
  PaperPlaneIcon,
  FileTextIcon,
  CopyIcon,
  ReloadIcon,
  MagicWandIcon,
  RocketIcon,
  ReaderIcon,
  LightningBoltIcon,
  ChatBubbleIcon,
  HamburgerMenuIcon,
  Cross2Icon,
  ArchiveIcon,
  TrashIcon,
  UploadIcon
} from '@radix-ui/react-icons'
import { ChatService, Message } from '@/services/chat'
import { DocumentService, Document } from '@/services/documents'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const chatService = new ChatService()
const documentService = new DocumentService()

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [currentModel, setCurrentModel] = useState('deepseek/deepseek-chat-v3')
  const [ragEnabled, setRagEnabled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentView, setCurrentView] = useState<'chat' | 'knowledge'>('chat')
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (currentView === 'knowledge') {
      loadDocuments()
    }
  }, [currentView])

  const loadDocuments = async () => {
    try {
      const { documents } = await documentService.listDocuments()
      setDocuments(documents)
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setUploadError(null)

    try {
      const response = await documentService.uploadDocument(file)
      console.log('Upload successful:', response)
      
      // Reload documents
      await loadDocuments()
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId)
      await loadDocuments()
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      // Optional: Add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleRegenerateMessage = async () => {
    // Find the last user message
    const lastUserMessageIndex = messages.findLastIndex(m => m.role === 'user')
    if (lastUserMessageIndex === -1) return

    // Remove all messages after the last user message
    const messagesUntilLastUser = messages.slice(0, lastUserMessageIndex + 1)
    setMessages(messagesUntilLastUser)

    // Regenerate the response
    const lastUserMessage = messages[lastUserMessageIndex]
    await generateResponse(lastUserMessage.content, messagesUntilLastUser)
  }

  const generateResponse = async (userInput: string, previousMessages: Message[]) => {
    setIsLoading(true)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      model: currentModel
    }

    setMessages(prev => [...prev, assistantMessage])

    await chatService.streamChat(
      { 
        messages: previousMessages.map(m => ({ role: m.role, content: m.content })).concat({ role: 'user', content: userInput }),
        model: currentModel,
        ragEnabled 
      },
      (chunk: string) => {
        setMessages(prev => 
          prev.map(m => 
            m.id === assistantMessage.id 
              ? { ...m, content: m.content + chunk }
              : m
          )
        )
      },
      () => {
        setIsLoading(false)
      },
      (error: string) => {
        console.error('Chat error:', error)
        setIsLoading(false)
        setMessages(prev => 
          prev.map(m => 
            m.id === assistantMessage.id 
              ? { ...m, content: `Error: ${error}` }
              : m
          )
        )
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    
    await generateResponse(userMessage.content, updatedMessages)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card/95 backdrop-blur-xl border-r transition-all duration-300 ease-in-out flex flex-col",
        "shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.1)] dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.05)]",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <MagicWandIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Bento</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8"
          >
            <Cross2Icon className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button 
            variant="default" 
            className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            onClick={() => {
              setMessages([])
              setCurrentView('chat')
            }}
          >
            <PlusIcon className="h-4 w-4" />
            New chat
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navigation Section */}
          <div className="px-3 pb-3">
            <div className="space-y-1">
              <Button
                variant={currentView === 'chat' ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setCurrentView('chat')}
              >
                <ChatBubbleIcon className="h-4 w-4" />
                Chat
              </Button>
              
              <Button
                variant={currentView === 'knowledge' ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setCurrentView('knowledge')}
              >
                <ArchiveIcon className="h-4 w-4" />
                Knowledge Management
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-3 h-px bg-border" />

          {/* Model & Settings Section - Scrollable */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-4">
              {/* Model Selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">AI Model</label>
                <select 
                  className="w-full mt-1.5 h-9 rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={currentModel}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentModel(e.target.value)}
                >
                  <option value="deepseek/deepseek-chat-v3">DeepSeek V3</option>
                </select>
              </div>

              {/* Settings */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-muted-foreground">Settings</h3>
                
                {/* RAG Toggle */}
                <div className="flex items-center justify-between py-1">
                  <label htmlFor="rag-mode" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                    <FileTextIcon className="h-4 w-4" />
                    RAG Mode
                  </label>
                  <Switch
                    id="rag-mode"
                    checked={ragEnabled}
                    onCheckedChange={setRagEnabled}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>

                {/* Theme Toggle */}
                <div className="flex items-center justify-between py-1">
                  <label htmlFor="theme-mode" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                    {theme === 'dark' ? (
                      <MoonIcon className="h-4 w-4" />
                    ) : (
                      <SunIcon className="h-4 w-4" />
                    )}
                    Dark Mode
                  </label>
                  <Switch
                    id="theme-mode"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
              </div>

              {/* Chat History (placeholder) */}
              <div className="space-y-3 pt-4">
                <h3 className="text-xs font-medium text-muted-foreground">Recent Chats</h3>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground hover:text-foreground">
                    <ChatBubbleIcon className="h-3 w-3 mr-2" />
                    No recent chats
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Sidebar Footer - Fixed at bottom */}
        <div className="mt-auto p-4 border-t space-y-2 bg-card/50">
          <p className="text-xs text-muted-foreground text-center">
            Powered by Bento
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs text-muted-foreground">by</span>
            <a 
              href="https://github.com/lambda0x63" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              lambda0x63
            </a>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle for Mobile/Desktop */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          "fixed top-3 left-3 z-40 h-9 w-9 rounded-lg shadow-md bg-background/90 backdrop-blur-sm",
          sidebarOpen && "opacity-0 pointer-events-none"
        )}
      >
        <HamburgerMenuIcon className="h-4 w-4" />
      </Button>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col relative transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "ml-0"
      )}>
        
        {currentView === 'chat' ? (
          <>
            {/* Chat View */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 mx-auto mb-6 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <RocketIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-semibold mb-3">Welcome to Bento</h2>
                  <p className="text-muted-foreground text-lg mb-8">Your AI assistant with RAG capabilities</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                      <h3 className="font-medium mb-1 flex items-center gap-2">
                        <ChatBubbleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Ask anything
                      </h3>
                      <p className="text-sm text-muted-foreground">Get help with coding, writing, analysis</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                      <h3 className="font-medium mb-1 flex items-center gap-2">
                        <ReaderIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Use RAG mode
                      </h3>
                      <p className="text-sm text-muted-foreground">Upload docs for context-aware answers</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                      <h3 className="font-medium mb-1 flex items-center gap-2">
                        <LightningBoltIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Switch models
                      </h3>
                      <p className="text-sm text-muted-foreground">Choose from 100+ AI models</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {messages.length > 0 && (
              <div className="py-8 space-y-4">
                {messages.map((message, index) => {
                  const isLastMessage = index === messages.length - 1
                  const isEmptyAssistant = message.role === 'assistant' && message.content === ''
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "group",
                        message.role === 'user' && "flex justify-end"
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <div className="flex gap-3 max-w-[85%]">
                          {/* Don't show icon if this is an empty message that will show loading */}
                          {!(isLastMessage && isEmptyAssistant && isLoading) && (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex-shrink-0 flex items-center justify-center">
                              <MagicWandIcon className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div className="space-y-2">
                            {message.content && (
                              <>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      p: ({ children }) => <p className="mb-3 last:mb-0 leading-7">{children}</p>,
                                      ul: ({ children }) => <ul className="mb-3 last:mb-0 list-disc pl-6">{children}</ul>,
                                      ol: ({ children }) => <ol className="mb-3 last:mb-0 list-decimal pl-6">{children}</ol>,
                                      li: ({ children }) => <li className="mb-1">{children}</li>,
                                      h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
                                      h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>,
                                      h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>,
                                      h4: ({ children }) => <h4 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h4>,
                                      h5: ({ children }) => <h5 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h5>,
                                      h6: ({ children }) => <h6 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h6>,
                                      blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-muted-foreground/30 pl-4 py-1 my-3 italic text-muted-foreground">
                                          {children}
                                        </blockquote>
                                      ),
                                      code: ({ className, children, ...props }: any) => {
                                        const match = /language-(\w+)/.exec(className || '')
                                        const inline = !match
                                        return inline ? (
                                          <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono" {...props}>
                                            {children}
                                          </code>
                                        ) : (
                                          <SyntaxHighlighter
                                            style={theme === 'dark' ? oneDark : undefined}
                                            language={match[1]}
                                            PreTag="div"
                                            className="rounded-lg my-3 text-sm"
                                            showLineNumbers={true}
                                            customStyle={{
                                              margin: 0,
                                              background: theme === 'dark' ? '' : '#f4f4f5',
                                              padding: '1rem',
                                            }}
                                          >
                                            {String(children).replace(/\n$/, '')}
                                          </SyntaxHighlighter>
                                        )
                                      },
                                      pre: ({ children }) => <>{children}</>,
                                      table: ({ children }) => (
                                        <div className="overflow-x-auto my-3">
                                          <table className="min-w-full border-collapse">{children}</table>
                                        </div>
                                      ),
                                      thead: ({ children }) => <thead className="border-b-2 border-border">{children}</thead>,
                                      tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
                                      tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
                                      th: ({ children }) => (
                                        <th className="px-4 py-2 text-left font-semibold text-sm">{children}</th>
                                      ),
                                      td: ({ children }) => <td className="px-4 py-2 text-sm">{children}</td>,
                                      a: ({ href, children }) => (
                                        <a
                                          href={href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline"
                                        >
                                          {children}
                                        </a>
                                      ),
                                      hr: () => <hr className="my-4 border-border" />,
                                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                      em: ({ children }) => <em className="italic">{children}</em>,
                                      del: ({ children }) => <del className="line-through">{children}</del>,
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleCopyMessage(message.content)}
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                  >
                                    <CopyIcon className="h-3 w-3" />
                                    Copy
                                  </button>
                                  {isLastMessage && (
                                    <>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <button 
                                        onClick={handleRegenerateMessage}
                                        disabled={isLoading}
                                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <ReloadIcon className="h-3 w-3" />
                                        Regenerate
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2.5 max-w-[85%]">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {isLoading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex-shrink-0 flex items-center justify-center">
                      <MagicWandIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="pt-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Fixed Input Area at Bottom */}
            <div className="border-t bg-background">
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={ragEnabled ? "Ask about your documents..." : "Ask Bento anything..."}
                    className="w-full min-h-[52px] max-h-[200px] pl-4 pr-12 py-3.5 bg-muted/50 border-0 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    disabled={isLoading}
                    rows={1}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
                    disabled={!input.trim() || isLoading}
                  >
                    <PaperPlaneIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
                  <p className="text-xs text-muted-foreground">
                    {currentModel.split('/')[1].replace('-', ' ')} • {input.length} / 4000
                  </p>
                </div>
              </form>
            </div>
          </>
        ) : (
          /* Knowledge Management View */
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto p-6">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Knowledge Management</h1>
                <p className="text-muted-foreground">Upload and manage documents for RAG-powered conversations</p>
              </div>

              {/* Upload Section */}
              <div 
                className={cn(
                  "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 mb-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer",
                  uploadingFile && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !uploadingFile && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingFile}
                />
                {uploadingFile ? (
                  <>
                    <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                    <h3 className="text-lg font-medium mb-2">Uploading...</h3>
                    <p className="text-sm text-muted-foreground">Please wait while we process your document</p>
                  </>
                ) : (
                  <>
                    <ArchiveIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                    <p className="text-sm text-muted-foreground mb-4">Drop files here or click to browse</p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 pointer-events-none">
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      Select Files
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Supports PDF, DOCX, TXT files (Max 10MB)</p>
                  </>
                )}
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-destructive">{uploadError}</p>
                </div>
              )}

              {/* Documents List */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Uploaded Documents</h2>
                {documents.length === 0 ? (
                  <div className="border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Upload documents to enable RAG mode</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.source} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <FileTextIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                              <h3 className="font-medium">{doc.source}</h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Type: {doc.fileType.toUpperCase()}</span>
                              <span>Chunks: {doc.chunks.length}</span>
                              <span>Created: {new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (doc.chunks[0]) {
                                const baseId = doc.chunks[0].id.split('-chunk-')[0]
                                if (confirm(`Delete "${doc.source}"?`)) {
                                  handleDeleteDocument(baseId)
                                }
                              }
                            }}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}