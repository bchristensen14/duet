import { useRef, useState, type FormEvent } from 'react'
import { EXAMPLES, findPath } from '../lib/ask'

/** Hero box: describe the collaboration, then see matching people in the demo. */
export function AskBox() {
  const [text, setText] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      ref.current?.focus()
      return
    }
    window.location.assign(`./demo/#${findPath(text)}`)
  }

  return (
    <div className="ask-wrap">
      <form className="ask" onSubmit={submit}>
        <label htmlFor="ask-text" className="ask-label">
          What kind of collaboration are you looking for?
        </label>
        <textarea
          id="ask-text"
          ref={ref}
          rows={3}
          maxLength={600}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder="e.g. I'm a singer-songwriter in Copenhagen looking for a producer for my first EP"
        />
        <div className="ask-foot">
          <span className="ask-hint">Who you are, who you need, and what it's for.</span>
          <button className="btn btn-dark" type="submit">
            Show my matches →
          </button>
        </div>
      </form>
      <ul className="ask-examples" aria-label="Examples">
        {EXAMPLES.map((ex) => (
          <li key={ex.label}>
            <button
              type="button"
              onClick={() => {
                setText(ex.text)
                ref.current?.focus()
              }}
            >
              {ex.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
