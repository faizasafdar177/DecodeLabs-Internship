import './MessageBubble.css'

function BotAvatar() {
  return (
    <div className="message__avatar message__avatar--bot" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
        <circle cx="9" cy="14" r="1" fill="white" stroke="none" />
        <circle cx="15" cy="14" r="1" fill="white" stroke="none" />
      </svg>
    </div>
  )
}

export default function MessageBubble({ role, content, isStreaming }) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="message message--user">
        <div className="message__bubble">{content}</div>
      </div>
    )
  }

  return (
    <div className="message message--assistant">
      <BotAvatar />
      <div className="message__content">
        {content}
        {isStreaming && <span className="message__cursor" aria-hidden="true" />}
      </div>
    </div>
  )
}
