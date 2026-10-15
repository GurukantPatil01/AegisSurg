// Gentes Dental OS — system architecture, drawn to Google Cloud reference-architecture conventions.

export type NodeKind =
  | "external" // outside Google Cloud
  | "user" // a person
  | "compute" // Cloud Run / Agent Runtime
  | "model" // Vertex AI model endpoint
  | "data" // Firestore / GCS / Memory Bank
  | "governance" // Model Armor, IAM, Registry, Identity
  | "ops"; // Trace / Logging / Monitoring

export interface ArchNode {
  id: string;
  label: string;
  role?: string;
  detail?: string[];
  logo?: string;
  mono?: string;
  kind: NodeKind;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ArchBox {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tint: string;
  border: string;
  dashed?: boolean;
  boundary?: boolean;
}

export type Side = "t" | "b" | "l" | "r";

export interface ArchEdge {
  from: string;
  fromSide: Side;
  to: string;
  toSide: Side;
  step?: number;
  label?: string;
  async?: boolean;
  accent?: boolean;
  bend?: { x?: number; y?: number };
}

export const KIND_COLOR: Record<NodeKind, string> = {
  external: "#64748b",
  user: "#c98500",
  compute: "#2a78d6",
  model: "#0b3a63",
  data: "#7c3aed",
  governance: "#d5578a",
  ops: "#1a8f1a",
};

export const KIND_LABEL: Record<NodeKind, string> = {
  user: "User",
  external: "External system — outside Google Cloud",
  compute: "Compute — Cloud Run / Agent Runtime",
  model: "Model endpoint — Vertex AI",
  data: "State & storage",
  governance: "Governance & security",
  ops: "Observability & delivery",
};

export const LEGEND_KINDS: NodeKind[] = ["user", "external", "compute", "model", "data", "governance", "ops"];

export const CANVAS = { w: 1920, h: 1210 };

// --- Containers -----------------------------------------------------------

export const DENTAL_BOXES: ArchBox[] = [
  {
    id: "gcp",
    label: "Google Cloud · liveapi-488810 · us-central1",
    x: 312,
    y: 96,
    w: 1310,
    h: 1050,
    tint: "#f7fafd",
    border: "#94a3b8",
    boundary: true,
  },
  {
    id: "dentalgraph",
    label: "GentesGraph subsystem — autonomous dental safety pipeline",
    sub: "Monitors bur speed & pulpal proximity; enforces cryptographic verification before restoration seal",
    x: 338,
    y: 286,
    w: 606,
    h: 322,
    tint: "#eef4fc",
    border: "#b9d3f0",
  },
  {
    id: "gentesbot",
    label: "GentesBot subsystem — chairside voice copilot",
    sub: "Dentist logs perio probing hands-free & reviews restorations; approved feedback becomes practice memory",
    x: 976,
    y: 286,
    w: 620,
    h: 322,
    tint: "#eef7f1",
    border: "#a7d7bd",
  },
  {
    id: "shared",
    label: "Shared services",
    sub: "Both subsystems read and write through the same state, models and guardrails",
    x: 338,
    y: 664,
    w: 1258,
    h: 336,
    tint: "#f8f6fd",
    border: "#d3c2f5",
  },
];

// --- Nodes ----------------------------------------------------------------

const N = (n: ArchNode) => n;

export const DENTAL_NODES: ArchNode[] = [
  // ---- Outside Google Cloud, left (GentesGraph's world) -----------------
  N({ id: "dataset", label: "Oral32-Dataset & RVG", role: "4K intraoral video + bitewings", mono: "▶", kind: "external", x: 40, y: 150, w: 234, h: 78 }),
  N({ id: "fhir", label: "Dentrix / Eaglesoft FHIR", role: "external Dental EHR · CDT billing + SOAP", logo: "fhir.png", mono: "FHIR", kind: "external", x: 40, y: 386, w: 234, h: 82 }),
  N({ id: "litapis", label: "JADA · JOE · ITI Consensus", role: "3 dental literature RAG APIs", logo: "europepmc.png", mono: "JADA", kind: "external", x: 40, y: 520, w: 234, h: 78 }),
  N({ id: "github", label: "GitHub", role: "push to main triggers deploy", logo: "github.png", mono: "GH", kind: "external", x: 40, y: 1030, w: 234, h: 78 }),

  // ---- Outside Google Cloud, right (GentesBot's world) ------------------
  N({ id: "dentist", label: "Dentist / Chairside Team", role: "voice perio charting & gate sign-off", mono: "☺", kind: "user", x: 1660, y: 386, w: 226, h: 82 }),

  // ---- Ingestion + presentation ---------------------------------------
  N({ id: "gcs", label: "Cloud Storage", role: "intraoral video · bitewings · 3D STL scans", logo: "cloudstorage.png", mono: "GCS", kind: "data", x: 338, y: 150, w: 400, h: 82 }),
  N({ id: "frontend", label: "Cloud Run — frontend", role: "React 32-tooth odontogram + GentesBot · SSE", logo: "cloudrun.png", kind: "compute", x: 796, y: 150, w: 400, h: 82 }),

  // ---- GentesGraph subsystem --------------------------------------------
  N({
    id: "orchestrator",
    label: "Cloud Run — dental orchestrator",
    role: "12 in-process ADK components on an event bus",
    detail: ["Anatomy Mapper · Bur Tracker · Pulpal Proximity ×3", "Restorative Margins · ADA CDT Coder", "Verification Gate · Indirect Pulp Capping"],
    logo: "cloudrun.png",
    kind: "compute",
    x: 362,
    y: 350,
    w: 558,
    h: 142,
  }),
  N({ id: "stateservice", label: "Cloud Run — dental state service", role: "single writer of 32-Tooth Living State Graph", logo: "cloudrun.png", kind: "compute", x: 548, y: 522, w: 372, h: 70 }),

  // ---- GentesBot subsystem ----------------------------------------------
  N({ id: "relay", label: "Cloud Run — GentesBot relay", role: "WebSocket · screens chairside voice before model sees it", logo: "cloudrun.png", kind: "compute", x: 1000, y: 350, w: 572, h: 80 }),
  N({
    id: "agentruntime",
    label: "Agent Runtime (GEAP)",
    role: "5 separately deployed dental reasoning engines",
    detail: ["Root Assistant · Voice Perio Probing · Pulpal Risk", "Restorative Margin Inspector · ADA CDT Derived Billing", "4 hold SPIFFE Agent Identity"],
    logo: "agentengine.png",
    mono: "AR",
    kind: "compute",
    x: 1000,
    y: 452,
    w: 572,
    h: 136,
  }),

  // ---- Shared services -------------------------------------------------
  N({ id: "vertex", label: "Vertex AI — Gemini 3.5 Flash", role: "multimodal tooth vision, caries bur tracking & SOAP notes", logo: "gemin.png", kind: "model", x: 362, y: 722, w: 386, h: 82 }),
  N({ id: "speech", label: "Vertex AI + Cloud TTS", role: "MedASR (Dental) in · Chirp 3 HD out", logo: "vertexai.png", kind: "model", x: 362, y: 820, w: 386, h: 76 }),

  N({ id: "firestore", label: "Firestore", role: "Dental State Graph · 32 teeth nodes, pulp proximity edges", logo: "firestore.png", kind: "data", x: 790, y: 722, w: 396, h: 82 }),
  N({ id: "memorybank", label: "Memory Bank (GEAP)", role: "approved dentist feedback, retrieved by similarity", logo: "memorybank.png", mono: "MB", kind: "data", x: 790, y: 820, w: 396, h: 82 }),

  N({ id: "armor", label: "Model Armor", role: "one template, screens input and output", logo: "modelarmor.png", kind: "governance", x: 1228, y: 722, w: 344, h: 82 }),
  N({ id: "iam", label: "IAM", role: "3 least-privilege service accounts", logo: "iam.png", mono: "IAM", kind: "governance", x: 1228, y: 820, w: 344, h: 82 }),
  N({ id: "registry", label: "Agent Registry + Identity", role: "6 registered dental services · SPIFFE certs", logo: "agentregistry.png", mono: "AR", kind: "governance", x: 1228, y: 906, w: 344, h: 76 }),

  // ---- Ops + CI/CD -----------------------------------------------------
  N({ id: "ops", label: "Cloud Trace · Logging · Monitoring", role: "OpenTelemetry GenAI spans across every service", logo: "cloudtrace.png", mono: "OPS", kind: "ops", x: 338, y: 1030, w: 596, h: 78 }),
  N({ id: "cicd", label: "Cloud Build → Artifact Registry", role: "10-step pipeline · deploys all dental services", logo: "cloudbuild.png", kind: "ops", x: 976, y: 1030, w: 620, h: 78 }),
];

// --- Edges ----------------------------------------------------------------

export const DENTAL_EDGES: ArchEdge[] = [
  { from: "dataset", fromSide: "r", to: "gcs", toSide: "l", step: 1, label: "intraoral video + bitewings", async: true },
  { from: "frontend", fromSide: "b", to: "orchestrator", toSide: "t", step: 2, label: "POST /cases/open", bend: { y: 262 } },
  { from: "orchestrator", fromSide: "l", to: "vertex", toSide: "t", step: 3, label: "tooth vision + bur tracking", bend: { y: 638 } },
  { from: "orchestrator", fromSide: "b", to: "stateservice", toSide: "t", step: 4, label: "32-tooth graph patches" },
  { from: "stateservice", fromSide: "b", to: "firestore", toSide: "t", step: 5, label: "transactional write", bend: { y: 638 } },
  { from: "orchestrator", fromSide: "l", to: "litapis", toSide: "r", step: 6, label: "JADA / JOE guidelines", bend: { x: 300 } },
  { from: "orchestrator", to: "fhir", fromSide: "l", toSide: "r", step: 7, label: "verified CDT codes + SOAP", bend: { x: 322 } },
  { from: "dentist", fromSide: "l", to: "relay", toSide: "r", step: 8, label: "voice perio charting" },
  { from: "relay", fromSide: "b", to: "agentruntime", toSide: "t", step: 9, label: "async_stream_query" },
  { from: "agentruntime", fromSide: "b", to: "memorybank", toSide: "t", step: 10, label: "on approval only", bend: { y: 638 } },
  { from: "memorybank", fromSide: "b", to: "vertex", toSide: "b", step: 11, label: "informs future preps", accent: true, bend: { y: 1008 } },
  { from: "github", fromSide: "r", to: "cicd", toSide: "l", label: "push to main", async: true, bend: { y: 1069 } },
];
