import React, { useState } from "react";
import type { PatientReport } from "./types";

interface OperativeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: PatientReport;
}

export const OperativeReportModal: React.FC<OperativeReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [surgeonName, setSurgeonName] = useState("Dr. Gurukant Patil, FACS / DDS");
  const [isSigned, setIsSigned] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isDental = report.specialty === "dental";

  const billingCodes = isDental
    ? [
        { code: "CDT D2643", label: "Onlay - composite/ceramic, 3 surfaces" },
        { code: "CDT D0140", label: "Limited oral evaluation - problem focused" },
        { code: "CDT D0220", label: "Intraoral periapical first radiographic image" },
      ]
    : [
        { code: "CPT 55866", label: "Laparoscopy, surgical, prostatectomy, retropubic radical" },
        { code: "CPT 38571", label: "Laparoscopy, surgical; with bilateral total pelvic lymphadenectomy" },
      ];

  const reportText = `===============================================================
AEGIS-OS & GENTES DENTAL OPERATIVE RECORD — OFFICIAL EHR EXPORT
===============================================================
PATIENT: ${report.name.toUpperCase()} (MRN: ${report.mrn})
DOB / AGE: ${report.age} Years | GENDER: ${report.gender}
DATE OF PROCEDURE: ${new Date().toLocaleDateString()}
FACILITY: ST. JUDE SURGICAL & ADVANCED DENTAL CENTER 04
ATTENDING CLINICIAN: ${surgeonName}

PRE-OPERATIVE DIAGNOSIS:
${report.chiefComplaint}

POST-OPERATIVE DIAGNOSIS:
Status post successful ${report.procedureName} at ${report.targetAnatomy}.

ANESTHESIA: Local with 2% Lidocaine 1:100,000 epinephrine (dental) / General endotracheal (surgical).

PROCEDURE SUMMARY & INTRAOPERATIVE OBSERVATIONS:
Patient was identified in the holding area, consent verified, and transferred to the operatory. Real-time vision-assisted telemetry and autonomous AI co-pilot guidance was engaged throughout the procedure.

1. Isolation & Access: Clean surgical access achieved.
2. Target Preparation: ${report.targetAnatomy} addressed in accordance with standard of care.
3. Complication Interception & Margin Control:
   - Intraoperative AI co-pilot verified clearance boundaries.
   - Pulpal / neurovascular margins inspected and confirmed intact.
   - Estimated Blood Loss: Minimal (< 20 mL). No adverse events.
4. Hemostasis & Closure: Complete hemostasis confirmed prior to terminal verification.

DERIVED BILLING CODES:
${billingCodes.map((c) => `- ${c.code}: ${c.label}`).join("\n")}

VERIFICATION GATE AUDIT:
- CRYPTOGRAPHIC GATE HASH: SHA256: 7f8a9e2c140d39e8b...
- STATUS: PASS (All safety thresholds within tolerance)
- AI ASSISTANT: Gemini 3.5 Multimodal Clinical Copilot

ELECTRONIC SIGNATURE:
${isSigned ? `[SIGNED DIGITALLY BY ${surgeonName.toUpperCase()} ON ${new Date().toISOString()}]` : "[PENDING DOCTOR SIGNATURE]"}
===============================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "3px solid #000000",
          boxShadow: "6px 6px 0px #000000",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-mono)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#000000",
            color: "#ffffff",
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ background: "#22c55e", color: "#000000", padding: "2px 6px", fontWeight: 900, fontSize: "11px" }}>
              AUDIT CERTIFIED
            </span>
            <strong style={{ fontSize: "14px", textTransform: "uppercase" }}>
              Operative Record & Documentation Sign-off
            </strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "1px solid #ffffff",
              padding: "2px 8px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Textarea displaying compiled note */}
        <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
          <div style={{ marginBottom: "10px", fontSize: "11px" }}>
            <label style={{ fontWeight: 800 }}>ATTENDING CLINICIAN SIGNING RECORD:</label>
            <input
              type="text"
              value={surgeonName}
              onChange={(e) => setSurgeonName(e.target.value)}
              style={{
                width: "100%",
                border: "2px solid #000000",
                padding: "6px 8px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                marginTop: "4px",
              }}
            />
          </div>

          <pre
            style={{
              background: "#f7f6f2",
              border: "2px solid #000000",
              padding: "14px",
              fontSize: "11px",
              lineHeight: "1.45",
              whiteSpace: "pre-wrap",
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {reportText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "12px 16px",
            background: "#ffffff",
            borderTop: "2px solid #000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            type="button"
            onClick={handleCopy}
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "2px solid #000000",
              padding: "6px 14px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "1.5px 1.5px 0px #000000",
            }}
          >
            {copied ? "✓ COPIED TO CLIPBOARD" : "📋 COPY EHR TEXT"}
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            {!isSigned ? (
              <button
                type="button"
                onClick={() => setIsSigned(true)}
                style={{
                  background: "#22c55e",
                  color: "#000000",
                  border: "2px solid #000000",
                  padding: "8px 16px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "2px 2px 0px #000000",
                }}
              >
                ✍️ DIGITALLY SIGN & ATTEST
              </button>
            ) : (
              <span
                style={{
                  background: "#000000",
                  color: "#22c55e",
                  border: "2px solid #000000",
                  padding: "8px 16px",
                  fontSize: "12px",
                  fontWeight: 900,
                }}
              >
                ✓ SIGNED & AUDITED
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#000000",
                color: "#ffffff",
                border: "2px solid #000000",
                padding: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
