import React from "react";
import type { PatientReport } from "./types";

interface PatientReportCardProps {
  report: PatientReport;
  onEditClick: () => void;
}

export const PatientReportCard: React.FC<PatientReportCardProps> = ({
  report,
  onEditClick,
}) => {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "2px solid #000000",
        boxShadow: "3px 3px 0px #000000",
        padding: "12px 14px",
        fontFamily: "var(--font-mono)",
      }}
    >
      {/* Top row: Patient demographics and Edit button */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          borderBottom: "2px solid #000000",
          paddingBottom: "8px",
          marginBottom: "10px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                background: "#000000",
                color: "#ffffff",
                padding: "2px 6px",
                fontSize: "10px",
                fontWeight: 900,
              }}
            >
              {report.specialty.toUpperCase()} PATIENT TWIN
            </span>
            <strong style={{ fontSize: "14px", textTransform: "uppercase" }}>{report.name}</strong>
            <span style={{ fontSize: "12px", color: "#666666" }}>
              ({report.age}y / {report.gender.charAt(0)}) • {report.mrn}
            </span>
          </div>
          <div style={{ fontSize: "12px", marginTop: "3px", fontWeight: 700 }}>
            {report.procedureName} — <span style={{ color: "#0047ff" }}>{report.targetAnatomy}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditClick}
          style={{
            background: "#ffffff",
            color: "#000000",
            border: "2px solid #000000",
            padding: "4px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "1.5px 1.5px 0px #000000",
            whiteSpace: "nowrap",
          }}
        >
          ✏️ EDIT PATIENT REPORT
        </button>
      </div>

      {/* Grid of Clinical Parameters */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "10px", fontSize: "11px" }}>
        {/* Allergies & High-Risk Meds */}
        <div style={{ background: "#fff5f5", border: "1.5px solid #ff3b00", padding: "6px 8px" }}>
          <div style={{ fontWeight: 800, color: "#ff3b00", marginBottom: "3px" }}>
            ⚠️ ACTIVE ALLERGIES & RISKS:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {report.allergies.length > 0 ? (
              report.allergies.map((allergy, i) => (
                <span
                  key={i}
                  style={{
                    background: "#ff3b00",
                    color: "#ffffff",
                    padding: "1px 5px",
                    fontWeight: 700,
                  }}
                >
                  {allergy}
                </span>
              ))
            ) : (
              <span style={{ color: "#666666" }}>NKDA (None known)</span>
            )}
            {report.medications.map((med, i) => (
              <span
                key={`med-${i}`}
                style={{
                  background: "#000000",
                  color: "#ffffff",
                  padding: "1px 5px",
                  fontWeight: 600,
                }}
              >
                {med}
              </span>
            ))}
          </div>
        </div>

        {/* Pre-Op Diagnostic / Imaging Note */}
        <div style={{ background: "#fbfbfa", border: "1.5px solid #000000", padding: "6px 8px" }}>
          <div style={{ fontWeight: 800, marginBottom: "3px" }}>📋 IMAGING & DIAGNOSIS:</div>
          <div
            style={{
              color: "#333333",
              lineHeight: "1.3",
              maxHeight: "48px",
              overflowY: "auto",
            }}
          >
            {report.imagingFindings}
          </div>
        </div>

        {/* Live Vitals Telemetry */}
        <div style={{ background: "#f5f8ff", border: "1.5px solid #0047ff", padding: "6px 8px" }}>
          <div style={{ fontWeight: 800, color: "#0047ff", marginBottom: "3px" }}>
            💓 SIMULATED VITALS:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px", fontSize: "10px" }}>
            <div>BP: <strong>{report.vitals.bloodPressure}</strong></div>
            <div>HR: <strong>{report.vitals.heartRate} bpm</strong></div>
            <div>SpO2: <strong>{report.vitals.spo2}%</strong></div>
            <div>TEMP: <strong>{report.vitals.tempC}°C</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};
