import React, { useEffect, useRef, useState } from "react";

interface ClinicalCameraFeedProps {
  specialty: "dental" | "surgical";
  onFrameCapture?: (dataUrl: string) => void;
  onAlertTriggered?: (alertText: string) => void;
  activeAlert?: string | null;
}

export const ClinicalCameraFeed: React.FC<ClinicalCameraFeedProps> = ({
  specialty,
  onFrameCapture,
  activeAlert,
}) => {
  const [feedMode, setFeedMode] = useState<"live" | "test">("test");
  const [cameraPermission, setCameraPermission] = useState<"idle" | "requesting" | "granted" | "denied">("idle");
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Video playback simulation state (for test mode)
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [reticlePos, setReticlePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isShutterFlash, setIsShutterFlash] = useState(false);

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const testCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Enumerate devices
  useEffect(() => {
    async function getDevices() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const vDevices = devices.filter((d) => d.kind === "videoinput");
        setVideoDevices(vDevices);
        if (vDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(vDevices[0].deviceId);
        }
      } catch (err) {
        console.warn("Could not enumerate media devices:", err);
      }
    }
    getDevices();
  }, [selectedDeviceId]);

  // Handle live camera stream activation
  useEffect(() => {
    if (feedMode !== "live") {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let active = true;
    async function startCamera() {
      setCameraPermission("requesting");
      setErrorMessage(null);
      try {
        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch((e) => console.warn("Auto-play prevented:", e));
        }
        setCameraPermission("granted");
      } catch (err: any) {
        console.error("Camera access error:", err);
        setCameraPermission("denied");
        setErrorMessage(err.message || "Unable to access camera. Check browser permissions or try video test mode.");
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [feedMode, selectedDeviceId]);

  // Video Test Mode Animation (Canvas simulation of intraoral prep or laparoscopic surgery)
  useEffect(() => {
    if (feedMode !== "test") return;

    let startTime = performance.now();
    let frameId: number;

    const renderTestFrame = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      if (isPlaying) {
        setPlaybackTime(elapsed);
      }

      const canvas = testCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Background: Surgical / Anatomical field
          ctx.fillStyle = specialty === "dental" ? "#fbfbfa" : "#1a0808";
          ctx.fillRect(0, 0, w, h);

          if (specialty === "dental") {
            // Draw Dental Tooth Cavity Prep simulation
            const centerX = w * 0.5;
            const centerY = h * 0.5;

            // Gingival tissue
            ctx.fillStyle = "#e07a7a";
            ctx.fillRect(0, h * 0.72, w, h * 0.28);

            // Molar Crown contour
            ctx.fillStyle = "#f5f4ef";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(centerX - 130, centerY - 90, 260, 180, 28);
            ctx.fill();
            ctx.stroke();

            // Occlusal fissures & Cavity prep
            ctx.fillStyle = "#111111";
            ctx.beginPath();
            ctx.ellipse(centerX + 15, centerY - 10, 48, 35, Math.PI / 12, 0, Math.PI * 2);
            ctx.fill();

            // Pulpal floor proximity marker (red warning zone)
            ctx.strokeStyle = "#ff3b00";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Oscillating dental bur
            const burX = centerX + Math.sin(elapsed * 2.5) * 20 + 15;
            const burY = centerY + Math.cos(elapsed * 2.5) * 12 - 10;
            setReticlePos({ x: (burX / w) * 100, y: (burY / h) * 100 });

            // Bur shank
            ctx.strokeStyle = "#888888";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(burX - 40, burY - 80);
            ctx.lineTo(burX, burY);
            ctx.stroke();

            // Bur head
            ctx.fillStyle = "#0047ff";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(burX, burY, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Water spray / cavitation mist
            for (let i = 0; i < 6; i++) {
              ctx.fillStyle = "rgba(0, 150, 255, 0.4)";
              ctx.beginPath();
              ctx.arc(
                burX + (Math.random() - 0.5) * 25,
                burY + (Math.random() - 0.5) * 25,
                Math.random() * 3 + 1,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          } else {
            // Draw Laparoscopic Prostatectomy (RARP) simulation
            const cx = w * 0.5;
            const cy = h * 0.5;

            // Deep pelvic peritoneum background
            const grad = ctx.createRadialGradient(cx, cy, 40, cx, cy, w * 0.6);
            grad.addColorStop(0, "#4a1212");
            grad.addColorStop(0.5, "#2b0909");
            grad.addColorStop(1, "#120202");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Prostatic apex & dorsal venous complex
            ctx.fillStyle = "#661818";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 30, 160, 110, 0, 0, Math.PI * 2);
            ctx.fill();

            // Aberrant Deep Dorsal Vein branch (pulsing)
            const veinPulse = 1 + Math.sin(elapsed * 3) * 0.08;
            ctx.strokeStyle = "#1d4ed8";
            ctx.lineWidth = 6 * veinPulse;
            ctx.beginPath();
            ctx.moveTo(cx - 70, cy + 10);
            ctx.bezierCurveTo(cx - 30, cy - 20, cx + 20, cy + 60, cx + 70, cy + 20);
            ctx.stroke();

            // DaVinci Maryland Bipolar Instrument 1 (Left Arm)
            const tipX = cx - 20 + Math.sin(elapsed * 1.8) * 25;
            const tipY = cy + 15 + Math.cos(elapsed * 1.8) * 15;
            setReticlePos({ x: (tipX / w) * 100, y: (tipY / h) * 100 });

            ctx.strokeStyle = "#999999";
            ctx.lineWidth = 9;
            ctx.beginPath();
            ctx.moveTo(0, h * 0.3);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Active Cautery Sparks
            if (Math.sin(elapsed * 4) > 0.3) {
              for (let i = 0; i < 4; i++) {
                ctx.fillStyle = "#facc15";
                ctx.beginPath();
                ctx.arc(
                  tipX + (Math.random() - 0.5) * 15,
                  tipY + (Math.random() - 0.5) * 15,
                  Math.random() * 2.5 + 1,
                  0,
                  Math.PI * 2
                );
                ctx.fill();
              }
            }
          }
        }
      }

      frameId = requestAnimationFrame(renderTestFrame);
    };

    frameId = requestAnimationFrame(renderTestFrame);
    animFrameRef.current = frameId;

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [feedMode, isPlaying, specialty]);

  // Capture snapshot for AI analysis
  const handleCaptureSnapshot = () => {
    setIsShutterFlash(true);
    setTimeout(() => setIsShutterFlash(false), 200);

    let dataUrl = "";
    if (feedMode === "live" && liveVideoRef.current) {
      const v = liveVideoRef.current;
      const c = document.createElement("canvas");
      c.width = v.videoWidth || 1280;
      c.height = v.videoHeight || 720;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(v, 0, 0, c.width, c.height);
        dataUrl = c.toDataURL("image/jpeg", 0.9);
      }
    } else if (feedMode === "test" && testCanvasRef.current) {
      dataUrl = testCanvasRef.current.toDataURL("image/jpeg", 0.9);
    }

    if (dataUrl && onFrameCapture) {
      onFrameCapture(dataUrl);
    }
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(ms).padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "2px solid #000000",
        boxShadow: "3px 3px 0px #000000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Camera Header Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          background: "#f7f6f2",
          borderBottom: "2px solid #000000",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              background: feedMode === "live" ? "#22c55e" : "#3b82f6",
              border: "1px solid #000000",
              display: "inline-block",
            }}
          />
          <strong style={{ textTransform: "uppercase" }}>
            {feedMode === "live" ? "Live Optical Stream" : "Procedural Simulation Test Feed"}
          </strong>
        </div>

        {/* Source Mode Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            type="button"
            onClick={() => setFeedMode("live")}
            style={{
              background: feedMode === "live" ? "#000000" : "#ffffff",
              color: feedMode === "live" ? "#ffffff" : "#000000",
              border: "2px solid #000000",
              padding: "4px 10px",
              fontWeight: 800,
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            🔴 LIVE CAMERA
          </button>
          <button
            type="button"
            onClick={() => setFeedMode("test")}
            style={{
              background: feedMode === "test" ? "#000000" : "#ffffff",
              color: feedMode === "test" ? "#ffffff" : "#000000",
              border: "2px solid #000000",
              padding: "4px 10px",
              fontWeight: 800,
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            📼 VIDEO TEST MODE
          </button>

          {/* Camera Device Dropdown (when in Live mode) */}
          {feedMode === "live" && videoDevices.length > 0 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              style={{
                background: "#ffffff",
                border: "2px solid #000000",
                padding: "3px 6px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
              }}
            >
              {videoDevices.map((d, idx) => (
                <option key={d.deviceId || idx} value={d.deviceId}>
                  {d.label || `Camera Device ${idx + 1}`}
                </option>
              ))}
            </select>
          )}

          {/* Snapshot Trigger Button */}
          <button
            type="button"
            onClick={handleCaptureSnapshot}
            title="Send current frame to AI Agent for real-time verification"
            style={{
              background: "#ffef44",
              color: "#000000",
              border: "2px solid #000000",
              padding: "4px 10px",
              fontWeight: 800,
              fontSize: "11px",
              cursor: "pointer",
              boxShadow: "1px 1px 0px #000000",
            }}
          >
            📸 CAPTURE FRAME FOR AI
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          background: "#000000",
          overflow: "hidden",
        }}
      >
        {/* Shutter flash animation on capture */}
        {isShutterFlash && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#ffffff",
              zIndex: 30,
              opacity: 0.85,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Live Camera Viewport */}
        {feedMode === "live" ? (
          cameraPermission === "denied" ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                color: "#ffffff",
                textAlign: "center",
                background: "#1e1e1e",
              }}
            >
              <div
                style={{
                  border: "2px solid #ff3b00",
                  background: "#ffefef",
                  color: "#000000",
                  padding: "16px",
                  maxWidth: "460px",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: "14px", marginBottom: "8px", color: "#ff3b00" }}>
                  [ CAMERA PERMISSION REQUIRED ]
                </div>
                <p style={{ fontSize: "12px", marginBottom: "12px", lineHeight: "1.4" }}>
                  {errorMessage || "Please grant browser camera access to stream real-time surgical or intraoral optics."}
                </p>
                <button
                  type="button"
                  onClick={() => setFeedMode("test")}
                  style={{
                    background: "#000000",
                    color: "#ffffff",
                    border: "2px solid #000000",
                    padding: "6px 14px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  SWITCH TO VIDEO TEST MODE
                </button>
              </div>
            </div>
          ) : (
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )
        ) : (
          /* Video Test Mode Simulation Canvas */
          <canvas
            ref={testCanvasRef}
            width={960}
            height={540}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        )}

        {/* Technical Reticle Grid HUD */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {/* Corner Guides */}
          <path d="M 20 40 L 20 20 L 40 20" fill="none" stroke="#ffffff" strokeWidth="2" />
          <path d="M calc(100% - 40px) 20 L calc(100% - 20px) 20 L calc(100% - 20px) 40" fill="none" stroke="#ffffff" strokeWidth="2" />
          <path d="M 20 calc(100% - 40px) L 20 calc(100% - 20px) L 40 calc(100% - 20px)" fill="none" stroke="#ffffff" strokeWidth="2" />
          <path d="M calc(100% - 40px) calc(100% - 20px) L calc(100% - 20px) calc(100% - 20px) L calc(100% - 20px) calc(100% - 40px)" fill="none" stroke="#ffffff" strokeWidth="2" />

          {/* Dynamic AI Target Crosshair following the tool or center */}
          <g transform={`translate(${(reticlePos.x / 100) * 800}, ${(reticlePos.y / 100) * 450})`}>
            <circle cx="0" cy="0" r="24" fill="none" stroke="#ffef44" strokeWidth="1.5" strokeDasharray="4,3" />
            <line x1="-30" y1="0" x2="-8" y2="0" stroke="#ffef44" strokeWidth="1.5" />
            <line x1="8" y1="0" x2="30" y2="0" stroke="#ffef44" strokeWidth="1.5" />
            <line x1="0" y1="-30" x2="0" y2="-8" stroke="#ffef44" strokeWidth="1.5" />
            <line x1="0" y1="8" x2="0" y2="30" stroke="#ffef44" strokeWidth="1.5" />
            <rect x="12" y="10" width="70" height="18" fill="#000000" stroke="#ffef44" strokeWidth="1" />
            <text x="16" y="23" fill="#ffef44" fontSize="9" fontFamily="monospace" fontWeight="900">
              TARGET LOCK
            </text>
          </g>
        </svg>

        {/* HUD Telemetry Badges */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            zIndex: 15,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              background: "#000000",
              color: "#ffffff",
              border: "1px solid #ffffff",
              padding: "2px 8px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 800,
            }}
          >
            {feedMode === "live" ? "SOURCE: USB INTRAOPERATIVE OPTICS" : "SOURCE: PROCEDURAL VALIDATION DATASET"}
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.8)",
              color: "#ffef44",
              padding: "2px 6px",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
            }}
          >
            TIMECODE: {formatTimecode(playbackTime)} • 60 FPS • 1080P
          </div>
        </div>

        {/* Active Complication / Alert Ribbon in Viewport */}
        {activeAlert && (
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              right: "16px",
              background: "#ff3b00",
              color: "#ffffff",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              padding: "8px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 20,
            }}
          >
            <span>⚠️ {activeAlert}</span>
            <span style={{ background: "#000000", color: "#ffffff", padding: "2px 6px", fontSize: "10px" }}>
              INTERCEPTION GATE ENGAGED
            </span>
          </div>
        )}
      </div>

      {/* Test Mode Scrubber Footer */}
      {feedMode === "test" && (
        <div
          style={{
            padding: "8px 12px",
            background: "#f7f6f2",
            borderTop: "2px solid #000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: "#000000",
                color: "#ffffff",
                border: "2px solid #000000",
                padding: "3px 10px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {isPlaying ? "PAUSE" : "RESUME"}
            </button>
            <span>SIMULATION ELAPSED: {playbackTime.toFixed(1)}s</span>
          </div>
          <span style={{ color: "#666666" }}>
            [ Ready to switch to Live Camera whenever connected ]
          </span>
        </div>
      )}
    </div>
  );
};
