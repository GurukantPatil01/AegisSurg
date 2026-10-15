import { Link } from "react-router-dom";
import { HeroGraph } from "./HeroGraph";

export function Hero() {
  return (
    <header className="home__hero" id="top">
      <div className="home__hero-inner">
        <div>
          <span className="home__badge">✦ Autonomous Surgical Intelligence • Active OR Guardrails</span>
          <h1 className="home__hero-headline">
            <span className="home__hero-headline-accent">AegisSurg: Autonomous Surgical Safety & Complication Interception</span> 
          </h1>
          <h2>
            Real-Time OR Co-Pilot: Intercepting Surgical Technique Errors, Reasoning Complications & Continuous Quality Improvement
          </h2>
          <br></br>

          <div className="home__hero-flow">
            <span className="home__hero-flow-lead">AegisSurg powers surgical safety as an active, closed-loop co-pilot system:</span>
            <ul className="home__hero-flow-list">
              {[
                <><b>AegisSurg (Autonomous Pipeline)</b> monitors intraoperative video, autonomously detects technique errors, reasons complications with live citations, and drafts instant FHIR records</>,
                <><b>AegisBot (Debriefing Co-Pilot)</b> conducts structured, hands-free voice debriefs with surgical teams to capture clinical feedback</>,
                <><b>Institutional Memory Layer</b> turns approved debrief findings into durable knowledge that actively informs subsequent surgical cases</>,
              ].map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="home__hero-visual-caption">
            <span className="home__hero-pill">
              <span className="home__hero-pill-dot" />
              Gemini 3.5
            </span>
            <span className="home__hero-pill">
              <span className="home__hero-pill-dot" />
              Vertex AI
            </span>
            <span className="home__hero-pill">
              <span className="home__hero-pill-dot" />
              Gemini Enterprise Agent Platform
            </span>
          </div>

          <div className="home__hero-ctas">
            <Link to="/console" className="home__btn home__btn--primary">
              ▶ Launch Case
            </Link>
            <a href="#how-it-works" className="home__btn home__btn--secondary">
              See How It Works →
            </a>
          </div>
        </div>

        <HeroGraph />
      </div>
    </header>
  );
}
