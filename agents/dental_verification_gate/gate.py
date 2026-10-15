"""Dental Verification Gate — fail-closed, read-only deterministic safety gate.

Every external dental write (e.g., patient chart alerts, automated EHR
procedure filing, prescription intents) passes through here first. The gate
inspects the reasoning chain on the living graph and refuses anything with
an unresolved reference or missing evidence link.

FAIL-CLOSED: Default is NO. Any exception or unverified check blocks the action.
NO LLM: Evaluated through deterministic Python graph traversal only.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from tools.dental_library import get_protocol

logger = logging.getLogger(__name__)

MIN_DENTAL_CONFIDENCE = 0.65


@dataclass
class DentalGateResult:
    passed: bool
    checks: list[dict[str, Any]] = field(default_factory=list)
    block_reasons: list[str] = field(default_factory=list)

    @property
    def summary(self) -> str:
        if self.passed:
            return f"Passed all {len(self.checks)} dental safety checks"
        return f"BLOCKED: {'; '.join(self.block_reasons)}"


def _check(result: DentalGateResult, name: str, ok: bool, detail: str) -> bool:
    result.checks.append({"check": name, "passed": bool(ok), "detail": detail})
    if not ok:
        result.block_reasons.append(f"{name}: {detail}")
    return bool(ok)


def evaluate_dental_intent(
    action_payload: dict[str, Any],
    graph_nodes: dict[str, Any],
    graph_edges: list[dict[str, Any]],
) -> DentalGateResult:
    """Synchronous, deterministic structural validation of a proposed dental action.

    Walks: action_intent -> corrective_protocol -> complication -> anomaly -> tooth.
    """
    result = DentalGateResult(passed=False)

    # Check 1: Action Intent structure
    if not _check(
        result,
        "action_intent_valid",
        bool(action_payload.get("action_type") and action_payload.get("intent_id")),
        "Missing action_type or intent_id in payload",
    ):
        return result

    # Check 2: Tooth number resolved and valid (Universal System 1-32)
    tooth_num = action_payload.get("tooth_number")
    if not _check(
        result,
        "valid_tooth_number",
        isinstance(tooth_num, int) and 1 <= tooth_num <= 32,
        f"Tooth number {tooth_num} is outside valid range (1-32)",
    ):
        return result

    # Check 3: Protocol resolved in bounded library
    protocol_code = action_payload.get("protocol_code")
    protocol = get_protocol(protocol_code) if protocol_code else None
    if not _check(
        result,
        "protocol_in_bounded_library",
        protocol is not None,
        f"Protocol code {protocol_code!r} is not in the authorized ADA/AAP clinical library",
    ):
        return result

    # Check 4: Protocol has actionable steps
    if not _check(
        result,
        "protocol_has_steps",
        bool(protocol and protocol.steps),
        "Selected protocol contains no actionable clinical steps",
    ):
        return result

    # Check 5: Complication resolved on graph
    complication_id = action_payload.get("complication_id")
    complication_node = graph_nodes.get(complication_id) if complication_id else None
    if not _check(
        result,
        "complication_resolves",
        complication_node is not None,
        f"Cited complication {complication_id!r} is not found on graph",
    ):
        return result

    # Check 6: Complication is literature-grounded
    complication_attrs = complication_node.get("attrs", {}) if complication_node else {}
    if not _check(
        result,
        "complication_is_literature_backed",
        bool(complication_attrs.get("evidence_backed")),
        "The complication is not grounded in peer-reviewed dental literature",
    ):
        return result

    # Check 7: Confidence meets safety floor
    confidence = complication_attrs.get("confidence", 0.0)
    if not _check(
        result,
        "confidence_threshold",
        isinstance(confidence, (int, float)) and confidence >= MIN_DENTAL_CONFIDENCE,
        f"Confidence {confidence} is below minimum floor {MIN_DENTAL_CONFIDENCE}",
    ):
        return result

    # Check 8: Anomaly resolved on graph
    anomaly_id = action_payload.get("anomaly_id")
    anomaly_node = graph_nodes.get(anomaly_id) if anomaly_id else None
    if not _check(
        result,
        "anomaly_resolves",
        anomaly_node is not None,
        f"Underlying anomaly {anomaly_id!r} is not found on graph",
    ):
        return result

    # Check 9: Causal graph edge exists
    has_causal_edge = any(
        e.get("edge_kind") == "causal_reasoning"
        and e.get("source") == anomaly_id
        and e.get("target") == complication_id
        for e in graph_edges
    )
    if not _check(
        result,
        "causal_edge_verified",
        has_causal_edge,
        f"No causal_reasoning edge links anomaly {anomaly_id} to complication {complication_id}",
    ):
        return result

    # Check 10: Dentist approval gate for final EHR writes
    if action_payload.get("is_external_ehr_write"):
        dentist_signed = action_payload.get("dentist_approved", False)
        if not _check(
            result,
            "dentist_approval_recorded",
            bool(dentist_signed),
            "Outbound EHR modification requires explicit dentist verification",
        ):
            return result

    result.passed = True
    return result
