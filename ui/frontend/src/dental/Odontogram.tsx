import React from "react";
import type { ToothData, ToothSurface } from "./dentalTypes";

interface OdontogramProps {
  teeth: Record<number, ToothData>;
  selectedTooth: number;
  onSelectTooth: (toothNumber: number) => void;
}

export const Odontogram: React.FC<OdontogramProps> = ({
  teeth,
  selectedTooth,
  onSelectTooth,
}) => {
  // Maxillary Arch: 1-16 (Upper Right to Upper Left)
  const upperTeeth = Array.from({ length: 16 }, (_, i) => i + 1);
  // Mandibular Arch: 32 down to 17 (Lower Right to Lower Left)
  const lowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i);

  const renderSurface = (
    surface: ToothSurface,
    status: string,
    shapeClass: string
  ) => {
    let fill = "#ffffff";
    if (status === "decay") fill = "#000000";
    else if (status === "restored") fill = "#0047ff";
    else if (status === "sealant") fill = "#737373";

    return (
      <path
        key={surface}
        data-surface={surface}
        d={shapeClass}
        fill={fill}
        stroke="#000000"
        strokeWidth="1"
      />
    );
  };

  const renderTooth = (toothNum: number) => {
    const data = teeth[toothNum];
    if (!data) return null;

    const isSelected = selectedTooth === toothNum;
    const isAlert = data.status === "pulpal_alert";
    const hasPerioRisk = data.perio && Object.values(data.perio).some((v) => typeof v === "number" && v >= 4);

    return (
      <div
        key={toothNum}
        onClick={() => onSelectTooth(toothNum)}
        className={`tooth-item ${isSelected ? "selected" : ""} ${isAlert ? "pulpal-alert" : ""}`}
        title={`${data.name} (#${data.tooth_number} / FDI ${data.fdi_number})`}
      >
        {/* Tooth number and status badge */}
        <div className="tooth-top-row">
          <span>{toothNum}</span>
          {data.perio?.bleeding_on_probing && <span className="bop-dot" title="Bleeding on Probing" />}
        </div>

        {/* 5-Surface Tooth SVG Anatomy diagram */}
        <svg viewBox="0 0 40 40" className="tooth-svg">
          {/* Top (Buccal/Lingual) */}
          {renderSurface("B", data.surfaces.B.status, "M 2 2 L 38 2 L 30 10 L 10 10 Z")}
          {/* Bottom (Lingual/Buccal) */}
          {renderSurface("L", data.surfaces.L.status, "M 10 30 L 30 30 L 38 38 L 2 38 Z")}
          {/* Left (Mesial/Distal) */}
          {renderSurface("M", data.surfaces.M.status, "M 2 2 L 10 10 L 10 30 L 2 38 Z")}
          {/* Right (Distal/Mesial) */}
          {renderSurface("D", data.surfaces.D.status, "M 38 2 L 38 38 L 30 30 L 30 10 Z")}
          {/* Center (Occlusal) */}
          {renderSurface("O", data.surfaces.O.status, "M 10 10 L 30 10 L 30 30 L 10 30 Z")}
        </svg>

        {/* Probing depths readout preview */}
        {data.perio && (
          <div className={`tooth-perio-val ${hasPerioRisk ? "perio-risk" : ""}`}>
            {data.perio.distobuccal}-{data.perio.midbuccal}-{data.perio.mesiobuccal}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="odontogram-card">
      <div className="odontogram-header">
        <div className="odontogram-title-wrap">
          <div style={{ width: "10px", height: "10px", background: "#000" }} />
          <div>
            <div className="odontogram-title">Universal Odontogram [32 Teeth]</div>
            <div className="odontogram-subtitle">
              Intraoperative Anatomical Chart & Surface Status
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="odontogram-legend">
          <span className="legend-item">
            <span className="legend-box legend-box-sound" />
            Sound
          </span>
          <span className="legend-item">
            <span className="legend-box legend-box-caries" />
            Caries [Black]
          </span>
          <span className="legend-item">
            <span className="legend-box legend-box-restored" />
            Restored [Blue]
          </span>
          <span className="legend-item">
            <span className="legend-box legend-box-alert" />
            Pulpal Alert
          </span>
        </div>
      </div>

      {/* Maxillary (Upper) Arch */}
      <div className="arch-container">
        <div className="arch-label-row">
          <span>Maxillary Upper Arch [Teeth 1–16]</span>
          <span style={{ color: "var(--brutal-text-secondary)", fontSize: "10px" }}>
            Q1 (Right) ➔ Q2 (Left)
          </span>
        </div>
        <div className="arch-teeth-grid">
          {upperTeeth.map(renderTooth)}
        </div>
      </div>

      {/* Midline Divider line */}
      <div className="arch-midline">
        <div className="arch-midline-line" />
        <div className="arch-midline-badge">Occlusal Plane / Midline</div>
      </div>

      {/* Mandibular (Lower) Arch */}
      <div className="arch-container">
        <div className="arch-label-row">
          <span>Mandibular Lower Arch [Teeth 32–17]</span>
          <span style={{ color: "var(--brutal-text-secondary)", fontSize: "10px" }}>
            Q4 (Right) ➔ Q3 (Left)
          </span>
        </div>
        <div className="arch-teeth-grid">
          {lowerTeeth.map(renderTooth)}
        </div>
      </div>
    </div>
  );
};
