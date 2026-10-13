import type { CSSProperties } from 'react'
import { Avatar, AvailabilityBadge, Empty } from '../components/ui'
import { suggestMatches } from '../lib/match'
import { navigate } from '../lib/router'
import { useStore } from '../lib/store'

export function Matches() {
  const { state, me } = useStore()
  if (!me) return null
  const matches = suggestMatches(me, state.creatives, 8)

  return (
    <div className="page">
      <div className="page-head">
        <h1>Your matches</h1>
        <p>
          Suggested from what you make, who you're looking for, your styles and where you are. Update your{' '}
          <a href="#/me/edit">profile</a> to tune them.
        </p>
      </div>
      {!matches.length && (
        <Empty title="No strong matches yet">
          <p>Add more styles or collaborator types to your profile.</p>
        </Empty>
      )}
      <div className="matches">
        {matches.map((m, i) => (
          <article key={m.creative.id} className={`card match${i === 0 ? ' top' : ''}`}>
            <div className="match-score" style={{ '--pct': `${m.score}%` } as CSSProperties}>
              <span>{m.score}</span>
              <small>fit</small>
            </div>
            <div className="match-main">
              <button className="creative-head" onClick={() => navigate(`/people/${m.creative.id}`)}>
                <Avatar creative={m.creative} size={48} />
                <span>
                  <strong>{m.creative.name}</strong>
                  <small>
                    {m.creative.discipline} · {m.creative.location}
                  </small>
                </span>
              </button>
              <ul className="reasons">
                {m.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <div className="card-actions">
                <AvailabilityBadge value={m.creative.availability} />
                <span className="spacer" />
                <button className="ghost" onClick={() => navigate(`/people/${m.creative.id}`)}>
                  View work
                </button>
                <button className="primary" onClick={() => navigate(`/inbox/${m.creative.id}`)}>
                  Say hello
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <a className="card premium-banner" href="#/premium">
        <span>
          <small>PREMIUM</small>
          <strong>Got a real project and no time to search?</strong>
          <span>Send a brief and we'll hand you a vetted shortlist, intros already made.</span>
        </span>
        <span className="arrow">→</span>
      </a>
    </div>
  )
}
