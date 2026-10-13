import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Avatar, Empty } from '../components/ui'
import { navigate, timeAgo } from '../lib/router'
import { uid, useStore } from '../lib/store'

export function Inbox({ withId }: { withId?: string }) {
  const { state, me, creative } = useStore()
  if (!me) return null

  // Group messages into one thread per other person, newest first.
  const threads = new Map<string, number>()
  for (const m of state.messages) {
    if (m.from !== me.id && m.to !== me.id) continue
    const other = m.from === me.id ? m.to : m.from
    threads.set(other, Math.max(threads.get(other) ?? 0, m.sentAt))
  }
  if (withId && !threads.has(withId)) threads.set(withId, Infinity)
  const ordered = [...threads.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)

  return (
    <div className="page">
      <div className="page-head">
        <h1>Messages</h1>
      </div>
      <div className={`card inbox${withId ? ' has-thread' : ''}`}>
        <nav className="threads">
          {ordered.map((id) => {
            const c = creative(id)
            if (!c) return null
            const last = [...state.messages]
              .reverse()
              .find((m) => (m.from === id && m.to === me.id) || (m.to === id && m.from === me.id))
            return (
              <button
                key={id}
                className={`thread-item${id === withId ? ' active' : ''}`}
                onClick={() => navigate(`/inbox/${id}`)}
              >
                <Avatar creative={c} size={40} />
                <span>
                  <strong>{c.name}</strong>
                  <small>{last ? last.body : 'New conversation'}</small>
                </span>
              </button>
            )
          })}
          {!ordered.length && (
            <Empty title="No conversations yet">
              <p>
                Check your <a href="#/matches">matches</a> and say hello.
              </p>
            </Empty>
          )}
        </nav>
        {withId ? <Thread otherId={withId} /> : <div className="thread placeholder muted">Pick a conversation</div>}
      </div>
    </div>
  )
}

function Thread({ otherId }: { otherId: string }) {
  const { state, me, dispatch, creative } = useStore()
  const [body, setBody] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const other = creative(otherId)
  const messages = state.messages.filter(
    (m) => (m.from === me?.id && m.to === otherId) || (m.from === otherId && m.to === me?.id),
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  if (!me || !other) return null

  const send = (e: FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    dispatch({
      type: 'sendMessage',
      message: { id: uid(), from: me.id, to: otherId, body: body.trim(), sentAt: Date.now() },
    })
    setBody('')
  }

  const icebreaker = `Hi ${other.name.split(' ')[0]}! I'm ${/^[aeiou]/i.test(me.discipline) ? 'an' : 'a'} ${me.discipline.toLowerCase()} in ${me.location.split(',')[0]}. I loved "${other.portfolio[0]?.title ?? 'your work'}" and think we could make something together. Up for a chat?`

  return (
    <section className="thread">
      <header className="thread-head">
        <button className="ghost small back" onClick={() => navigate('/inbox')} aria-label="Back to conversations">
          ←
        </button>
        <button className="creative-head" onClick={() => navigate(`/people/${other.id}`)}>
          <Avatar creative={other} size={36} />
          <span>
            <strong>{other.name}</strong>
            <small>{other.discipline}</small>
          </span>
        </button>
      </header>
      <div className="messages">
        {!messages.length && (
          <div className="icebreaker">
            <p className="muted">Not sure how to start? Cold DMs go unanswered; specific ones don't.</p>
            <button className="ghost small" onClick={() => setBody(icebreaker)}>
              Use a suggested opener
            </button>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.from === me.id ? 'mine' : 'theirs'}`}>
            <p>{m.body}</p>
            <small>{timeAgo(m.sentAt)}</small>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="composer-bar" onSubmit={send}>
        <textarea
          rows={1}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) send(e)
          }}
          placeholder={`Message ${other.name.split(' ')[0]}…`}
          aria-label="Message"
        />
        <button className="primary" type="submit" disabled={!body.trim()}>
          Send
        </button>
      </form>
    </section>
  )
}
