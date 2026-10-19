import { useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Avatar, AvailabilityBadge } from '../components/ui'
import { EXAMPLES, findPath } from '../lib/ask'
import { findMatches, interpret, quote, type Hit, type HitKind, type Interpretation } from '../lib/interpret'
import { navigate } from '../lib/router'
import { useStore } from '../lib/store'

const KIND_LABEL: Record<HitKind, string> = {
  self: 'You',
  wanted: 'Looking for',
  style: 'Style',
  project: 'For',
  place: 'Where',
}
const KIND_ORDER: HitKind[] = ['self', 'wanted', 'style', 'project', 'place']

/** "Who are you looking for?" results: the visitor's own words, what we understood, and who fits. */
export function Find({ query }: { query: string }) {
  const { state, me } = useStore()
  const [draft, setDraft] = useState(query)
  const interp = useMemo(() => interpret(query), [query])
  const matches = useMemo(
    () => findMatches(interp, state.creatives.filter((c) => c.id !== me?.id)),
    [interp, state.creatives, me],
  )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (draft.trim()) navigate(findPath(draft))
  }

  const sayHello = (id: string) =>
    me ? navigate(`/inbox/${id}`) : navigate(`/start?q=${encodeURIComponent(query)}&next=${encodeURIComponent(`/inbox/${id}`)}`)

  return (
    <div className="page find">
      <form className="card find-request" onSubmit={submit}>
        <label htmlFor="find-text">What kind of collaboration are you looking for?</label>
        <textarea
          id="find-text"
          rows={3}
          maxLength={600}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder="e.g. I'm a singer-songwriter in Copenhagen looking for a producer for my first EP"
        />
        <div className="find-request-foot">
          <span className="muted">Say who you are, who you need and what it's for.</span>
          <button className="primary" type="submit" disabled={!draft.trim() || draft.trim() === query.trim()}>
            {query ? 'Update matches' : 'Show my matches'}
          </button>
        </div>
        {!query && (
          <div className="chips find-examples">
            {EXAMPLES.map((ex) => (
              <button key={ex.label} type="button" className="chip chip-btn" onClick={() => navigate(findPath(ex.text))}>
                {ex.label}
              </button>
            ))}
          </div>
        )}
      </form>

      {query && (
        <>
          <section className="card understood" aria-labelledby="understood-title">
            <h2 id="understood-title" className="label-title">
              What we picked up
            </h2>
            <p className="understood-text">
              <Highlighted text={interp.text} hits={interp.hits} />
            </p>
            <Legend interp={interp} />
          </section>

          <h2 className="section-title">
            {matches.length === 1 ? '1 person who fits' : matches.length ? `${matches.length} people who fit` : 'No one fits that yet'}
          </h2>

          {interp.missing.length > 0 && (
            <p className="find-missing">Nobody in the demo matches {orList(interp.missing.map((h) => quote(h.text)))} yet.</p>
          )}

          {!matches.length && !interp.missing.length && (
            <p className="muted">
              Try naming a role (producer, photographer, drummer…), a style or a city, or pick one of these:{' '}
              {EXAMPLES.slice(0, 2).map((ex, i) => (
                <span key={ex.label}>
                  {i > 0 && ' or '}
                  <a href={`#${findPath(ex.text)}`}>{ex.label.toLowerCase()}</a>
                </span>
              ))}
              .
            </p>
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
                        {m.creative.role ?? m.creative.discipline} · {m.creative.location}
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
                    <button className="primary" onClick={() => sayHello(m.creative.id)}>
                      Say hello
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="card find-cta">
            <div>
              <strong>Want Duet to find these people for real?</strong>
              <p className="muted">
                This demo matched your words against sample profiles. At launch, real creatives and our team do the search
                for you.
              </p>
            </div>
            <div className="find-cta-actions">
              {!me && (
                <button className="ghost" onClick={() => navigate(`/start?q=${encodeURIComponent(query)}`)}>
                  Create a demo profile
                </button>
              )}
              <a className="primary find-cta-link" href="../#waitlist">
                Join the waitlist
              </a>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

/** “a”, “a” or “b”, “a”, “b” or “c”; repeats dropped regardless of case. */
function orList(items: string[]): string {
  const unique = items.filter((w, i) => items.findIndex((x) => x.toLowerCase() === w.toLowerCase()) === i)
  return unique.length < 2 ? unique.join('') : `${unique.slice(0, -1).join(', ')} or ${unique[unique.length - 1]}`
}

function Highlighted({ text, hits }: { text: string; hits: Hit[] }) {
  const parts: ReactNode[] = []
  let at = 0
  for (const h of [...hits].sort((a, b) => a.start - b.start)) {
    if (h.start > at) parts.push(text.slice(at, h.start))
    parts.push(
      <mark key={h.start} className={`hl hl-${h.kind}`} title={KIND_LABEL[h.kind]}>
        {text.slice(h.start, h.end)}
      </mark>,
    )
    at = h.end
  }
  parts.push(text.slice(at))
  return <>{parts}</>
}

function Legend({ interp }: { interp: Interpretation }) {
  const rows = KIND_ORDER.map((kind) => {
    if (kind === 'wanted' && interp.inferred) {
      return { kind, label: 'Suggested', words: [...new Set(interp.wanted.map((w) => w.discipline.toLowerCase()))] }
    }
    // Keep the visitor's own spelling ("Copenhagen", "EP"); drop repeats regardless of case.
    const seen = new Set<string>()
    const words = interp.hits
      .filter((h) => h.kind === kind)
      .map((h) => h.text)
      .filter((w) => !seen.has(w.toLowerCase()) && seen.add(w.toLowerCase()))
    return { kind, label: KIND_LABEL[kind], words }
  }).filter((r) => r.words.length)

  if (!rows.length) {
    return <p className="muted">We didn't recognise any roles, styles or places in that. Try adding a few.</p>
  }
  return (
    <dl className="legend">
      {rows.map((r) => (
        <div key={r.kind} className="legend-row">
          <dt>{r.label}</dt>
          <dd>
            {r.words.map((w) => (
              <span key={w} className={`legend-chip hl-${r.kind}`}>
                {w}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  )
}
