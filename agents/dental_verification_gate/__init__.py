"""Dental Verification Gate package."""

from agents.dental_verification_gate.gate import (
    DentalGateResult,
    evaluate_dental_intent,
    MIN_DENTAL_CONFIDENCE,
)

__all__ = ["DentalGateResult", "evaluate_dental_intent", "MIN_DENTAL_CONFIDENCE"]
