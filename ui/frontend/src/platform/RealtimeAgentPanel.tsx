import React, { useState } from "react";
import type { AgentObservation, PatientReport } from "./types";

interface RealtimeAgentPanelProps {
  patientReport: PatientReport;
  observations: AgentObservation[];
  onAcknowledgeObservation: (id: string) => void;
  onGenerateOperativeNote: () => void;
  lastCapturedFrame?: string | null;
}

export const RealtimeAgentPanel: React.FC<RealtimeAgentPanelProps> = ({
  patientReport,
  observations,
  onAcknowledgeObservation,
  onGenerateOperativeNote,
  lastCapturedFrame,
}) => {
  const [queryInput, setQueryInput] = useState("");
  const [qnaList, setQnaList] = useState<Array<{ question: string; answer: string; timestamp: string }>>([
    {
      question: "Confirm antibiotic prophylaxis given patient's penicillin allergy.",
      answer: `Patient ${patientReport.name} has a documented Penicillin allergy (hives). Recommended alternative per ADA/AAOS guidelines: Clindamycin 600mg PO 1h prior or Azithromycin 500mg PO. Do NOT administer Amoxicillin or Augmentin.`,
      timestamp: "10:14:22",
    },
  ]);

  const handleSendQuery = (customQ?: string) => {
    const q = (customQ ?? queryInput).trim();
    if (!q) return;

    // Intelligent context-aware simulated agent response
    let ans = "";
    const lower = q.toLowerCase();

    if (lower.includes("margin") || lower.includes("clearance") || lower.includes("depth")) {
      ans =
        patientReport.specialty === "dental"
          ? `Current bur preparation depth is 1.82mm occlusal, 0.45mm from the pulpal horn of Tooth #19. Margin finish line: 0.5mm supra-gingival chamfer on distal. Pulpal roof integrity: INTACT.`
          : `Posterolateral margin distance from prostatic capsule: 2.3mm. Neurovascular bundle preservation: Grade 1 (intact fascial plane). Surgical margin is clear of tumor.`;
    } else if (lower.includes("bleed") || lower.includes("hemostasis") || lower.includes("blood")) {
      ans = `Hemostasis status: STABLE. Estimated intraoperative blood loss: < 25 mL. Note: Patient has history of ${patientReport.medicalHistory[0] || "antiplatelet use"}, coagulator power verified at 35W.`;
    } else if (lower.includes("cdt") || lower.includes("cpt") || lower.includes("code") || lower.includes("billing")) {
      ans =
        patientReport.specialty === "dental"
          ? `Derived CDT Codes: D2643 (Resin-based composite/ceramic onlay, 3 surfaces), D0140 (Limited oral evaluation), D0220 (Intraoral periapical radiograph). Documentation meets standard of care.`
          : `Derived CPT Codes: 55866 (Laparoscopic/robotic radical prostatectomy with nerve sparing), 38571 (Pelvic lymphadenectomy). Surgical verification gate status: PASS.`;
    } else {
      ans = `Agent analysis for "${q}": Telemetry confirms operational parameters within normal limits for ${patientReport.name} (${patientReport.mrn}). Target: ${patientReport.targetAnatomy}. No active complications detected.`;
    }

    const newEntry = {
      question: q,
      answer: ans,
      timestamp: new Date().toLocaleTimeString(),
    };

    setQnaList([newEntry, ...qnaList]);
    setQueryInput("");
  };

  const quickPrompts =
    patientReport.specialty === "dental"
      ? [
          "Check margin clearance on #19",
          "Is bur proximity safe from pulp?",
          "Verify CDT billing codes",
          "Review allergy precautions",
        ]
      : [
          "Check lateral surgical margins",
          "Identify aberrant DVC vessel",
          "Is bleeding controlled?",
          "Verify CPT robotic codes",
        ];

  return (
    <div
      style={{
        background: "#ffffff",
        border: "2px solid #000000",
        boxShadow: "3px 3px 0px #000000",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: "var(--font-mono)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#000000",
          color: "#ffffff",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid #000000",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              background: "#22c55e",
              border: "1px solid #ffffff",
              display: "inline-block",
            }}
          />
          <strong style={{ fontSize: "12px", textTransform: "uppercase" }}>
            Real-Time Clinical Agent Copilot
          </strong>
        </div>
        <button
          type="button"
          onClick={onGenerateOperativeNote}
          style={{
            background: "#ffef44",
            color: "#000000",
            border: "1.5px solid #000000",
            padding: "3px 8px",
            fontSize: "10px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          📝 GENERATE OPERATIVE NOTE
        </button>
      </div>

      {/* Snapshot Thumbnail Preview if Doctor Captured One */}
      {lastCapturedFrame && (
        <div
          style={{
            padding: "8px 12px",
            background: "#f7f6f2",
            borderBottom: "1.5px solid #000000",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img
            src={lastCapturedFrame}
            alt="Captured Optical Frame"
            style={{
              width: "54px",
              height: "36px",
              objectFit: "cover",
              border: "1.5px solid #000000",
            }}
          />
          <div style={{ fontSize: "10px" }}>
            <strong>OPTICAL FRAME INGESTED:</strong>
            <span style={{ color: "#22c55e", display: "block" }}>
              Vision embeddings synced with patient report. Multi-modal inference active.
            </span>
          </div>
        </div>
      )}

      {/* Scrollable Feed */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Active Real-Time Clinical Observations */}
        {observations.map((obs) => {
          const isWarning = obs.category === "warning" || obs.category === "interception";
          return (
            <div
              key={obs.id}
              style={{
                border: isWarning ? "2px solid #ff3b00" : "1.5px solid #000000",
                background: isWarning ? "#fff5f5" : "#ffffff",
                boxShadow: isWarning ? "2px 2px 0px #ff3b00" : "1.5px 1.5px 0px #000000",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    background: isWarning ? "#ff3b00" : "#000000",
                    color: "#ffffff",
                    padding: "1px 6px",
                    fontSize: "9px",
                    fontWeight: 900,
                  }}
                >
                  {obs.category.toUpperCase()} • {obs.phase}
                </span>
                <span style={{ fontSize: "10px", color: "#666666" }}>{obs.timestamp}</span>
              </div>

              <strong style={{ fontSize: "12px", color: isWarning ? "#ff3b00" : "#000000" }}>
                {obs.title}
              </strong>
              <p style={{ fontSize: "11px", lineHeight: "1.3", margin: 0 }}>{obs.description}</p>

              {obs.suggestedAction && (
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px dashed #000000",
                    padding: "6px 8px",
                    fontSize: "10px",
                    marginTop: "2px",
                  }}
                >
                  <strong>RECOMMENDED ACTION:</strong> {obs.suggestedAction}
                </div>
              )}

              {isWarning && !obs.acknowledged && (
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  <button
                    type="button"
                    onClick={() => onAcknowledgeObservation(obs.id)}
                    style={{
                      background: "#000000",
                      color: "#ffffff",
                      border: "1px solid #000000",
                      padding: "4px 8px",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    [ ACKNOWLEDGE ]
                  </button>
                  <button
                    type="button"
                    onClick={() => onAcknowledgeObservation(obs.id)}
                    style={{
                      background: "#ffffff",
                      color: "#000000",
                      border: "1px solid #000000",
                      padding: "4px 8px",
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    [ OVERRIDE ]
                  </button>
                </div>
              )}
              {obs.acknowledged && (
                <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: 800 }}>
                  ✓ Acknowledged by Attending Clinician
                </span>
              )}
            </div>
          );
        })}

        {/* Doctor-Agent Q&A History */}
        {qnaList.map((item, idx) => (
          <div
            key={idx}
            style={{
              border: "1.5px solid #0047ff",
              background: "#f5f8ff",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
              <strong style={{ color: "#0047ff" }}>DOCTOR QUERY:</strong>
              <span style={{ color: "#666666" }}>{item.timestamp}</span>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 700 }}>"{item.question}"</div>
            <div
              style={{
                marginTop: "4px",
                background: "#ffffff",
                border: "1px solid #0047ff",
                padding: "6px 8px",
                fontSize: "11px",
                lineHeight: "1.35",
              }}
            >
              <span style={{ fontWeight: 800, color: "#0047ff" }}>AGENT: </span>
              {item.answer}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Question Chips */}
      <div
        style={{
          padding: "6px 10px",
          background: "#f7f6f2",
          borderTop: "1.5px solid #000000",
          display: "flex",
          gap: "4px",
          overflowX: "auto",
        }}
      >
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendQuery(p)}
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "1px solid #000000",
              padding: "2px 6px",
              fontSize: "9px",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + {p}
          </button>
        ))}
      </div>

      {/* Doctor Query Input Bar */}
      <div
        style={{
          padding: "8px 10px",
          background: "#ffffff",
          borderTop: "2px solid #000000",
          display: "flex",
          gap: "6px",
        }}
      >
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendQuery();
          }}
          placeholder="Ask AI Copilot (e.g. 'Check margin', 'Verify allergy precautions')..."
          style={{
            flex: 1,
            border: "1.5px solid #000000",
            padding: "6px 8px",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
          }}
        />
        <button
          type="button"
          onClick={() => handleSendQuery()}
          style={{
            background: "#000000",
            color: "#ffffff",
            border: "1.5px solid #000000",
            padding: "6px 12px",
            fontSize: "11px",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          ASK
        </button>
      </div>
    </div>
  );
};
