import './Sidebar.css'

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

export default function Sidebar({ conversations, activeId, onSelect, onNewChat }) {
  return (
    <aside className="sidebar">
      <button className="sidebar__new-chat" onClick={onNewChat}>
        <PlusIcon />
        <span>New chat</span>
      </button>

      <nav className="sidebar__list" aria-label="Conversation history">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            className={`sidebar__item ${conv.id === activeId ? 'sidebar__item--active' : ''}`}
            onClick={() => onSelect(conv.id)}
            title={conv.title}
          >
            <ChatIcon />
            <span className="sidebar__item-title">{conv.title}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">U</div>
          <span>Your account</span>
        </div>
      </div>
    </aside>
  )
}
