export type ToothSurface = "M" | "O" | "D" | "B" | "L";

export type ToothStatus =
  | "sound"
  | "caries"
  | "restored"
  | "pulpal_alert"
  | "crown"
  | "missing"
  | "endo";

export interface SurfaceState {
  surface: ToothSurface;
  status: "sound" | "decay" | "restored" | "sealant";
  depth_mm?: number;
}

export interface PerioMeasurements {
  distobuccal: number;
  midbuccal: number;
  mesiobuccal: number;
  distolingual: number;
  midlingual: number;
  mesiolingual: number;
  bleeding_on_probing: boolean;
}

export interface ToothData {
  tooth_number: number; // 1 to 32 (Universal System)
  fdi_number: number;   // 11 to 48 (FDI World Dental Federation notation)
  name: string;
  arch: "maxillary" | "mandibular";
  quadrant: 1 | 2 | 3 | 4;
  status: ToothStatus;
  surfaces: Record<ToothSurface, SurfaceState>;
  perio?: PerioMeasurements;
  active_anomaly?: {
    type: string;
    description: string;
    severity: "low" | "moderate" | "critical";
    distance_to_pulp_mm: number;
    consensus_score: number;
    recommended_protocol: string;
  };
}

export interface VerificationCheck {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  citation?: string;
  detail?: string;
}

export interface DentalGateStatus {
  passed: boolean;
  checks: VerificationCheck[];
  gate_reason: string;
  requires_dentist_signoff: boolean;
  dentist_approved: boolean;
}

export interface DentalSoapNote {
  patient_id: string;
  tooth_number: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  cdt_codes: Array<{
    code: string;
    description: string;
    fee_estimate_usd: number;
  }>;
  status: "draft" | "approved" | "exported_to_fhir";
  signed_by?: string;
  signed_at?: string;
}

export interface VoiceMessage {
  id: string;
  sender: "dentist" | "gentesbot";
  text: string;
  timestamp: string;
  intent?: "perio_entry" | "protocol_query" | "soap_draft" | "safety_alert";
}
