export function Footer() {
  return (
    <footer className="home__footer">
      <div className="home__footer-inner">
        <span>AegisSurg — Autonomous Surgical Safety Platform</span>
        <span>
          <a href="https://github.com/adityashukla8/surggraph" target="_blank" rel="noreferrer">
            Source
          </a>
          {" · "}
          <a href="https://www.linkedin.com/in/adityashukla8" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          {" · "}
          Synthetic patient data · Not a clinical device
        </span>
      </div>
    </footer>
  );
}
