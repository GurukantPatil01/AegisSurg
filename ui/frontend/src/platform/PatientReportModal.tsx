import React, { useState } from "react";
import type { PatientReport } from "./types";

interface PatientReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: PatientReport;
  onSaveReport: (updatedReport: PatientReport) => void;
}

export const PatientReportModal: React.FC<PatientReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onSaveReport,
}) => {
  const [formData, setFormData] = useState<PatientReport>({ ...report });
  const [medicalHistoryText, setMedicalHistoryText] = useState(report.medicalHistory.join("\n"));
  const [allergiesText, setAllergiesText] = useState(report.allergies.join(", "));
  const [medicationsText, setMedicationsText] = useState(report.medications.join(", "));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PatientReport = {
      ...formData,
      medicalHistory: medicalHistoryText.split("\n").map((s) => s.trim()).filter(Boolean),
      allergies: allergiesText.split(",").map((s) => s.trim()).filter(Boolean),
      medications: medicationsText.split(",").map((s) => s.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    onSaveReport(updated);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
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
          maxWidth: "840px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-mono)",
        }}
      >
        {/* Modal Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ background: "#ffef44", color: "#000000", padding: "2px 6px", fontWeight: 900, fontSize: "11px" }}>
              EHR INTAKE
            </span>
            <strong style={{ fontSize: "14px", textTransform: "uppercase" }}>
              Patient Clinical Report & Surgical Intake
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

        {/* Modal Body Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Row 1: Demographics */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
                PATIENT FULL NAME
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: "100%",
                  border: "2px solid #000000",
                  padding: "6px 8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
                MRN / CASE ID
              </label>
              <input
                type="text"
                value={formData.mrn}
                onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
                style={{
                  width: "100%",
                  border: "2px solid #000000",
                  padding: "6px 8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
                AGE
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                style={{
                  width: "100%",
                  border: "2px solid #000000",
                  padding: "6px 8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
                SPECIALTY
              </label>
              <select
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value as "dental" | "surgical" })}
                style={{
                  width: "100%",
                  border: "2px solid #000000",
                  padding: "6px 8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  background: "#ffffff",
                }}
              >
                <option value="dental">Dental</option>
                <option value="surgical">Robotic Surgery</option>
              </select>
            </div>
          </div>

          {/* Row 2: Procedure & Target Anatomy */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
                INTENDED PROCEDURE
              </label>
              <input
                type="text"
                value={formData.procedureName}
                onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                style={{
                  width: "100%",
                  border: "2px solid #000000",
                  padding: "6px 8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
                TARGET ANATOMY / TOOTH #
              </label>
              <input
                type="text"
                value={formData.targetAnatomy}
                onChange={(e) => setFormData({ ...formData, targetAnatomy: e.target.value })}
                style={{
                  width: "100%",
                  border: "2px solid #000000",
                  padding: "6px 8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
                required
              />
            </div>
          </div>

          {/* Row 3: Chief Complaint & Diagnosis */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
              CHIEF COMPLAINT & PRE-OPERATIVE DIAGNOSIS
            </label>
            <textarea
              rows={2}
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
              style={{
                width: "100%",
                border: "2px solid #000000",
                padding: "6px 8px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
              }}
            />
          </div>

          {/* Row 4: Allergies & Medications (Key for AI Complication Reasoning!) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ background: "#fff5f5", border: "1.5px solid #ff3b00", padding: "10px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#ff3b00", marginBottom: "4px" }}>
                ⚠️ ALLERGIES (COMMA SEPARATED)
              </label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="Penicillin, Latex, Sulfa..."
                style={{
                  width: "100%",
                  border: "1.5px solid #000000",
                  padding: "6px 8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>
            <div style={{ background: "#f5f8ff", border: "1.5px solid #0047ff", padding: "10px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#0047ff", marginBottom: "4px" }}>
                💊 CURRENT MEDICATIONS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="Plavix, Lisinopril, Metformin..."
                style={{
                  width: "100%",
                  border: "1.5px solid #000000",
                  padding: "6px 8px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>
          </div>

          {/* Row 5: Medical History */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
              SYSTEMIC MEDICAL HISTORY & PRIOR SURGERIES (ONE PER LINE)
            </label>
            <textarea
              rows={2}
              value={medicalHistoryText}
              onChange={(e) => setMedicalHistoryText(e.target.value)}
              placeholder="e.g. Prior TURP 4 years ago\nHypertension\nCardiac stent"
              style={{
                width: "100%",
                border: "2px solid #000000",
                padding: "6px 8px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
              }}
            />
          </div>

          {/* Row 6: Imaging & Radiographs */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
              PRE-OP RADIOGRAPHS / MRI / PATHOLOGY FINDINGS
            </label>
            <textarea
              rows={2}
              value={formData.imagingFindings}
              onChange={(e) => setFormData({ ...formData, imagingFindings: e.target.value })}
              style={{
                width: "100%",
                border: "2px solid #000000",
                padding: "6px 8px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
              }}
            />
          </div>

          {/* Row 7: Clinical Precautions & Notes */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, marginBottom: "4px" }}>
              DOCTOR CLINICAL PRECAUTIONS FOR AI COPILOT
            </label>
            <textarea
              rows={2}
              value={formData.clinicalNotes}
              onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
              style={{
                width: "100%",
                border: "2px solid #000000",
                padding: "6px 8px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
              }}
            />
          </div>

          {/* Modal Footer Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "12px",
              borderTop: "2px solid #000000",
            }}
          >
            <span style={{ fontSize: "11px", color: "#666666" }}>
              * Saving immediately synchronizes the AI Agent's active safety boundaries.
            </span>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "#ffffff",
                  color: "#000000",
                  border: "2px solid #000000",
                  padding: "8px 16px",
                  fontWeight: 800,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                CANCEL
              </button>
              <button
                type="submit"
                style={{
                  background: "#000000",
                  color: "#ffffff",
                  border: "2px solid #000000",
                  padding: "8px 18px",
                  fontWeight: 900,
                  fontSize: "12px",
                  cursor: "pointer",
                  boxShadow: "2px 2px 0px #000000",
                }}
              >
                💾 SAVE & UPDATE AI REASONING
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
