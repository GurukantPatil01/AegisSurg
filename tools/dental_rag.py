"""Targeted dental literature retrieval (RAG) for Gentes Dental OS.

Specializes literature queries to major clinical dental publications (e.g.,
Journal of the American Dental Association, Journal of Endodontics, Journal
of Periodontology, International Endodontic Journal) via live Europe PMC and
PubMed APIs.
"""

from __future__ import annotations

import logging
from typing import Any

from tools.europepmc_rag import search_articles

logger = logging.getLogger(__name__)

DENTAL_CORE_JOURNALS = [
    "J Am Dent Assoc",
    "J Endod",
    "J Periodontol",
    "Int Endod J",
    "Dent Mater",
    "Oper Dent",
]


async def query_dental_literature(query: str, max_results: int = 5) -> list[dict[str, Any]]:
    """Retrieves live peer-reviewed dental literature abstracts matching query."""
    enhanced_query = f"({query}) AND (dentistry OR endodontics OR restorative OR pulp)"
    try:
        results = await search_articles(enhanced_query, max_results=max_results)
        return results
    except Exception as exc:
        logger.warning("Dental literature query failed for %r: %s", query, exc)
        return []
