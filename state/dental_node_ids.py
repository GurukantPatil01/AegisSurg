"""Deterministic, collision-free node and edge ID generation for Gentes Dental OS.

Ensures that every agent references anatomical structures, anomalies, and
protocols by standardized IDs rather than arbitrary strings.
"""

from __future__ import annotations


def dental_case(case_id: str) -> str:
    return f"dental_case:{case_id}"


def tooth(tooth_number: int) -> str:
    """Canonical tooth node ID (1-32 Universal system)."""
    return f"tooth:{tooth_number}"


def tooth_surface(tooth_number: int, surface: str) -> str:
    """Canonical surface node ID (e.g., surface:19:M)."""
    return f"surface:{tooth_number}:{surface.upper()}"


def periodontal_pocket(tooth_number: int, site: str) -> str:
    """Canonical periodontal pocket ID (e.g., perio:19:distobuccal)."""
    return f"perio:{tooth_number}:{site.lower()}"


def radiograph(image_id: str) -> str:
    return f"radiograph:{image_id}"


def caries_lesion(tooth_number: int, surface: str) -> str:
    return f"lesion:{tooth_number}:{surface.upper()}"


def dental_anomaly(tooth_number: int, category: str, window_seq: int) -> str:
    """Anomaly node ID (e.g., anomaly:19:pulpal_proximity:12)."""
    return f"anomaly:{tooth_number}:{category}:{window_seq}"


def dental_complication(anomaly_id: str, slug: str) -> str:
    return f"complication:{anomaly_id}:{slug}"


def corrective_protocol(tooth_number: int, protocol_code: str) -> str:
    return f"protocol:{tooth_number}:{protocol_code}"


def soap_note(case_id: str) -> str:
    return f"soap_note:{case_id}"


def verification_block(action_intent_id: str) -> str:
    return f"verification:{action_intent_id}"


def action_intent(action_type: str, action_id: str) -> str:
    return f"action_intent:{action_type}:{action_id}"


def edge(source_id: str, target_id: str, kind: str) -> str:
    return f"{source_id}->{target_id}:{kind}"
