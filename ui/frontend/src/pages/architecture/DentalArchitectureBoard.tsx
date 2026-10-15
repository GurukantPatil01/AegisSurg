import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Kind = "external" | "user" | "compute" | "model" | "data" | "gov" | "ops";

interface Svc {
  name: string;
  role: string;
  logo?: string;
  mono?: string;
  kind: Kind;
  note?: string;
}

function Card({ s, logos, anchor, plain }: { s: Svc; logos: Set<string>; anchor?: string; plain?: boolean }) {
  const has = !!s.logo && logos.has(s.logo);
  return (
    <div className={`ab__card ab__card--${s.kind}`} data-anchor={anchor}>
      <span className={`ab__icon${plain ? " ab__icon--plain" : ""}`} aria-hidden="true">
        {has ? <img src={`/icons/${s.logo}`} alt="" /> : <span className="ab__mono">{s.mono ?? s.name.slice(0, 2)}</span>}
      </span>
      <span className="ab__card-text">
        <b>{s.name}</b>
        <i>{s.role}</i>
        {s.note && <em>{s.note}</em>}
      </span>
    </div>
  );
}

const INGEST: Svc[] = [
  { name: "Cloud Storage", role: "4K intraoral video, bitewing DICOMs, STL 3D scans", logo: "cloudstorage.png", mono: "GCS", kind: "data" },
  { name: "Cloud Run — frontend", role: "React 32-tooth odontogram + GentesBot drawer, SSE stream", logo: "cloudrun.png", kind: "compute", note: "runs as a zero-permission identity" },
];

const DENTALGRAPH: Svc[] = [
  { name: "Cloud Run — dental orchestrator", role: "ADK components (Anatomy mapper, Bur tracker, Pulpal proximity agent, Margin verifier, CDT coder)", logo: "cloudrun.png", kind: "compute" },
  { name: "Cloud Run — dental state service", role: "single writer of the 32-Tooth Living State Graph", logo: "cloudrun.png", kind: "compute" },
];

const GENTESBOT: Svc[] = [
  { name: "Cloud Run — GentesBot relay", role: "WebSocket; screens chairside voice turns before model sees it", logo: "cloudrun.png", kind: "compute" },
  { name: "Agent Runtime (GEAP)", role: "5 separately deployed dental reasoning engines", logo: "gemin.png", mono: "AR", kind: "compute" },
];

const MODELS: Svc[] = [
  { name: "Vertex AI — Gemini 3.5 Flash", role: "multimodal tooth vision, caries bur tracking & SOAP note generation", logo: "gemin.png", kind: "model" },
  { name: "Vertex AI — MedASR (Dental)", role: "specialized dental terminology recognition (perio depths, surfaces, margins)", logo: "vertexai.png", kind: "model" },
  { name: "Cloud Text-to-Speech", role: "Chirp 3 HD streaming chairside synthesis", mono: "TTS", kind: "model" },
];

const STATE: Svc[] = [
  { name: "Firestore", role: "Living State Graph — 32 teeth nodes, pulpal proximity edges, CDT codes", logo: "firestore.png", kind: "data", note: "multi-instance safe, real-time fan-out" },
  { name: "Memory Bank (GEAP)", role: "approved dentist feedback & chairside preferences, retrieved by similarity", logo: "gemin.png", mono: "MB", kind: "data" },
];

const GOV: Svc[] = [
  { name: "Model Armor", role: "one template, screens input and output", logo: "modelarmor.png", kind: "gov" },
  { name: "Agent Registry (GEAP)", role: "6 registered dental services", logo: "gemin.png", mono: "AR", kind: "gov" },
  { name: "Agent Identity (GEAP)", role: "SPIFFE certs on 4 dental subagents", logo: "gemin.png", mono: "AI", kind: "gov" },
  { name: "IAM", role: "3 least-privilege service accounts", logo: "iam.png", mono: "IAM", kind: "gov" },
];

const OPS: Svc[] = [
  { name: "Cloud Trace", role: "OpenTelemetry GenAI spans", logo: "cloudtrace.png", mono: "CT", kind: "ops" },
  { name: "Cloud Logging", role: "agent and service logs", logo: "cloudlogging.png", mono: "CL", kind: "ops" },
  { name: "Cloud Monitoring", role: "metrics", logo: "cloudmonitoring.png", mono: "CM", kind: "ops" },
  { name: "Cloud Build", role: "10-step pipeline on push to main", logo: "cloudbuild.png", kind: "ops" },
  { name: "Artifact Registry", role: "container images", logo: "artifactregistry.png", mono: "AR", kind: "ops" },
];

const EXT_LEFT: Svc[] = [
  { name: "Oral32-Dataset & RVG", role: "4K intraoral camera feeds, digital bitewings & RVG radiographs", logo: "video.png", mono: "▶", kind: "external" },
  { name: "JADA · JOE · ITI Consensus", role: "3 dental literature RAG APIs, merged by rank fusion", logo: "europepmc.png", mono: "JADA", kind: "external" },
  { name: "Dentrix / Eaglesoft FHIR", role: "external Dental EHR — ADA CDT billing + signed SOAP progress notes", logo: "fhir.png", mono: "FHIR", kind: "external" },
  { name: "GitHub", role: "push to main triggers the deploy", logo: "github.png", mono: "GH", kind: "external" },
];

const EXT_RIGHT: Svc[] = [
  { name: "Dentist / Chairside Team", role: "hands-free voice perio charting, case review & gate attestation", logo: "surgeon.png", kind: "user" },
];

const LEGEND: { k: Kind | "agent" | "tool" | "det" | "hitl"; label: string }[] = [
  { k: "compute", label: "Compute — Cloud Run / Agent Runtime" },
  { k: "model", label: "Model endpoint — Vertex AI" },
  { k: "data", label: "State & storage" },
  { k: "gov", label: "Governance & security" },
  { k: "ops", label: "Observability & delivery" },
  { k: "external", label: "External — outside Google Cloud" },
  { k: "user", label: "Human in the loop" },
];

interface Conn {
  n: number;
  from: string;
  to: string;
  label: string;
  desc: string;
  accent?: boolean;
  async?: boolean;
  hitl?: boolean;
  exitDx?: number;
  enterDx?: number;
  trunk?: boolean;
  spec?: (ch: Channels) => RouteSpec;
  labelLeg?: number;
}

const CONNS: Conn[] = [
  { n: 1, from: "dataset", to: "gcs", label: "GCS: Intraoral video + DICOMs", async: true, desc: "Intraoral 4K camera frames and digital bitewings land in Cloud Storage." },
  { n: 2, from: "frontend", to: "orchestrator", label: "POST /cases/open", desc: "The Gentes cockpit opens a case (Tooth #19, #14, #30); the orchestrator mints a case ID." },
  { n: 3, from: "orchestrator", to: "gemini", trunk: true, exitDx: -90, enterDx: -120, label: "Gemini 3.5: Tooth Vision + Bur Tracking", desc: "Tooth crown segmentation and three Pulpal Proximity agents call Gemini 3.5 over 5s sliding windows. Consensus requires 2 of 3 before an alert is raised." },
  { n: 4, from: "orchestrator", to: "stateservice", label: "Firestore: 32-Tooth Graph persistence", desc: "Every finding (surfaces, prep depth, pulpal proximity) is written as a graph patch rather than held in memory." },
  { n: 5, from: "stateservice", to: "firestore", labelLeg: 1, spec: (ch) => ({ from: "bottom", to: "top", via: [{ y: ch.gapY - 28 }, { x: ch.surgX }] }), label: "Firestore: transactional write", desc: "A transaction increments a monotonic seq driving the live SSE fan-out to the 32-tooth odontogram." },
  { n: 6, from: "orchestrator", to: "litapis", label: "Dental literature retrieval", desc: "Literature RAG queries JADA, JOE, and ITI consensus guidelines on indirect pulp capping (IPC/D3120)." },
  { n: 7, from: "orchestrator", to: "gemini", labelLeg: 1, spec: (ch) => ({ from: "bottom", fromOffset: -90, to: "right", via: [{ y: ch.gapY }, { x: ch.modelsX - 15 }] }), label: "Gemini 3.5: Derived CDT Codes & SOAP", desc: "Gemini 3.5 derives ADA CDT billing codes (D2643, D0140, D0220) and drafts the chairside SOAP record." },
  { n: 8, from: "gemini", to: "armor", spec: (ch) => ({ from: "bottom", to: "left", via: [{ y: ch.modelStackY }, { x: ch.govX + 15 }] }), label: "ModelArmor: Screen the draft", desc: "Model Armor screens the clinical draft autonomously before a dentist is offered an attestation button." },
  { n: 9, from: "orchestrator", to: "fhir", label: "FHIR: Verified write to Dentrix EHR", hitl: true, desc: "After the fail-closed Verification Gate and dentist's approval, DocumentReference is written to the dental practice management system." },
  { n: 10, from: "surgeon", to: "relay", labelLeg: 2, spec: (ch) => ({ from: "right", to: "top", via: [{ x: ch.cloudEdgeX }, { y: ch.ingestGapY }] }), label: "HITL: Voice perio charting & debrief", desc: "The dentist speaks probing depths or reviews cavity prep hands-free through GentesBot." },
  { n: 11, from: "relay", to: "medasr", labelLeg: 2, spec: (ch) => ({ from: "left", to: "right", fromOffset: -8, via: [{ x: ch.surgX - 12 }, { y: ch.gapY }, { x: ch.modelsX }] }), label: "MedASR: Dental speech recognition", async: true, desc: "MedASR transcribes dental vocabulary (furcation class, distobuccal, cavosurface finish line)." },
  { n: 12, from: "relay", to: "armor", labelLeg: 2, spec: (ch) => ({ from: "right", to: "top", via: [{ x: ch.botEdgeX }, { y: ch.gapY }] }), label: "ModelArmor: Screen the turn", desc: "Model Armor template screens the chairside transcript before any reasoning model sees it." },
  { n: 13, from: "relay", to: "agentruntime", label: "GEAP: async_stream_query", desc: "The root agent dispatches to five dental specialist subagents on Agent Runtime." },
  { n: 14, from: "agentruntime", to: "firestore", labelLeg: 1, spec: (ch) => ({ from: "bottom", fromOffset: -8, to: "right", via: [{ y: ch.gapY - 20 }, { x: ch.govX }] }), label: "Firestore: Reads completed arch state", async: true, desc: "Subagents read the active 32-tooth state off the same Living State Graph GentesGraph wrote." },
  { n: 15, from: "relay", to: "tts", labelLeg: 2, spec: (ch) => ({ from: "left", to: "right", fromOffset: 8, via: [{ x: ch.surgX + 12 }, { y: ch.gapY + 29 }, { x: ch.modelsX + 15 }] }), label: "Chirp: Speech out", async: true, desc: "Chirp 3 HD streams chairside confirmation back to the clinician." },
  { n: 16, from: "agentruntime", to: "memorybank", labelLeg: 1, spec: (ch) => ({ from: "bottom", fromOffset: 8, to: "right", via: [{ y: ch.gapY + 10 }, { x: ch.govX - 15 }] }), label: "MemoryBank: On approval only", hitl: true, desc: "Only when the dentist approves the review does captured feedback become durable clinical practice memory." },
  { n: 17, from: "memorybank", to: "gemini", label: "Gemini 3.5: Informs future preparations", accent: true, desc: "Dentist preferences and bur depth tolerances inform subsequent tooth preparations — the closed learning loop." },
  { n: 18, from: "github", to: "cloudbuild", spec: () => ({ from: "bottom", to: "left", via: [] }), label: "CloudBuild: Push to main", async: true, desc: "A push to main runs the 10-step pipeline and deploys all Gentes Dental Cloud Run services." },
];

interface Pt {
  x: number;
  y: number;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Path {
  d: string;
  pts: Pt[];
  lx: number;
  ly: number;
  leader?: Pt | null;
  c: Conn;
}

interface Channels {
  surgX: number;
  modelsX: number;
  govX: number;
  gapY: number;
  botEdgeX: number;
  cloudEdgeX: number;
  ingestGapY: number;
  modelStackY: number;
}

type Side = "top" | "bottom" | "left" | "right";

interface RouteSpec {
  from: Side;
  to: Side;
  fromOffset?: number;
  toOffset?: number;
  fromAt?: number;
  toAt?: number;
  via: Array<{ x: number } | { y: number }>;
}

function edgePoint(r: { x: number; y: number; w: number; h: number }, side: Side, off = 0): Pt {
  switch (side) {
    case "top": return { x: r.x + r.w / 2 + off, y: r.y };
    case "bottom": return { x: r.x + r.w / 2 + off, y: r.y + r.h };
    case "left": return { x: r.x, y: r.y + r.h / 2 + off };
    case "right": return { x: r.x + r.w, y: r.y + r.h / 2 + off };
  }
}

function routeManual(a: DOMRect, b: DOMRect, o: DOMRect, spec: RouteSpec): { d: string; pts: Pt[]; lx: number; ly: number } {
  const A = { x: a.left - o.left, y: a.top - o.top, w: a.width, h: a.height };
  const B = { x: b.left - o.left, y: b.top - o.top, w: b.width, h: b.height };
  const pin = (p: Pt, r: typeof A, side: Side, at?: number): Pt => {
    if (at === undefined) return p;
    const lo = side === "top" || side === "bottom" ? r.x : r.y;
    const hi = side === "top" || side === "bottom" ? r.x + r.w : r.y + r.h;
    const v = Math.min(Math.max(at, lo + 6), hi - 6);
    return side === "top" || side === "bottom" ? { x: v, y: p.y } : { x: p.x, y: v };
  };
  const start = pin(edgePoint(A, spec.from, spec.fromOffset), A, spec.from, spec.fromAt);
  const end = pin(edgePoint(B, spec.to, spec.toOffset), B, spec.to, spec.toAt);

  const pts: Pt[] = [start];
  let cur = start;
  for (const v of spec.via) {
    cur = "x" in v ? { x: v.x, y: cur.y } : { x: cur.x, y: v.y };
    pts.push(cur);
  }
  const vertical = spec.to === "top" || spec.to === "bottom";
  if (vertical && cur.x !== end.x) pts.push({ x: end.x, y: cur.y });
  if (!vertical && cur.y !== end.y) pts.push({ x: cur.x, y: end.y });
  pts.push(end);

  const d = pts.map((q, i) => `${i === 0 ? "M" : "L"} ${q.x} ${q.y}`).join(" ");
  let best = 1;
  let bestLen = -1;
  for (let i = 1; i < pts.length; i++) {
    const len = Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
    if (len > bestLen) {
      bestLen = len;
      best = i;
    }
  }
  return { d, pts, lx: (pts[best - 1].x + pts[best].x) / 2, ly: (pts[best - 1].y + pts[best].y) / 2 };
}

function route(
  a: DOMRect,
  b: DOMRect,
  o: DOMRect,
  nudge: { exitDx?: number; enterDx?: number; corridorY?: number } = {},
): { d: string; pts: Pt[]; lx: number; ly: number } {
  const A = { x: a.left - o.left, y: a.top - o.top, w: a.width, h: a.height };
  const B = { x: b.left - o.left, y: b.top - o.top, w: b.width, h: b.height };
  const ac = { x: A.x + A.w / 2, y: A.y + A.h / 2 };
  const bc = { x: B.x + B.w / 2, y: B.y + B.h / 2 };
  const dx = bc.x - ac.x;
  const dy = bc.y - ac.y;

  let p1: { x: number; y: number };
  let p2: { x: number; y: number };
  let pts: { x: number; y: number }[];

  if (Math.abs(dx) > Math.abs(dy)) {
    p1 = { x: dx > 0 ? A.x + A.w : A.x, y: ac.y };
    p2 = { x: dx > 0 ? B.x : B.x + B.w, y: bc.y };
    const mx = (p1.x + p2.x) / 2;
    pts = Math.abs(p1.y - p2.y) < 3 ? [p1, p2] : [p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2];
  } else {
    p1 = { x: ac.x + (nudge.exitDx ?? 0), y: dy > 0 ? A.y + A.h : A.y };
    p2 = { x: bc.x + (nudge.enterDx ?? 0), y: dy > 0 ? B.y : B.y + B.h };
    const cy = nudge.corridorY ?? (p1.y + p2.y) / 2;
    pts = [p1, { x: p1.x, y: cy }, { x: p2.x, y: cy }, p2];
  }

  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  let best = 1;
  let bestLen = -1;
  for (let i = 1; i < pts.length; i++) {
    const len = Math.abs(pts[i].x - pts[i - 1].x) + Math.abs(pts[i].y - pts[i - 1].y);
    if (len > bestLen) {
      bestLen = len;
      best = i;
    }
  }
  return { d, pts, lx: (pts[best - 1].x + pts[best].x) / 2, ly: (pts[best - 1].y + pts[best].y) / 2 };
}

function separateCorridors(paths: Path[]) {
  const SEPARATION = 16;
  for (let i = 0; i < paths.length; i++) {
    for (let j = i + 1; j < paths.length; j++) {
      const p1 = paths[i];
      const p2 = paths[j];
      for (let a = 1; a < p1.pts.length; a++) {
        for (let b = 1; b < p2.pts.length; b++) {
          const s1a = p1.pts[a - 1];
          const s1b = p1.pts[a];
          const s2a = p2.pts[b - 1];
          const s2b = p2.pts[b];
          const h1 = s1a.y === s1b.y;
          const h2 = s2a.y === s2b.y;
          if (h1 && h2 && Math.abs(s1a.y - s2a.y) < SEPARATION) {
            const min1 = Math.min(s1a.x, s1b.x);
            const max1 = Math.max(s1a.x, s1b.x);
            const min2 = Math.min(s2a.x, s2b.x);
            const max2 = Math.max(s2a.x, s2b.x);
            if (max1 > min2 && max2 > min1) {
              const shift = SEPARATION / 2;
              s1a.y -= shift;
              s1b.y -= shift;
              s2a.y += shift;
              s2b.y += shift;
              p1.d = p1.pts.map((p, k) => `${k === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
              p2.d = p2.pts.map((p, k) => `${k === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
            }
          }
        }
      }
    }
  }
}

function placeLabels(
  paths: Path[],
  _obstacles: Rect[],
  _bounds: { x: number; y: number; w: number; h: number },
  sizes: Map<number, { w: number; h: number }>,
) {
  const placed: Rect[] = [];
  for (const p of paths) {
    const sz = sizes.get(p.c.n) ?? { w: 140, h: 22 };
    const w = sz.w + 6;
    const h = sz.h + 6;
    const pts = p.pts;
    const legIdx = p.c.labelLeg !== undefined && p.c.labelLeg < pts.length - 1 ? p.c.labelLeg : 1;
    const a = pts[Math.min(legIdx, pts.length - 2)];
    const b = pts[Math.min(legIdx + 1, pts.length - 1)];
    const at = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    p.lx = at.x;
    p.ly = at.y;
    placed.push({ x: at.x - w / 2, y: at.y - h / 2, w, h });
  }
}

export function DentalArchitectureWalkthrough() {
  return (
    <div className="ab__flow">
      <h4 className="ab__flow-title">Gentes Dental OS — End-to-End Clinical Architecture Flow</h4>
      <ol
        className="ab__flow-list"
        style={{ gridTemplateRows: `repeat(${Math.ceil(CONNS.length / 2)}, auto)` }}
      >
        {CONNS.map((c) => (
          <li key={c.n} className={c.hitl ? "ab__flow-hitl" : c.accent ? "ab__flow-accent" : undefined}>
            <span className="ab__flow-num">{c.n}</span>
            <span>
              <b>{c.label}</b>
              {c.desc}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DentalArchitectureBoard() {
  const [logos, setLogos] = useState<Set<string>>(new Set());
  useEffect(() => {
    const all = [...INGEST, ...DENTALGRAPH, ...GENTESBOT, ...MODELS, ...STATE, ...GOV, ...OPS, ...EXT_LEFT, ...EXT_RIGHT];
    const names = [...new Set(all.map((s) => s.logo).filter(Boolean) as string[])];
    let alive = true;
    Promise.all(
      names.map(
        (f) =>
          new Promise<string | null>((res) => {
            const i = new Image();
            i.onload = () => res(f);
            i.onerror = () => res(null);
            i.src = `/icons/${f}`;
          }),
      ),
    ).then((r) => alive && setLogos(new Set(r.filter(Boolean) as string[])));
    return () => {
      alive = false;
    };
  }, []);

  const stageRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const root = stageRef.current;
    if (!root) return;
    const o = root.getBoundingClientRect();
    setSize({ w: o.width, h: o.height });
    const findEl = (id: string) => root.querySelector<HTMLElement>(`[data-anchor="${id}"]`);
    const find = (id: string) => findEl(id)?.getBoundingClientRect();
    const panelGapY = (from: string, to: string) => {
      const a = findEl(from)?.closest(".ab__panel")?.getBoundingClientRect();
      const b = findEl(to)?.closest(".ab__panel")?.getBoundingClientRect();
      if (!a || !b) return undefined;
      return (a.bottom + b.top) / 2 - o.top;
    };
    const box = (sel: string) => root.querySelector(sel)?.getBoundingClientRect();
    const graph = box(".ab__panel--graph");
    const bot = box(".ab__panel--bot");
    const shared = box(".ab__panel--shared");
    const models = box(".ab__sub--models");
    const state = box(".ab__sub--state");
    const ch: Channels | null =
      graph && bot && shared && models && state
        ? {
            surgX: (graph.right + bot.left) / 2 - o.left,
            modelsX: (models.right + state.left) / 2 - o.left,
            govX: (state.right + (box(".ab__sub--gov")?.left ?? state.right)) / 2 - o.left,
            gapY: (graph.bottom + shared.top) / 2 - o.top,
            modelStackY: ((find("gemini")?.bottom ?? 0) + (find("medasr")?.top ?? 0)) / 2 - o.top,
            botEdgeX:
              bot.right - parseFloat(getComputedStyle(root.querySelector(".ab__panel--bot")!).paddingRight || "14") / 2 - o.left,
            cloudEdgeX:
              (box(".ab__cloud")?.right ?? 0) -
              parseFloat(getComputedStyle(root.querySelector(".ab__cloud")!).paddingRight || "16") / 2 -
              o.left,
            ingestGapY: ((box(".ab__row--even")?.bottom ?? 0) + (box(".ab__row--band")?.top ?? 0)) / 2 - o.top,
          }
        : null;

    const next: Path[] = [];
    for (const c of CONNS) {
      const a = find(c.from);
      const b = find(c.to);
      if (!a || !b) continue;
      if (c.spec && ch) {
        next.push({ ...routeManual(a, b, o, c.spec(ch)), c });
        continue;
      }
      const corridorY = c.trunk ? panelGapY(c.from, c.to) : undefined;
      next.push({ ...route(a, b, o, { exitDx: c.exitDx, enterDx: c.enterDx, corridorY }), c });
    }
    const obstacles: Rect[] = [
      ...root.querySelectorAll<HTMLElement>(
        ".ab__card, .ab__panel-note, .ab__panel h4, .ab__cloud-head, .ab__sub-title, .ab__ext-title",
      ),
    ].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
    });
    const pill = new Map<number, { w: number; h: number }>();
    root.querySelectorAll<HTMLElement>(".ab__wire-label").forEach((el) => {
      const n = Number(el.querySelector("b")?.textContent);
      const r = el.getBoundingClientRect();
      if (n) pill.set(n, { w: r.width, h: r.height });
    });
    separateCorridors(next);
    placeLabels(next, obstacles, { x: 0, y: 0, w: o.width, h: o.height }, pill);
    setPaths(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, logos]);

  return (
    <div className="ab" id="dental-architecture-board">
      <div className="ab__stage" ref={stageRef}>
        <svg className="ab__wires" width={size.w} height={size.h} aria-hidden="true">
          <defs>
            <marker id="ab-arw-dent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#94a3b8" />
            </marker>
            <marker id="ab-arw-dent-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#7c3aed" />
            </marker>
          </defs>
          {paths.map((p, i) => (
            <g key={i}>
              {p.leader && (
                <line
                  x1={p.leader.x}
                  y1={p.leader.y}
                  x2={p.lx}
                  y2={p.ly}
                  stroke={p.c.accent ? "#7c3aed" : p.c.hitl ? "#c98500" : "#cbd5e1"}
                  strokeWidth={1}
                  strokeDasharray="2 3"
                />
              )}
              <path
                d={p.d}
                fill="none"
                stroke={p.c.accent ? "#7c3aed" : p.c.hitl ? "#c98500" : "#94a3b8"}
                strokeWidth={p.c.accent ? 2 : 1.5}
                strokeDasharray={p.c.async ? "6 4" : p.c.accent ? "7 4" : undefined}
                markerEnd={p.c.accent ? "url(#ab-arw-dent-a)" : "url(#ab-arw-dent)"}
              />
            </g>
          ))}
        </svg>

        <aside className="ab__ext">
          <span className="ab__ext-title">External</span>
          {EXT_LEFT.map((s, i) => (
            <Card key={s.name} s={s} logos={logos} anchor={["dataset", "litapis", "fhir", "github"][i]} plain />
          ))}
        </aside>

        <section className="ab__cloud">
          <div className="ab__ext-top">
            <span className="ab__ext-title">External</span>
            {EXT_RIGHT.map((s) => (
              <Card key={s.name} s={s} logos={logos} anchor="surgeon" plain />
            ))}
          </div>
          <header className="ab__cloud-head">Google Cloud · liveapi-488810 · us-central1</header>

          <div className="ab__row ab__row--2 ab__row--even">
            {INGEST.map((s, i) => (
              <Card key={s.name} s={s} logos={logos} anchor={i === 0 ? "gcs" : "frontend"} />
            ))}
          </div>

          <div className="ab__row ab__row--2 ab__row--band">
            <div className="ab__panel ab__panel--graph">
              <h4>
                GentesGraph <span>Driven by Cloud Run + Vertex AI</span>
              </h4>
              {DENTALGRAPH.map((s, i) => (
                <Card key={s.name} s={s} logos={logos} anchor={i === 0 ? "orchestrator" : "stateservice"} />
              ))}
            </div>

            <div className="ab__panel ab__panel--bot">
              <h4>
                GentesBot <span>Driven by Gemini Enterprise Agent Platform</span>
              </h4>
              {GENTESBOT.map((s, i) => (
                <Card key={s.name} s={s} logos={logos} anchor={i === 0 ? "relay" : "agentruntime"} />
              ))}
            </div>
          </div>

          <div className="ab__panel ab__panel--shared">
            <h4>
              Shared services <span>both workflows read and write through these</span>
            </h4>
            <div className="ab__row ab__row--3">
              <div className="ab__sub ab__sub--boxed ab__sub--models">
                <span className="ab__sub-title">Models</span>
                {MODELS.map((s, i) => (
                  <Card key={s.name} s={s} logos={logos} anchor={["gemini", "medasr", "tts"][i]} />
                ))}
              </div>
              <div className="ab__sub ab__sub--boxed ab__sub--state">
                <span className="ab__sub-title">State &amp; memory</span>
                {STATE.map((s, i) => (
                  <Card key={s.name} s={s} logos={logos} anchor={i === 0 ? "firestore" : "memorybank"} />
                ))}
              </div>
              <div className="ab__sub ab__sub--boxed ab__sub--gov">
                <span className="ab__sub-title">Governance</span>
                {GOV.map((s, i) => (
                  <Card key={s.name} s={s} logos={logos} anchor={["armor", "registry", "identity", "iam"][i]} />
                ))}
              </div>
            </div>
          </div>

          <div className="ab__panel ab__panel--ops">
            <h4>
              Observability &amp; delivery <span>spans every service above</span>
            </h4>
            <div className="ab__row ab__row--3">
              {OPS.map((s, i) => (
                <Card key={s.name} s={s} logos={logos} anchor={["trace", "logging", "monitoring", "cloudbuild", "artifacts"][i]} />
              ))}
            </div>
          </div>
        </section>

        <div className="ab__wire-labels" aria-hidden="true">
          {paths.map((p, i) => (
            <span
              key={i}
              className={`ab__wire-label${p.c.accent ? " ab__wire-label--accent" : p.c.hitl ? " ab__wire-label--hitl" : ""}`}
              style={{ left: p.lx, top: p.ly }}
            >
              <b>{p.c.n}</b>
              {p.c.label}
            </span>
          ))}
        </div>
      </div>

      <div className="ab__legend">
        {LEGEND.map((l) => (
          <span key={l.k} className="ab__legend-item">
            <i className={`ab__swatch ab__swatch--${l.k}`} />
            {l.label}
          </span>
        ))}
      </div>

      <DentalArchitectureWalkthrough />
    </div>
  );
}
