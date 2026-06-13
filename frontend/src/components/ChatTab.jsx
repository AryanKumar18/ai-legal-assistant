import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import api from '../services/api'

export default function ChatTab({ document, darkMode }) {
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    fetchSessions()
  }, [document.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchSessions = async () => {
    try {
      const response = await api.get(`/chat/sessions/${document.id}`)
      setSessions(response.data)
      if (response.data.length > 0) {
        selectSession(response.data[0])
      }
    } catch (err) {
      console.error('Failed to fetch sessions', err)
    }
  }

  const selectSession = async (session) => {
    setActiveSession(session)
    try {
      const response = await api.get(`/chat/messages/${session.id}`)
      setMessages(response.data)
    } catch (err) {
      console.error('Failed to fetch messages', err)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await api.post('/chat/sessions', {
        document_id: document.id,
        title: 'New Chat'
      })
      const newSession = response.data
      setSessions(prev => [newSession, ...prev])
      setActiveSession(newSession)
      setMessages([])
      inputRef.current?.focus()
    } catch (err) {
      console.error('Failed to create session', err)
    }
  }

  const deleteSession = async (e, sessionId) => {
    e.stopPropagation()
    try {
      await api.delete(`/chat/sessions/${sessionId}`)
      const updated = sessions.filter(s => s.id !== sessionId)
      setSessions(updated)
      if (activeSession?.id === sessionId) {
        setActiveSession(null)
        setMessages([])
        if (updated.length > 0) selectSession(updated[0])
      }
    } catch (err) {
      console.error('Failed to delete session', err)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    let sessionId = activeSession?.id

    if (!sessionId) {
      const response = await api.post('/chat/sessions', {
        document_id: document.id,
        title: 'New Chat'
      })
      const newSession = response.data
      setSessions(prev => [newSession, ...prev])
      setActiveSession(newSession)
      sessionId = newSession.id
    }

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await api.post('/chat/message', {
        question: input,
        session_id: sessionId
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.answer
      }])
      fetchSessions()
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not process your question. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Theme classes
  const t = {
    sidebar: darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-gray-300',
    sidebarText: darkMode ? 'text-gray-300' : 'text-gray-700',
    sidebarMuted: darkMode ? 'text-gray-500' : 'text-gray-400',
    sidebarHover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200',
    sidebarActive: darkMode ? 'bg-gray-700 text-white' : 'bg-white text-indigo-600 shadow-sm',
    sidebarInactive: darkMode ? 'text-gray-400' : 'text-gray-600',
    sidebarBottom: darkMode ? 'border-gray-700' : 'border-gray-300',
    chat: darkMode ? 'bg-gray-800' : 'bg-white',
    chatText: darkMode ? 'text-gray-100' : 'text-gray-800',
    chatMuted: darkMode ? 'text-gray-400' : 'text-gray-400',
    inputBg: darkMode ? 'bg-gray-700 border-gray-600 focus-within:border-indigo-500' : 'bg-gray-50 border-gray-200 focus-within:border-indigo-300 focus-within:bg-white',
    inputText: darkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400',
    assistantBg: darkMode ? 'text-gray-200' : 'text-gray-800',
    divider: darkMode ? 'border-gray-600' : 'border-gray-300',
    suggestionBtn: darkMode
      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-indigo-500 hover:text-indigo-400'
      : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600',
  }

  return (
    <div className={`flex h-[calc(100vh-96px)] -mx-8 -mb-8 -mt-8`}>

      {/* Left Sidebar */}
      <div className={`w-56 flex flex-col h-full border-r-2 ${t.sidebar} ${t.divider}`}>

        {/* Header with theme toggle */}
        <div className="p-3 pt-4 flex items-center justify-between">
          <button
            onClick={createNewSession}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition flex-1 ${t.sidebarText} ${t.sidebarHover}`}
          >
            <span className="text-base font-light">+</span>
            <span>New chat</span>
          </button>

         
        </div>

        {/* Divider */}
        <div className={`mx-3 border-t ${t.divider}`} />

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {sessions.length === 0 ? (
            <p className={`text-xs text-center mt-4 ${t.sidebarMuted}`}>No chats yet</p>
          ) : (
            <>
              <p className={`text-xs px-3 py-1 uppercase tracking-wider mb-1 ${t.sidebarMuted}`}>
                Recent
              </p>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group transition mb-0.5 ${
                    activeSession?.id === session.id
                      ? t.sidebarActive
                      : `${t.sidebarInactive} ${t.sidebarHover}`
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">💬</span>
                    <span className="text-xs truncate">{session.title}</span>
                  </div>
                  <button
                    onClick={(e) => deleteSession(e, session.id)}
                    className={`opacity-0 group-hover:opacity-100 text-xs transition flex-shrink-0 ml-1 hover:text-red-400 ${t.sidebarMuted}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Document name at bottom */}
        <div className={`p-3 border-t-2 ${t.divider}`}>
          <p className={`text-xs truncate ${t.sidebarMuted}`}>
            📄 {document.original_filename}
          </p>
        </div>
      </div>

      {/* Right — Chat Area */}
      <div className={`flex-1 flex flex-col ${t.chat} transition-colors duration-200`}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${t.chatText}`}>
                Ask anything about this document
              </h3>
              <p className={`text-sm max-w-sm ${t.chatMuted}`}>
                I can answer questions, find specific clauses, explain terms, and analyze the content.
              </p>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {[
                  'Summarize this document',
                  'What are the key terms?',
                  'Are there any risk clauses?',
                  'Who are the parties involved?'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className={`text-xs px-3 py-2 border rounded-full transition ${t.suggestionBtn}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">⚖️</span>
                    </div>
                  )}

                  <div className={`max-w-[75%] ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm'
                      : `text-sm ${t.assistantBg}`
                  }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          h1: ({ children }) => <h1 className={`font-bold text-base mb-2 mt-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{children}</h1>,
                          h2: ({ children }) => <h2 className={`font-bold text-sm mb-2 mt-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{children}</h2>,
                          h3: ({ children }) => <h3 className={`font-semibold text-sm mb-1 mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{children}</h3>,
                          hr: () => <hr className={`my-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`} />,
                          code: ({ children }) => <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{children}</code>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs font-bold">U</span>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">⚖️</span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`px-6 py-4 border-t-2 ${t.divider} ${t.chat}`}>
          <div className="max-w-3xl mx-auto">
            <div className={`flex items-end gap-3 border-2 rounded-2xl px-4 py-3 transition ${t.inputBg}`}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about this document..."
                rows={1}
                className={`flex-1 bg-transparent text-sm resize-none focus:outline-none leading-relaxed ${t.inputText}`}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition ${
                  input.trim() && !loading
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
            <p className={`text-xs text-center mt-2 ${t.chatMuted}`}>
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}