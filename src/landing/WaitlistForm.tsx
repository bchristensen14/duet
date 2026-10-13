import { useEffect, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { forgetSignup, hasJoined, isValidEmail, joinWaitlist, waitlistConnected } from '../lib/waitlist'

type Status = 'idle' | 'sending' | 'error'

const FEEDBACK_MAX = 1000

export function WaitlistForm() {
  const [joined, setJoined] = useState(hasJoined)
  // The address just submitted; kept in memory only, never stored.
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const refocusEmail = useRef(false)

  // After a submit, move focus to the confirmation so screen readers announce it.
  useEffect(() => {
    if (submitted) doneRef.current?.focus()
  }, [submitted])

  // After "Use another email", put focus back in the form instead of dropping it on <body>.
  useEffect(() => {
    if (!joined && refocusEmail.current) {
      refocusEmail.current = false
      emailRef.current?.focus()
    }
  }, [joined])

  const emailInvalid = emailTouched && !isValidEmail(email)

  const finish = () => {
    setSubmitted(email.trim())
    setJoined(true)
    setStatus('idle')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      // Render the error and aria-invalid first, so they're read when focus lands.
      flushSync(() => setEmailTouched(true))
      emailRef.current?.focus()
      return
    }
    setEmailTouched(true)
    if (status === 'sending') return
    // Bots fill every field; people never see this one.
    if (honeypot) return finish()
    setStatus('sending')
    try {
      await joinWaitlist({ email, feedback })
      finish()
    } catch {
      setStatus('error')
    }
  }

  if (joined) {
    const preview = !waitlistConnected
    return (
      <div className="waitlist-done">
        <h3 ref={doneRef} tabIndex={-1}>
          {preview ? 'Preview only' : "You're on the list."}
        </h3>
        <p>
          {preview ? (
            <>The waitlist isn't connected yet, so this signup wasn't sent anywhere.</>
          ) : submitted ? (
            <>
              We'll email <strong>{submitted}</strong> when we launch.
            </>
          ) : (
            <>We'll email you when we launch.</>
          )}
        </p>
        <div className="done-actions">
          <a className="btn btn-dark" href="./demo/">
            Try the demo →
          </a>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              refocusEmail.current = true
              forgetSignup()
              setJoined(false)
              setSubmitted(null)
              setEmail('')
              setEmailTouched(false)
              setFeedback('')
              setHoneypot('')
            }}
          >
            Use another email
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="waitlist-form" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor="wl-email">
        Email
      </label>
      <input
        ref={emailRef}
        id="wl-email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setEmailTouched(email !== '')}
        placeholder="you@example.com"
        aria-invalid={emailInvalid}
        aria-describedby={emailInvalid ? 'wl-email-error' : undefined}
      />
      {emailInvalid && (
        <p id="wl-email-error" className="field-error" role="alert">
          Enter a valid email address.
        </p>
      )}

      <label className="feedback" htmlFor="wl-feedback">
        <span>
          Any feedback, or features you'd like to see? <span className="optional">Optional</span>
        </span>
        <textarea
          id="wl-feedback"
          name="feedback"
          rows={3}
          maxLength={FEEDBACK_MAX}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="A feature you'd love, or the collaborator you're looking for."
        />
      </label>

      <div className="hp" aria-hidden="true">
        <input
          tabIndex={-1}
          name="company_website"
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* aria-disabled (not disabled) keeps focus on the button while sending; submit() ignores repeats. */}
      <button className="btn btn-dark waitlist-submit" type="submit" aria-disabled={status === 'sending'}>
        {status === 'sending' ? 'Joining…' : 'Join the waitlist'}
      </button>

      <div aria-live="polite">
        {status === 'error' && <p className="field-error">Couldn't send that. Please try again.</p>}
      </div>
      <p className="fine-print">
        {waitlistConnected
          ? 'Early access and launch emails only. Unsubscribe anytime.'
          : "Preview: the waitlist isn't connected yet, so signups aren't collected."}
      </p>
    </form>
  )
}
