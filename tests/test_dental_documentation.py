"""Unit tests for Dental Documentation and GentesBot chairside co-pilot."""

import pytest
from agents.dental_documentation.agent import derive_cdt_code, draft_dental_soap_note
from agents.gentesbot.agent import GentesBotSession


def test_derive_cdt_codes():
    c1 = derive_cdt_code("composite", surfaces=["O"])
    assert c1.code == "D2391"

    c2 = derive_cdt_code("composite", surfaces=["M", "O"])
    assert c2.code == "D2392"

    c3 = derive_cdt_code("composite", surfaces=["M", "O", "D"])
    assert c3.code == "D2393"

    ipc = derive_cdt_code("indirect_pulp_cap")
    assert ipc.code == "D3120"

    dpc = derive_cdt_code("direct_pulp_cap")
    assert dpc.code == "D3110"


def test_draft_dental_soap_note():
    note = draft_dental_soap_note(
        patient_chief_complaint="Cold sensitivity on lower right molar",
        tooth_number=19,
        observed_pathology="0.4mm remaining dentin thickness over mesiobuccal pulp horn",
        procedure_performed="Resin-based composite restoration",
        surfaces=["M", "O"],
        protocol_applied="Indirect Pulp Capping (IPC)",
    )
    assert "Tooth #19" in note.objective
    assert "D2392" in [c.code for c in note.cdt_codes]
    assert "D3120" in [c.code for c in note.cdt_codes]
    assert note.approval_status == "draft"


def test_gentesbot_voice_session_perio():
    session = GentesBotSession(session_id="sess-1", case_id="case-1")

    # Test perio dictation
    res1 = session.process_voice_turn("Tooth 14: 4 3 2 bleeding on mesial")
    assert res1["intent"] == "periodontal_record"
    assert res1["tooth_number"] == 14
    assert res1["probing_depths"] == [4, 3, 2]
    assert res1["bleeding"] is True
    assert 14 in session.perio_measurements

    # Test protocol recommendation
    res2 = session.process_voice_turn("What is the protocol for deep pulp proximity?")
    assert res2["intent"] == "protocol_recommendation"
    assert res2["protocol_code"] == "IPC"

    # Test SOAP note generation
    res3 = session.process_voice_turn("Draft note for tooth 19 MO")
    assert res3["intent"] == "soap_note_drafted"
    assert res3["tooth_number"] == 19
    assert "D2392" in str(res3["soap_note"]["cdt_codes"])
