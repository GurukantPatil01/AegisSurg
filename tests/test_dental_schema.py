"""Unit tests for Gentes dental schema and canonical node ID generation."""

import pytest
from state.dental_node_ids import (
    caries_lesion,
    corrective_protocol,
    dental_anomaly,
    dental_case,
    periodontal_pocket,
    soap_note,
    tooth,
    tooth_surface,
    verification_block,
)
from state.dental_schema import (
    CDTCode,
    DentalDiffEvent,
    DentalGraphEdgePatch,
    DentalGraphNodePatch,
    DentalSOAPNote,
)


def test_dental_node_ids():
    assert tooth(19) == "tooth:19"
    assert tooth_surface(19, "m") == "surface:19:M"
    assert periodontal_pocket(14, "distobuccal") == "perio:14:distobuccal"
    assert caries_lesion(30, "d") == "lesion:30:D"
    assert dental_anomaly(19, "pulpal_proximity", 5) == "anomaly:19:pulpal_proximity:5"
    assert corrective_protocol(19, "IPC") == "protocol:19:IPC"
    assert soap_note("case-123") == "soap_note:case-123"
    assert verification_block("intent-999") == "verification:intent-999"


def test_dental_graph_patches():
    node = DentalGraphNodePatch(
        node_id="tooth:19",
        node_type="tooth",
        label="Mandibular Left First Molar",
        attrs={"restoration_status": "in_prep", "caries_risk": "high"},
        source_agent="dental_perception",
        source_tool="identify_tooth",
    )
    assert node.node_id == "tooth:19"
    assert node.attrs["caries_risk"] == "high"

    edge = DentalGraphEdgePatch(
        edge_id="tooth:19->surface:19:M:anatomical_relation",
        source_node_id="tooth:19",
        target_node_id="surface:19:M",
        edge_kind="anatomical_relation",
        source_agent="dental_perception",
        source_tool="map_surfaces",
    )
    assert edge.edge_kind == "anatomical_relation"

    diff = DentalDiffEvent(case_id="case-123", seq=1, node=node, edge=edge)
    assert diff.seq == 1
    assert diff.node.label == "Mandibular Left First Molar"
