import { useState, type FormEvent } from 'react'
import { forgetSignup, isValidEmail, joinWaitlist, joinedEmail, waitlistConnected } from '../lib/waitlist'
import { DISCIPLINES } from '../types'

type Status = 'idle' | 'sending' | 'error'

const FEEDBACK_MAX = 1000

export function WaitlistForm() {
  const [joined, setJoined] = useState<string | null>(joinedEmail)
  const [status, setStatus] = useState<Status>('idle')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [city, setCity] = useState('')
  const [feedback, setFeedback] = useState('')
  const [honeypot, setHoneypot] = useState('')

  const emailInvalid = emailTouched && !isValidEmail(email)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setEmailTouched(true)
    if (!isValidEmail(email) || status === 'sending') return
    // Bots fill every field; people never see this one.
    if (honeypot) {
      setJoined(email.trim())
      return
    }
    setStatus('sending')
    try {
      await joinWaitlist({ email, name, role, city, feedback })
      setJoined(email.trim())
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  if (joined) {
    return (
      <div className="waitlist-card waitlist-done" role="status">
        <span className="done-mark" aria-hidden="true">
          ✓
        </span>
        <h3>You're on the list</h3>
        <p>
          We'll email <strong>{joined}</strong> as soon as Duet launches. Thanks for helping shape it.
        </p>
        <a className="btn btn-primary" href="./demo/">
          Try the demo while you wait →
        </a>
        <button
          type="button"
          className="text-btn"
          onClick={() => {
            forgetSignup()
            setJoined(null)
            setEmail('')
            setEmailTouched(false)
            setFeedback('')
          }}
        >
          Sign up another email
        </button>
      </div>
    )
  }

  return (
    <form className="waitlist-card" onSubmit={submit} noValidate>
      <label className="field">
        <span>
          Email <span className="req">(required)</span>
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
          placeholder="you@example.com"
          aria-invalid={emailInvalid}
          aria-describedby={emailInvalid ? 'email-error' : undefined}
        />
        {emailInvalid && (
          <small id="email-error" className="field-error">
            Please enter a valid email address.
          </small>
        )}
      </label>

      <div className="field-row">
        <label className="field">
          <span>First name</span>
          <input name="name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>City</span>
          <input
            name="city"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Copenhagen"
          />
        </label>
      </div>

      <label className="field">
        <span>I'm a…</span>
        <select name="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">Choose one (optional)</option>
          {DISCIPLINES.map((d) => (
            <option key={d}>{d}</option>
          ))}
          <option>Other creative</option>
          <option>Hiring for a label, studio, agency or brand</option>
        </select>
      </label>

      <label className="field">
        <span>What would you want Duet to do for you?</span>
        <textarea
          name="feedback"
          rows={4}
          maxLength={FEEDBACK_MAX}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Optional. A feature you'd love, a collaboration you're trying to find, or anything that would make you use it."
          aria-describedby="feedback-count"
        />
        <small id="feedback-count" className="field-hint">
          Optional · {feedback.length}/{FEEDBACK_MAX}
        </small>
      </label>

      <label className="hp" aria-hidden="true">
        Leave this empty
        <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </label>

      <button className="btn btn-primary btn-block" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Joining…' : 'Join the waitlist'}
      </button>

      <div aria-live="polite">
        {status === 'error' && (
          <p className="form-error">Something went wrong sending that. Check your connection and try again.</p>
        )}
      </div>
      <p className="fine-print">
        We'll only email you about Duet's launch. No spam, unsubscribe anytime.
        {!waitlistConnected && (
          <>
            {' '}
            <strong>Preview:</strong> the waitlist isn't connected yet, so signups stay in this browser.
          </>
        )}
      </p>
    </form>
  )
}
