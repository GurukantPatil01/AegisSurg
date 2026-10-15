import React, { useState } from "react";
import type { VoiceMessage, DentalSoapNote } from "./dentalTypes";

interface GentesBotDrawerProps {
  messages: VoiceMessage[];
  soapNote: DentalSoapNote;
  onSendMessage: (text: string) => void;
  onApproveSoap: () => void;
}

export const GentesBotDrawer: React.FC<GentesBotDrawerProps> = ({
  messages,
  soapNote,
  onSendMessage,
  onApproveSoap,
}) => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "soap">("chat");

  const quickCommands = [
    "Dictate perio for tooth #14: 5 3 4 bleeding on mesial",
    "What is the literature evidence for Indirect Pulp Cap vs pulpotomy?",
    "Generate SOAP note for Tooth #19 DO composite and D3120 IPC",
    "Check pulpal proximity on #19 bitewing",
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleQuickCommand = (cmd: string) => {
    onSendMessage(cmd);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="cockpit-card" style={{ height: "100%" }}>
      {/* Header with Tab Switcher */}
      <div className="card-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "#000000",
              border: "1px solid #000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "#ffffff",
            }}
          >
            GB
          </div>
          <div>
            <div className="card-title">
              GentesBot Chairside
              <span
                style={{
                  fontSize: "9px",
                  fontFamily: "var(--font-mono)",
                  padding: "1px 5px",
                  background: "#000000",
                  color: "#ffffff",
                  fontWeight: 800,
                }}
              >
                VOICE TERMINAL
              </span>
            </div>
            <div className="card-subtitle">
              Intraoperative Speech & Real-Time Auto-Charting
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-switcher">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
          >
            Voice Stream
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("soap")}
            className={`tab-btn ${activeTab === "soap" ? "active" : ""}`}
          >
            SOAP Chart
            {soapNote.status === "draft" && (
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  background: "var(--brutal-alert)",
                  marginLeft: "4px",
                }}
              />
            )}
          </button>
        </div>
      </div>

      {activeTab === "chat" ? (
        <>
          {/* Quick Voice Command Chips */}
          <div className="quick-prompts-row">
            {quickCommands.map((cmd, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickCommand(cmd)}
                className="quick-prompt-chip"
                title={cmd}
              >
                "{cmd}"
              </button>
            ))}
          </div>

          {/* Voice Chat Stream */}
          <div className="voice-chat-stream">
            {messages.map((m) => {
              const isDentist = m.sender === "dentist";
              return (
                <div
                  key={m.id}
                  className={`voice-msg ${isDentist ? "dentist" : "gentesbot"}`}
                >
                  <div className="voice-msg-meta">
                    <strong>
                      {isDentist ? "DR. PATIL [VOICE]" : "GENTESBOT [CO-PILOT]"}
                    </strong>
                    {" • "}
                    {m.timestamp}
                  </div>
                  <div
                    className={`voice-bubble ${
                      isDentist
                        ? "dentist"
                        : m.intent === "safety_alert"
                        ? "safety-alert"
                        : "gentesbot"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Voice Dictation & Input Bar */}
          <form onSubmit={handleSend} className="voice-input-form">
            <button
              type="button"
              onClick={toggleListening}
              className={`mic-toggle-btn ${isListening ? "listening" : ""}`}
              title={isListening ? "Microphone active (listening)" : "Enable voice dictation"}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Hands-free voice prompt or clinical command..."
              className="voice-text-input"
            />
            <button type="submit" className="voice-send-btn">
              Send
            </button>
          </form>
        </>
      ) : (
        /* Autonomous SOAP & CDT Billing View */
        <div className="soap-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000000", paddingBottom: "6px" }}>
            <span style={{ fontFamily: "var(--font-mono)", color: "#000000", fontWeight: 800, fontSize: "11px", textTransform: "uppercase" }}>
              PATIENT: {soapNote.patient_id} | TOOTH #{soapNote.tooth_number}
            </span>
            <span
              className="dental-pill"
              style={{
                background: soapNote.status === "exported_to_fhir" ? "#000000" : "#ffffff",
                color: soapNote.status === "exported_to_fhir" ? "#ffffff" : "#000000",
              }}
            >
              [{soapNote.status.toUpperCase()}]
            </span>
          </div>

          <div className="soap-section">
            <div className="soap-label">S — SUBJECTIVE</div>
            <div className="soap-body">{soapNote.subjective}</div>
          </div>

          <div className="soap-section">
            <div className="soap-label">O — OBJECTIVE</div>
            <div className="soap-body">{soapNote.objective}</div>
          </div>

          <div className="soap-section">
            <div className="soap-label">A — ASSESSMENT</div>
            <div className="soap-body">{soapNote.assessment}</div>
          </div>

          <div className="soap-section">
            <div className="soap-label">P — PLAN & INTERVENTIONS</div>
            <div className="soap-body">{soapNote.plan}</div>
          </div>

          {/* CDT Billing Codes */}
          <div className="cdt-codes-box">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 900, textTransform: "uppercase", borderBottom: "1px solid #000", paddingBottom: "3px", marginBottom: "4px" }}>
              <span>DERIVED ADA CDT BILLING CODES</span>
              <span>TOTAL: ${soapNote.cdt_codes.reduce((acc, c) => acc + c.fee_estimate_usd, 0)}</span>
            </div>
            {soapNote.cdt_codes.map((c) => (
              <div key={c.code} className="cdt-code-item">
                <span style={{ fontWeight: 800 }}>{c.code}</span>
                <span style={{ fontSize: "10px", color: "var(--brutal-text-secondary)" }}>{c.description}</span>
                <span style={{ fontWeight: 800 }}>${c.fee_estimate_usd}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", marginTop: "4px", borderTop: "2px solid #000000" }}>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--brutal-text-secondary)", textTransform: "uppercase" }}>
              {soapNote.status === "exported_to_fhir"
                ? "✓ COMMITTED TO DENTRIX/EAGLESOFT FHIR."
                : "CLINICIAN SIGN-OFF COMMITS RECORD TO EHR."}
            </span>
            <button
              type="button"
              disabled={soapNote.status === "exported_to_fhir"}
              onClick={onApproveSoap}
              className="gate-btn"
              style={{
                background: soapNote.status === "exported_to_fhir" ? "var(--brutal-surface-subtle)" : "#000000",
                color: soapNote.status === "exported_to_fhir" ? "var(--brutal-text-muted)" : "#ffffff",
              }}
            >
              {soapNote.status === "exported_to_fhir" ? "✓ COMMITTED" : "SIGN & COMMIT NOTE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
