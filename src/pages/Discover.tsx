import { useMemo, useState } from 'react'
import { Chip, CreativeCard } from '../components/ui'
import { navigate } from '../lib/router'
import { useStore } from '../lib/store'
import { DISCIPLINES, type Discipline } from '../types'

export function Discover() {
  const { state, me, dispatch } = useStore()
  const [query, setQuery] = useState('')
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [openOnly, setOpenOnly] = useState(false)
  const [nearMe, setNearMe] = useState(false)

  const myRegion = me?.location.split(',').pop()?.trim().toLowerCase()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.creatives.filter((c) => {
      if (c.id === me?.id) return false
      if (disciplines.length && !disciplines.includes(c.discipline)) return false
      if (openOnly && c.availability !== 'open') return false
      if (nearMe && myRegion && c.location.split(',').pop()?.trim().toLowerCase() !== myRegion) return false
      if (!q) return true
      return [c.name, c.discipline, c.location, c.bio, ...c.styles].join(' ').toLowerCase().includes(q)
    })
  }, [state.creatives, me, query, disciplines, openOnly, nearMe, myRegion])

  const toggle = (d: Discipline) =>
    setDisciplines((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))

  return (
    <div className="page">
      <div className="page-head">
        <h1>Discover</h1>
        <p>Find people in your scene by discipline, style and location.</p>
      </div>
      <div className="card search-panel">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search names, styles, places… try “film score” or “Los Angeles”"
          aria-label="Search creatives"
        />
        <div className="chips">
          {DISCIPLINES.map((d) => (
            <Chip key={d} active={disciplines.includes(d)} onClick={() => toggle(d)}>
              {d}
            </Chip>
          ))}
        </div>
        <div className="toggles">
          <label className="check">
            <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} />
            Open to projects
          </label>
          {me && (
            <label className="check">
              <input type="checkbox" checked={nearMe} onChange={(e) => setNearMe(e.target.checked)} />
              Near me
            </label>
          )}
          <span className="muted">{results.length} creatives</span>
        </div>
      </div>
      <div className="grid">
        {results.map((c) => {
          const following = state.following.includes(c.id)
          return (
            <CreativeCard key={c.id} creative={c}>
              {me && (
                <div className="card-actions">
                  <button
                    className={following ? 'ghost' : 'secondary'}
                    onClick={() => dispatch({ type: 'toggleFollow', creativeId: c.id })}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
                  <button className="ghost" onClick={() => navigate(`/inbox/${c.id}`)}>
                    Message
                  </button>
                </div>
              )}
            </CreativeCard>
          )
        })}
      </div>
      {!results.length && <p className="muted center">No one matches those filters yet.</p>}
    </div>
  )
}
