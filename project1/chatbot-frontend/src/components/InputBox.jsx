import { useRef, useState } from 'react'
import './InputBox.css'

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 19V5M12 5l-6 6M12 5l6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function InputBox({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleChange = (e) => {
    setValue(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`
    }
  }

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="composer">
      <div className="composer__box">
        <textarea
          ref={textareaRef}
          className="composer__textarea"
          placeholder="Message the assistant..."
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button
          className="composer__send"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
      <p className="composer__hint">The assistant can make mistakes. Check important info.</p>
    </div>
  )
}
