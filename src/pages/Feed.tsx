import { useState, type FormEvent } from 'react'
import { Avatar, Chip, WorkCard } from '../components/ui'
import { suggestMatches } from '../lib/match'
import { navigate } from '../lib/router'
import { uid, useStore } from '../lib/store'
import type { WorkKind } from '../types'

type Filter = 'all' | 'following' | WorkKind

export function Feed() {
  const { state, me } = useStore()
  const [filter, setFilter] = useState<Filter>('all')

  const posts = state.creatives
    .flatMap((c) => c.portfolio.map((work) => ({ work, author: c })))
    .filter(({ work, author }) => {
      if (filter === 'all') return true
      if (filter === 'following') return state.following.includes(author.id) || author.id === me?.id
      return work.kind === filter
    })
    .sort((a, b) => b.work.createdAt - a.work.createdAt)

  return (
    <div className="page">
      <div className="page-head">
        <h1>Showcase</h1>
        <p>New work from the community.</p>
      </div>
      <div className="feed-layout">
        <div>
          {me && <Composer />}
          <div className="chips filters">
            {(['all', 'following', 'audio', 'video', 'image', 'text'] as const).map((f) => (
              <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
                {f === 'all' ? 'Everything' : f === 'following' ? 'Following' : f[0].toUpperCase() + f.slice(1)}
              </Chip>
            ))}
          </div>
          <div className="feed">
            {posts.map(({ work, author }) => (
              <WorkCard key={work.id} work={work} author={author} />
            ))}
            {!posts.length && <p className="muted">Nothing here yet. Follow some creatives from Discover.</p>}
          </div>
        </div>
        {me && <SuggestedSidebar />}
      </div>
    </div>
  )
}

function SuggestedSidebar() {
  const { state, me } = useStore()
  if (!me) return null
  const top = suggestMatches(me, state.creatives, 3)
  return (
    <aside className="card sidebar">
      <h3>Suggested for you</h3>
      {top.map((m) => (
        <button key={m.creative.id} className="mini-match" onClick={() => navigate(`/people/${m.creative.id}`)}>
          <Avatar creative={m.creative} size={36} />
          <span>
            <strong>{m.creative.name}</strong>
            <small>{m.reasons[0] ?? m.creative.discipline}</small>
          </span>
          <span className="score-pill">{m.score}</span>
        </button>
      ))}
      <a href="#/matches" className="see-all">
        See all matches →
      </a>
    </aside>
  )
}

function Composer() {
  const { me, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<WorkKind>('audio')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  if (!me) return null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    dispatch({
      type: 'addWork',
      work: {
        id: uid(),
        kind,
        title: title.trim(),
        description: description.trim(),
        link: link.trim() || undefined,
        createdAt: Date.now(),
      },
    })
    setTitle('')
    setDescription('')
    setLink('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button className="card composer-closed" onClick={() => setOpen(true)}>
        <Avatar creative={me} size={36} />
        <span>Share something you made…</span>
      </button>
    )
  }

  return (
    <form className="card form composer" onSubmit={submit}>
      <div className="segmented">
        {(['audio', 'video', 'image', 'text'] as const).map((k) => (
          <button type="button" key={k} className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>
            {k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>
      <input required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="A line or two about it"
      />
      <input
        type="url"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Link (SoundCloud, YouTube, Drive…) optional"
      />
      <div className="form-actions">
        <button type="button" className="ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
        <button className="primary" type="submit" disabled={!title.trim()}>
          Post to portfolio
        </button>
      </div>
    </form>
  )
}
