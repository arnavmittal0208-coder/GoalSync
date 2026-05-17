import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CircleGauge,
  MessageSquare,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    icon: CircleGauge,
    title: 'Live visibility',
    text: 'See goal progress and check-ins update in real time. No more chasing status in Slack or email threads.',
  },
  {
    icon: Users,
    title: 'Built for teams',
    text: 'Review individual progress and team trends from one central place. Perfect for 1:1s and team retrospectives.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    text: 'Separate employee, manager, and admin views with fine-grained permissions. Everyone sees exactly what they need.',
  },
  {
    icon: BarChart3,
    title: 'OKR tracking',
    text: 'Set quarterly objectives and key results. Track progress automatically with colour-coded health indicators.',
  },
  {
    icon: MessageSquare,
    title: 'Async check-ins',
    text: 'Team members submit structured check-ins on their own schedule. Managers review them in digest format — no meetings required.',
  },
  {
    icon: Activity,
    title: 'Health signals',
    text: 'Morale scores, blockers, and sentiment trends surface automatically so nothing slips through the cracks.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="landing-nav">
        <a className="landing-brand" href="/">
          <span className="landing-brand__icon">
            <Target size={18} />
          </span>
          <span className="landing-brand__text">GoalSync</span>
        </a>

        <nav className="landing-nav__links" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#login">Sign in</a>
        </nav>

        <div className="landing-nav__actions">
          <a href="#login" className="landing-chip landing-chip--ghost">
            Sign in
          </a>
          <button onClick={handleGetStarted} className="landing-chip landing-chip--solid">
            Get started free
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="landing-hero">
          <div className="landing-hero__left">
            <div className="landing-eyebrow">
              <span />Performance management, simplified
            </div>

            <h1>
              A <em>sharper</em> way to run goals &amp; team progress.
            </h1>

            <p className="landing-hero__copy">
              Track check-ins, OKRs, and team health in one calm, polished workspace built for employees,
              managers, and admins alike.
            </p>

            <div className="landing-hero__cta">
              <button onClick={handleGetStarted} className="landing-btn landing-btn--solid landing-btn--large">
                Start for free
                <ArrowRight size={16} />
              </button>
              <a href="#features" className="landing-btn landing-btn--outline landing-btn--large">
                See features
              </a>
            </div>

            <div className="landing-social">
              <div className="landing-avatars" aria-hidden="true">
                <span className="landing-avatar landing-avatar--mint">JM</span>
                <span className="landing-avatar landing-avatar--blue">SR</span>
                <span className="landing-avatar landing-avatar--sand">AK</span>
                <span className="landing-avatar landing-avatar--lavender">TP</span>
              </div>
              <p>
                <strong>2,400+ teams</strong> already run goals on GoalSync
              </p>
            </div>
          </div>

          <div className="landing-hero__right">
            {/* Card 1: Goals Progress */}
            <article className="landing-card landing-card--compact">
              <div className="landing-card__label">Q2 OKR Progress</div>
              <div className="landing-card__title">Engineering Team Goals</div>

              {[
                { name: 'Ship v2.0 release', pct: 78 },
                { name: 'Reduce bug backlog', pct: 62 },
                { name: 'API response time <200ms', pct: 91 },
              ].map((item) => (
                <div className="landing-progress" key={item.name}>
                  <div className="landing-progress__info">
                    <span>{item.name}</span>
                    <div className="landing-progress__bar">
                      <div className="landing-progress__fill" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                  <strong>{item.pct}%</strong>
                </div>
              ))}
            </article>

            {/* Cards Grid */}
            <div className="landing-hero__grid">
              {/* Stats Card */}
              <article className="landing-card landing-card--stats">
                <div className="landing-card__label">This week</div>
                <div className="landing-stats">
                  <div className="landing-stat">
                    <span>12</span>
                    <small>Check-ins</small>
                  </div>
                  <div className="landing-stat">
                    <span>94%</span>
                    <small>On-track</small>
                  </div>
                </div>
              </article>

              {/* Accent Card */}
              <article className="landing-card landing-card--accent">
                <div className="landing-card__label landing-card__label--inverse">Team health</div>
                <div className="landing-accent__value">8.4</div>
                <div className="landing-accent__copy">avg. morale score</div>
                <div className="landing-accent__trend">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <polyline points="18 15 12 9 6 15" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  +1.2 vs last month
                </div>
              </article>
            </div>

            {/* Check-ins Card */}
            <article className="landing-card landing-card--checkins">
              <div className="landing-card__label">Recent Check-ins</div>
              <div className="landing-checkins">
                <div className="landing-checkin">
                  <span className="landing-checkin__dot" />
                  <span className="landing-checkin__name">Sarah R. — Weekly update submitted</span>
                  <span className="landing-checkin__tag">Done</span>
                </div>
                <div className="landing-checkin">
                  <span className="landing-checkin__dot landing-checkin__dot--amber" />
                  <span className="landing-checkin__name">Marcus T. — Blocked on deployment</span>
                  <span className="landing-checkin__tag landing-checkin__tag--warn">Blocked</span>
                </div>
                <div className="landing-checkin">
                  <span className="landing-checkin__dot" />
                  <span className="landing-checkin__name">Priya K. — Goal updated to 85%</span>
                  <span className="landing-checkin__tag">Done</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Features Section */}
        <section className="landing-features" id="features">
          <div className="landing-section-label">Why GoalSync</div>
          <h2 className="landing-section-title">Everything your team needs to stay aligned.</h2>
          <p className="landing-section-sub">
            One workspace. Every goal, check-in, and team signal in a single, distraction-free view.
          </p>

          <div className="landing-features__grid">
            {FEATURE_CARDS.map(({ icon: Icon, title, text }) => (
              <article className="landing-feature" key={title}>
                <div className="landing-feature__icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="landing-cta-section">
          <h2>Ready to transform your team's goals?</h2>
          <p>Join thousands of teams running goals on GoalSync.</p>
          <button onClick={handleGetStarted} className="landing-btn landing-btn--solid landing-btn--large">
            Get started free
            <ArrowRight size={16} />
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer__brand">GoalSync</div>
        <div className="landing-footer__links">
          <a href="#features">Product</a>
          <a href="#features">Pricing</a>
          <a href="#features">Privacy</a>
          <a href="#features">Terms</a>
        </div>
        <div className="landing-footer__copy">© 2026 GoalSync, Inc.</div>
      </footer>
    </div>
  );
}
