import React from "react";
import {
  CANVAS,
  DENTAL_BOXES,
  DENTAL_EDGES,
  DENTAL_NODES,
  KIND_COLOR,
  KIND_LABEL,
  LEGEND_KINDS,
  type ArchEdge,
  type ArchNode,
  type Side,
} from "./dentalArchitectureData";

const byId = new Map(DENTAL_NODES.map((n) => [n.id, n]));

function port(n: ArchNode, s: Side) {
  switch (s) {
    case "t":
      return { x: n.x + n.w / 2, y: n.y };
    case "b":
      return { x: n.x + n.w / 2, y: n.y + n.h };
    case "l":
      return { x: n.x, y: n.y + n.h / 2 };
    case "r":
      return { x: n.x + n.w, y: n.y + n.h / 2 };
  }
}

function routeOf(e: ArchEdge): { d: string; mid: { x: number; y: number } } | null {
  const a = byId.get(e.from);
  const b = byId.get(e.to);
  if (!a || !b) return null;
  const p1 = port(a, e.fromSide);
  const p2 = port(b, e.toSide);
  let pts: { x: number; y: number }[];

  if (e.bend?.x !== undefined) {
    pts = [p1, { x: e.bend.x, y: p1.y }, { x: e.bend.x, y: p2.y }, p2];
  } else if (e.bend?.y !== undefined) {
    pts = [p1, { x: p1.x, y: e.bend.y }, { x: p2.x, y: e.bend.y }, p2];
  } else {
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    if (e.fromSide === "l" || e.fromSide === "r") {
      pts = [p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2];
    } else {
      pts = [p1, { x: p1.x, y: my }, { x: p2.x, y: my }, p2];
    }
  }

  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const mid = pts.length === 2 ? { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 } : pts[Math.floor(pts.length / 2)];
  return { d, mid };
}

export const DentalArchitectureDiagram: React.FC = () => {
  return (
    <svg
      viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
      width="100%"
      height="100%"
      style={{ background: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" }}
    >
      <defs>
        <marker id="dent-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
        </marker>
        <marker id="dent-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#7c3aed" />
        </marker>
      </defs>

      {/* Subsystem Container Boxes */}
      {DENTAL_BOXES.map((b) => (
        <g key={b.id}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill={b.tint}
            stroke={b.border}
            strokeWidth={b.boundary ? 2 : 1.5}
            strokeDasharray={b.boundary ? "6 4" : undefined}
            rx={8}
          />
          <text
            x={b.x + 18}
            y={b.y + 28}
            fontSize={b.boundary ? 16 : 14}
            fontWeight={700}
            fill="#0f172a"
            fontFamily="monospace"
          >
            {b.label}
          </text>
          {b.sub && (
            <text x={b.x + 18} y={b.y + 46} fontSize={11} fill="#64748b">
              {b.sub}
            </text>
          )}
        </g>
      ))}

      {/* Edges / Numbered Flow Connectors */}
      {DENTAL_EDGES.map((e, idx) => {
        const r = routeOf(e);
        if (!r) return null;
        return (
          <g key={idx}>
            <path
              d={r.d}
              fill="none"
              stroke={e.accent ? "#7c3aed" : "#94a3b8"}
              strokeWidth={e.accent ? 2.5 : 1.5}
              strokeDasharray={e.async ? "5 4" : undefined}
              markerEnd={e.accent ? "url(#dent-arrow-accent)" : "url(#dent-arrow)"}
            />
            {e.step && (
              <g transform={`translate(${r.mid.x - 14}, ${r.mid.y - 12})`}>
                <rect x="0" y="0" width="28" height="24" rx="4" fill={e.accent ? "#7c3aed" : "#0f172a"} />
                <text x="14" y="16" fill="#ffffff" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                  {e.step}
                </text>
              </g>
            )}
            {e.label && (
              <text
                x={r.mid.x + 18}
                y={r.mid.y + 4}
                fontSize="10"
                fontFamily="monospace"
                fontWeight="700"
                fill="#334155"
              >
                {e.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Services and Agent Nodes */}
      {DENTAL_NODES.map((n) => (
        <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
          <rect
            width={n.w}
            height={n.h}
            rx={6}
            fill="#ffffff"
            stroke={KIND_COLOR[n.kind]}
            strokeWidth={1.5}
            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.04))"
          />
          {/* Node Kind Swatch Bar */}
          <rect width={6} height={n.h} rx={2} fill={KIND_COLOR[n.kind]} />

          {/* Node Monogram Tile */}
          <rect x={14} y={12} width={26} height={26} rx={4} fill="#f1f5f9" />
          <text x={27} y={29} fontSize={11} fontWeight="800" fill="#334155" textAnchor="middle" fontFamily="monospace">
            {n.mono ?? n.label.slice(0, 2).toUpperCase()}
          </text>

          {/* Titles & Roles */}
          <text x={48} y={24} fontSize={12} fontWeight="800" fill="#0f172a">
            {n.label}
          </text>
          {n.role && (
            <text x={48} y={38} fontSize={10} fill="#64748b">
              {n.role}
            </text>
          )}

          {/* Detail lines if multi-agent breakdown */}
          {n.detail &&
            n.detail.map((line, li) => (
              <text key={li} x={48} y={54 + li * 14} fontSize={9} fill="#475569" fontFamily="monospace">
                • {line}
              </text>
            ))}
        </g>
      ))}

      {/* Legend Footer */}
      <g transform={`translate(40, ${CANVAS.h - 50})`}>
        {LEGEND_KINDS.map((k, i) => (
          <g key={k} transform={`translate(${i * 260}, 0)`}>
            <rect width={16} height={16} rx={3} fill={KIND_COLOR[k]} />
            <text x={24} y={12} fontSize={11} fill="#475569" fontWeight="600">
              {KIND_LABEL[k]}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};
