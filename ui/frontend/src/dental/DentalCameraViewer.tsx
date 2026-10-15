import React, { useState } from "react";
import type { ToothData } from "./dentalTypes";

interface DentalCameraViewerProps {
  selectedToothData?: ToothData;
}

export const DentalCameraViewer: React.FC<DentalCameraViewerProps> = ({
  selectedToothData,
}) => {
  const [viewMode, setViewMode] = useState<"camera" | "xray" | "split">("split");
  const isAlert = selectedToothData?.status === "pulpal_alert";

  return (
    <div className="cockpit-card" style={{ height: "100%" }}>
      {/* Header */}
      <div className="card-header">
        <div>
          <div className="card-title">
            <span style={{ width: "8px", height: "8px", background: isAlert ? "var(--brutal-alert)" : "#000", display: "inline-block" }} />
            Intraoral Vision & Bitewing HUD
          </div>
          <div className="card-subtitle">
            Bur Tracking & Pulpal Proximity Telemetry
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="tab-switcher">
          <button
            type="button"
            onClick={() => setViewMode("camera")}
            className={`tab-btn ${viewMode === "camera" ? "active" : ""}`}
          >
            Camera
          </button>
          <button
            type="button"
            onClick={() => setViewMode("xray")}
            className={`tab-btn ${viewMode === "xray" ? "active" : ""}`}
          >
            Bitewing
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`tab-btn ${viewMode === "split" ? "active" : ""}`}
          >
            Dual View
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className={`hud-viewports ${viewMode !== "split" ? "hud-viewport-single" : ""}`}>
        {/* Intraoral Camera Stream Simulation */}
        {(viewMode === "camera" || viewMode === "split") && (
          <div className={`hud-panel ${isAlert ? "alert" : ""}`}>
            <div className="hud-svg-container">
              {/* Technical Viewfinder Reticle Grid */}
              <svg viewBox="0 0 200 150" style={{ width: "100%", height: "100%" }}>
                {/* Viewfinder Corner Marks */}
                <path d="M 10 20 L 10 10 L 20 10" fill="none" stroke="#000" strokeWidth="2" />
                <path d="M 190 20 L 190 10 L 180 10" fill="none" stroke="#000" strokeWidth="2" />
                <path d="M 10 130 L 10 140 L 20 140" fill="none" stroke="#000" strokeWidth="2" />
                <path d="M 190 130 L 190 140 L 180 140" fill="none" stroke="#000" strokeWidth="2" />

                {/* Tooth Crown Outline */}
                <path
                  d="M 40 40 Q 100 20 160 40 Q 170 110 150 140 Q 100 150 50 140 Q 30 110 40 40 Z"
                  fill="#fbfbfa"
                  stroke="#000000"
                  strokeWidth="2"
                />
                {/* Pulp Chamber & Horns */}
                <path
                  d="M 80 85 Q 90 70 100 80 Q 110 70 120 85 Q 115 130 85 130 Z"
                  fill="#fee2e2"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                {/* Caries Cavity Prep (Disto-Occlusal) */}
                <path
                  d="M 105 45 Q 140 48 145 78 Q 130 85 108 72 Z"
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                {/* Rotary Bur Crosshair & Trajectory */}
                <circle cx="112" cy="74" r="5" fill="#0047ff" stroke="#000" strokeWidth="1.5" />
                <line
                  x1="112"
                  y1="74"
                  x2="114"
                  y2="83"
                  stroke="#ff3b00"
                  strokeWidth="2"
                  strokeDasharray="2,2"
                />
                <text x="120" y="80" fill="#ff3b00" fontSize="9" fontFamily="monospace" fontWeight="900">
                  0.38mm
                </text>
              </svg>

              {/* HUD Telemetry Overlay */}
              <div className="hud-tag-top">
                <span className="hud-tag">
                  [ REC • 4K INTRAORAL ]
                </span>
                <span className="hud-tag">
                  BUR: CARBIDE #4 [8,200 RPM]
                </span>
              </div>

              {/* Pulpal Alert Banner */}
              {isAlert && (
                <div className="hud-alert-banner">
                  <span>[ CRITICAL PULPAL PROXIMITY: 0.38 MM ]</span>
                  <span style={{ border: "1px solid #fff", padding: "1px 6px" }}>
                    STOP ROTARY EXCAVATION
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Digital Bitewing Radiograph Preview */}
        {(viewMode === "xray" || viewMode === "split") && (
          <div className="hud-panel">
            <div className="hud-svg-container" style={{ background: "#ffffff" }}>
              {/* Radiograph SVG Simulation */}
              <svg viewBox="0 0 200 150" style={{ width: "100%", height: "100%" }}>
                {/* Alveolar Bone Crest */}
                <path d="M 0 110 Q 100 115 200 110 L 200 150 L 0 150 Z" fill="#e5e5e5" stroke="#000" strokeWidth="1.5" />
                {/* Tooth #18 Outline */}
                <path
                  d="M 15 35 Q 55 30 55 90 Q 35 125 15 90 Z"
                  fill="#f5f5f5"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                {/* Tooth #19 Outline */}
                <path
                  d="M 65 35 Q 135 30 135 90 Q 100 135 65 90 Z"
                  fill="#f5f5f5"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                {/* Pulp Chamber in Radiograph (Radiolucent - Dark) */}
                <path
                  d="M 85 65 Q 100 50 115 65 Q 110 110 90 110 Z"
                  fill="#262626"
                />
                {/* Interproximal Caries Radiolucency (Tooth #19 Distal) */}
                <ellipse cx="122" cy="52" rx="10" ry="8" fill="#000000" stroke="#ff3b00" strokeWidth="1.5" strokeDasharray="3,2" />
                {/* Tooth #20 Outline */}
                <path
                  d="M 145 40 Q 185 35 185 90 Q 165 125 145 90 Z"
                  fill="#f5f5f5"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
              </svg>

              <div className="hud-tag-top">
                <span className="hud-tag">
                  BITEWING: BW-L-19-2026
                </span>
                <span className="hud-tag">
                  LESION: D3 DENTIN INVASION
                </span>
              </div>

              <div style={{ position: "absolute", bottom: "8px", right: "8px" }}>
                <span className="hud-tag">
                  16-BIT DICOM
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Telemetry Footer */}
      <div className="hud-footer">
        <span>TARGET: TOOTH #{selectedToothData?.tooth_number ?? 19} [{selectedToothData?.name ?? "MANDIBULAR MOLAR"}]</span>
        <span style={{ color: "var(--brutal-black)", fontWeight: 800 }}>
          LATENCY: 18MS • GEMINI 3.5 MULTIMODAL DENTAL
        </span>
      </div>
    </div>
  );
};
