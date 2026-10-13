import { Avatar, Logo } from './components/ui'
import { navigate, useRoute } from './lib/router'
import { useStore } from './lib/store'
import { Discover } from './pages/Discover'
import { Feed } from './pages/Feed'
import { Inbox } from './pages/Inbox'
import { Matches } from './pages/Matches'
import { Person } from './pages/Person'
import { Premium } from './pages/Premium'
import { ProfileForm } from './pages/ProfileForm'

const NAV = [
  ['feed', 'Showcase'],
  ['discover', 'Discover'],
  ['matches', 'Matches'],
  ['inbox', 'Messages'],
  ['premium', 'Premium'],
] as const

export default function App() {
  const { me, dispatch } = useStore()
  const [section = 'feed', param] = useRoute()

  if (!me) return <ProfileForm onboarding />

  let page
  switch (section) {
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
            Join waitlist
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
