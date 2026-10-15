"""Bounded clinical protocol library for Gentes Dental OS.

Contains evidence-based, peer-reviewed clinical restorative protocols
(derived from ADA, AAP, and AAE guidelines). Agents are strictly restricted
to choosing from this bounded vocabulary rather than inventing novel clinical
actions.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class DentalProtocol:
    code: str
    name: str
    indication: str
    steps: list[str]
    contraindications: list[str]
    citations: list[str]
    cdt_code: str


DENTAL_PROTOCOLS: dict[str, DentalProtocol] = {
    "IPC": DentalProtocol(
        code="IPC",
        name="Indirect Pulp Capping (Biomimetic Calcium Silicate)",
        indication="Deep carious lesion approaching within 0.5mm of vital pulp without irreversible symptoms",
        steps=[
            "Halt aggressive rotary excavation adjacent to pulp horn",
            "Disinfect cavity with 2% chlorhexidine digluconate",
            "Apply bioactive calcium silicate / hydraulic MTA liner to deep dentin barrier",
            "Place resin-modified glass ionomer (RMGI) base over liner",
            "Perform immediate bonded composite seal",
        ],
        contraindications=["Spontaneous lingering nocturnal pain", "Periapical radiolucency", "Non-vital pulp"],
        citations=[
            "Schwendicke et al. J Dent Res 2016; 95(1):15-24",
            "Bjorndal et al. J Endod 2017; 43(6):863-870",
        ],
        cdt_code="D3120",
    ),
    "DPC": DentalProtocol(
        code="DPC",
        name="Direct Pulp Capping (Hydraulic Bioceramic / MTA)",
        indication="Mechanical pinpoint exposure (<1mm) in asymptomatic vital tooth with controlled hemorrhage",
        steps=[
            "Achieve immediate hemostasis using 2.5% NaOCl soaked sterile cotton pellet (1-2 min)",
            "Apply pure mineral trioxide aggregate (MTA) or calcium silicate directly over exposure site",
            "Layer with light-cure resin-modified glass ionomer liner",
            "Place definitive adhesive restoration with tight coronal seal",
            "Schedule 6-week and 6-month pulp vitality recall",
        ],
        contraindications=["Purulent exudate", "Uncontrolled bleeding (>5 min)", "Necrotic pulp"],
        citations=[
            "AAE Position Statement on Vital Pulp Therapy 2021",
            "Hilton TJ. J Dent Res 2009; 88(4):302-309",
        ],
        cdt_code="D3110",
    ),
    "SWE": DentalProtocol(
        code="SWE",
        name="Stepwise Caries Excavation (Two-Stage Selective Removal)",
        indication="Extremely deep caries where complete one-visit excavation carries >80% exposure risk",
        steps=[
            "Remove peripheral caries to sound enamel and superficial dentin margins",
            "Leave affected leathery demineralized dentin directly over the pulp wall",
            "Seal with high-strength glass ionomer cement temporary restoration for 6-12 months",
            "Re-entry after tertiary dentin formation to confirm hardness and definitive restore",
        ],
        contraindications=["Teeth with irreversible pulpitis", "Apical periodontitis"],
        citations=["Bjorndal et al. Eur J Oral Sci 2010; 118(3):290-297"],
        cdt_code="D2940",
    ),
    "DME": DentalProtocol(
        code="DME",
        name="Deep Margin Elevation (Subgingival Margin Relocation)",
        indication="Subgingival proximal margins located up to 1-2mm coronal to the alveolar bone crest",
        steps=[
            "Isolate interproximal area with curved matrix band and Teflon tape",
            "Carefully bevel enamel margin and etch with 37% phosphoric acid",
            "Apply universal adhesive with selective dentin etching",
            "Relocate margin supragingivally using incrementally placed micro-hybrid composite",
            "Verify marginal seal and biological width preservation via bite-wing radiograph",
        ],
        contraindications=["Violation of biological width / alveolar crest infringement", "Inability to isolate"],
        citations=["Magne & Spreafico. J Esthet Restor Dent 2012; 24(2):73-82"],
        cdt_code="D2392",
    ),
    "ENDO_REF": DentalProtocol(
        code="ENDO_REF",
        name="Endodontic Debridement / Specialist Referral",
        indication="Symptomatic irreversible pulpitis or Frank pulpal necrosis following deep invasion",
        steps=[
            "Administer profound local anesthesia (supplement with intraligamentary / intraosseous)",
            "Perform complete coronal deroofing and pulpal chamber extirpation",
            "Place intracanal calcium hydroxide medication and sterile cotton pellet",
            "Provide leak-proof provisional seal with Cavit / IRM",
            "Initiate specialist endodontic referral or schedule definitive root canal therapy",
        ],
        contraindications=["Non-restorable tooth structure"],
        citations=["AAE Guide to Clinical Endodontics 6th Edition"],
        cdt_code="D3220",
    ),
}


def get_protocol(code: str) -> DentalProtocol | None:
    return DENTAL_PROTOCOLS.get(code.upper())


def list_protocols() -> list[dict[str, Any]]:
    return [
        {
            "code": p.code,
            "name": p.name,
            "indication": p.indication,
            "cdt_code": p.cdt_code,
            "citations": p.citations,
        }
        for p in DENTAL_PROTOCOLS.values()
    ]
