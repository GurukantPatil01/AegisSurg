import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ClinicalCameraFeed } from "./ClinicalCameraFeed";
import { PatientReportCard } from "./PatientReportCard";
import { PatientReportModal } from "./PatientReportModal";
import { RealtimeAgentPanel } from "./RealtimeAgentPanel";
import { OperativeReportModal } from "./OperativeReportModal";
import { DEFAULT_DENTAL_PATIENT, DEFAULT_SURGICAL_PATIENT } from "./initialPatientReports";
import { ThemeToggle } from "../components/ThemeToggle";
import type { AgentObservation, PatientReport } from "./types";

export const ClinicalWorkstationPage: React.FC = () => {
  // Current active patient report
  const [patientReport, setPatientReport] = useState<PatientReport>(DEFAULT_DENTAL_PATIENT);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isOperativeNoteModalOpen, setIsOperativeNoteModalOpen] = useState(false);
  const [lastCapturedFrame, setLastCapturedFrame] = useState<string | null>(null);

  // Active milestone phase
  const [activePhaseIndex, setActivePhaseIndex] = useState(2);

  const dentalPhases = [
    "01. Local Anesthesia",
    "02. Rubber Dam Isolation",
    "03. Rotary Excavation",
    "04. Pulpal Verification",
    "05. Margin Seal & Note",
  ];

  const surgicalPhases = [
    "01. Port Placement",
    "02. Bladder Neck Dissection",
    "03. DVC Ligation",
    "04. Neurovascular Preservation",
    "05. Vesicourethral Anastomosis",
  ];

  const currentPhases = patientReport.specialty === "dental" ? dentalPhases : surgicalPhases;

  // Real-time dynamic observations based on current patient report
  const generateInitialObservations = (report: PatientReport): AgentObservation[] => {
    if (report.specialty === "dental") {
      const observations: AgentObservation[] = [
        {
          id: "obs-dent-1",
          timestamp: "10:12:05",
          phase: "03. Rotary Excavation",
          category: "observation",
          title: "Anatomical Landmark Identified: Tooth #19 Occlusal Fissure",
          description: "Targeting disto-occlusal caries. Carbide bur #4 detected at 8,200 RPM with continuous aerosol water irrigation.",
          confidence: 0.96,
        },
        {
          id: "obs-dent-2",
          timestamp: "10:14:18",
          phase: "03. Rotary Excavation",
          category: "warning",
          title: "Proximity Alert: Pulpal Chamber Floor (0.42mm)",
          description: `Approaching pulp chamber roof. Patient ${report.name} exhibits reversible pulpitis symptoms. Risk of unintended pulpal exposure if speed exceeds 6,000 RPM.`,
          confidence: 0.94,
          suggestedAction: "Switch to slow-speed round bur #2 or hand spoon excavator to complete final demineralized dentin removal.",
          acknowledged: false,
        },
      ];

      if (report.allergies.includes("Penicillin")) {
        observations.push({
          id: "obs-dent-3",
          timestamp: "10:15:00",
          phase: "04. Pulpal Verification",
          category: "verification",
          title: "Allergy Safeguard: Penicillin Contraindication Active",
          description: "If pulpal capping or systemic prophylaxis is indicated, do not prescribe Penicillin or Amoxicillin.",
          confidence: 0.99,
          acknowledged: true,
        });
      }

      return observations;
    } else {
      const observations: AgentObservation[] = [
        {
          id: "obs-surg-1",
          timestamp: "09:48:32",
          phase: "03. DVC Ligation",
          category: "observation",
          title: "EndoWrist Bipolar Tracking Active",
          description: "EndoWrist Maryland Bipolar Forceps localized at right dorsal venous plexus. Tissue traction optimal.",
          confidence: 0.98,
        },
        {
          id: "obs-surg-2",
          timestamp: "09:51:10",
          phase: "03. DVC Ligation",
          category: "interception",
          title: "Aberrant Deep Dorsal Vein Branch Detected",
          description: `Aberrant tributary identified crossing anterior to prostatic apex. Patient ${report.name} has prior TURP with altered fibrotic planes. High risk of torrential venous bleeding upon division.`,
          confidence: 0.93,
          suggestedAction: "Pass 2-0 Vicryl suture on CT-1 needle distal to the aberrant branch prior to cold knife transaction.",
          acknowledged: false,
        },
      ];

      return observations;
    }
  };

  const [observations, setObservations] = useState<AgentObservation[]>(() =>
    generateInitialObservations(DEFAULT_DENTAL_PATIENT)
  );

  // Switch between Dental and Surgical Clinical Cases
  const handleSwitchCase = (specialty: "dental" | "surgical") => {
    if (specialty === "dental") {
      setPatientReport(DEFAULT_DENTAL_PATIENT);
      setObservations(generateInitialObservations(DEFAULT_DENTAL_PATIENT));
      setActivePhaseIndex(2);
    } else {
      setPatientReport(DEFAULT_SURGICAL_PATIENT);
      setObservations(generateInitialObservations(DEFAULT_SURGICAL_PATIENT));
      setActivePhaseIndex(2);
    }
  };

  // When doctor updates the patient report
  const handleSaveReport = (updated: PatientReport) => {
    setPatientReport(updated);
    // Regenerate and adapt agent observations to the updated report
    setObservations((prev) => [
      {
        id: `obs-update-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        phase: currentPhases[activePhaseIndex],
        category: "observation",
        title: "Clinical Memory Synchronized with Doctor Intake",
        description: `Agent updated reasoning parameters for ${updated.name}. Active allergies: ${updated.allergies.join(", ") || "None"}. Diagnosis: ${updated.procedureName}.`,
        confidence: 0.99,
        acknowledged: true,
      },
      ...prev,
    ]);
  };

  const handleAcknowledgeObservation = (id: string) => {
    setObservations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, acknowledged: true } : o))
    );
  };

  const handleFrameCapture = (dataUrl: string) => {
    setLastCapturedFrame(dataUrl);
    setObservations((prev) => [
      {
        id: `obs-capture-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        phase: currentPhases[activePhaseIndex],
        category: "observation",
        title: "High-Resolution Optical Frame Analyzed",
        description: `Frame captured by clinician. Multi-modal vision model verified margin sharpness at 0.08mm resolution. No macro-defects detected.`,
        confidence: 0.97,
        acknowledged: true,
      },
      ...prev,
    ]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--page, #f7f6f2)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-mono)",
      }}
    >
      {/* Top Clinical Header Bar */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "3px solid #000000",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          boxShadow: "0 2px 0px #000000",
        }}
      >
        {/* Title & Facility Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "#000000",
              color: "#ffffff",
              padding: "4px 8px",
              fontWeight: 900,
              fontSize: "12px",
              letterSpacing: "0.5px",
            }}
          >
            AEGIS • PLATFORM
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                textTransform: "uppercase",
              }}
            >
              Clinical Operating Suite & Live Co-Pilot
            </h1>
            <div style={{ fontSize: "11px", color: "#555555" }}>
              FACILITY: ST. JUDE HEALTHCARE & GENTES DENTAL INSTITUTE • SUITE 04
            </div>
          </div>
        </div>

        {/* Case Switcher & Quick Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Switch Case Mode */}
          <div style={{ display: "flex", border: "2px solid #000000" }}>
            <button
              type="button"
              onClick={() => handleSwitchCase("dental")}
              style={{
                background: patientReport.specialty === "dental" ? "#000000" : "#ffffff",
                color: patientReport.specialty === "dental" ? "#ffffff" : "#000000",
                border: "none",
                padding: "6px 12px",
                fontWeight: 800,
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              🦷 DENTAL CASE (#19)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchCase("surgical")}
              style={{
                background: patientReport.specialty === "surgical" ? "#000000" : "#ffffff",
                color: patientReport.specialty === "surgical" ? "#ffffff" : "#000000",
                border: "none",
                borderLeft: "2px solid #000000",
                padding: "6px 12px",
                fontWeight: 800,
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              🏥 SURGICAL CASE (RARP)
            </button>
          </div>

          {/* Module Deep Links */}
          <Link
            to="/console"
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "2px solid #000000",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "2px 2px 0px #000000",
            }}
          >
            ROBOTIC GRAPH CONSOLE
          </Link>
          <Link
            to="/dental"
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "2px solid #000000",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "2px 2px 0px #000000",
            }}
          >
            32-TOOTH ODONTOGRAM
          </Link>
          <Link
            to="/"
            style={{
              background: "#ffffff",
              color: "#000000",
              border: "2px solid #000000",
              padding: "6px 10px",
              fontSize: "11px",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "2px 2px 0px #000000",
            }}
          >
            EXIT
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Procedure Milestone Progress Ribbon */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "2px solid #000000",
          padding: "8px 20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          overflowX: "auto",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: 900, whiteSpace: "nowrap" }}>
          PROCEDURE PHASES:
        </span>
        {currentPhases.map((phase, idx) => {
          const isDone = idx < activePhaseIndex;
          const isCurrent = idx === activePhaseIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePhaseIndex(idx)}
              style={{
                background: isCurrent ? "#000000" : isDone ? "#e5e5e5" : "#ffffff",
                color: isCurrent ? "#ffffff" : "#000000",
                border: "1.5px solid #000000",
                padding: "3px 8px",
                fontSize: "10px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {isDone ? `✓ ${phase}` : phase}
            </button>
          );
        })}
      </div>

      {/* Main Split Grid */}
      <main
        style={{
          flex: 1,
          padding: "16px 20px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: "16px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Patient Intake Card + Clinical Camera / Video Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Patient Report Intake Card */}
          <PatientReportCard
            report={patientReport}
            onEditClick={() => setIsReportModalOpen(true)}
          />

          {/* Clinical Camera Feed with Live Camera + Video Testing Switcher */}
          <ClinicalCameraFeed
            specialty={patientReport.specialty}
            onFrameCapture={handleFrameCapture}
            activeAlert={
              observations.find((o) => !o.acknowledged && (o.category === "warning" || o.category === "interception"))
                ?.title || null
            }
          />
        </div>

        {/* Right Column: Real-Time AI Agent Assistant Panel */}
        <div style={{ height: "calc(100vh - 170px)", minHeight: "640px" }}>
          <RealtimeAgentPanel
            patientReport={patientReport}
            observations={observations}
            onAcknowledgeObservation={handleAcknowledgeObservation}
            onGenerateOperativeNote={() => setIsOperativeNoteModalOpen(true)}
            lastCapturedFrame={lastCapturedFrame}
          />
        </div>
      </main>

      {/* Patient Report Intake & Medical History Modal */}
      <PatientReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={patientReport}
        onSaveReport={handleSaveReport}
      />

      {/* Operative Note & Audit Generator Modal */}
      <OperativeReportModal
        isOpen={isOperativeNoteModalOpen}
        onClose={() => setIsOperativeNoteModalOpen(false)}
        report={patientReport}
      />
    </div>
  );
};
