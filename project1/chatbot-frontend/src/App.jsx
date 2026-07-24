import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import './App.css'

let idCounter = 0
const nextId = () => `msg-${++idCounter}`

function createConversation() {
  return {
    id: `conv-${Date.now()}`,
    title: 'New chat',
    messages: [],
  }
}

export default function App() {
  const [conversations, setConversations] = useState([createConversation()])
  const [activeId, setActiveId] = useState(conversations[0].id)
  const [isLoading, setIsLoading] = useState(false)

  const activeConversation = conversations.find((c) => c.id === activeId)

  const updateConversation = (id, updater) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? updater(c) : c))
    )
  }

  const handleNewChat = () => {
    const conv = createConversation()
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
  }

  const handleSelect = (id) => {
    setActiveId(id)
  }

  const handleSend = async (text) => {
    const convId = activeId
    const userMessage = { id: nextId(), role: 'user', content: text }

    updateConversation(convId, (c) => ({
      ...c,
      title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
      messages: [...c.messages, userMessage],
    }))

    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversation_id: convId }),
      })
      const data = await res.json()

      const replyText = res.ok
        ? data.reply
        : `Error: ${data.error || 'Something went wrong.'}`

      updateConversation(convId, (c) => ({
        ...c,
        messages: [...c.messages, { id: nextId(), role: 'assistant', content: replyText }],
      }))
    } catch (err) {
      updateConversation(convId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { id: nextId(), role: 'assistant', content: 'Error: could not reach the server.' },
        ],
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
      />
      <ChatWindow
        messages={activeConversation.messages}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  )
}
