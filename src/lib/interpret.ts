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
  /** People they asked for that the demo has nobody for yet (actors, models…). */
  missing: Hit[]
  /** True when nobody was asked for, so `wanted` was filled with roles that usually pair with `self`. */
  inferred: boolean
  styles: StyleHit[]
  projects: ProjectHit[]
  place?: PlaceHit
}

// ---------- Lexicons ----------
// Patterns are regex fragments matched case-insensitively on whole words. Longer, more
// specific entries come first; overlapping matches keep the earliest, then longest.
// Danish words are included in singular and plural ("fotograf", "fotografer").

/** Object words after a verb like "produce my …", "mix our …". */
const OBJ = '(?=\\s+(?:my|our|the|an?|it|them|this|some|his|her|their)\\b)'

const ROLES: { re: string; discipline: Discipline; role?: string }[] = [
  { re: 'singer[- ]songwriters?', discipline: 'Songwriter', role: 'singer-songwriter' },
  { re: 'song ?writers?|song ?writing|co-?writers?|sangskriver(?:e)?', discipline: 'Songwriter' },
  { re: 'lyricists?|lyrics|tekstforfatter(?:e)?', discipline: 'Writer', role: 'lyricist' },
  { re: 'rappers?|rap artists?|rapper(?:e)?|MCs?', discipline: 'Vocalist', role: 'rapper' },
  { re: 'sopranos?|opera singers?|mezzos?', discipline: 'Vocalist', role: 'soprano' },
  { re: 'singers?|sanger(?:e)?|sangerinde(?:r)?|forsanger(?:e)?', discipline: 'Vocalist', role: 'singer' },
  { re: 'vocalists?|vocals|vokalist(?:er)?', discipline: 'Vocalist' },
  { re: 'choirs?|kor', discipline: 'Vocalist' },
  { re: 'accompanists?|akkompagnatør(?:er)?', discipline: 'Instrumentalist', role: 'pianist' },
  { re: 'cellists?|cellos?|cellist(?:er)?', discipline: 'Instrumentalist', role: 'cellist' },
  { re: 'string quartets?|strings|string players?|strygere', discipline: 'Instrumentalist', role: 'string' },
  { re: 'violinists?|violinist(?:er)?|violins?|fiddlers?|fiddles?', discipline: 'Instrumentalist', role: 'violinist' },
  {
    re: 'pianists?|pianist(?:er)?|pianos?|piano players?|keyboardists?|keyboard players?|keys? players?|keyboards?|keys',
    discipline: 'Instrumentalist',
    role: 'pianist',
  },
  { re: 'guitarr?ists?|guitarist(?:er)?|guitars?|guitar players?', discipline: 'Instrumentalist', role: 'guitarist' },
  { re: 'bassists?|bassist(?:er)?|bass players?|bass(?![ -](?:music|drops?|lines?|heavy|boost))', discipline: 'Instrumentalist', role: 'bassist' },
  { re: 'drumm?ers?|drums|percussionists?|trommeslager(?:e)?', discipline: 'Instrumentalist', role: 'drummer' },
  { re: 'saxophonists?|saxofonist(?:er)?|saxophones?|sax(?: players?)?', discipline: 'Instrumentalist', role: 'saxophonist' },
  { re: 'trumpeters?|trumpets?|horn players?|horns|brass', discipline: 'Instrumentalist', role: 'trumpet' },
  { re: '(?:covers? |wedding |live )?bands?|(?:punk|rock|pop|jazz|metal|funk)band|trios?|duos?|live music|live musicians?|live acts?|livemusik', discipline: 'Instrumentalist', role: 'band' },
  { re: 'musicians?|instrumentalists?|session players?|session musicians?|musiker(?:e)?|orchestras?|ensembles?|orkestre?|orkester', discipline: 'Instrumentalist' },
  { re: 'film composers?', discipline: 'Composer', role: 'film composer' },
  { re: 'composers?|komponist(?:er)?|conductors?|dirigent(?:er)?|scor(?:e|ing) (?:my|our|a|the|for)', discipline: 'Composer' },
  {
    re: `mix(?:ing)? engineers?|mixing|mastering|sound engineers?|lydtekniker(?:e)?|mix(?=\\s+(?:and|&|og)\\s+master)|mix${OBJ}|master${OBJ}|mixe|mastere`,
    discipline: 'Producer',
    role: 'mix',
  },
  { re: `produc[eo]rs?|music producers?|beat ?makers?|beats|producer(?:e)?|produce${OBJ}`, discipline: 'Producer', role: 'producer' },
  { re: 'sound designers?|sound design|lyddesigner(?:e)?', discipline: 'Producer', role: 'sound design' },
  { re: 'jingles?', discipline: 'Producer' },
  { re: 'djs?|deejays?', discipline: 'DJ', role: 'dj' },
  { re: 'choreographers?|choreography|koreograf(?:er)?', discipline: 'Choreographer' },
  { re: 'dancers?|dance crews?|danser(?:e)?', discipline: 'Dancer' },
  { re: 'muralists?|murals?', discipline: 'Painter', role: 'mural' },
  { re: 'live painters?|painters?|maler(?:e)?', discipline: 'Painter' },
  { re: 'animators?|animator(?:er)?|animated|animation', discipline: 'Illustrator', role: 'animator' },
  { re: 'illustrators?|illustrator(?:er)?|illustrations?', discipline: 'Illustrator' },
  { re: 'photographers?|photography|photo ?shoots?|product photos?|photos|headshots?|fotograf(?:er)?', discipline: 'Photographer' },
  { re: 'music video directors?|music videos?|musikvideo(?:er)?', discipline: 'Filmmaker', role: 'music video' },
  { re: 'film editors?|video editors?|editors?|editing|klipper(?:e)?', discipline: 'Filmmaker', role: 'editor' },
  {
    re:
      'filmmakers?|film ?makers?|filmskaber(?:e)?|directors?|videographers?|videograf(?:er)?|cinematographers?|' +
      'camera (?:person|operator)s?|instruktør(?:er)?|after-?movies?|promo(?:tional)? videos?|brand videos?|' +
      `event videos?|wedding (?:films?|videos?)|recap videos?|videos?|film(?:ing)?${OBJ}|` +
      'shoot(?:ing)? (?:our|my|a|the) (?:video|film)s?',
    discipline: 'Filmmaker',
  },
  { re: 'copywriters?|copy ?writing', discipline: 'Writer', role: 'copywriter' },
  { re: 'screenwriters?|scriptwriters?|librettists?|writers?|forfatter(?:e)?', discipline: 'Writer' },
  { re: 'poets?|spoken word (?:artists?|poets?|performers?)|digter(?:e)?', discipline: 'Poet' },
  { re: 'graphic designers?|graphic design|brand designers?|grafiske? designer(?:e)?|grafiker(?:e)?', discipline: 'Designer', role: 'graphic designer' },
  {
    re: 'logos?|branding|visual identity|designers?|designer(?:e)?|merch(?:andise)?|label designs?|cover designs?|artwork|album art(?:work)?|(?:album )?cover art(?:work)?|album covers?|design(?:s|ed|ing)?',
    discipline: 'Designer',
  },
]

/** People the demo has no one for yet. Highlighted, then named honestly instead of silently ignored. */
const MISSING =
  'actors?|actress(?:es)?|skuespiller(?:e)?|models?|modeller|tattoo artists?|tattooists?|make-?up artists?|' +
  'stylists?|caterers?|florists?|(?:web )?developers?|programmers?|teachers?|underviser(?:e)?|voice actors?|' +
  'comedians?|magicians?|sculptors?|billedhugger(?:e)?'

const BUSINESS =
  'record labels?|labels?|pladeselskab(?:er)?|brands?|compan(?:y|ies)|business(?:es)?|agenc(?:y|ies)|startups?|' +
  'restaurants?|caf(?:e|é)s?|coffee (?:shops?|brands?|roasters?|roastery)|baker(?:y|ies)|bager(?:i|ier)|venues?|' +
  'theat(?:re|er)s?|teatre?|galler(?:y|ies)|galleri(?:er)?|shops?|stores?|butik(?:ker)?|magazines?|bars?|hotels?|clubs?|' +
  'brewer(?:y|ies)|bryggeri(?:er)?|museums?|museer|museum|schools?|skole(?:r)?|festivals?|podcasts?|game studios?|' +
  'event planners?|wedding planners?|organi[sz]ers?|non-?profits?|ngos?|church(?:es)?|kirke(?:r)?|firma|virksomhed'

const STYLES: [string, string][] = [
  ['contemporary dance', 'contemporary dance'],
  ['street ?dance|breaking|breakdance', 'street dance'],
  ['contemporary classical', 'contemporary classical'],
  ['classical|klassisk', 'classical'],
  ['indie', 'indie'],
  ['k-?pop|pop', 'pop'],
  ['rock', 'rock'],
  ['punk', 'punk'],
  ['metal', 'metal'],
  ['folk', 'folk'],
  ['funk(?:y)?', 'funk'],
  ['jazz(?:y)?', 'jazz'],
  ['blues', 'blues'],
  ['soul(?:ful)?', 'soul'],
  ['r&b|rnb|r and b', 'r&b'],
  ['hip[- ]?hop|rap', 'hip-hop'],
  ['electronica?|edm', 'electronic'],
  ['techno', 'techno'],
  ['drum (?:and|&|n\'?) bass|dnb|d&b', 'drum and bass'],
  ['house music|deep house|tech house|house(?= (?:tracks?|songs?|sets?|beats?|music|part(?:y|ies)|nights?|dj))', 'house'],
  ['disco', 'disco'],
  ['ambient', 'ambient'],
  ['lo-?fi', 'lo-fi'],
  ['chamber', 'chamber'],
  ['opera(?:tic)?', 'opera'],
  ['film scores?|soundtracks?|cinematic', 'film score'],
  ['experimental', 'experimental'],
  ['minimal(?:ism|ist)?', 'minimal'],
  ['ballet', 'ballet'],
  ['documentar(?:y|ies)|dokumentar', 'documentary'],
  ['portraits?', 'portrait'],
  ['fashion', 'fashion'],
  ['black and white|b&w', 'black and white'],
  ['surreal(?:ist)?', 'surreal'],
  ['abstract', 'abstract'],
  ['acoustic|akustisk', 'acoustic'],
  ['country', 'country'],
  ['gospel', 'gospel'],
  ['spoken word|poetry|slam', 'poetry'],
]

/** What the work is for. The regex checks a creative's bio and portfolio for related work. */
const PROJECTS: [string, RegExp][] = [
  ['(?:first |debut )?eps?', /\beps?\b/i],
  ['(?:debut )?albums?|lps?', /\balbums?\b/i],
  ['singles?|songs?|tracks?|sange?', /\b(?:singles?|songs?|tracks?)\b/i],
  ['album covers?|cover art', /\bcovers?\b|cover art/i],
  ['short films?|films?|movies?|kortfilm', /\bfilms?\b|short film|kortfilm/i],
  ['weddings?|bryllup(?:per)?|(?:getting |get |got )married|marry(?:ing)?|marriage', /wedding/i],
  ['campaigns?|ads?|adverts?|commercials?|reklame(?:r)?', /campaign|commercial|\bbrands?\b/i],
  ['packaging|emballage', /packaging/i],
  ['launch(?:es)?|launch part(?:y|ies)|opening(?: night| party)?', /launch|opening/i],
  ['tours?|touring|turné', /\btour/i],
  ['dj[ -]?sets?', /dj sets?|club|\bsets?\b/i],
  ['concerts?|gigs?|live shows?|live sets?|performances?|koncert(?:er)?', /live (?:shows?|sets?|sessions?|gigs?)\b|concert|\bgigs?\b|perform/i],
  ['club nights?|part(?:y|ies)|fest', /club night|\bpart(?:y|ies)\b/i],
  ['games?|video games?|spil', /\bgames?\b/i],
  ['stage|theat(?:re|er) (?:show|production|piece)s?|productions?', /\bstage\b|theat(?:re|er)/i],
  ['premieres?', /premiere/i],
  ['recordings?|recording sessions?|session work|studio sessions?', /session|recording|\brecords?\b/i],
  ['lyric videos?', /lyric video/i],
]

const PLACES: [string, string | undefined, string][] = [
  [
    'copenhagen|københavn|kobenhavn|kbh|cph|nørrebro|norrebro|vesterbro|østerbro|osterbro|frederiksberg|amager|' +
      'valby|nordvest|sydhavn|refshaleøen|christianshavn|islands brygge',
    'Copenhagen',
    'DK',
  ],
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

/**
 * Phrases that introduce who the visitor wants; roles after the first one count as "wanted".
 * Not inside a relative clause: in "any producers who want to work on my EP", "who want" is theirs.
 */
const SEEK =
  /(?<![\p{L}\p{N}])(?<!\b(?:who|that|which)\s+)(?:looking for|look(?:ing)? to (?:find|hire|work with|meet)|searching for|seeking|need(?:s|ing|ed)?|want(?:s|ing|ed)?|hire|hiring|find(?:ing)?|to work with|collaborat(?:e|ing) with|collab with|team up with|(?:i'?m|we'?re|i am|we are) after|do you know|know any|recommend|leder efter|på udkig efter|søger|søges|mangler|har brug for)(?![\p{L}\p{N}])/iu

/** "I'm a …", "we are a …" just before a word marks it as describing the visitor. */
const SELF_PREFIX = /(?:^|[^\p{L}])(?:i'?m|i am|im|we'?re|we are|i work as|i play|as an?|jeg er|vi er)\s+(?:an?\s+|en\s+|et\s+)?(?:[\p{L}'-]+\s+){0,3}$/iu
const OWN_PREFIX =
  /(?:^|[^\p{L}])(?:our|my|i run|we run|i own|we own|i host|we host|we'?re organi[sz]ing|organi[sz]ing|we'?re running|vores|min|mit)\s+(?:[\p{L}'&-]+\s+){0,2}$/iu
/** "I want to make album art", "we'd love to shoot a video": the visitor makes it, so it's their project. */
const MAKES =
  /\b(?:i|we|and)(?:'d| would)?\s+(?:want to |wanna |like to |love to |plan to )?(?:make|create|design|shoot|film|record|draw|paint)\s+(?:(?:an?|the|some|my|our)\s+)?(?:[\p{L}'-]+\s+)?$/iu
/** "… for a trio", "… til et punkband": what the people asked for would join. Not "looking for a band". */
const FOR_GROUP =
  /(?<!(?:looking|searching|leder|søger)\s)\b(?:for|til)\s+(?:(?:an?|our|my|the|et|en|vores|mit|min)\s+)?(?:[\p{L}&'-]+\s+){0,2}$/iu
/** "I don't need a producer", "not a drummer": a role to leave out entirely. */
const NEGATED = /(?:don'?t|do not|doesn'?t|not|no|without|ikke)\s+(?:really\s+)?(?:need|want|looking for)?\s*(?:an?\s+|any\s+|en\s+)?$/i
/** "Session guitarist available for …": the visitor offering themselves. */
const OFFERING = /^\s+(?:available|for hire|offering|here|looking for work|ledig)\b/i
/** "our drummer just quit, need a new one": the member they need to replace. */
const REPLACING = /\b(?:quit|left|leaving|replace|replacement|new one|another one|ny|nyt)\b/i

/** Who usually pairs well with whom, used when a visitor only says what they are. */
const COMPLEMENTS: Partial<Record<Discipline, Discipline[]>> = {
  Vocalist: ['Producer', 'Instrumentalist', 'Songwriter'],
  Songwriter: ['Producer', 'Instrumentalist', 'Vocalist'],
  Producer: ['Vocalist', 'Songwriter', 'Instrumentalist'],
  Instrumentalist: ['Vocalist', 'Songwriter', 'Producer', 'Instrumentalist'],
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
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const ROLE_RES = ROLES.map((r) => ({ ...r, rx: word(r.re) }))
const MISSING_RE = word(MISSING)
const BUSINESS_RE = word(BUSINESS)
const STYLE_RES = STYLES.map(([re, token]) => ({ rx: word(re), token }))
const PROJECT_RES = PROJECTS.map(([re, check]) => ({ rx: word(re), check }))
const PLACE_RES = PLACES.map(([re, city, country]) => ({ rx: word(re), city, country }))

type Candidate =
  | { type: 'role'; start: number; end: number; discipline: Discipline; role?: string }
  | { type: 'missing'; start: number; end: number }
  | { type: 'business'; start: number; end: number }
  | { type: 'style'; start: number; end: number; token: string }
  | { type: 'project'; start: number; end: number; check: RegExp }
  | { type: 'place'; start: number; end: number; city?: string; country: string }

const MAX_LENGTH = 600

/** "producer", "drummers", "DJ" name people; "music video", "photos", "mixing" name the work. */
const namesPerson = (s: string) =>
  /(er|or|ist|ian|dj|mc|poet|crew|band|duo|trio|choir|kor|quartet|orchestra|ensemble|inde|strings|soprano|alto|mezzo|ere|ør|graf)s?$/i.test(s.trim())

export function interpret(input: string): Interpretation {
  const text = input.slice(0, MAX_LENGTH)
  const found: Candidate[] = []
  const scan = (rx: RegExp, make: (start: number, end: number) => Candidate) => {
    for (const m of text.matchAll(rx)) if (m[0]) found.push(make(m.index, m.index + m[0].length))
  }
  for (const r of ROLE_RES) scan(r.rx, (start, end) => ({ type: 'role', start, end, discipline: r.discipline, role: r.role }))
  scan(MISSING_RE, (start, end) => ({ type: 'missing', start, end }))
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
  const postfix = !!seekMatch && /^(needed|wanted|søges)$/i.test(seekMatch[0])
  const seek = seekMatch && !postfix ? seekMatch.index : -1
  const sentenceStart = (c: Candidate) => text.slice(0, c.start).search(/[.!?][^.!?]*$/) + 1
  const before = (c: Candidate) => text.slice(sentenceStart(c), c.start)
  const after = (c: Candidate) => text.slice(c.end, c.end + 30)
  const words = (c: Candidate) => text.slice(c.start, c.end)
  // "I'm a …" only counts when no "looking for" sits in between ("I'm looking for a producer").
  const selfPrefix = (c: Candidate) => {
    const m = SELF_PREFIX.exec(before(c))
    return !!m && !SEEK.test(m[0])
  }
  const isSelf = (c: Candidate) => selfPrefix(c) || OFFERING.test(after(c)) || (seek >= 0 && c.start < seek)
  const isGroup = (c: Candidate) => /band|choir|kor|quartet|trio|crew|duo|ensemble|orchestra|orkest/i.test(words(c))
  // "our band", "my choir": a group the visitor belongs to. So is the group in "singer needed for a
  // covers band" or "seeking a bassist and a drummer for a trio", once the ask has been made.
  const isOwnGroup = (c: Candidate, asked: boolean) =>
    isGroup(c) && (OWN_PREFIX.test(before(c)) || ((postfix || asked) && FOR_GROUP.test(before(c))))
  // "our drummer just quit": a member they need to replace.
  const isLeavingMember = (c: Candidate) => OWN_PREFIX.test(before(c)) && namesPerson(words(c)) && REPLACING.test(text)
  const negated = (c: Candidate) => NEGATED.test(text.slice(Math.max(0, c.start - 40), c.start))

  const interp: Interpretation = { text, hits: [], self: [], wanted: [], missing: [], inferred: false, styles: [], projects: [] }
  const addProject = (base: Omit<Hit, 'kind'>, check: RegExp) => {
    const hit: ProjectHit = { ...base, kind: 'project', check }
    interp.projects.push(hit)
    interp.hits.push(hit)
  }

  for (const c of picked) {
    const base = { start: c.start, end: c.end, text: words(c) }
    if (c.type === 'role') {
      if (negated(c)) continue
      const self = isOwnGroup(c, interp.wanted.length > 0) || (!isLeavingMember(c) && isSelf(c))
      // "my music video", "dance cover video, need a …": their own work, not a person. "I play drums" is them.
      const plays = /\b(?:i|we) play\s+(?:the\s+)?$/i.test(before(c))
      if (!namesPerson(base.text) && !plays && (self || OWN_PREFIX.test(before(c)) || MAKES.test(before(c)))) {
        addProject(base, new RegExp(escapeRe(base.text), 'i'))
        continue
      }
      const hit: RoleHit = { ...base, kind: self ? 'self' : 'wanted', discipline: c.discipline, role: c.role }
      ;(self ? interp.self : interp.wanted).push(hit)
      interp.hits.push(hit)
    } else if (c.type === 'missing') {
      if (negated(c) || isSelf(c)) continue
      const hit: Hit = { ...base, kind: 'wanted' }
      interp.missing.push(hit)
      interp.hits.push(hit)
    } else if (c.type === 'business') {
      // "our brand", "we're a label": the visitor. "photos for a festival": what it's for.
      if (isSelf(c) || OWN_PREFIX.test(before(c))) {
        if (interp.business && interp.business.text.toLowerCase() === base.text.toLowerCase()) continue
        const hit: Hit = { ...base, kind: 'self' }
        interp.business ??= hit
        interp.hits.push(hit)
      } else {
        const stem = base.text.toLowerCase().replace(/(?:ies|es|s)$/, '')
        addProject(base, new RegExp(`\\b${escapeRe(stem)}`, 'i'))
      }
    } else if (c.type === 'style') {
      const hit: StyleHit = { ...base, kind: 'style', token: c.token }
      interp.styles.push(hit)
      interp.hits.push(hit)
    } else if (c.type === 'project') {
      addProject(base, c.check)
    } else {
      const hit: PlaceHit = { ...base, kind: 'place', city: c.city, country: c.country }
      interp.place ??= hit
      interp.hits.push(hit)
    }
  }

  // "Brand photoshoot for our fashion brand": don't list the business as both "you" and "for".
  if (interp.business) {
    const own = interp.business.text.toLowerCase()
    const dupes = interp.projects.filter((p) => p.text.toLowerCase() === own)
    interp.projects = interp.projects.filter((p) => !dupes.includes(p))
    interp.hits = interp.hits.filter((h) => !dupes.includes(h as ProjectHit))
  }

  // Only said what they are ("I'm a photographer")? Suggest the usual partners. Not when they
  // asked for someone we don't have (actors): saying so beats guessing.
  if (!interp.wanted.length && !interp.missing.length) {
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

/** Quotes the visitor's own words; a sentence-initial capital ("Drummer needed") is lowered, acronyms (DJ, EPs) kept. */
export const quote = (s: string) => `“${s === s.toUpperCase() || /^.[A-Z]/.test(s) ? s : s[0].toLowerCase() + s.slice(1)}”`
// "an MC", "an EP" but "a DJ": acronyms go by how the first letter sounds.
const article = (s: string) => (/^[aeiou]/i.test(s) || /^[FHLMNRSX](?:[A-Z]|$)/.test(s) ? 'an' : 'a')
const withArticle = (s: string) => {
  // English -s plurals, and Danish ones: musikere, dansere, komponister, fotografer, instruktører.
  const plural = (/s$/i.test(s) && !/(ss|bass|chorus|vocals)$/i.test(s)) || /(?:ere|ister|grafer|ører)$/i.test(s)
  return plural ? quote(s) : `${article(s)} ${quote(s)}`
}
const asked = (s: string) => (namesPerson(s) ? `You asked for ${withArticle(s)}` : `Matches ${quote(s)}`)

/** The person behind a role key, for "Not a saxophonist, but a violinist" when they typed "saxophone". */
const ROLE_NOUN: Record<string, string> = {
  mix: 'mix engineer',
  string: 'string player',
  trumpet: 'trumpet player',
  'music video': 'music video director',
  'sound design': 'sound designer',
  mural: 'muralist',
}
/** Roles that cover more than one wording: a soprano or a vocalist is a singer too. */
const ROLE_MATCH: Record<string, RegExp> = {
  singer: /singer|soprano|vocalist/,
  mix: /mix|master/,
  mural: /mural/,
}
/** Signs in a profile that someone plays live with others, for "band" and "live music" requests. */
const PLAYS_LIVE = /\bband\b|quartet|ensemble|live (?:shows?|sets?|sessions?|at)\b|wedding|session|tour/i

function countryOf(location: string): string {
  const code = location.split(',').pop()?.trim().toUpperCase() ?? ''
  return US_STATES.has(code) ? 'US' : code
}

const NEAR_MISS = 12

export function findMatches(interp: Interpretation, creatives: Creative[], limit = 6): FoundMatch[] {
  // Only asked for people the demo doesn't have (actors)? The page says so; filler would mislead.
  if (interp.missing.length && !interp.wanted.length) return []
  const me = interp.self[0]
  // "a “singer”" in their words; for "I play drums", name the person instead: "a drummer".
  const selfNoun = me && !namesPerson(me.text) ? ROLE_NOUN[me.role ?? ''] ?? me.role ?? me.discipline.toLowerCase() : ''
  const selfText = me?.text ?? interp.business?.text
  const asSelf = (s: string) => (selfNoun ? `${article(selfNoun)} ${selfNoun}` : withArticle(s))
  const selfDiscipline = interp.self[0]?.discipline
  // Someone named a role: only people in it (or near misses that fit in other ways) belong in the list.
  const explicit = interp.wanted.length > 0 && !interp.inferred

  const score = (c: Creative, allowNearMiss: boolean): FoundMatch => {
    const roleText = `${c.role ?? ''} ${c.discipline}`.toLowerCase()
    const workText = [c.bio, c.styles.join(' '), ...c.portfolio.map((w) => `${w.title} ${w.description}`)].join(' ')
    const reasons: string[] = []
    let total = 0

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
          r = saysItBetter ? '' : selfText ? `Pairs well with ${asSelf(selfText)}` : `Suggested ${c.discipline.toLowerCase()}`
        }
      } else if (w.role === 'band') {
        if (['Instrumentalist', 'Vocalist'].includes(c.discipline) && PLAYS_LIVE.test(workText)) {
          s = 40
          r = `Plays live (you asked for ${namesPerson(w.text) ? withArticle(w.text) : quote(w.text)})`
        }
      } else if (w.role && (ROLE_MATCH[w.role] ?? new RegExp(escapeRe(w.role))).test(roleText)) {
        s = 45
        r = asked(w.text)
      } else if (!w.role && c.discipline === w.discipline) {
        // Their title says what was asked ("illustrator" for an illustrator) beats the same field.
        s = (c.role ?? '').toLowerCase().includes(w.text.toLowerCase().replace(/s$/, '')) ? 45 : 40
        r = asked(w.text)
      } else if (w.role && c.discipline === w.discipline) {
        // Same field, different specialty: a cellist when they asked for a drummer.
        const role = (c.role ?? c.discipline).toLowerCase()
        const wantedNoun = namesPerson(w.text) ? w.text.toLowerCase() : ROLE_NOUN[w.role] ?? w.role
        s = NEAR_MISS
        r = `Not ${article(wantedNoun)} ${wantedNoun}, but ${article(role)} ${role}`
      }
      if (s > best) [best, bestReason] = [s, r]
    }
    if (best) {
      total += best
      if (bestReason) reasons.push(bestReason)
    }

    if (selfDiscipline && selfText && c.lookingFor.includes(selfDiscipline)) {
      total += 12
      reasons.push(`Looking for ${asSelf(selfText)} like you`)
    } else if (interp.business && /brand|compan|business|campaign|caf|label|commercial|jingle|launch/i.test(c.bio)) {
      total += 10
      reasons.push('Works with brands and businesses')
    }

    const styles = interp.styles.filter((s) => c.styles.some((cs) => cs.includes(s.token)) || c.bio.toLowerCase().includes(s.token))
    if (styles.length) {
      total += Math.min(styles.length * 10, 25)
      reasons.push(`Shared style: ${[...new Set(styles.map((s) => quote(s.text)))].join(', ')}`)
    }

    // Quote the visitor's word only when the profile really says it; otherwise quote the profile.
    const mentions = new Set<string>()
    for (const p of interp.projects) {
      const m = workText.match(p.check)
      if (!m) continue
      mentions.add(quote(workText.toLowerCase().includes(p.text.toLowerCase()) ? p.text : m[0]))
    }
    if (mentions.size) {
      total += Math.min(mentions.size * 8, 16)
      reasons.push(`Their work mentions ${[...mentions].join(', ')}`)
    }

    const place = interp.place
    const sameCity = !!place?.city && c.location.toLowerCase().includes(place.city.toLowerCase())
    if (place) {
      if (sameCity) {
        total += 15
        reasons.push(`Also in ${place.city}`)
      } else if (countryOf(c.location) === place.country) {
        total += 7
        reasons.push(`Nearby, in ${COUNTRY_NAMES[place.country] ?? place.country}`)
      }
    }

    const fitsOtherwise = styles.length > 0 || mentions.size > 0 || sameCity
    const relevant = explicit
      ? best > NEAR_MISS || (best === NEAR_MISS && (fitsOtherwise || allowNearMiss))
      : best > 0 || styles.length > 0 || mentions.size > 0

    if (c.availability === 'open') {
      total += 6
      if (relevant) reasons.push('Open to new projects')
    } else if (c.availability === 'busy') {
      total -= 15
    }

    return { creative: c, score: relevant ? Math.max(1, Math.min(total, 100)) : 0, reasons }
  }

  const rank = (allowNearMiss: boolean) =>
    creatives
      .map((c) => score(c, allowNearMiss))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

  // Nobody in the exact role (no bassist yet)? Show the closest people rather than an empty page.
  const ranked = rank(false)
  return ranked.length || !explicit ? ranked : rank(true)
}
