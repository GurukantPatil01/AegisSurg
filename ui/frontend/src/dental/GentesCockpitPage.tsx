import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./dental.css";
import { Odontogram } from "./Odontogram";
import { DentalVerificationGateCard } from "./DentalVerificationGateCard";
import { GentesBotDrawer } from "./GentesBotDrawer";
import { DentalCameraViewer } from "./DentalCameraViewer";
import {
  createDefaultDentalArch,
  INITIAL_GATE_STATUS,
  INITIAL_SOAP_NOTE,
  INITIAL_VOICE_MESSAGES,
} from "./sampleData";
import { ThemeToggle } from "../components/ThemeToggle";
import type { VoiceMessage, DentalSoapNote, DentalGateStatus } from "./dentalTypes";

export const GentesCockpitPage: React.FC = () => {
  const [teeth, setTeeth] = useState(createDefaultDentalArch);
  const [selectedTooth, setSelectedTooth] = useState<number>(19);
  const [gateStatus, setGateStatus] = useState<DentalGateStatus>(INITIAL_GATE_STATUS);
  const [soapNote, setSoapNote] = useState<DentalSoapNote>(INITIAL_SOAP_NOTE);
  const [messages, setMessages] = useState<VoiceMessage[]>(INITIAL_VOICE_MESSAGES);
  const [caseScenario, setCaseScenario] = useState<"tooth19_caries" | "tooth14_perio" | "tooth30_crown">("tooth19_caries");

  // Handle dentist approving the Verification Gate
  const handleDentistSignoff = () => {
    setGateStatus((prev) => {
      const updatedChecks = prev.checks.map((c) =>
        c.id === "check_dentist_signoff"
          ? {
              ...c,
              passed: true,
              detail: "Authorized by Dr. G. Patil, DDS at " + new Date().toLocaleTimeString(),
            }
          : c
      );
      return {
        ...prev,
        checks: updatedChecks,
        dentist_approved: true,
        gate_reason: "All 10 checks passed. Clinician authorization confirmed. Written to HL7 FHIR Procedure resource.",
      };
    });

    const signoffMsg: VoiceMessage = {
      id: `msg-${Date.now()}`,
      sender: "gentesbot",
      text: "Dentist sign-off verified. HL7 FHIR Procedure resource [Procedure/dent-proc-19-ipc] written and read-back verified. Indirect pulp cap protocol logged.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      intent: "safety_alert",
    };
    setMessages((prev) => [...prev, signoffMsg]);
  };

  // Handle approving the SOAP note
  const handleApproveSoap = () => {
    setSoapNote((prev) => ({
      ...prev,
      status: "exported_to_fhir",
      signed_by: "Dr. G. Patil, DDS (NPI: 1892837492)",
      signed_at: new Date().toISOString(),
    }));

    const approvalMsg: VoiceMessage = {
      id: `msg-${Date.now()}`,
      sender: "gentesbot",
      text: "SOAP Progress Note approved and committed to Dentrix/Eaglesoft EHR via HL7 FHIR. ADA CDT billing codes (D2392, D3120, D0220 - $437.00) submitted to claims queue.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      intent: "soap_draft",
    };
    setMessages((prev) => [...prev, approvalMsg]);
  };

  // Handle voice or text message from the dentist
  const handleSendMessage = (text: string) => {
    const userMsg: VoiceMessage = {
      id: `msg-${Date.now()}`,
      sender: "dentist",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let botResponse = "";
      let intent: VoiceMessage["intent"] = "protocol_query";

      if (lower.includes("perio") || lower.includes("probing")) {
        intent = "perio_entry";
        botResponse =
          "Periodontal probing recorded for target tooth. Probing depths logged to digital chart without touching chairside screen. BOP status updated.";
        if (lower.includes("14")) {
          setTeeth((prev) => {
            const copy = { ...prev };
            if (copy[14].perio) {
              copy[14].perio = {
                ...copy[14].perio,
                distobuccal: 5,
                midbuccal: 3,
                mesiobuccal: 4,
                bleeding_on_probing: true,
              };
            }
            return copy;
          });
        }
      } else if (lower.includes("ipc") || lower.includes("indirect pulp") || lower.includes("evidence")) {
        botResponse =
          "Literature evidence (Schwendicke et al., JADA 2016; JOE 2021) recommends Indirect Pulp Capping (IPC/D3120) using calcium silicate (MTA/TheraCal) over aggressive excavation. Vitality preservation rate is 93% at 3 years vs 72% for direct pulp exposure.";
      } else if (lower.includes("soap") || lower.includes("note")) {
        intent = "soap_draft";
        botResponse =
          "SOAP note drafted with clinical findings, excavation depth, calcium silicate IPC placement, and DO composite restoration. CDT codes D2392 and D3120 mapped. Ready for sign-off.";
      } else {
        botResponse = `Acknowledged: "${text}". Living dental graph updated with chairside observation. Verification gate remains active.`;
      }

      const reply: VoiceMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "gentesbot",
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        intent,
      };
      setMessages((prev) => [...prev, reply]);
    }, 600);
  };

  const handleScenarioChange = (scenario: "tooth19_caries" | "tooth14_perio" | "tooth30_crown") => {
    setCaseScenario(scenario);
    if (scenario === "tooth19_caries") {
      setSelectedTooth(19);
    } else if (scenario === "tooth14_perio") {
      setSelectedTooth(14);
    } else if (scenario === "tooth30_crown") {
      setSelectedTooth(30);
    }
  };

  const currentToothData = teeth[selectedTooth];

  return (
    <div className="dental-cockpit">
      {/* Top Navigation Bar */}
      <header className="dental-header">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link to="/" className="dental-brand">
            <div className="dental-brand-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-4-7-7z" />
              </svg>
            </div>
            <div>
              <div className="dental-brand-title">Gentes Dental OS</div>
              <div className="dental-brand-subtitle">
                Autonomous Dental Safety & Voice Co-Pilot
              </div>
            </div>
          </Link>

          {/* Case Scenario Selector */}
          <div className="dental-scenarios">
            <span className="dental-scenarios-label">Preset:</span>
            <button
              type="button"
              onClick={() => handleScenarioChange("tooth19_caries")}
              className={`dental-scenario-btn ${caseScenario === "tooth19_caries" ? "active" : ""}`}
            >
              #19 Deep Caries & Pulpal Proximity
            </button>
            <button
              type="button"
              onClick={() => handleScenarioChange("tooth14_perio")}
              className={`dental-scenario-btn ${caseScenario === "tooth14_perio" ? "active" : ""}`}
            >
              #14 Voice Perio Charting
            </button>
            <button
              type="button"
              onClick={() => handleScenarioChange("tooth30_crown")}
              className={`dental-scenario-btn ${caseScenario === "tooth30_crown" ? "active" : ""}`}
            >
              #30 Restorative Check
            </button>
          </div>
        </div>

          {/* Right Header Controls */}
          <div className="dental-header-right">
            <div className="dental-live-badge">
              <span className="pulse-dot" />
              <span>LIVE: PT-DENT-88412 • OP-A</span>
            </div>

            <Link
              to="/workstation"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#ffef44",
                color: "#000000",
                border: "2px solid #000000",
                padding: "6px 12px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                fontWeight: 900,
                textTransform: "uppercase",
                textDecoration: "none",
                boxShadow: "2px 2px 0px #000000",
              }}
            >
              [ 🎛️ CLINICAL WORKSTATION ]
            </Link>

            <Link
              to="/dental/architecture"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#ffffff",
                color: "#000000",
                border: "2px solid #000000",
                padding: "6px 12px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
                textTransform: "uppercase",
                textDecoration: "none",
                boxShadow: "2px 2px 0px #000000",
              }}
            >
              [ 📐 DENTAL ARCHITECTURE ]
            </Link>

            <Link to="/console" className="dental-switch-link">
              [ SURGICAL CONSOLE ➔ ]
            </Link>

            <ThemeToggle />
          </div>
        </header>

        {/* Main Dental Dashboard Workspace */}
        <main className="dental-main">
          {/* Patient Clinical Context Bar */}
          <div className="dental-context-bar">
            <div className="dental-context-group">
              <div className="dental-context-item">
                PATIENT: <strong>ELENA ROSTOVA, 34F</strong>
              </div>
              <div className="dental-divider-v" />
              <div className="dental-context-item">
                COMPLAINT: <span>"COLD SENSITIVITY LOWER LEFT QUADRANT (2 WEEKS)"</span>
              </div>
              <div className="dental-divider-v" />
              <div className="dental-context-item">
                TARGET: <span>
                  #{selectedTooth} [{currentToothData?.name.toUpperCase()}]
                </span>
              </div>
            </div>

            <div className="dental-context-group">
              <span className="dental-pill dental-pill-emerald">
                ANESTHESIA: 2% LIDO 1:100K EPI (IANB)
              </span>
              <span className="dental-pill dental-pill-blue">
                ISOLATION: RUBBER DAM
              </span>
            </div>
          </div>

        {/* Row 1: Universal 32-Tooth Odontogram */}
        <Odontogram
          teeth={teeth}
          selectedTooth={selectedTooth}
          onSelectTooth={(num) => setSelectedTooth(num)}
        />

        {/* Row 2: Camera & HUD (Left), Verification Gate (Middle), GentesBot Drawer (Right) */}
        <div className="cockpit-grid">
          {/* Left Column: Intraoral Camera & Radiograph HUD */}
          <div>
            <DentalCameraViewer selectedToothData={currentToothData} />
          </div>

          {/* Middle Column: 10-Check Verification Gate */}
          <div>
            <DentalVerificationGateCard
              gateStatus={gateStatus}
              onDentistSignoff={handleDentistSignoff}
            />
          </div>

          {/* Right Column: GentesBot Hands-Free Voice Assistant & SOAP View */}
          <div>
            <GentesBotDrawer
              messages={messages}
              soapNote={soapNote}
              onSendMessage={handleSendMessage}
              onApproveSoap={handleApproveSoap}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
