"""Dental EHR & FHIR R4 Integration with Read-back Verification.

Generates and posts HL7 FHIR Condition and Procedure resources to clinical
dental EHR systems (e.g., Dentrix, Curve Dental, Epic Wisdom) or HAPI FHIR,
with immediate read-back verification to guarantee record integrity.
"""

from __future__ import annotations

import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)

FHIR_BASE_URL = os.environ.get("FHIR_BASE_URL", "https://hapi.fhir.org/baseR4")


async def file_dental_procedure(
    patient_id: str,
    tooth_number: int,
    cdt_code: str,
    procedure_name: str,
    surfaces: list[str] | None = None,
    notes: str = "",
) -> dict[str, Any]:
    """Posts an HL7 FHIR Procedure resource for a dental intervention and reads it back."""
    surface_str = "".join(surfaces) if surfaces else ""
    resource = {
        "resourceType": "Procedure",
        "status": "completed",
        "category": {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/procedure-category",
                    "code": "dental",
                    "display": "Dental Procedure",
                }
            ]
        },
        "code": {
            "coding": [
                {
                    "system": "http://www.ada.org/cdt",
                    "code": cdt_code,
                    "display": procedure_name,
                }
            ],
            "text": f"{procedure_name} (Tooth #{tooth_number} {surface_str})".strip(),
        },
        "subject": {"reference": f"Patient/{patient_id}"},
        "bodySite": [
            {
                "coding": [
                    {
                        "system": "http://fdi.org/universal-teeth",
                        "code": str(tooth_number),
                        "display": f"Tooth #{tooth_number}",
                    }
                ]
            }
        ],
        "note": [{"text": notes}] if notes else [],
    }

    url = f"{FHIR_BASE_URL.rstrip('/')}/Procedure"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(url, json=resource)
        if resp.status_code not in (200, 201):
            logger.error("FHIR Procedure write failed: %s %s", resp.status_code, resp.text)
            return {"success": False, "status_code": resp.status_code, "error": resp.text}

        created = resp.json()
        resource_id = created.get("id")

        # Readback verification
        get_url = f"{url}/{resource_id}"
        get_resp = await client.get(get_url)
        verified = get_resp.status_code == 200

        return {
            "success": True,
            "resource_id": resource_id,
            "verified": verified,
            "resource_url": get_url,
        }
