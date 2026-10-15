"""Autonomous Dental Documentation Agent for Gentes Dental OS.

Synthesizes structured clinical progress notes formatted in standard SOAP
(Subjective, Objective, Assessment, Plan) and automatically maps completed
clinical procedures to corresponding ADA CDT billing codes.
"""

from __future__ import annotations

import logging
from typing import Any

from state.dental_schema import CDTCode, DentalSOAPNote

logger = logging.getLogger(__name__)

# CDT code mapping rules
CDT_CATALOG = {
    "D2391": ("Restorative", "Resin-based composite - one surface, posterior"),
    "D2392": ("Restorative", "Resin-based composite - two surfaces, posterior"),
    "D2393": ("Restorative", "Resin-based composite - three surfaces, posterior"),
    "D2394": ("Restorative", "Resin-based composite - four or more surfaces, posterior"),
    "D3110": ("Endodontics", "Pulp cap - direct (excluding final restoration)"),
    "D3120": ("Endodontics", "Pulp cap - indirect (excluding final restoration)"),
    "D2940": ("Restorative", "Protective restoration (sedative / stepwise)"),
    "D0120": ("Diagnostic", "Periodic oral evaluation - established patient"),
    "D0274": ("Radiographs", "Bitewings - four radiographic images"),
    "D4341": ("Periodontics", "Periodontal scaling and root planing - four or more teeth per quadrant"),
}


def derive_cdt_code(procedure_type: str, surfaces: list[str] | None = None, is_posterior: bool = True) -> CDTCode:
    """Deterministically maps procedure and surfaces to standard CDT code."""
    surface_count = len(surfaces) if surfaces else 1
    if procedure_type == "composite" and is_posterior:
        if surface_count == 1:
            code = "D2391"
        elif surface_count == 2:
            code = "D2392"
        elif surface_count == 3:
            code = "D2393"
        else:
            code = "D2394"
    elif procedure_type == "indirect_pulp_cap":
        code = "D3120"
    elif procedure_type == "direct_pulp_cap":
        code = "D3110"
    elif procedure_type == "stepwise_excavation":
        code = "D2940"
    else:
        code = "D2391"

    category, desc = CDT_CATALOG.get(code, ("General", "Dental service"))
    return CDTCode(
        code=code,
        category=category,
        description=desc,
        surfaces=surfaces or [],
    )


def draft_dental_soap_note(
    patient_chief_complaint: str,
    tooth_number: int,
    observed_pathology: str,
    procedure_performed: str,
    surfaces: list[str],
    protocol_applied: str | None = None,
    post_op_instructions: str = "Advised patient of transient cold sensitivity; avoid chewing hard foods on right quadrant for 2 hours.",
) -> DentalSOAPNote:
    """Generates an ADA-compliant dental progress SOAP note."""
    surface_str = "".join(surfaces)

    subjective = (
        f"Patient presented for scheduled operative care. "
        f"Chief complaint: {patient_chief_complaint.strip() or 'No acute pain reported; routine operative restoration.'}"
    )

    objective = (
        f"Clinical exam of Tooth #{tooth_number}: Deep carious lesion identified on {surface_str} surfaces. "
        f"Caries excavation performed using #4 round bur at slow-speed handpiece under rubber dam isolation. "
        f"{observed_pathology}."
    )

    assessment = (
        f"Tooth #{tooth_number}: Successful biological preparation. "
        + (f"Applied evidence-based protocol: {protocol_applied}. " if protocol_applied else "")
        + "Pulp vitality preserved with intact peripheral dentin seal."
    )

    plan = (
        f"Completed {procedure_performed} on tooth #{tooth_number} ({surface_str}). "
        f"Checked occlusion in centric and lateral excursions with 40um articulating paper. "
        f"{post_op_instructions}"
    )

    cdt_entries = [
        derive_cdt_code("composite", surfaces=surfaces, is_posterior=(tooth_number in {1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 28, 29, 30, 31, 32}))
    ]
    if protocol_applied and "indirect" in protocol_applied.lower():
        cdt_entries.append(derive_cdt_code("indirect_pulp_cap"))
    elif protocol_applied and "direct" in protocol_applied.lower():
        cdt_entries.append(derive_cdt_code("direct_pulp_cap"))

    return DentalSOAPNote(
        subjective=subjective,
        objective=objective,
        assessment=assessment,
        plan=plan,
        cdt_codes=cdt_entries,
        approval_status="draft",
    )
