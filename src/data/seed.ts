import type { AppState, Creative } from '../types'

const DAY = 24 * 60 * 60 * 1000
const now = Date.now()

let n = 0
const item = (
  kind: Creative['portfolio'][number]['kind'],
  title: string,
  description: string,
  daysAgo: number,
) => ({ id: `w${++n}`, kind, title, description, createdAt: now - daysAgo * DAY })

export const SEED_CREATIVES: Creative[] = [
  {
    id: 'c-maya',
    name: 'Maya Okafor',
    discipline: 'Instrumentalist',
    location: 'Los Angeles, CA',
    bio: 'Cellist. Chamber music by training, film scores by choice. Looking for living composers who want their pieces played, not just filed.',
    styles: ['contemporary classical', 'film score', 'chamber'],
    lookingFor: ['Composer', 'Filmmaker'],
    availability: 'open',
    hue: 18,
    portfolio: [
      item('audio', 'Suite for Solo Cello, mvt. II', 'Live recording at a house concert in Silver Lake.', 2),
      item('video', 'Scoring session: "Low Tide"', 'Behind the scenes on a student short.', 20),
    ],
  },
  {
    id: 'c-jonah',
    name: 'Jonah Reyes',
    discipline: 'Filmmaker',
    location: 'Oakland, CA',
    bio: 'Documentary director. My next short is about a fishing town and needs a score that sounds like fog.',
    styles: ['documentary', 'ambient', 'film score'],
    lookingFor: ['Composer', 'Photographer'],
    availability: 'limited',
    hue: 210,
    portfolio: [
      item('video', 'Trailer: "Salt Line"', 'Rough cut, temp music. Looking to replace it.', 4),
      item('image', 'Location stills', 'Bodega Bay, 5am.', 11),
    ],
  },
  {
    id: 'c-sora',
    name: 'Sora Lindqvist',
    discipline: 'Vocalist',
    location: 'San Francisco, CA',
    bio: 'Soprano who loves new music and hates singing the same three arias. Premieres welcome.',
    styles: ['contemporary classical', 'art song', 'experimental'],
    lookingFor: ['Composer', 'Instrumentalist'],
    availability: 'open',
    hue: 280,
    portfolio: [
      item('audio', 'Premiere: "Three Rooms"', 'Song cycle for soprano and piano, 2025.', 6),
    ],
  },
  {
    id: 'c-ines',
    name: 'Inés Duarte',
    discipline: 'Choreographer',
    location: 'Los Angeles, CA',
    bio: 'Contemporary dance company director. We build pieces with composers in the room from day one.',
    styles: ['contemporary dance', 'experimental', 'minimalism'],
    lookingFor: ['Composer', 'Dancer', 'Filmmaker'],
    availability: 'limited',
    hue: 340,
    portfolio: [
      item('video', 'Rehearsal: "Weight"', 'Six dancers, one chair, no music yet.', 1),
      item('text', 'Company manifesto', 'Why we never use stock music.', 30),
    ],
  },
  {
    id: 'c-theo',
    name: 'Theo Park',
    discipline: 'Producer',
    location: 'Los Angeles, CA',
    bio: 'Producer and mix engineer. Orchestral meets electronic. Home studio in Echo Park.',
    styles: ['electronic', 'film score', 'ambient'],
    lookingFor: ['Composer', 'Vocalist'],
    availability: 'open',
    hue: 160,
    portfolio: [
      item('audio', 'Strings + modular sketch', 'Bowed textures through a Buchla clone.', 3),
    ],
  },
  {
    id: 'c-amara',
    name: 'Amara Nwosu',
    discipline: 'Photographer',
    location: 'San Diego, CA',
    bio: 'Portraits of musicians in rehearsal. I like the moments before anyone is ready.',
    styles: ['portrait', 'documentary', 'black and white'],
    lookingFor: ['Instrumentalist', 'Dancer', 'Vocalist'],
    availability: 'open',
    hue: 40,
    portfolio: [
      item('image', 'Green Room', 'A string quartet, five minutes to curtain.', 5),
      item('image', 'Hands', 'Series of pianists, 2024 to now.', 40),
    ],
  },
  {
    id: 'c-lena',
    name: 'Lena Fischer',
    discipline: 'Writer',
    location: 'Berlin, DE',
    bio: 'Librettist and poet. Writing a chamber opera about a lighthouse keeper and looking for a composer to share it with.',
    styles: ['opera', 'poetry', 'contemporary classical'],
    lookingFor: ['Composer'],
    availability: 'open',
    hue: 230,
    portfolio: [
      item('text', 'Libretto excerpt: "The Keeper"', 'Scene 1, the first storm.', 8),
    ],
  },
  {
    id: 'c-kofi',
    name: 'Kofi Mensah',
    discipline: 'Dancer',
    location: 'Los Angeles, CA',
    bio: 'Freelance contemporary and hip-hop dancer. I want to perform to music written for the body, not just over it.',
    styles: ['contemporary dance', 'hip-hop', 'experimental'],
    lookingFor: ['Choreographer', 'Composer', 'Filmmaker'],
    availability: 'busy',
    hue: 100,
    portfolio: [
      item('video', 'Solo: "Undertow"', 'Improvised to a field recording.', 9),
    ],
  },
  {
    id: 'c-priya',
    name: 'Priya Natarajan',
    discipline: 'Illustrator',
    location: 'Austin, TX',
    bio: 'Album art and animated loops. I listen to a record ten times before I draw anything.',
    styles: ['album art', 'animation', 'surreal'],
    lookingFor: ['Producer', 'Composer', 'Vocalist'],
    availability: 'limited',
    hue: 300,
    portfolio: [
      item('image', 'Cover study: "Nightswim"', 'Gouache, scanned and looped.', 7),
    ],
  },
  {
    id: 'c-ruth',
    name: 'Ruth Abara',
    discipline: 'Instrumentalist',
    location: 'San Francisco, CA',
    bio: 'Pianist. New music ensemble co-founder. We commission two young composers a season.',
    styles: ['contemporary classical', 'minimalism', 'chamber'],
    lookingFor: ['Composer', 'Vocalist'],
    availability: 'open',
    hue: 190,
    portfolio: [
      item('audio', 'Glass: Etude No. 6', 'Practice-room recording, honest mistakes included.', 12),
    ],
  },
]

export function seedState(): AppState {
  return {
    meId: null,
    creatives: SEED_CREATIVES,
    likes: {},
    following: [],
    messages: [],
    briefs: [],
  }
}

/** Short canned replies so the inbox feels alive in a demo. */
export const AUTO_REPLIES = [
  'Hey, thanks for reaching out! Love what you posted. Want to grab a call this week?',
  'This sounds great. Send me something you are working on?',
  'Thanks! I am a bit busy this month but would love to hear more.',
]
