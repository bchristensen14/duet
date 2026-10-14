export interface WaitlistSignup {
  email: string
  /** Optional: features they want or anything else they'd like to tell us. */
  feedback: string
}

const STORAGE_KEY = 'duet-waitlist'

const env = import.meta.env
const FORM_ID = env.VITE_WAITLIST_FORM_ID?.trim() ?? ''
// Accept "entry.123" or just "123".
const entry = (id: string | undefined) => {
  const v = id?.trim() ?? ''
  return v && !v.startsWith('entry.') ? `entry.${v}` : v
}
const EMAIL_ENTRY = entry(env.VITE_WAITLIST_EMAIL_ENTRY)
const FEEDBACK_ENTRY = entry(env.VITE_WAITLIST_FEEDBACK_ENTRY)

/** True when signups go to the Google Form. Without it (a preview build) nothing is collected. */
export const waitlistConnected = FORM_ID !== '' && EMAIL_ENTRY !== ''

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

/**
 * Submits a signup to the Google Form, which records it as a response
 * (and in the linked Google Sheet, if one is set up).
 *
 * Google Forms doesn't allow cross-origin reads, so this posts in no-cors mode:
 * the response is opaque, and only network failures can be detected. That's why
 * the form IDs are checked once when they're configured (see README).
 */
export async function joinWaitlist(signup: WaitlistSignup): Promise<void> {
  if (!waitlistConnected) {
    console.warn('The waitlist Google Form is not configured; this signup was not sent anywhere.')
    return
  }

  const body = new URLSearchParams({ [EMAIL_ENTRY]: signup.email.trim() })
  const feedback = signup.feedback.trim()
  if (FEEDBACK_ENTRY && feedback) body.set(FEEDBACK_ENTRY, feedback)

  await fetch(`https://docs.google.com/forms/d/e/${encodeURIComponent(FORM_ID)}/formResponse`, {
    method: 'POST',
    mode: 'no-cors',
    body,
  })
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
