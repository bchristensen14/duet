import { useState, type FormEvent } from 'react'
import { Chip } from '../components/ui'
import { timeAgo } from '../lib/router'
import { uid, useStore } from '../lib/store'
import { DISCIPLINES, type Discipline } from '../types'

const STEPS = [
  ['Brief', 'Tell us the project, style, skills and timeline.'],
  ['AI sources', 'We filter candidates by discipline, style, location and availability.'],
  ['Humans vet', 'Our team reviews portfolios and judges creative chemistry.'],
  ['Shortlist', 'A few vetted, available collaborators, with intros already made.'],
]

export function Premium() {
  const { state, dispatch } = useStore()
  const [project, setProject] = useState('')
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [styles, setStyles] = useState('')
  const [timeline, setTimeline] = useState('')
  const [sent, setSent] = useState(false)

  const toggle = (d: Discipline) =>
    setDisciplines((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    dispatch({
      type: 'submitBrief',
      brief: {
        id: uid(),
        project: project.trim(),
        disciplines,
        styles: styles
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        timeline: timeline.trim(),
        createdAt: Date.now(),
      },
    })
    setProject('')
    setDisciplines([])
    setStyles('')
    setTimeline('')
    setSent(true)
  }

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Premium · €20 per search + 1% of project earnings</span>
        <h1>Let Duet do the search</h1>
        <p>Creatives don't want another search tool. They want the search done for them.</p>
      </div>
      <ol className="steps">
        {STEPS.map(([title, text], i) => (
          <li key={title} className={`card step${i === 3 ? ' dark' : ''}`}>
            <span className="step-n">{i + 1}</span>
            <strong>{title}</strong>
            <p>{text}</p>
          </li>
        ))}
      </ol>

      <form className="card form" onSubmit={submit}>
        <h2>Your brief</h2>
        <label>
          The project
          <textarea
            required
            rows={3}
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="e.g. A 20-minute chamber piece premiering in March. Need a string trio who reads contemporary scores."
          />
        </label>
        <fieldset>
          <legend>Who you need</legend>
          <div className="chips">
            {DISCIPLINES.map((d) => (
              <Chip key={d} active={disciplines.includes(d)} onClick={() => toggle(d)}>
                {d}
              </Chip>
            ))}
          </div>
        </fieldset>
        <div className="row">
          <label>
            Style
            <input value={styles} onChange={(e) => setStyles(e.target.value)} placeholder="minimalism, film score" />
          </label>
          <label>
            Timeline
            <input value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="Rehearsals from January" />
          </label>
        </div>
        <button className="primary" type="submit" disabled={!project.trim() || !disciplines.length}>
          Request a shortlist · €20
        </button>
        <small className="hint">
          Demo: no payment is taken and briefs stay in your browser. <a href="../#waitlist">Join the waitlist</a> for
          real searches.
        </small>
        {sent && <p className="success">Brief saved in this demo.</p>}
      </form>

      {state.briefs.length > 0 && (
        <>
          <h2 className="section-title">Your briefs</h2>
          <div className="briefs">
            {state.briefs.map((b) => (
              <article key={b.id} className="card brief">
                <div className="brief-top">
                  <span className="badge badge-limited">Demo</span>
                  <small className="muted">{timeAgo(b.createdAt)}</small>
                </div>
                <p>{b.project}</p>
                <small className="muted">
                  {b.disciplines.join(', ')}
                  {b.timeline && ` · ${b.timeline}`}
                </small>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
