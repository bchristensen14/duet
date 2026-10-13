import { Logo } from '../components/Logo'
import { WaitlistForm } from './WaitlistForm'

const PAINS = [
  ['⏱', 'Hours lost searching', 'Scrolling Instagram and scattered sites to find one person who might fit.'],
  ['✉', 'Cold DMs go unanswered', 'Messages to strangers mostly disappear into the void.'],
  ['◎', 'No way to judge fit', "You can't tell if someone shares your vision until you've already committed."],
  ['☼', 'Hard to get seen', 'Your work rarely travels beyond the people who already follow you.'],
]

const COMMUNITY = [
  ['Showcase your portfolio', 'Share recordings, films, images and writing in one profile built for collaborators.'],
  ['Discover your scene', 'Find creatives near you by discipline, style and availability.'],
  ['Get suggested matches', 'See who fits you best, and why, before you send the first message.'],
]

const STEPS = [
  ['Brief', 'Tell us the project, style, skills and timeline.'],
  ['AI sources', 'We filter candidates by discipline, style, location and availability.'],
  ['Humans vet', 'Our team reviews portfolios and judges creative chemistry.'],
  ['Shortlist', 'A few vetted, available collaborators, with intros already made.'],
]

const DISCIPLINES = [
  'Composers',
  'Singers',
  'Instrumentalists',
  'Producers',
  'DJs',
  'Dancers',
  'Choreographers',
  'Painters',
  'Illustrators',
  'Photographers',
  'Filmmakers',
  'Writers',
  'Poets',
]

const TEAM = [
  ['Roger', 'Pianist', 'Marketing and anthropology', 18],
  ['Ben', 'Pianist and singer-songwriter', 'Finance and entrepreneurship', 250],
  ['Brian', 'Music producer', 'Physics', 160],
  ['Jared', 'DJ and producer', 'Music and journalism', 300],
] as const

export function Landing() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-nav">
        <a href="./" className="brand" aria-label="Duet home">
          <Logo size={24} />
          <span>Duet</span>
        </a>
        <nav aria-label="Sections">
          <a href="#how" className="nav-link">
            How it works
          </a>
          <a href="#team" className="nav-link">
            Team
          </a>
          <a href="./demo/" className="btn btn-ghost-dark btn-sm">
            Try the demo
          </a>
          <a href="#waitlist" className="btn btn-primary btn-sm">
            Join the waitlist
          </a>
        </nav>
      </header>

      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Launching first in Copenhagen</p>
            <h1>The headhunter for creative collaboration.</h1>
            <p className="lede">
              Musicians, dancers, painters, photographers, writers: tell us what your project needs and we'll hand you a
              short list of collaborators who actually fit.
            </p>
            <div className="cta-row">
              <a href="#waitlist" className="btn btn-primary btn-lg">
                Join the waitlist
              </a>
              <a href="./demo/" className="btn btn-ghost-dark btn-lg">
                Try the demo →
              </a>
            </div>
            <p className="hero-note">Free to join. The demo runs in your browser, no sign-up needed.</p>
          </div>
          <MatchPreview />
        </section>

        <section className="section problem" aria-labelledby="problem-title">
          <div className="persona">
            <span className="persona-avatar" aria-hidden="true">
              W
            </span>
            <div>
              <p className="persona-meta">Meet William, 23 · Classical composer · California</p>
              <blockquote>
                “It's hard to find the right performers to collaborate with now that I've left the networks available to me
                at music school.”
              </blockquote>
            </div>
          </div>
          <h2 id="problem-title">Finding the right collaborator shouldn't be a full-time job.</h2>
          <p className="section-lede">Creatives in every discipline told us the same four things.</p>
          <div className="pains">
            {PAINS.map(([icon, title, text]) => (
              <article key={title} className="pain">
                <span className="pain-icon" aria-hidden="true">
                  {icon}
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="insight" aria-label="What we learned">
          <p className="insight-label">What 12 customer interviews told us</p>
          <p className="insight-quote">
            Creatives don't want another search tool. <em>They want the search done for them.</em>
          </p>
        </section>

        <section className="section" id="how" aria-labelledby="how-title">
          <h2 id="how-title">How Duet works</h2>
          <p className="section-lede">A free community to show your work and meet people, and a service that searches for you when you have a real project.</p>

          <div className="tiers">
            <article className="tier">
              <p className="tier-tag">Free</p>
              <h3>Duet Community</h3>
              <p className="tier-sub">A social app for creatives.</p>
              <ul className="feature-list">
                {COMMUNITY.map(([title, text]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <a href="./demo/" className="btn btn-secondary">
                Try the Community demo →
              </a>
            </article>

            <article className="tier tier-premium">
              <p className="tier-tag">Premium · €20 per search</p>
              <h3>Done-for-you search</h3>
              <p className="tier-sub">For when you have a real project and no time to search.</p>
              <ol className="steps">
                {STEPS.map(([title, text], i) => (
                  <li key={title}>
                    <span className="step-n">{i + 1}</span>
                    <span>
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="tier-foot">AI makes us efficient. Humans make us accurate.</p>
            </article>
          </div>
        </section>

        <section className="section for-who" aria-labelledby="who-title">
          <h2 id="who-title">For every creative discipline</h2>
          <p className="section-lede">
            Most collaboration tools are built for one kind of artist. Duet is built for the moment different kinds meet.
          </p>
          <ul className="discipline-cloud">
            {DISCIPLINES.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </section>

        <section className="demo-band" aria-labelledby="demo-title">
          <div>
            <h2 id="demo-title">See it for yourself</h2>
            <p>
              Make a profile in 30 seconds, see who you'd match with and why, and message a collaborator. Everything stays
              in your browser.
            </p>
          </div>
          <a href="./demo/" className="btn btn-primary btn-lg">
            Try the demo →
          </a>
        </section>

        <section className="section waitlist" id="waitlist" aria-labelledby="waitlist-title">
          <div className="waitlist-copy">
            <h2 id="waitlist-title">Join the waitlist</h2>
            <p>
              We're launching the free community in Copenhagen first. Join to get early access, and tell us what you'd want
              from Duet: we read every answer.
            </p>
            <ul className="perks">
              <li>Early access to Duet Community</li>
              <li>A say in what we build next</li>
              <li>First in line for done-for-you search</li>
            </ul>
          </div>
          <WaitlistForm />
        </section>

        <section className="section team" id="team" aria-labelledby="team-title">
          <h2 id="team-title">Built by creatives</h2>
          <p className="section-lede">Four co-founders who've lived the problem we're solving.</p>
          <div className="team-grid">
            {TEAM.map(([name, craft, background, hue]) => (
              <article key={name} className="member">
                <span
                  className="member-avatar"
                  aria-hidden="true"
                  style={{
                    background: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 40) % 360} 75% 52%))`,
                  }}
                >
                  {name[0]}
                </span>
                <h3>{name}</h3>
                <p className="member-craft">{craft}</p>
                <p className="member-bg">Co-founder · {background}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a href="./" className="brand" aria-label="Duet home">
          <Logo size={20} />
          <span>Duet</span>
        </a>
        <p>The headhunter for creative collaboration.</p>
        <nav aria-label="Footer">
          <a href="./demo/">Try the demo</a>
          <a href="#waitlist">Join the waitlist</a>
        </nav>
      </footer>
    </>
  )
}

/** A static glimpse of the Matches screen from the demo. */
function MatchPreview() {
  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-card">
        <div className="preview-head">
          <span className="preview-ring">
            <b>100</b>
            <small>fit</small>
          </span>
          <span className="preview-who">
            <span className="preview-avatar" style={{ background: 'linear-gradient(135deg,#f0a35a,#e6c33a)' }}>
              MO
            </span>
            <span>
              <strong>Maya Okafor</strong>
              <small>Cellist · Los Angeles</small>
            </span>
          </span>
        </div>
        <ul className="preview-reasons">
          <li>You're looking for an instrumentalist</li>
          <li>They're looking for a composer</li>
          <li>Shared style: film score, chamber</li>
          <li>Open to new projects</li>
        </ul>
        <span className="preview-btn">Say hello</span>
      </div>
      <div className="preview-card preview-card-back">
        <div className="preview-head">
          <span className="preview-ring preview-ring-87">
            <b>87</b>
            <small>fit</small>
          </span>
          <span className="preview-who">
            <span className="preview-avatar" style={{ background: 'linear-gradient(135deg,#b45ae6,#e63aa6)' }}>
              SL
            </span>
            <span>
              <strong>Sora Lindqvist</strong>
              <small>Soprano · San Francisco</small>
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
