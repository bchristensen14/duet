export interface WaitlistSignup {
  email: string
  name: string
  role: string
  city: string
  feedback: string
}

const ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT?.trim() || ''
const STORAGE_KEY = 'duet-waitlist'

/** True when signups are sent somewhere. Without an endpoint they only stay in this browser. */
export const waitlistConnected = ENDPOINT !== ''

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

/**
 * Sends a signup to the configured form endpoint (Formspree-compatible JSON POST).
 * Throws on network or server errors so the form can offer a retry.
 */
export async function joinWaitlist(signup: WaitlistSignup): Promise<void> {
  const payload = {
    email: signup.email.trim(),
    name: signup.name.trim(),
    role: signup.role,
    city: signup.city.trim(),
    feedback: signup.feedback.trim(),
    source: 'landing',
    _subject: 'New Duet waitlist signup',
  }

  if (waitlistConnected) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Waitlist signup failed (${res.status})`)
  } else {
    console.warn('VITE_WAITLIST_ENDPOINT is not set; this signup was only saved in this browser.', payload)
  }

  rememberSignup(payload.email)
}

/** Remembers that this browser already joined, so a return visit shows the thank-you state. */
function rememberSignup(email: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, joinedAt: Date.now() }))
  } catch {
    // Storage unavailable (private mode): the signup itself already went through.
  }
}

export function joinedEmail(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw).email ?? null) : null
  } catch {
    return null
  }
}

export function forgetSignup() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to forget.
  }
}
