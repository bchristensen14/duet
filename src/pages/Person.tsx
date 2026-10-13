import { Avatar, AvailabilityBadge, Chip, Empty, WorkCard } from '../components/ui'
import { scoreMatch } from '../lib/match'
import { navigate } from '../lib/router'
import { useStore } from '../lib/store'

export function Person({ id }: { id: string }) {
  const { state, me, dispatch, creative } = useStore()
  const person = creative(id)
  if (!person) {
    return (
      <div className="page">
        <Empty title="Profile not found">
          <a href="#/discover">Back to Discover</a>
        </Empty>
      </div>
    )
  }

  const isMe = person.id === me?.id
  const following = state.following.includes(person.id)
  const match = me && !isMe ? scoreMatch(me, person) : null
  const likes = person.portfolio.reduce((sum, w) => sum + (state.likes[w.id]?.length ?? 0), 0)

  return (
    <div className="page">
      <section className="card profile-hero">
        <Avatar creative={person} size={88} />
        <div className="profile-info">
          <h1>{person.name}</h1>
          <p className="muted">
            {person.discipline} · {person.location}
          </p>
          <p>{person.bio}</p>
          <div className="chips">
            {person.styles.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
          <p className="looking">
            Looking for: <strong>{person.lookingFor.join(', ')}</strong>
          </p>
          <div className="stats">
            <span>
              <strong>{person.portfolio.length}</strong> works
            </span>
            <span>
              <strong>{likes}</strong> likes
            </span>
            <AvailabilityBadge value={person.availability} />
          </div>
        </div>
        <div className="profile-actions">
          {isMe ? (
            <>
              <button className="secondary" onClick={() => navigate('/me/edit')}>
                Edit profile
              </button>
              <button className="ghost" onClick={() => navigate('/feed')}>
                Add work
              </button>
            </>
          ) : (
            me && (
              <>
                <button className="primary" onClick={() => navigate(`/inbox/${person.id}`)}>
                  Say hello
                </button>
                <button
                  className={following ? 'ghost' : 'secondary'}
                  onClick={() => dispatch({ type: 'toggleFollow', creativeId: person.id })}
                >
                  {following ? 'Following' : 'Follow'}
                </button>
              </>
            )
          )}
        </div>
      </section>

      {match && match.reasons.length > 0 && (
        <section className="card why">
          <h3>
            Why you two might click <span className="score-pill">{match.score}</span>
          </h3>
          <ul className="reasons">
            {match.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="section-title">Portfolio</h2>
      {person.portfolio.length ? (
        <div className="feed grid-feed">
          {person.portfolio.map((w) => (
            <div key={w.id} className="work-wrap">
              <WorkCard work={w} author={person} />
              {isMe && (
                <button className="link-danger" onClick={() => dispatch({ type: 'removeWork', id: w.id })}>
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Empty title={isMe ? 'Your portfolio is empty' : 'No work shared yet'}>
          {isMe && <a href="#/feed">Share your first piece</a>}
        </Empty>
      )}
    </div>
  )
}
