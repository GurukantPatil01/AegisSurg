import type { PatientReport } from "./types";

export const DEFAULT_DENTAL_PATIENT: PatientReport = {
  id: "pt-dent-1049",
  name: "Eleanor Vance",
  mrn: "MRN-789201",
  age: 48,
  gender: "Female",
  procedureName: "Caries Excavation & Indirect Ceramic Inlay/Onlay",
  targetAnatomy: "Tooth #19 [Mandibular Left 1st Molar]",
  specialty: "dental",
  chiefComplaint: "Acute sensitivity to cold liquids and sweet foods in lower left jaw for 3 weeks.",
  medicalHistory: [
    "Mild Essential Hypertension (controlled)",
    "Penicillin allergy (hives)",
    "Mild bruxism (nightguard worn intermittently)"
  ],
  allergies: ["Penicillin", "Latex"],
  medications: ["Lisinopril 10mg daily", "Multivitamins"],
  vitals: {
    bloodPressure: "124/82",
    heartRate: 72,
    spo2: 99,
    tempC: 36.7,
  },
  imagingFindings: "Bitewing BW-L-19 shows radiolucency extending into the middle-to-deep third of dentin (D3 lesion) on disto-occlusal surface. Pulpal roof proximity within 0.6mm. No periapical radiolucency. Periodontal ligament space intact.",
  clinicalNotes: "Patient desires conservative tooth preservation. Electric pulp test positive (vital). Cold test elicits lingering sensitivity of 4 seconds (reversible pulpitis). Advise careful rotary bur speed and pulpal preservation protocols.",
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_SURGICAL_PATIENT: PatientReport = {
  id: "pt-surg-3082",
  name: "John Miller",
  mrn: "MRN-554192",
  age: 66,
  gender: "Male",
  procedureName: "Robot-Assisted Radical Prostatectomy (RARP)",
  targetAnatomy: "Prostate, Dorsal Venous Complex & Neurovascular Bundles",
  specialty: "surgical",
  chiefComplaint: "Biopsy-proven localized adenocarcinoma of the prostate, PSA 6.8 ng/mL.",
  medicalHistory: [
    "Prior Transurethral Resection of Prostate (TURP) 4 years ago (fibrotic anterior tissue plane expected)",
    "Coronary Artery Disease with Drug-Eluting Stent 2 years ago",
    "On dual antiplatelet therapy historically; Plavix held 7 days pre-op"
  ],
  allergies: ["Sulfa drugs"],
  medications: ["Aspirin 81mg", "Atorvastatin 20mg", "Metoprolol 25mg"],
  vitals: {
    bloodPressure: "132/78",
    heartRate: 68,
    spo2: 98,
    tempC: 36.9,
  },
  imagingFindings: "Multiparametric MRI demonstrates a 1.4cm PIRADS-5 lesion in the right mid-peripheral zone, abutting the capsule without gross extracapsular extension. Prior TURP cavity visible with anterior apical fibrosis.",
  clinicalNotes: "Plan for bilateral nerve-sparing RARP. Special precaution required at dorsal venous complex ligation due to hypervascular collateralization and altered TURP planes.",
  updatedAt: new Date().toISOString(),
};
