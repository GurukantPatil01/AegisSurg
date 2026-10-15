"""Dental Anomaly Detection package for Gentes Dental OS."""

from agents.dental_anomaly_detection.aggregation import (
    DEFAULT_ANOMALY_THRESHOLD,
    DEFAULT_DENTAL_WEIGHTS,
    aggregate_dental_votes,
)

__all__ = [
    "aggregate_dental_votes",
    "DEFAULT_DENTAL_WEIGHTS",
    "DEFAULT_ANOMALY_THRESHOLD",
]
