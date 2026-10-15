"""Unit tests for the Dental Verification Gate.

Verifies that the gate blocks ungrounded clinical actions (fail-closed)
and permits fully verified, literature-backed, dentist-approved interventions.
"""

import pytest
from agents.dental_verification_gate.gate import evaluate_dental_intent


def test_gate_permits_valid_verified_intent():
    payload = {
        "action_type": "protocol_recommendation",
        "intent_id": "intent-001",
        "tooth_number": 19,
        "protocol_code": "IPC",
        "complication_id": "comp-101",
        "anomaly_id": "anom-202",
        "is_external_ehr_write": True,
        "dentist_approved": True,
    }

    graph_nodes = {
        "comp-101": {
            "attrs": {
                "evidence_backed": True,
                "confidence": 0.88,
                "literature_doi": "10.1177/0022034515618961",
            }
        },
        "anom-202": {
            "attrs": {
                "category": "pulpal_proximity",
                "depth_mm": 0.4,
            }
        },
    }

    graph_edges = [
        {"edge_kind": "causal_reasoning", "source": "anom-202", "target": "comp-101"}
    ]

    result = evaluate_dental_intent(payload, graph_nodes, graph_edges)
    assert result.passed is True
    assert "Passed all" in result.summary


def test_gate_blocks_invalid_tooth_number():
    payload = {
        "action_type": "protocol_recommendation",
        "intent_id": "intent-002",
        "tooth_number": 45,  # Invalid tooth number!
        "protocol_code": "IPC",
        "complication_id": "comp-101",
        "anomaly_id": "anom-202",
    }
    result = evaluate_dental_intent(payload, {}, [])
    assert result.passed is False
    assert any("Tooth number 45 is outside valid range" in r for r in result.block_reasons)


def test_gate_blocks_unauthorized_protocol():
    payload = {
        "action_type": "protocol_recommendation",
        "intent_id": "intent-003",
        "tooth_number": 19,
        "protocol_code": "NON_STANDARD_RESTORATION",
        "complication_id": "comp-101",
        "anomaly_id": "anom-202",
    }
    result = evaluate_dental_intent(payload, {}, [])
    assert result.passed is False
    assert any("not in the authorized ADA/AAP" in r for r in result.block_reasons)


def test_gate_blocks_unsupported_complication():
    payload = {
        "action_type": "protocol_recommendation",
        "intent_id": "intent-004",
        "tooth_number": 19,
        "protocol_code": "IPC",
        "complication_id": "comp-unbacked",
        "anomaly_id": "anom-202",
    }
    graph_nodes = {
        "comp-unbacked": {
            "attrs": {
                "evidence_backed": False,  # Not supported by literature!
                "confidence": 0.85,
            }
        },
        "anom-202": {"attrs": {}},
    }
    result = evaluate_dental_intent(payload, graph_nodes, [])
    assert result.passed is False
    assert any("not grounded in peer-reviewed dental literature" in r for r in result.block_reasons)


def test_gate_blocks_low_confidence():
    payload = {
        "action_type": "protocol_recommendation",
        "intent_id": "intent-005",
        "tooth_number": 19,
        "protocol_code": "IPC",
        "complication_id": "comp-low",
        "anomaly_id": "anom-202",
    }
    graph_nodes = {
        "comp-low": {
            "attrs": {
                "evidence_backed": True,
                "confidence": 0.40,  # Below 0.65 floor!
            }
        },
        "anom-202": {"attrs": {}},
    }
    result = evaluate_dental_intent(payload, graph_nodes, [])
    assert result.passed is False
    assert any("below minimum floor" in r for r in result.block_reasons)


def test_gate_blocks_unapproved_external_ehr_write():
    payload = {
        "action_type": "ehr_procedure_file",
        "intent_id": "intent-006",
        "tooth_number": 19,
        "protocol_code": "IPC",
        "complication_id": "comp-101",
        "anomaly_id": "anom-202",
        "is_external_ehr_write": True,
        "dentist_approved": False,  # Missing dentist sign-off!
    }
    graph_nodes = {
        "comp-101": {"attrs": {"evidence_backed": True, "confidence": 0.90}},
        "anom-202": {"attrs": {}},
    }
    graph_edges = [
        {"edge_kind": "causal_reasoning", "source": "anom-202", "target": "comp-101"}
    ]
    result = evaluate_dental_intent(payload, graph_nodes, graph_edges)
    assert result.passed is False
    assert any("dentist verification" in r for r in result.block_reasons)
