import { useState, type FormEvent } from 'react'
import { Chip, Logo } from '../components/ui'
import { interpret } from '../lib/interpret'
import { navigate } from '../lib/router'
import { uid, useStore } from '../lib/store'
import { DISCIPLINES, type Availability, type Creative, type Discipline } from '../types'

/** Profile fields guessed from what a visitor typed into "What kind of collaboration are you looking for?". */
function prefillFrom(query: string) {
  const it = interpret(query)
  const place = it.place
  return {
    discipline: it.self[0]?.discipline ?? (it.business ? ('Brand / business' as const) : undefined),
    location: place?.city ? `${place.city}, ${place.country}` : '',
    bio: it.text.trim(),
    styles: [...new Set(it.styles.map((s) => s.token))].join(', '),
    lookingFor: [...new Set(it.wanted.map((w) => w.discipline))],
  }
}

export function ProfileForm({ onboarding, prefillQuery, next }: { onboarding?: boolean; prefillQuery?: string; next?: string }) {
  const { me, dispatch } = useStore()
  const [pre] = useState(() => (!me && prefillQuery?.trim() ? prefillFrom(prefillQuery) : null))
  const [name, setName] = useState(me?.name ?? '')
  const [discipline, setDiscipline] = useState<Discipline>(me?.discipline ?? pre?.discipline ?? 'Composer')
  const [location, setLocation] = useState(me?.location ?? pre?.location ?? '')
  const [bio, setBio] = useState(me?.bio ?? pre?.bio ?? '')
  const [styles, setStyles] = useState(me?.styles.join(', ') ?? pre?.styles ?? '')
  const [lookingFor, setLookingFor] = useState<Discipline[]>(me?.lookingFor ?? pre?.lookingFor ?? [])
  const [availability, setAvailability] = useState<Availability>(me?.availability ?? 'open')

  const toggle = (d: Discipline) =>
    setLookingFor((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]))

  const fillWilliam = () => {
    setName('William Hart')
    setDiscipline('Composer')
    setLocation('Los Angeles, CA')
    setBio(
      "Classical composer, 23. Just out of music school and missing the people I used to write for. Looking for performers who want to premiere new work.",
    )
    setStyles('contemporary classical, chamber, film score')
    setLookingFor(['Instrumentalist', 'Vocalist', 'Choreographer'])
    setAvailability('open')
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const profile: Creative = {
      id: me?.id ?? `me-${uid()}`,
      name: name.trim(),
      discipline,
      location: location.trim(),
      bio: bio.trim(),
      styles: styles
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
      lookingFor,
      availability,
      portfolio: me?.portfolio ?? [],
      hue: me?.hue ?? Math.floor(Math.random() * 360),
    }
    dispatch({ type: 'saveProfile', profile })
    // `next` only ever comes from our own links (e.g. "Say hello" on a match); keep it to in-app paths.
    navigate(next?.startsWith('/') ? next : onboarding ? '/matches' : `/people/${profile.id}`)
  }

  return (
    <div className={onboarding ? 'onboarding' : 'page narrow'}>
      {onboarding && (
        <header className="hero">
          <a href="../" className="back-home">
            ← About Duet
          </a>
          <Logo size={44} />
          <h1>Duet Community</h1>
          <p>Show your work, find your scene, and meet the people you should be making things with.</p>
          <p className="demo-note">A demo with sample profiles. Nothing you enter leaves your browser.</p>
          {pre && <p className="demo-note prefilled">We filled this in from what you typed. Add your name and check it over.</p>}
        </header>
      )}
      <form className="card form" onSubmit={submit}>
        <div className="form-head">
          <h2>{onboarding ? 'Create your profile' : 'Edit profile'}</h2>
          {onboarding && (
            <button type="button" className="ghost small" onClick={fillWilliam}>
              Try as William
            </button>
          )}
        </div>
        <label>
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
        <div className="row">
          <label>
            I am a
            <select value={discipline} onChange={(e) => setDiscipline(e.target.value as Discipline)}>
              {DISCIPLINES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Based in
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or Country"
            />
          </label>
        </div>
        <label>
          About you
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="What do you make? What kind of project are you hoping for?"
          />
        </label>
        <label>
          Styles and genres
          <input
            value={styles}
            onChange={(e) => setStyles(e.target.value)}
            placeholder="e.g. contemporary classical, film score, ambient"
          />
          <small>Comma separated. These power your matches.</small>
        </label>
        <fieldset>
          <legend>I want to collaborate with</legend>
          <div className="chips">
            {DISCIPLINES.map((d) => (
              <Chip key={d} active={lookingFor.includes(d)} onClick={() => toggle(d)}>
                {d}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Availability</legend>
          <div className="segmented">
            {(['open', 'limited', 'busy'] as const).map((a) => (
              <button
                type="button"
                key={a}
                className={availability === a ? 'active' : ''}
                onClick={() => setAvailability(a)}
              >
                {a === 'open' ? 'Open' : a === 'limited' ? 'Limited' : 'Busy'}
              </button>
            ))}
          </div>
        </fieldset>
        <button className="primary" type="submit" disabled={!name.trim() || !lookingFor.length}>
          {onboarding ? 'Join the community' : 'Save'}
        </button>
        {!lookingFor.length && <small className="hint">Pick at least one discipline to collaborate with.</small>}
      </form>
    </div>
  )
}
