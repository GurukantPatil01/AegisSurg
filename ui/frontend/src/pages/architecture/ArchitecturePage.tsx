import { useState } from "react";
import { useLocation } from "react-router-dom";
import "../home/home.css";
import { Nav } from "../home/Nav";
import { Footer } from "../home/Footer";
import "./architecture.css";
import { ArchitectureBoard } from "./ArchitectureBoard";
import { DentalArchitectureBoard } from "./DentalArchitectureBoard";

export function ArchitecturePage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isDentalDefault =
    location.pathname.includes("dental") || searchParams.get("view") === "dental";

  const [activeSystem, setActiveSystem] = useState<"surgical" | "dental">(
    isDentalDefault ? "dental" : "surgical"
  );

  return (
    <div className="home">
      <Nav />
      <section className="home__section arch__section" id="architecture">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <div>
            <span className="home__eyebrow">Enterprise Reference Architecture</span>
            <h1 className="home__headline" style={{ fontSize: 36, margin: "4px 0 8px" }}>
              {activeSystem === "surgical"
                ? "AegisSurg: Autonomous Surgical Architecture"
                : "Gentes Dental OS: Restorative Safety Architecture"}
            </h1>
            <p className="home__lede" style={{ marginBottom: 0 }}>
              {activeSystem === "surgical"
                ? "Every service, model, agent, gate and external write this system uses across Robot-Assisted Radical Prostatectomy."
                : "Complete Google Cloud reference architecture for autonomous dental bur tracking, pulpal preservation, and chairside voice charting."}
            </p>
          </div>

          {/* System Switcher */}
          <div
            style={{
              display: "flex",
              border: "2px solid #000000",
              boxShadow: "3px 3px 0px #000000",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveSystem("surgical")}
              style={{
                background: activeSystem === "surgical" ? "#000000" : "#ffffff",
                color: activeSystem === "surgical" ? "#ffffff" : "#000000",
                border: "none",
                padding: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              🏥 SURGICAL (SURGOS)
            </button>
            <button
              type="button"
              onClick={() => setActiveSystem("dental")}
              style={{
                background: activeSystem === "dental" ? "#000000" : "#ffffff",
                color: activeSystem === "dental" ? "#ffffff" : "#000000",
                border: "none",
                borderLeft: "2px solid #000000",
                padding: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              🦷 GENTES DENTAL OS
            </button>
          </div>
        </div>

        <div className="arch__frame">
          {activeSystem === "surgical" ? <ArchitectureBoard /> : <DentalArchitectureBoard />}
        </div>
      </section>
      <Footer />
    </div>
  );
}
