import { useEffect, type CSSProperties } from 'react'
import { Logo } from '../components/Logo'
import { PHOTOS } from '../data/photos'
import { AskBox } from './AskBox'
import { WaitlistForm } from './WaitlistForm'

const MATCHES = [
  { id: 'c-maya', initials: 'MO', name: 'Maya Okafor', role: 'Cellist', city: 'Los Angeles', why: 'Looking for a composer', score: 100, hue: 30 },
  { id: 'c-ruth', initials: 'RA', name: 'Ruth Abara', role: 'Pianist', city: 'San Francisco', why: 'Shared style: chamber', score: 97, hue: 200 },
  { id: 'c-ines', initials: 'ID', name: 'Inés Duarte', role: 'Choreographer', city: 'Los Angeles', why: 'Also in Los Angeles', score: 79, hue: 345 },
]

const STEPS = [
  ['Brief', 'Your project, style and timeline.'],
  ['AI sources', 'Candidates filtered by fit.'],
  ['Humans vet', 'We judge the creative chemistry.'],
  ['Shortlist', 'Vetted people, intros made.'],
]

const TEAM = [
  ['Roger', 'Pianist', 18],
  ['Ben', 'Pianist & songwriter', 250],
  ['Brian', 'Music producer', 160],
  ['Jared', 'DJ & producer', 300],
] as const

const gradient = (hue: number) =>
  `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 40) % 360} 75% 52%))`

/** A sample person's photo (same AI-generated face as in the demo), or initials if there's none. */
function Face({ id, initials, hue }: { id: string; initials: string; hue: number }) {
  const photo = PHOTOS[id]
  return photo ? (
    <img className="avatar avatar-photo" src={`./photos/${photo}`} alt="" loading="lazy" decoding="async" />
  ) : (
    <span className="avatar" style={{ background: gradient(hue) }}>
      {initials}
    </span>
  )
}

export function Landing() {
  // The browser jumps to #waitlist before React renders it, so links like
  // "../#waitlist" from the demo would land at the top. Scroll once mounted.
  useEffect(() => {
    let id = window.location.hash.slice(1)
    try {
      id = decodeURIComponent(id)
    } catch {
      // Malformed escape like "#100%": keep the raw hash.
    }
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-nav">
        <a href="./" className="brand">
          <Logo size={20} />
          <span>Duet</span>
        </a>
        <nav aria-label="Main">
          <a href="#how" className="nav-link">
            How it works
          </a>
          <a href="#team" className="nav-link">
            Team
          </a>
          <a href="./demo/" className="btn btn-light btn-sm nav-demo">
            Try the demo
          </a>
          <a href="#waitlist" className="btn btn-dark btn-sm">
            Join waitlist
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero">
          <h1>
            The headhunter for <br className="br-wide" />
            creative collaboration.
          </h1>
          <p className="lede">Tell us what your project needs. We'll find collaborators who actually fit.</p>
          <AskBox />
          <p className="hero-alt">
            Or <a href="#waitlist">join the waitlist</a> to be first in line.
          </p>
        </section>

        <section className="showcase">
          <div className="panel panel-bloom">
            <div className="window" aria-hidden="true">
              <div className="window-head">
                <span>Your matches</span>
                <span className="window-sub">Suggested for a composer</span>
              </div>
              {MATCHES.map((m, i) => (
                <div key={m.name} className="match-row">
                  <Face id={m.id} initials={m.initials} hue={m.hue} />
                  <span className="match-who">
                    <strong>{m.name}</strong>
                    <small>
                      {m.role}
                      <span className="city"> · {m.city}</span>
                    </small>
                  </span>
                  <span className="match-why">{m.why}</span>
                  <span className="score" style={{ '--pct': `${m.score}%` } as CSSProperties}>
                    {m.score}
                  </span>
                  {i === 0 ? <span className="mini-btn">Say hello</span> : <span className="mini-btn ghosted">View</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="statement">
          <p className="label">From 12 interviews with creatives</p>
          <p className="statement-text">
            Creatives don't want another search tool. <span>They want the search done for them.</span>
          </p>
        </section>

        <section className="how" id="how" aria-labelledby="how-title">
          <h2 id="how-title" className="sr-only">
            How Duet works
          </h2>
          <div className="how-grid">
            <article className="panel how-panel">
              <p className="label">Free · Duet Community</p>
              <h3>Show your work. Meet your scene.</h3>
              <p className="panel-text">Portfolios, discovery and suggested matches.</p>
              <div className="stage stage-violet" aria-hidden="true">
                <div className="post">
                  <div className="post-head">
                    <Face id="c-amara" initials="AN" hue={40} />
                    <span>
                      <strong>Amara Nwosu</strong>
                      <small>Photographer · 2d ago</small>
                    </span>
                  </div>
                  <div
                    className="post-cover"
                    style={PHOTOS['c-amara-1'] ? { backgroundImage: `url(./photos/${PHOTOS['c-amara-1']})` } : undefined}
                  />
                  <div className="post-foot">
                    <span>Green Room</span>
                    <span className="like">♥ 24</span>
                  </div>
                </div>
              </div>
            </article>

            <article className="panel how-panel">
              <p className="label">Premium</p>
              <h3>We do the search for you.</h3>
              <p className="panel-text">€20 per search, plus 1% of what the project earns.</p>
              <div className="stage stage-coral" aria-hidden="true">
                <div className="brief">
                  <p className="brief-label">Brief</p>
                  <p className="brief-text">String trio for a chamber premiere in March.</p>
                  <div className="brief-tags">
                    <span>Instrumentalist</span>
                    <span>Contemporary</span>
                    <span>Copenhagen</span>
                  </div>
                  <div className="brief-result">
                    <span className="stack">
                      <Face id="c-ruth" initials="RA" hue={200} />
                      <Face id="c-maya" initials="MO" hue={30} />
                      <Face id="c-sora" initials="SL" hue={280} />
                    </span>
                    <span>
                      <strong>Shortlist ready</strong>
                      <small>3 vetted · intros sent</small>
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <p className="label steps-label">How Premium works</p>
          <ol className="steps">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="step">
                <span className="step-n">{i + 1}</span>
                <strong>{title}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="team" id="team" aria-labelledby="team-title">
          <p className="label">Team</p>
          <h2 id="team-title">Built by creatives.</h2>
          <ul className="team-list">
            {TEAM.map(([name, craft, hue]) => (
              <li key={name}>
                <span className="avatar avatar-lg" aria-hidden="true" style={{ background: gradient(hue) }}>
                  {name[0]}
                </span>
                <strong>{name}</strong>
                <small>{craft}</small>
              </li>
            ))}
          </ul>
        </section>

        <section className="join" id="waitlist" aria-labelledby="waitlist-title">
          <div className="panel join-panel">
            <h2 id="waitlist-title">Be first in line.</h2>
            <p className="panel-text">Early access to Duet.</p>
            <WaitlistForm />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-row">
          <a href="./" className="brand">
            <Logo size={18} />
            <span>Duet</span>
          </a>
          <nav aria-label="Footer">
            <a href="./demo/">Demo</a>
            <a href="#waitlist">Waitlist</a>
          </nav>
        </div>
        <div className="wordmark" aria-hidden="true">
          Duet
        </div>
      </footer>
    </>
  )
}
