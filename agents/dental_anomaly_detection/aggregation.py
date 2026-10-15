"""Deterministic consensus aggregation for Gentes dental anomaly detection.

Implements multi-role weighted consensus across Depth, Margin, and Procedural
evaluations in plain Python. Crucially, no LLM is used to compute safety
thresholds or vote arithmetic.
"""

from __future__ import annotations

from typing import Literal

DentalAnomalyRole = Literal["depth", "margin", "procedural"]

# Role weights: depth (pulpal proximity) is highest risk, then margin integrity, then procedural pace
DEFAULT_DENTAL_WEIGHTS: dict[DentalAnomalyRole, float] = {
    "depth": 1.3,
    "margin": 1.0,
    "procedural": 0.8,
}

# Threshold requiring at least two agreeing roles to flag an active anomaly
# (e.g., depth 1.3 + margin 1.0 = 2.3 >= 1.7; depth alone = 1.3 < 1.7)
DEFAULT_ANOMALY_THRESHOLD = 1.7


def aggregate_dental_votes(
    depth_flag: bool,
    margin_flag: bool,
    procedural_flag: bool,
    weights: dict[DentalAnomalyRole, float] = DEFAULT_DENTAL_WEIGHTS,
    threshold: float = DEFAULT_ANOMALY_THRESHOLD,
) -> tuple[float, bool]:
    """Computes weighted consensus score and returns (composite_score, is_anomaly_confirmed)."""
    score = (
        weights["depth"] * float(depth_flag)
        + weights["margin"] * float(margin_flag)
        + weights["procedural"] * float(procedural_flag)
    )
    return round(score, 2), score >= threshold
