import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { navigate, timeAgo } from '../lib/router'
import { useStore } from '../lib/store'
import type { Availability, Creative, PortfolioItem, WorkKind } from '../types'

export { Logo }

export function Avatar({ creative, size = 44 }: { creative: Creative; size?: number }) {
  const initials = creative.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${creative.hue} 70% 62%), hsl(${(creative.hue + 40) % 360} 75% 52%))`,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}

const AVAILABILITY_LABEL: Record<Availability, string> = {
  open: 'Open to projects',
  limited: 'Limited availability',
  busy: 'Busy',
}

export function AvailabilityBadge({ value }: { value: Availability }) {
  return <span className={`badge badge-${value}`}>{AVAILABILITY_LABEL[value]}</span>
}

export function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  if (!onClick) return <span className="chip">{children}</span>
  return (
    <button type="button" className={`chip chip-btn${active ? ' active' : ''}`} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  )
}

const KIND_ICON: Record<WorkKind, string> = {
  audio: '♪',
  video: '▶',
  image: '◐',
  text: '¶',
}

export function WorkCover({ work, hue }: { work: PortfolioItem; hue: number }) {
  return (
    <div
      className={`cover cover-${work.kind}`}
      style={{
        background: `radial-gradient(circle at 25% 30%, hsl(${hue} 70% 60% / .9), transparent 60%), radial-gradient(circle at 80% 70%, hsl(${(hue + 60) % 360} 80% 60% / .8), transparent 55%), var(--ink)`,
      }}
    >
      <span className="cover-icon">{KIND_ICON[work.kind]}</span>
      <span className="cover-kind">{work.kind}</span>
    </div>
  )
}

export function WorkCard({ work, author }: { work: PortfolioItem; author: Creative }) {
  const { state, me, dispatch } = useStore()
  const likes = state.likes[work.id] ?? []
  const liked = !!me && likes.includes(me.id)
  return (
    <article className="card work-card">
      <button className="author-row" onClick={() => navigate(`/people/${author.id}`)}>
        <Avatar creative={author} size={36} />
        <span>
          <strong>{author.name}</strong>
          <small>
            {author.discipline} · {timeAgo(work.createdAt)}
          </small>
        </span>
      </button>
      <WorkCover work={work} hue={author.hue} />
      <div className="work-body">
        <h3>{work.title}</h3>
        <p>{work.description}</p>
        {work.link && (
          <a href={work.link} target="_blank" rel="noreferrer" className="work-link">
            Open work ↗
          </a>
        )}
      </div>
      <div className="work-actions">
        <button
          className={`like${liked ? ' liked' : ''}`}
          onClick={() => dispatch({ type: 'toggleLike', workId: work.id })}
          aria-pressed={liked}
        >
          {liked ? '♥' : '♡'} {likes.length || ''}
        </button>
        {me && author.id !== me.id && (
          <button className="ghost" onClick={() => navigate(`/inbox/${author.id}`)}>
            Say hello
          </button>
        )}
      </div>
    </article>
  )
}

export function CreativeCard({ creative, children }: { creative: Creative; children?: ReactNode }) {
  return (
    <article className="card creative-card">
      <button className="creative-head" onClick={() => navigate(`/people/${creative.id}`)}>
        <Avatar creative={creative} size={52} />
        <span>
          <strong>{creative.name}</strong>
          <small>
            {creative.discipline} · {creative.location}
          </small>
        </span>
      </button>
      <p className="bio">{creative.bio}</p>
      <div className="chips">
        {creative.styles.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
      </div>
      <AvailabilityBadge value={creative.availability} />
      {children}
    </article>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <Logo size={32} />
      <h3>{title}</h3>
      {children}
    </div>
  )
}
