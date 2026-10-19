export const DISCIPLINES = [
  'Composer',
  'Vocalist',
  'Instrumentalist',
  'Producer',
  'Dancer',
  'Choreographer',
  'Painter',
  'Illustrator',
  'Photographer',
  'Filmmaker',
  'Writer',
  'Poet',
  'Songwriter',
  'DJ',
  'Designer',
  'Brand / business',
] as const

export type Discipline = (typeof DISCIPLINES)[number]

export type Availability = 'open' | 'limited' | 'busy'

export type WorkKind = 'audio' | 'video' | 'image' | 'text'

export interface PortfolioItem {
  id: string
  kind: WorkKind
  title: string
  description: string
  link?: string
  createdAt: number
}

export interface Creative {
  id: string
  name: string
  age?: number
  discipline: Discipline
  /** Specific role shown under the name, e.g. "Cellist" or "Music video director". */
  role?: string
  location: string
  bio: string
  styles: string[]
  lookingFor: Discipline[]
  availability: Availability
  portfolio: PortfolioItem[]
  /** Hue (0-360) used for the generated avatar. */
  hue: number
}

export interface Message {
  id: string
  from: string
  to: string
  body: string
  sentAt: number
}

export interface Brief {
  id: string
  project: string
  disciplines: Discipline[]
  styles: string[]
  timeline: string
  createdAt: number
}

export interface AppState {
  meId: string | null
  creatives: Creative[]
  likes: Record<string, string[]> // portfolio item id -> creative ids
  following: string[]
  messages: Message[]
  briefs: Brief[]
}
