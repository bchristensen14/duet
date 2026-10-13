import type { Creative } from '../types'

export interface Match {
  creative: Creative
  score: number
  reasons: string[]
}

const region = (location: string) => location.split(',').pop()?.trim().toLowerCase() ?? ''
const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a')
const city = (location: string) => location.split(',')[0].trim().toLowerCase()

/**
 * Scores how well `other` fits as a collaborator for `me`.
 *
 * MVP stand-in for the AI matcher: a transparent weighted score over
 * discipline fit, shared style, location and availability. Every point
 * comes with a human-readable reason so suggestions are explainable.
 */
export function scoreMatch(me: Creative, other: Creative): Match {
  let score = 0
  const reasons: string[] = []

  if (me.lookingFor.includes(other.discipline)) {
    score += 35
    reasons.push(`You're looking for ${article(other.discipline)} ${other.discipline.toLowerCase()}`)
  }
  if (other.lookingFor.includes(me.discipline)) {
    score += 25
    reasons.push(`They're looking for ${article(me.discipline)} ${me.discipline.toLowerCase()}`)
  }

  const mine = new Set(me.styles.map((s) => s.toLowerCase()))
  const shared = other.styles.filter((s) => mine.has(s.toLowerCase()))
  if (shared.length) {
    score += Math.min(shared.length * 10, 25)
    reasons.push(`Shared style: ${shared.join(', ')}`)
  }

  if (city(me.location) && city(me.location) === city(other.location)) {
    score += 15
    reasons.push(`Also in ${other.location.split(',')[0]}`)
  } else if (region(me.location) && region(me.location) === region(other.location)) {
    score += 7
    reasons.push(`Nearby (${other.location})`)
  }

  if (other.availability === 'open') {
    score += 10
    reasons.push('Open to new projects')
  } else if (other.availability === 'limited') {
    score += 4
  }

  return { creative: other, score: Math.min(score, 100), reasons }
}

export function suggestMatches(me: Creative, everyone: Creative[], limit = 6): Match[] {
  return everyone
    .filter((c) => c.id !== me.id)
    .map((c) => scoreMatch(me, c))
    .filter((m) => m.score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
