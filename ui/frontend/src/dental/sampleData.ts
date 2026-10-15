import type { ToothData, DentalSoapNote, DentalGateStatus, VoiceMessage } from "./dentalTypes";

// Tooth name mapping (Teeth 1-32)
const TOOTH_NAMES: Record<number, string> = {
  1: "Maxillary Right 3rd Molar",
  2: "Maxillary Right 2nd Molar",
  3: "Maxillary Right 1st Molar",
  4: "Maxillary Right 2nd Premolar",
  5: "Maxillary Right 1st Premolar",
  6: "Maxillary Right Canine",
  7: "Maxillary Right Lateral Incisor",
  8: "Maxillary Right Central Incisor",
  9: "Maxillary Left Central Incisor",
  10: "Maxillary Left Lateral Incisor",
  11: "Maxillary Left Canine",
  12: "Maxillary Left 1st Premolar",
  13: "Maxillary Left 2nd Premolar",
  14: "Maxillary Left 1st Molar",
  15: "Maxillary Left 2nd Molar",
  16: "Maxillary Left 3rd Molar",
  17: "Mandibular Left 3rd Molar",
  18: "Mandibular Left 2nd Molar",
  19: "Mandibular Left 1st Molar",
  20: "Mandibular Left 2nd Premolar",
  21: "Mandibular Left 1st Premolar",
  22: "Mandibular Left Canine",
  23: "Mandibular Left Lateral Incisor",
  24: "Mandibular Left Central Incisor",
  25: "Mandibular Right Central Incisor",
  26: "Mandibular Right Lateral Incisor",
  27: "Mandibular Right Canine",
  28: "Mandibular Right 1st Premolar",
  29: "Mandibular Right 2nd Premolar",
  30: "Mandibular Right 1st Molar",
  31: "Mandibular Right 2nd Molar",
  32: "Mandibular Right 3rd Molar",
};

export function createDefaultDentalArch(): Record<number, ToothData> {
  const teeth: Record<number, ToothData> = {};

  for (let i = 1; i <= 32; i++) {
    const isUpper = i <= 16;
    let quadrant: 1 | 2 | 3 | 4 = 1;
    if (i <= 8) quadrant = 1;
    else if (i <= 16) quadrant = 2;
    else if (i <= 24) quadrant = 3;
    else quadrant = 4;

    teeth[i] = {
      tooth_number: i,
      fdi_number: isUpper ? (quadrant === 1 ? 10 + (9 - i) : 20 + (i - 8)) : (quadrant === 3 ? 30 + (25 - i) : 40 + (i - 24)),
      name: TOOTH_NAMES[i] || `Tooth ${i}`,
      arch: isUpper ? "maxillary" : "mandibular",
      quadrant,
      status: "sound",
      surfaces: {
        M: { surface: "M", status: "sound" },
        O: { surface: "O", status: "sound" },
        D: { surface: "D", status: "sound" },
        B: { surface: "B", status: "sound" },
        L: { surface: "L", status: "sound" },
      },
      perio: {
        distobuccal: 2,
        midbuccal: 2,
        mesiobuccal: 3,
        distolingual: 3,
        midlingual: 2,
        mesiolingual: 2,
        bleeding_on_probing: false,
      },
    };
  }

  // Set realistic patient states
  // Tooth 3: Existing amalgam restoration (MOD)
  teeth[3].status = "restored";
  teeth[3].surfaces.M.status = "restored";
  teeth[3].surfaces.O.status = "restored";
  teeth[3].surfaces.D.status = "restored";

  // Tooth 14: Periodontal pocketing (4-5-4 mm) with BOP
  teeth[14].perio = {
    distobuccal: 5,
    midbuccal: 3,
    mesiobuccal: 4,
    distolingual: 4,
    midlingual: 3,
    mesiolingual: 5,
    bleeding_on_probing: true,
  };

  // Tooth 19: ACTIVE INTRAOPERATIVE CASE - Deep carious lesion, pulpal proximity alert
  teeth[19].status = "pulpal_alert";
  teeth[19].surfaces.O.status = "decay";
  teeth[19].surfaces.D.status = "decay";
  teeth[19].surfaces.O.depth_mm = 2.8;
  teeth[19].surfaces.D.depth_mm = 2.4;
  teeth[19].active_anomaly = {
    type: "Critical Pulpal Proximity",
    description: "Axial excavation within 0.38 mm of distal pulp horn during carbide bur #4 prep.",
    severity: "critical",
    distance_to_pulp_mm: 0.38,
    consensus_score: 2.1,
    recommended_protocol: "IPC (Indirect Pulp Cap with Calcium Silicate/MTA) - ADA CDT D3120",
  };

  // Tooth 30: Occlusal composite restoration
  teeth[30].status = "restored";
  teeth[30].surfaces.O.status = "restored";

  return teeth;
}

export const INITIAL_GATE_STATUS: DentalGateStatus = {
  passed: true,
  gate_reason: "All 10 deterministic structural checks passed. Awaiting human dentist EHR sign-off.",
  requires_dentist_signoff: true,
  dentist_approved: false,
  checks: [
    {
      id: "check_alert_node",
      label: "1. Alert Node Anchored",
      description: "Anomaly node exists in living dental graph",
      passed: true,
      detail: "anomaly:19:pulpal_proximity:0.38mm",
    },
    {
      id: "check_protocol_bounded",
      label: "2. Bounded Protocol Resolution",
      description: "Selected protocol belongs to evidence-based library",
      passed: true,
      detail: "IPC / D3120 (Indirect Pulp Cap)",
    },
    {
      id: "check_lit_grounding",
      label: "3. Dental Literature Grounding",
      description: "Peer-reviewed journal reference with DOI/PMID",
      passed: true,
      citation: "Schwendicke et al., JADA 2016; 147(5):340-349 (PMID: 26970716)",
      detail: "Indirect pulp capping preserves pulp vitality in 93% of deep lesions vs direct exposure",
    },
    {
      id: "check_confidence_floor",
      label: "4. Multi-Role Confidence Floor",
      description: "Consensus agreement >= 1.70",
      passed: true,
      detail: "Consensus score 2.10 (Depth: 1.30, Margin: 1.00, Procedural: 0.80)",
    },
    {
      id: "check_tooth_resolved",
      label: "5. Tooth & Surface Identifier",
      description: "Universal tooth number 1-32 with valid surface code",
      passed: true,
      detail: "Tooth #19 (Mandibular Left 1st Molar) - Surfaces: O, D",
    },
    {
      id: "check_causal_edges",
      label: "6. Living Graph Causal Chain",
      description: "detection -> complication -> corrective protocol intact",
      passed: true,
      detail: "Edge sequence: perception:bur -> anomaly:19 -> protocol:IPC",
    },
    {
      id: "check_radiographic_anchor",
      label: "7. Radiographic Bitewing Anchor",
      description: "Bitewing image anchored with verified lesion coordinates",
      passed: true,
      detail: "Bitewing BW-L-19-2026 radiolucency extends into inner 1/3 of dentin",
    },
    {
      id: "check_model_armor",
      label: "8. Model Armor Safety Filter",
      description: "Zero adversarial prompts or unvetted hallucination text",
      passed: true,
      detail: "Clean payload, standard clinical terminology confirmed",
    },
    {
      id: "check_dismissal_status",
      label: "9. Advisory & Dismissal Check",
      description: "Proposal is not dismissed or overridden by chairside surgeon",
      passed: true,
      detail: "Active, non-dismissed intraoperative intervention",
    },
    {
      id: "check_dentist_signoff",
      label: "10. Human Dentist EHR Sign-Off",
      description: "Mandatory human-in-the-loop consent before external FHIR write",
      passed: false,
      detail: "Pending dentist chairside voice or click authorization",
    },
  ],
};

export const INITIAL_SOAP_NOTE: DentalSoapNote = {
  patient_id: "PT-DENT-88412",
  tooth_number: 19,
  subjective: "Patient reports mild sensitivity to cold liquids on lower left quadrant for the past 2 weeks. Denies spontaneous or lingering throbbing pain.",
  objective: "Clinical exam reveals deep disto-occlusal carious lesion on Tooth #19 with soft leathery dentin. Radiograph confirms radiolucency extending into inner third of dentin, 0.38 mm from pulp chamber. Normal response to cold test, non-tender to percussion, normal palpation. Probing depths within normal limits (2-3 mm).",
  assessment: "Deep Caries (K02.62) with Reversible Pulpitis (K04.01) on Tooth #19. High risk for pulpal exposure during aggressive rotary excavation.",
  plan: "Under local anesthesia (2% lidocaine with 1:100k epi, 1.7ml IANB), rubber dam isolation achieved. Caries excavated using low-speed round bur #4 leaving thin layer of affected dentin over pulp horn. TheraCal LC (calcium silicate) applied as indirect pulp cap. Selective etch, universal bonding agent, and light-cured composite resin restoration (DO) placed and polished. Occlusion verified.",
  cdt_codes: [
    { code: "D2392", description: "Resin-based composite - two surfaces, posterior (DO)", fee_estimate_usd: 285 },
    { code: "D3120", description: "Pulp cap - indirect (excluding final restoration)", fee_estimate_usd: 110 },
    { code: "D0220", description: "Intraoral - periapical first radiographic image", fee_estimate_usd: 42 },
  ],
  status: "draft",
};

export const INITIAL_VOICE_MESSAGES: VoiceMessage[] = [
  {
    id: "msg-1",
    sender: "dentist",
    text: "Gentes, prepare case context for tooth nineteen DO prep.",
    timestamp: "18:42:10",
  },
  {
    id: "msg-2",
    sender: "gentesbot",
    text: "Tooth #19 selected. Periapical radiograph shows deep carious radiolucency within 0.4mm of the distal pulp horn. Bounded IPC protocol loaded.",
    timestamp: "18:42:13",
    intent: "safety_alert",
  },
  {
    id: "msg-3",
    sender: "dentist",
    text: "Dictate perio depths for tooth fourteen: four three five, bleeding on mesial.",
    timestamp: "18:43:02",
  },
  {
    id: "msg-4",
    sender: "gentesbot",
    text: "Recorded Tooth #14 perio: DB 4mm, MB 3mm, ML 5mm with BOP confirmed. Chart updated hands-free.",
    timestamp: "18:43:05",
    intent: "perio_entry",
  },
  {
    id: "msg-5",
    sender: "gentesbot",
    text: "WARNING: Intraoral camera tracks rotary bur at 0.38mm to pulp horn on tooth 19. Recommend switching to spoon excavator and preparing Indirect Pulp Cap (D3120). Verification gate is engaged.",
    timestamp: "18:44:18",
    intent: "safety_alert",
  },
];
