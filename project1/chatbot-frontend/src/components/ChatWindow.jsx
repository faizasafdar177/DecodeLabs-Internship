import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import InputBox from './InputBox'
import './ChatWindow.css'

function EmptyState() {
  return (
    <div className="empty-state">
      <h1 className="empty-state__title">What can I help with?</h1>
    </div>
  )
}

export default function ChatWindow({ messages, onSend, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="chat-window">
      <div className="chat-window__scroll">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="chat-window__content">
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} isStreaming={m.isStreaming} />
            ))}
            {isLoading && (
              <MessageBubble role="assistant" content="" isStreaming />
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      <InputBox onSend={onSend} disabled={isLoading} />
    </div>
  )
}
