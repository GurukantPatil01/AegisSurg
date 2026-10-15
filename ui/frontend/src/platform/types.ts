export interface PatientReport {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  procedureName: string;
  targetAnatomy: string; // e.g. "Tooth #19 [Mandibular 1st Molar]" or "Prostate & DVC"
  specialty: "dental" | "surgical";
  chiefComplaint: string;
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
  vitals: {
    bloodPressure: string;
    heartRate: number;
    spo2: number;
    tempC: number;
  };
  imagingFindings: string;
  clinicalNotes: string;
  updatedAt: string;
}

export interface AgentObservation {
  id: string;
  timestamp: string;
  phase: string;
  category: "observation" | "warning" | "interception" | "verification" | "qna";
  title: string;
  description: string;
  confidence: number;
  suggestedAction?: string;
  acknowledged?: boolean;
}

export interface OperativeRecord {
  id: string;
  patientId: string;
  surgeonName: string;
  procedureDate: string;
  preOpDiagnosis: string;
  postOpDiagnosis: string;
  procedureDescription: string;
  complicationsEncountered: string;
  estimatedBloodLoss: string;
  verificationGateAudit: {
    passed: boolean;
    hash: string;
    stampedAt: string;
  };
  billingCodes: Array<{ code: string; label: string }>;
  doctorSignature?: string;
}
