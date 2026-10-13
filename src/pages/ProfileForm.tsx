import { useState, type FormEvent } from 'react'
import { Chip, Logo } from '../components/ui'
import { navigate } from '../lib/router'
import { uid, useStore } from '../lib/store'
import { DISCIPLINES, type Availability, type Creative, type Discipline } from '../types'

export function ProfileForm({ onboarding }: { onboarding?: boolean }) {
  const { me, dispatch } = useStore()
  const [name, setName] = useState(me?.name ?? '')
  const [discipline, setDiscipline] = useState<Discipline>(me?.discipline ?? 'Composer')
  const [location, setLocation] = useState(me?.location ?? '')
  const [bio, setBio] = useState(me?.bio ?? '')
  const [styles, setStyles] = useState(me?.styles.join(', ') ?? '')
  const [lookingFor, setLookingFor] = useState<Discipline[]>(me?.lookingFor ?? [])
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
    navigate(onboarding ? '/matches' : `/people/${profile.id}`)
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
