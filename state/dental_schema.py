"""The Gentes Living Dental State schema.

Single source of truth for every shape that crosses an agent boundary in the
Gentes Dental OS. Agents never carry case state in their prompt context — they
read and write through the state service, which persists and streams these models.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


class DentalProvenanced(BaseModel):
    source_agent: str
    source_tool: str
    timestamp: datetime = Field(default_factory=_now)


# ---------------------------------------------------------------------------
# Dental Vocabulary & Node Types
# ---------------------------------------------------------------------------

DentalNodeType = Literal[
    # Structural & Patient Context
    "dental_case",  # case open event and baseline encounter
    "patient_twin",  # patient oral health profile & systemic risks (e.g. diabetes, anticoagulants)
    "agent",  # agent:{name} — an ADK agent in the Gentes topology
    # Anatomical & Clinical Entities
    "tooth",  # tooth:{number} (Universal 1-32 or FDI 11-48)
    "tooth_surface",  # surface:{tooth}:{mesial|distal|occlusal|facial|lingual}
    "periodontal_pocket",  # perio:{tooth}:{site} probing depth & bleeding on probing
    "radiograph",  # bitewing, periapical, or CBCT image anchor
    # Observations & Perception
    "dental_observation",  # observed visual entity or prep phase
    "caries_lesion",  # identified carious lesion with depth classification
    # Reasoning Chain
    "dental_anomaly",  # procedural error: pulpal proximity, margin violation, adjacent abrasion
    "dental_complication",  # predicted complication: irreversible pulpitis, sinus perforation
    "literature_evidence",  # supporting evidence from JADA, JOE, PubMed
    "corrective_protocol",  # selected protocol from bounded ADA library
    "trajectory_divergence",  # divergence between actual preparation and ideal prep margin
    # Safety & Action Gating
    "action_intent",  # pending write to dental EHR or alert
    "verification_block",  # fail-closed gate outcome node
    "model_armor_screen",  # content screening verification
    "action_outcome",  # final write receipt to EHR / FHIR
    # Documentation & Debriefing
    "soap_note",  # drafted Subjective, Objective, Assessment, Plan note
    "cdt_billing_entry",  # auto-generated CDT procedural billing codes
    "gentesbot_review",  # signed-off debrief review document
]

DentalEdgeKind = Literal[
    "anatomical_relation",  # tooth -> surface, tooth -> perio_pocket
    "radiographic_evidence",  # radiograph -> tooth or lesion
    "detection",  # observation -> dental_anomaly
    "causal_reasoning",  # anomaly -> dental_complication
    "evidence",  # literature_evidence -> complication or protocol
    "treatment_recommendation",  # complication -> corrective_protocol
    "trajectory_comparison",  # observed prep -> ideal corrective protocol
    "verification",  # action_intent -> verification_block
    "outcome",  # action_intent -> action_outcome
    "documentation_link",  # tooth/protocol -> soap_note
    "hierarchy",  # parent agent -> child agent
]

ToothSurface = Literal["M", "O", "D", "F", "L", "B", "I"]  # Mesial, Occlusal, Distal, Facial, Lingual, Buccal, Incisal
ToothNumber = int  # 1 to 32 (Universal System)


class DentalGraphNodePatch(DentalProvenanced):
    node_id: str
    node_type: DentalNodeType
    label: str
    attrs: dict[str, Any] = Field(default_factory=dict)


class DentalGraphEdgePatch(DentalProvenanced):
    edge_id: str
    source_node_id: str
    target_node_id: str
    edge_kind: DentalEdgeKind
    reason: str = ""
    attrs: dict[str, Any] = Field(default_factory=dict)


class DentalDiffEvent(BaseModel):
    case_id: str
    seq: int = 0
    node: DentalGraphNodePatch | None = None
    edge: DentalGraphEdgePatch | None = None
    timestamp: datetime = Field(default_factory=_now)


class CDTCode(BaseModel):
    code: str  # e.g., "D2392"
    category: str  # e.g., "Restorative"
    description: str  # e.g., "Resin-based composite - two surfaces, posterior"
    tooth_number: int | None = None
    surfaces: list[str] = Field(default_factory=list)


class DentalSOAPNote(BaseModel):
    subjective: str
    objective: str
    assessment: str
    plan: str
    cdt_codes: list[CDTCode] = Field(default_factory=list)
    approval_status: Literal["draft", "approved", "rejected", "filed"] = "draft"
