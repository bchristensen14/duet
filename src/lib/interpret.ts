import type { Creative, Discipline } from '../types'

/**
 * Reads a free-text collaboration request ("I'm a singer in Copenhagen looking for a
 * producer for my EP") and ranks creatives against it.
 *
 * MVP stand-in for AI matching: keyword lexicons plus a few phrasing rules, all in the
 * browser. Every hit keeps its position in the original text so the page can highlight
 * exactly which words were understood, and every match reason quotes those words back.
 */

export type HitKind = 'self' | 'wanted' | 'style' | 'project' | 'place'

export interface Hit {
  start: number
  end: number
  text: string
  kind: HitKind
}

interface RoleHit extends Hit {
  discipline: Discipline
  /** Lower-case fragment of a creative's role that marks an exact match, e.g. "cellist". */
  role?: string
}

interface StyleHit extends Hit {
  token: string
}

interface ProjectHit extends Hit {
  check: RegExp
}

interface PlaceHit extends Hit {
  city?: string
  country: string
}

export interface Interpretation {
  text: string
  hits: Hit[]
  self: RoleHit[]
  /** The visitor is a brand, label, venue or other business (its words, e.g. "coffee brand"). */
  business?: Hit
  wanted: RoleHit[]
  /** True when nobody was asked for, so `wanted` was filled with roles that usually pair with `self`. */
  inferred: boolean
  styles: StyleHit[]
  projects: ProjectHit[]
  place?: PlaceHit
}

// ---------- Lexicons ----------
// Patterns are regex fragments matched case-insensitively on whole words. Longer, more
// specific entries come first; overlapping matches keep the earliest, then longest.

const ROLES: { re: string; discipline: Discipline; role?: string }[] = [
  { re: 'singer[- ]songwriters?', discipline: 'Songwriter', role: 'singer-songwriter' },
  { re: 'song ?writers?|song ?writing|co-?writers?|sangskrivere?', discipline: 'Songwriter' },
  { re: 'lyricists?|lyrics|tekstforfattere?', discipline: 'Writer', role: 'lyricist' },
  { re: 'rappers?|rap artists?|rappere?', discipline: 'Vocalist', role: 'rapper' },
  { re: 'sopranos?|opera singers?|mezzos?', discipline: 'Vocalist', role: 'soprano' },
  { re: 'singers?|vocalists?|vocals|sangere?|sangerinde|sangerinder', discipline: 'Vocalist', role: 'singer' },
  { re: 'choirs?|kor', discipline: 'Vocalist' },
  { re: 'cellists?|cellos?', discipline: 'Instrumentalist', role: 'cellist' },
  { re: 'string quartets?|strings|string players?|strygere', discipline: 'Instrumentalist', role: 'string' },
  { re: 'violinists?|violins?|fiddlers?|fiddles?|violinister?', discipline: 'Instrumentalist', role: 'violinist' },
  { re: 'pianists?|pianos?|pianister?|keyboardists?|keyboards?|keys', discipline: 'Instrumentalist', role: 'pianist' },
  { re: 'guitarists?|guitars?|guitarister?|guitar players?', discipline: 'Instrumentalist', role: 'guitarist' },
  { re: 'bassists?|bass players?|bassister?', discipline: 'Instrumentalist', role: 'bassist' },
  { re: 'drummers?|drums|percussionists?|trommeslagere?', discipline: 'Instrumentalist', role: 'drummer' },
  { re: 'saxophonists?|saxophones?|sax', discipline: 'Instrumentalist', role: 'saxophonist' },
  { re: 'trumpeters?|trumpets?|horn players?|horns|brass', discipline: 'Instrumentalist', role: 'trumpet' },
  { re: 'musicians?|instrumentalists?|session players?|session musicians?|musikere?|bands?', discipline: 'Instrumentalist' },
  { re: 'film composers?', discipline: 'Composer', role: 'film composer' },
  { re: 'composers?|komponister?|scor(?:e|ing) (?:my|our|a|the|for)', discipline: 'Composer' },
  { re: 'mix(?:ing)? engineers?|mixing|mastering|sound engineers?|lydteknikere?', discipline: 'Producer', role: 'mix' },
  { re: 'producers?|music producers?|beat ?makers?|beats|producere?', discipline: 'Producer', role: 'producer' },
  { re: 'sound designers?', discipline: 'Producer' },
  { re: 'djs?|deejays?', discipline: 'DJ', role: 'dj' },
  { re: 'choreographers?|choreography|koreografer?', discipline: 'Choreographer' },
  { re: 'dancers?|dance crews?|dansere?', discipline: 'Dancer' },
  { re: 'muralists?|murals?', discipline: 'Painter', role: 'muralist' },
  { re: 'painters?|malere?', discipline: 'Painter' },
  { re: 'animators?|animated|animation|animatorer', discipline: 'Illustrator', role: 'animator' },
  { re: 'illustrators?|illustrations?|illustratorer', discipline: 'Illustrator' },
  { re: 'photographers?|photography|photo ?shoots?|photos|headshots?|fotografer?', discipline: 'Photographer' },
  { re: 'music video directors?|music videos?|musikvideoer|musikvideo', discipline: 'Filmmaker', role: 'music video' },
  { re: 'video editors?', discipline: 'Filmmaker' },
  { re: 'filmmakers?|film ?makers?|directors?|videographers?|cinematographers?|camera (?:person|operator)s?|instruktører|instruktør', discipline: 'Filmmaker' },
  { re: 'copywriters?|tekstforfattere?', discipline: 'Writer', role: 'copywriter' },
  { re: 'screenwriters?|scriptwriters?|librettists?|writers?|forfattere?', discipline: 'Writer' },
  { re: 'poets?|spoken word|digtere?', discipline: 'Poet' },
  { re: 'graphic designers?|brand designers?|grafiske? designere?', discipline: 'Designer', role: 'graphic designer' },
  { re: 'logos?|branding|visual identity|designers?|designere?', discipline: 'Designer' },
]

const BUSINESS =
  'record labels?|labels?|pladeselskaber?|brands?|compan(?:y|ies)|business(?:es)?|agenc(?:y|ies)|startups?|' +
  'restaurants?|caf(?:e|é)s?|coffee (?:shops?|brands?|roasters?|roastery)|baker(?:y|ies)|venues?|' +
  'theat(?:re|er)s?|galler(?:y|ies)|shops?|stores?|magazines?|bars?|hotels?|clubs?|firma|virksomhed'

const STYLES: [string, string][] = [
  ['contemporary dance', 'contemporary dance'],
  ['street ?dance|breaking|breakdance', 'street dance'],
  ['contemporary classical', 'contemporary classical'],
  ['classical|klassisk', 'classical'],
  ['indie', 'indie'],
  ['pop', 'pop'],
  ['rock', 'rock'],
  ['punk', 'punk'],
  ['metal', 'metal'],
  ['folk', 'folk'],
  ['jazz(?:y)?', 'jazz'],
  ['blues', 'blues'],
  ['soul(?:ful)?', 'soul'],
  ['r&b|rnb|r and b', 'r&b'],
  ['hip[- ]?hop|rap', 'hip-hop'],
  ['electronica?|edm', 'electronic'],
  ['techno', 'techno'],
  ['house music|deep house|tech house', 'house'],
  ['disco', 'disco'],
  ['ambient', 'ambient'],
  ['lo-?fi', 'lo-fi'],
  ['chamber', 'chamber'],
  ['opera(?:tic)?', 'opera'],
  ['film scores?|soundtracks?|cinematic', 'film score'],
  ['experimental', 'experimental'],
  ['minimal(?:ism|ist)?', 'minimal'],
  ['ballet', 'ballet'],
  ['documentar(?:y|ies)', 'documentary'],
  ['portraits?', 'portrait'],
  ['fashion', 'fashion'],
  ['black and white|b&w', 'black and white'],
  ['surreal(?:ist)?', 'surreal'],
  ['abstract', 'abstract'],
  ['acoustic|akustisk', 'acoustic'],
  ['country', 'country'],
  ['gospel', 'gospel'],
]

const PROJECTS: [string, RegExp][] = [
  ['(?:first |debut )?eps?', /\beps?\b/i],
  ['(?:debut )?albums?|lps?', /album/i],
  ['singles?|songs?|tracks?|sange?', /single|song|track/i],
  ['album covers?|cover art', /cover/i],
  ['short films?|films?|movies?|kortfilm', /film/i],
  ['weddings?|bryllup(?:per)?', /wedding/i],
  ['campaigns?|ads?|adverts?|commercials?|reklamer?', /campaign|commercial|brand/i],
  ['packaging|emballage', /packaging/i],
  ['jingles?', /jingle/i],
  ['launch(?:es)?|launch part(?:y|ies)', /launch/i],
  ['tours?|touring|turné', /tour/i],
  ['concerts?|gigs?|live shows?|live sets?|performances?|koncerter?', /live|concert|gig|perform/i],
  ['festivals?', /festival/i],
  ['club nights?|part(?:y|ies)|fest', /club|part(?:y|ies)/i],
  ['games?|video games?|spil', /game/i],
  ['podcasts?', /podcast/i],
  ['stage|theat(?:re|er) (?:show|production|piece)s?', /stage|theat/i],
  ['premieres?', /premiere/i],
  ['recordings?|recording sessions?|session work|studio sessions?', /session|record/i],
  ['lyric videos?', /lyric video/i],
]

const PLACES: [string, string | undefined, string][] = [
  ['copenhagen|københavn|kobenhavn|kbh|cph', 'Copenhagen', 'DK'],
  ['aarhus|århus', 'Aarhus', 'DK'],
  ['odense', 'Odense', 'DK'],
  ['aalborg', 'Aalborg', 'DK'],
  ['malmö|malmo', 'Malmö', 'SE'],
  ['stockholm', 'Stockholm', 'SE'],
  ['gothenburg|göteborg', 'Gothenburg', 'SE'],
  ['oslo', 'Oslo', 'NO'],
  ['berlin', 'Berlin', 'DE'],
  ['hamburg', 'Hamburg', 'DE'],
  ['london', 'London', 'UK'],
  ['los angeles|l\\.a\\.', 'Los Angeles', 'US'],
  ['san francisco|bay area', 'San Francisco', 'US'],
  ['oakland', 'Oakland', 'US'],
  ['san diego', 'San Diego', 'US'],
  ['austin', 'Austin', 'US'],
  ['new york|nyc', 'New York', 'US'],
  ['colorado springs', 'Colorado Springs', 'US'],
  ['denmark|danmark', undefined, 'DK'],
  ['sweden|sverige', undefined, 'SE'],
  ['germany|tyskland', undefined, 'DE'],
]

const COUNTRY_NAMES: Record<string, string> = { DK: 'Denmark', SE: 'Sweden', NO: 'Norway', DE: 'Germany', UK: 'the UK', US: 'the US' }
const US_STATES = new Set(['CA', 'TX', 'NY', 'CO', 'WA', 'OR', 'IL', 'MA', 'FL', 'GA', 'TN'])

/** Phrases that introduce who the visitor wants. Roles after the first one count as "wanted". */
const SEEK =
  /(?<![\p{L}\p{N}])(?:looking for|look(?:ing)? to (?:find|hire|work with|meet)|searching for|seeking|need(?:s|ing|ed)?|want(?:s|ing|ed)?|hire|hiring|find(?:ing)?|to work with|collaborat(?:e|ing) with|collab with|team up with|leder efter|søger|mangler)(?![\p{L}\p{N}])/iu

/** "I'm a …", "we are a …" just before a word marks it as describing the visitor. */
const SELF_PREFIX = /(?:^|[^\p{L}])(?:i'?m|i am|im|we'?re|we are|i work as|i play|i'm an?|jeg er|vi er|as an?)\s+(?:an?\s+|en\s+|et\s+)?(?:[\p{L}'-]+\s+){0,3}$/iu
const OWN_PREFIX = /(?:^|[^\p{L}])(?:our|my|i run|we run|i own|we own|vores|min|mit)\s+(?:[\p{L}'-]+\s+){0,2}$/iu

/** Who usually pairs well with whom, used when a visitor only says what they are. */
const COMPLEMENTS: Partial<Record<Discipline, Discipline[]>> = {
  Vocalist: ['Producer', 'Instrumentalist', 'Songwriter'],
  Songwriter: ['Producer', 'Instrumentalist', 'Vocalist'],
  Producer: ['Vocalist', 'Songwriter', 'Instrumentalist'],
  Instrumentalist: ['Vocalist', 'Composer', 'Producer'],
  Composer: ['Instrumentalist', 'Filmmaker', 'Choreographer'],
  DJ: ['Producer', 'Vocalist'],
  Dancer: ['Choreographer', 'Filmmaker'],
  Choreographer: ['Dancer', 'Composer', 'Filmmaker'],
  Filmmaker: ['Composer', 'Photographer', 'Producer'],
  Photographer: ['Designer', 'Filmmaker'],
  Painter: ['Photographer', 'Designer'],
  Illustrator: ['Producer', 'Songwriter'],
  Writer: ['Songwriter', 'Composer'],
  Poet: ['Composer', 'Producer'],
  Designer: ['Photographer', 'Illustrator'],
  'Brand / business': ['Photographer', 'Designer', 'Filmmaker'],
}

const word = (src: string) => new RegExp(`(?<![\\p{L}\\p{N}])(?:${src})(?![\\p{L}\\p{N}])`, 'giu')

const ROLE_RES = ROLES.map((r) => ({ ...r, rx: word(r.re) }))
const BUSINESS_RE = word(BUSINESS)
const STYLE_RES = STYLES.map(([re, token]) => ({ rx: word(re), token }))
const PROJECT_RES = PROJECTS.map(([re, check]) => ({ rx: word(re), check }))
const PLACE_RES = PLACES.map(([re, city, country]) => ({ rx: word(re), city, country }))

type Candidate =
  | { type: 'role'; start: number; end: number; discipline: Discipline; role?: string }
  | { type: 'business'; start: number; end: number }
  | { type: 'style'; start: number; end: number; token: string }
  | { type: 'project'; start: number; end: number; check: RegExp }
  | { type: 'place'; start: number; end: number; city?: string; country: string }

const MAX_LENGTH = 600

export function interpret(input: string): Interpretation {
  const text = input.slice(0, MAX_LENGTH)
  const found: Candidate[] = []
  const scan = (rx: RegExp, make: (start: number, end: number) => Candidate) => {
    for (const m of text.matchAll(rx)) found.push(make(m.index, m.index + m[0].length))
  }
  for (const r of ROLE_RES) scan(r.rx, (start, end) => ({ type: 'role', start, end, discipline: r.discipline, role: r.role }))
  scan(BUSINESS_RE, (start, end) => ({ type: 'business', start, end }))
  for (const s of STYLE_RES) scan(s.rx, (start, end) => ({ type: 'style', start, end, token: s.token }))
  for (const p of PROJECT_RES) scan(p.rx, (start, end) => ({ type: 'project', start, end, check: p.check }))
  for (const p of PLACE_RES) scan(p.rx, (start, end) => ({ type: 'place', start, end, city: p.city, country: p.country }))

  // Earliest first, then longest; drop anything overlapping an earlier pick.
  found.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start))
  const picked: Candidate[] = []
  for (const c of found) if (!picked.some((p) => c.start < p.end && p.start < c.end)) picked.push(c)

  const seekMatch = SEEK.exec(text)
  // "Drummer needed", "singer wanted": the ask comes after the role, so position says nothing.
  const postfix = !!seekMatch && /^(needed|wanted)$/i.test(seekMatch[0])
  const seek = seekMatch && !postfix ? seekMatch.index : -1
  const before = (c: Candidate) => text.slice(Math.max(0, text.lastIndexOf('.', c.start) + 1), c.start)
  const isSelf = (c: Candidate) => SELF_PREFIX.test(before(c)) || (seek >= 0 && c.start < seek)
  // "our band", "my choir": a group the visitor belongs to. ("my music video" is a project, not a person.)
  const isOwnGroup = (c: Candidate) => OWN_PREFIX.test(before(c)) && /band|choir|kor|quartet|crew/i.test(text.slice(c.start, c.end))

  const interp: Interpretation = { text, hits: [], self: [], wanted: [], inferred: false, styles: [], projects: [] }
  for (const c of picked) {
    const base = { start: c.start, end: c.end, text: text.slice(c.start, c.end) }
    if (c.type === 'role') {
      const hit: RoleHit = { ...base, kind: isSelf(c) || isOwnGroup(c) ? 'self' : 'wanted', discipline: c.discipline, role: c.role }
      ;(hit.kind === 'self' ? interp.self : interp.wanted).push(hit)
      interp.hits.push(hit)
    } else if (c.type === 'business') {
      // "our brand", "we're a label": the visitor. "photos for a festival": what it's for.
      if (isSelf(c) || OWN_PREFIX.test(before(c))) {
        const hit: Hit = { ...base, kind: 'self' }
        interp.business ??= hit
        interp.hits.push(hit)
      } else {
        const hit: ProjectHit = { ...base, kind: 'project', check: /brand|compan|business|label|caf|venue|festival|shop|club|bar|hotel|restaurant|event/i }
        interp.projects.push(hit)
        interp.hits.push(hit)
      }
    } else if (c.type === 'style') {
      const hit: StyleHit = { ...base, kind: 'style', token: c.token }
      interp.styles.push(hit)
      interp.hits.push(hit)
    } else if (c.type === 'project') {
      const hit: ProjectHit = { ...base, kind: 'project', check: c.check }
      interp.projects.push(hit)
      interp.hits.push(hit)
    } else {
      const hit: PlaceHit = { ...base, kind: 'place', city: c.city, country: c.country }
      interp.place ??= hit
      interp.hits.push(hit)
    }
  }

  // Only said what they are ("I'm a photographer")? Suggest the usual partners.
  if (!interp.wanted.length) {
    const from = interp.self[0]?.discipline ?? (interp.business ? 'Brand / business' : undefined)
    const partners = from ? COMPLEMENTS[from] ?? [] : []
    if (partners.length) {
      interp.inferred = true
      interp.wanted = partners.map((discipline) => ({ start: -1, end: -1, text: '', kind: 'wanted', discipline }))
    }
  }
  return interp
}

// ---------- Matching ----------

export interface FoundMatch {
  creative: Creative
  score: number
  reasons: string[]
}

/** Quotes the visitor's own words; a sentence-initial capital ("Drummer needed") is lowered, acronyms (DJ, EP) kept. */
const quote = (s: string) => `“${s === s.toUpperCase() ? s : s[0].toLowerCase() + s.slice(1)}”`
const article = (s: string) => (/^[aeiou]/i.test(s) ? 'an' : 'a')
const withArticle = (s: string) => {
  const plural = /s$/i.test(s) && !/(ss|bass|chorus|vocals)$/i.test(s)
  return plural ? quote(s) : `${article(s)} ${quote(s)}`
}
/** "producer", "drummers", "DJ" name people; "music video", "photos", "mixing" name the work. */
const namesPerson = (s: string) =>
  /(er|or|ist|ian|dj|mc|poet|crew|band|choir|quartet|strings|soprano|alto|mezzo|kor)s?$/i.test(s.trim())
const asked = (s: string) => (namesPerson(s) ? `You asked for ${withArticle(s)}` : `Matches ${quote(s)}`)

function countryOf(location: string): string {
  const code = location.split(',').pop()?.trim().toUpperCase() ?? ''
  return US_STATES.has(code) ? 'US' : code
}

const NEAR_MISS = 12

export function findMatches(interp: Interpretation, creatives: Creative[], limit = 6): FoundMatch[] {
  const selfText = interp.self[0]?.text ?? interp.business?.text
  const selfDiscipline = interp.self[0]?.discipline
  // Someone named a role: only people in it (or near misses that fit in other ways) belong in the list.
  const explicit = interp.wanted.length > 0 && !interp.inferred

  const results = creatives.map((c): FoundMatch => {
    const roleText = `${c.role ?? ''} ${c.discipline}`.toLowerCase()
    const workText = [c.bio, c.styles.join(' '), ...c.portfolio.map((w) => `${w.title} ${w.description}`)].join(' ')
    const reasons: string[] = []
    let score = 0

    // Who they asked for: an exact role beats the same discipline.
    let best = 0
    let bestReason = ''
    for (const w of interp.wanted) {
      let s = 0
      let r = ''
      if (interp.inferred) {
        if (c.discipline === w.discipline) {
          s = 30
          // "Looking for a photographer like you" (below) already says it better when it applies.
          const saysItBetter = selfDiscipline && c.lookingFor.includes(selfDiscipline)
          r = saysItBetter ? '' : selfText ? `Pairs well with ${withArticle(selfText)}` : `Suggested ${c.discipline.toLowerCase()}`
        }
      } else if (w.role && roleText.includes(w.role)) {
        s = 45
        r = asked(w.text)
      } else if (c.discipline === w.discipline) {
        // Same field, different specialty: a cellist when they asked for a drummer.
        const role = (c.role ?? c.discipline).toLowerCase()
        s = w.role ? NEAR_MISS : 40
        r = w.role ? `Not ${withArticle(w.text)}, but ${article(role)} ${role}` : asked(w.text)
      }
      if (s > best) [best, bestReason] = [s, r]
    }
    if (best) {
      score += best
      if (bestReason) reasons.push(bestReason)
    }

    if (selfDiscipline && selfText && c.lookingFor.includes(selfDiscipline)) {
      score += 12
      reasons.push(`Looking for ${withArticle(selfText)} like you`)
    } else if (interp.business && /brand|compan|business|campaign|caf|label|commercial|jingle|launch/i.test(c.bio)) {
      score += 10
      reasons.push('Works with brands and businesses')
    }

    const styles = interp.styles.filter((s) => c.styles.some((cs) => cs.includes(s.token)) || c.bio.toLowerCase().includes(s.token))
    if (styles.length) {
      score += Math.min(styles.length * 10, 25)
      reasons.push(`Shared style: ${[...new Set(styles.map((s) => quote(s.text)))].join(', ')}`)
    }

    const projects = interp.projects.filter((p) => p.check.test(workText))
    if (projects.length) {
      score += Math.min(projects.length * 8, 16)
      reasons.push(`Their profile mentions ${[...new Set(projects.map((p) => quote(p.text)))].join(', ')}`)
    }

    const place = interp.place
    const sameCity = !!place?.city && c.location.toLowerCase().includes(place.city.toLowerCase())
    if (place) {
      if (sameCity) {
        score += 15
        reasons.push(`Also in ${place.city}`)
      } else if (countryOf(c.location) === place.country) {
        score += 7
        reasons.push(`Nearby, in ${COUNTRY_NAMES[place.country] ?? place.country}`)
      }
    }

    const fitsOtherwise = styles.length > 0 || projects.length > 0 || sameCity
    const relevant = explicit
      ? best > NEAR_MISS || (best === NEAR_MISS && fitsOtherwise)
      : best > 0 || styles.length > 0 || projects.length > 0

    if (c.availability === 'open') {
      score += 6
      if (relevant) reasons.push('Open to new projects')
    } else if (c.availability === 'busy') {
      score -= 15
    }

    return { creative: c, score: relevant ? Math.max(1, Math.min(score, 100)) : 0, reasons }
  })

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
