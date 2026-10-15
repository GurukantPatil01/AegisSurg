"""GentesBot — Chairside Voice Debrief & Hands-Free Dental Co-Pilot.

Enables clinicians to dictate periodontal measurements, review tooth
preparations, query bounded evidence-based protocols, and sign off on
clinical SOAP notes hands-free without breaking sterile asepsis.
"""

from __future__ import annotations

import logging
import re
from typing import Any

from agents.dental_documentation.agent import draft_dental_soap_note
from state.dental_schema import DentalSOAPNote
from tools.dental_library import get_protocol, list_protocols

logger = logging.getLogger(__name__)


class GentesBotSession:
    """Manages an interactive hands-free chairside dental session."""

    def __init__(self, session_id: str, case_id: str):
        self.session_id = session_id
        self.case_id = case_id
        self.perio_measurements: dict[int, dict[str, Any]] = {}
        self.active_tooth: int | None = None
        self.active_surfaces: list[str] = []
        self.active_protocol: str | None = None

    def process_voice_turn(self, speech_text: str) -> dict[str, Any]:
        """Parses speech input and routes to appropriate dental command handler."""
        text = speech_text.strip()
        lower = text.lower()

        # 1. Periodontal probing dictation: e.g. "Tooth 14 3 2 3 bleeding on mesial"
        perio_match = re.search(r"tooth\s*#?(\d+)\s*[:,\s]\s*(\d)\s*(\d)\s*(\d)", lower)
        if perio_match:
            tooth_num = int(perio_match.group(1))
            depths = [int(perio_match.group(2)), int(perio_match.group(3)), int(perio_match.group(4))]
            has_bop = "bleeding" in lower or "bop" in lower
            self.perio_measurements[tooth_num] = {
                "depths": depths,
                "bleeding_on_probing": has_bop,
                "max_depth": max(depths),
            }
            return {
                "intent": "periodontal_record",
                "tooth_number": tooth_num,
                "probing_depths": depths,
                "bleeding": has_bop,
                "reply": f"Recorded Tooth #{tooth_num}: depths {depths[0]}-{depths[1]}-{depths[2]}mm, bleeding on probing {'noted' if has_bop else 'negative'}.",
            }

        # 2. Protocol guidance query: e.g. "Protocol for deep pulp proximity"
        if "protocol" in lower or "pulp cap" in lower or "excavation" in lower:
            if "direct" in lower:
                proto = get_protocol("DPC")
            elif "indirect" in lower or "proximity" in lower:
                proto = get_protocol("IPC")
            elif "stepwise" in lower:
                proto = get_protocol("SWE")
            elif "margin" in lower:
                proto = get_protocol("DME")
            else:
                proto = get_protocol("IPC")

            if proto:
                self.active_protocol = proto.code
                return {
                    "intent": "protocol_recommendation",
                    "protocol_code": proto.code,
                    "protocol_name": proto.name,
                    "reply": f"Recommended: {proto.name}. Indication: {proto.indication}. First step: {proto.steps[0]}.",
                }

        # 3. SOAP note generation: e.g. "Draft note for tooth 19 MO composite"
        note_match = re.search(r"tooth\s*#?(\d+)", lower)
        if "draft" in lower or "note" in lower or "chart" in lower:
            tooth_num = int(note_match.group(1)) if note_match else (self.active_tooth or 19)
            surfaces = ["M", "O"] if "mo" in lower else ["M", "O", "D"] if "mod" in lower else ["O"]
            note = draft_dental_soap_note(
                patient_chief_complaint="Scheduled restorative visit",
                tooth_number=tooth_num,
                observed_pathology="Demineralized dentin with proximity to coronal pulp",
                procedure_performed="Resin-based composite restoration",
                surfaces=surfaces,
                protocol_applied=self.active_protocol or "Indirect Pulp Capping (IPC)",
            )
            return {
                "intent": "soap_note_drafted",
                "tooth_number": tooth_num,
                "soap_note": note.model_dump(),
                "reply": f"Drafted SOAP progress note for Tooth #{tooth_num} ({''.join(surfaces)}). Added CDT codes: {', '.join(c.code for c in note.cdt_codes)}. Awaiting your sign-off.",
            }

        # Default conversational reply
        return {
            "intent": "general_chairside",
            "reply": f"GentesBot standing by. You can dictate perio depths, request clinical protocols, or ask to draft the case note.",
        }
