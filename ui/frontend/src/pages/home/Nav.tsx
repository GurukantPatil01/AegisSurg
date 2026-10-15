import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "../../components/ThemeToggle";

const LINKS = [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#architecture", label: "Architecture" },
  { href: "#state", label: "State" },
  { href: "#agents", label: "Orchestration" },
  { href: "#tech", label: "Tech" },
];

/** /architecture still exists as its own route — it is the shareable URL for
    the README and the submission, and what scripts/export_architecture.py
    screenshots. The nav points at the in-page section instead, so the link
    behaves like every other one beside it. */

export function Nav() {
  // The nav is shared with /architecture, where a bare "#problem" would
  // resolve against that route and go nowhere. Off the home page the anchors
  // are prefixed so they navigate home first; on it they stay bare, which
  // keeps the jump instant instead of triggering a full page load.
  const onHome = useLocation().pathname === "/";
  return (
    <nav className="home__nav">
      <a href="#top" className="home__nav-brand">
        <span className="home__nav-mark">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
            <circle cx="12" cy="12" r="6" fill="#fff" />
          </svg>
        </span>
        AegisSurg
      </a>
      <div className="home__nav-links">
        {LINKS.map((l) => (
          <a key={l.href} href={onHome ? l.href : `/${l.href}`} className="home__nav-link">
            {l.label}
          </a>
        ))}
      </div>
      <div className="home__nav-actions">
        <Link
          to="/workstation"
          className="home__nav-cta home__btn"
          style={{
            background: "#ffef44",
            color: "#000000",
            border: "2px solid #000000",
            fontWeight: 900,
            boxShadow: "2px 2px 0px #000000",
          }}
        >
          [ 🎛️ CLINICAL WORKSTATION ]
        </Link>
        <Link
          to="/dental"
          className="home__nav-cta home__btn home__btn--dental"
        >
          [ 🦷 GENTES DENTAL OS ]
        </Link>
        <Link to="/console" className="home__nav-cta home__btn home__btn--primary">
          [ LAUNCH CASE ]
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
