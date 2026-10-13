export interface WaitlistSignup {
  email: string
  /** Optional: features they want or anything else they'd like to tell us. */
  feedback: string
}

const ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT?.trim() || ''
const STORAGE_KEY = 'duet-waitlist'

/** True when signups are sent somewhere. Without an endpoint (a preview build) nothing is collected. */
export const waitlistConnected = ENDPOINT !== ''

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

/**
 * Sends a signup to the configured form endpoint (Formspree-compatible JSON POST).
 * Throws on network or server errors so the form can offer a retry.
 */
export async function joinWaitlist(signup: WaitlistSignup): Promise<void> {
  const payload = {
    email: signup.email.trim(),
    feedback: signup.feedback.trim(),
    source: 'landing',
    _subject: 'New Duet waitlist signup',
  }

  if (!waitlistConnected) {
    console.warn('VITE_WAITLIST_ENDPOINT is not set; this signup was not sent anywhere.')
    return
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Waitlist signup failed (${res.status})`)
  rememberSignup()
}

/**
 * Remembers that this browser already joined, so a return visit shows the thank-you state.
 * Only a flag is stored, never the email, so the next person on a shared device can't see it.
 */
function rememberSignup() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ joinedAt: Date.now() }))
  } catch {
    // Storage unavailable (private mode): the signup itself already went through.
  }
}

export function hasJoined(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}

export function forgetSignup() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to forget.
  }
}
