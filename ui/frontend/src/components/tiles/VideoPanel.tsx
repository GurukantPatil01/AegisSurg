import { useState, useEffect } from "react";
import type { RefObject } from "react";

interface VideoPanelProps {
  videoUrl?: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
  onPlay?: () => void;
  isPlaying?: boolean;
}

export function VideoPanel({ videoUrl, videoRef, onPlay, isPlaying = false }: VideoPanelProps) {
  const [videoError, setVideoError] = useState(false);
  const [playingState, setPlayingState] = useState(isPlaying);
  const [frameTick, setFrameTick] = useState(0);

  useEffect(() => {
    setPlayingState(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (!playingState) return;
    const interval = setInterval(() => {
      setFrameTick((t) => (t + 1) % 600);
    }, 50);
    return () => clearInterval(interval);
  }, [playingState]);

  const handleStart = () => {
    setPlayingState(true);
    onPlay?.();
  };

  // Timecode calculation
  const seconds = Math.floor(frameTick / 20) + 85;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const frames = (frameTick % 20) * 3;
  const timecode = `00:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;

  // Instrument tip oscillation
  const tipX = 110 + Math.sin(frameTick * 0.1) * 8;
  const tipY = 75 + Math.cos(frameTick * 0.08) * 6;

  return (
    <div className="tile" data-tile="video" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="tile__header">
        <h3>Raw Video [Intraoperative Laparoscopy]</h3>
        <span className="tile__badge tile__badge--real">SAR-RARP50</span>
      </div>
      <div className="tile__body tile__body--center" style={{ position: "relative", width: "100%", height: "100%", minHeight: "220px", background: "#050505", overflow: "hidden" }}>
        {/* Real Video element if functional */}
        {!videoError && videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            className="tile__video"
            onPlay={handleStart}
            onError={() => setVideoError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}

        {/* High-Fidelity Laparoscopic Surgical Simulation Canvas (Always available as fallback/demo) */}
        {(videoError || !videoUrl || playingState) && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 50%, #2a1215 0%, #0d0607 70%, #000 100%)" }}>
            <svg viewBox="0 0 300 200" style={{ width: "100%", height: "100%", filter: "contrast(115%)" }}>
              {/* Abdominal cavity anatomy: Bladder neck & pelvic sidewall */}
              <path d="M 20 180 Q 90 90 200 120 Q 280 140 290 200 Z" fill="#4d1b22" stroke="#66222b" strokeWidth="2" />
              <path d="M 60 70 Q 150 40 240 80 Q 220 130 140 120 Z" fill="#6e2530" stroke="#8a303e" strokeWidth="1.5" />

              {/* Aberrant Deep Dorsal Vein Plexus Branch (Target of alert) */}
              <path
                d="M 100 80 Q 125 70 145 90 Q 170 85 190 100"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M 125 70 Q 135 60 140 45"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.75"
              />

              {/* Bounding Box / Tool Reticle on target vein */}
              <rect
                x="98"
                y="58"
                width="60"
                height="46"
                fill="none"
                stroke="#ff3b00"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              <text x="100" y="52" fill="#ff3b00" fontSize="7" fontFamily="monospace" fontWeight="900">
                [ DETECT: ABERRANT VEIN 1.1MM ]
              </text>

              {/* EndoWrist Maryland Bipolar Forceps Robotic Tool */}
              <g transform={`rotate(${Math.sin(frameTick * 0.05) * 4}, ${tipX}, ${tipY})`}>
                <line x1="30" y1="20" x2={tipX} y2={tipY} stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
                <line x1="30" y1="20" x2={tipX} y2={tipY} stroke="#cbd5e1" strokeWidth="3" />
                {/* Forceps Jaws */}
                <path d={`M ${tipX} ${tipY} L ${tipX + 12} ${tipY - 6}`} stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" />
                <path d={`M ${tipX} ${tipY} L ${tipX + 10} ${tipY + 4}`} stroke="#f1f5f9" strokeWidth="2.5" strokeLinecap="round" />
                {/* Cautery active spark */}
                {frameTick % 20 < 8 && (
                  <circle cx={tipX + 8} cy={tipY - 1} r="3" fill="#38bdf8" opacity="0.9" />
                )}
              </g>

              {/* Viewfinder Corner Crosshairs */}
              <path d="M 15 25 L 15 15 L 25 15" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
              <path d="M 285 25 L 285 15 L 275 15" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
              <path d="M 15 175 L 15 185 L 25 185" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
              <path d="M 285 175 L 285 185 L 275 185" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
            </svg>

            {/* Viewfinder HUD Overlays */}
            <div style={{ position: "absolute", top: "10px", left: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ background: "#000", border: "1px solid #fff", color: "#fff", padding: "2px 6px", fontSize: "10px", fontFamily: "var(--font-mono)", fontWeight: 800 }}>
                {playingState ? "● REC LIVE" : "■ STANDBY"} • 60 FPS • 4K
              </span>
              <span style={{ background: "#000", border: "1px solid #38bdf8", color: "#38bdf8", padding: "2px 6px", fontSize: "9px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                TOOL #1: MARYLAND BIPOLAR FORCEPS
              </span>
            </div>

            <div style={{ position: "absolute", bottom: "10px", left: "12px", background: "#000", border: "1px solid #fff", color: "#fff", padding: "2px 8px", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 900 }}>
              {timecode}
            </div>

            <div style={{ position: "absolute", bottom: "10px", right: "12px", background: "rgba(0,0,0,0.8)", border: "1px solid #ff3b00", color: "#ff3b00", padding: "2px 6px", fontSize: "9px", fontFamily: "var(--font-mono)", fontWeight: 800 }}>
              CONSENSUS: 3.00 &gt; 1.70 [ESCALATED]
            </div>
          </div>
        )}

        {/* Start Overlay Button when not started yet */}
        {!playingState && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.65)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", zIndex: 10 }}>
            <button
              type="button"
              onClick={handleStart}
              style={{
                background: "#000000",
                color: "#ffffff",
                border: "2px solid #ffffff",
                boxShadow: "3px 3px 0px #ffffff",
                padding: "10px 20px",
                fontSize: "12px",
                fontWeight: 900,
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              ▶ START LIVE SURGICAL DEMO
            </button>
            <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "#ffffff", textTransform: "uppercase" }}>
              Click to launch autonomous co-pilot &amp; stream state graph
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
