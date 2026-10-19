import { useEffect, type ReactNode } from 'react'
import { Avatar, Logo } from './components/ui'
import { hashParams, navigate, useRoute } from './lib/router'
import { useStore } from './lib/store'
import { Discover } from './pages/Discover'
import { Feed } from './pages/Feed'
import { Find } from './pages/Find'
import { Inbox } from './pages/Inbox'
import { Matches } from './pages/Matches'
import { Person } from './pages/Person'
import { Premium } from './pages/Premium'
import { ProfileForm } from './pages/ProfileForm'

const NAV = [
  ['feed', 'Showcase'],
  ['find', 'Find'],
  ['discover', 'Discover'],
  ['matches', 'Matches'],
  ['inbox', 'Messages'],
  ['premium', 'Premium'],
] as const

export default function App() {
  const { me, dispatch } = useStore()
  const [section = 'feed', param] = useRoute()

  // On phones the tab row scrolls sideways; keep the current tab in view.
  useEffect(() => {
    document.querySelector('.nav a.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [section, me])

  const params = hashParams()
  const query = params.get('q') ?? ''

  // Visitors arriving from the landing page's "What kind of collaboration…" box see results
  // (and profiles) before making an account; anything else starts with onboarding.
  if (!me) {
    if (section === 'find') return <VisitorShell query={query}>{<Find key={query} query={query} />}</VisitorShell>
    if (section === 'people' && param) return <VisitorShell query={query}>{<Person id={param} />}</VisitorShell>
    return <ProfileForm onboarding prefillQuery={query} next={params.get('next') ?? undefined} />
  }

  let page
  switch (section) {
    case 'find':
      page = <Find key={query} query={query} />
      break
    case 'discover':
      page = <Discover />
      break
    case 'matches':
      page = <Matches />
      break
    case 'inbox':
      page = <Inbox withId={param} />
      break
    case 'premium':
      page = <Premium />
      break
    case 'people':
      page = <Person id={param ?? ''} />
      break
    case 'me':
      page = param === 'edit' ? <ProfileForm /> : <Person id={me.id} />
      break
    default:
      page = <Feed />
  }

  return (
    <>
      <header className="topbar">
        <a href="#/feed" className="brand">
          <Logo size={22} />
          <span>Duet</span>
        </a>
        <nav className="nav">
          {NAV.map(([key, label]) => (
            <a key={key} href={`#/${key}`} className={section === key ? 'active' : ''}>
              {label}
            </a>
          ))}
        </nav>
        <div className="me-menu">
          <a href="../#waitlist" className="waitlist-link">
            <span className="wide-only">Join </span>waitlist
          </a>
          <button className="me-btn" onClick={() => navigate('/me')} aria-label="Your profile">
            <Avatar creative={me} size={34} />
          </button>
          <button
            className="ghost small"
            onClick={() => {
              if (confirm('Reset the demo? This clears your profile, posts and messages.')) {
                dispatch({ type: 'reset' })
                navigate('/feed')
              }
            }}
          >
            Reset
          </button>
        </div>
      </header>
      <main>{page}</main>
    </>
  )
}

/** Top bar for visitors who haven't made a demo profile yet. */
function VisitorShell({ query, children }: { query: string; children: ReactNode }) {
  return (
    <>
      <header className="topbar">
        <a href="../" className="brand">
          <Logo size={22} />
          <span>Duet</span>
        </a>
        <span className="spacer" />
        <div className="me-menu">
          <a href="../#waitlist" className="waitlist-link">
            <span className="wide-only">Join </span>waitlist
          </a>
          <button className="ghost small" onClick={() => navigate(`/start?q=${encodeURIComponent(query)}`)}>
            Create profile
          </button>
        </div>
      </header>
      <main>{children}</main>
    </>
  )
}
