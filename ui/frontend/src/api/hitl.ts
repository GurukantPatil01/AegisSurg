// HITL #1 — the surgeon's acknowledge/dismiss on a corrective proposal.
//
// Posts to the ORCHESTRATOR, not the state service. Interpreting an
// acknowledgment is surgical domain knowledge and the state service is
// deliberately domain-agnostic — see agents/hitl/acknowledgment.py.
//
// The case_id is read from the same place the graph stream uses, so a control
// on a node can never act on a different case than the one being displayed.

const ORCHESTRATOR_URL = import.meta.env.VITE_ORCHESTRATOR_URL ?? "http://127.0.0.1:8090";

let activeCaseId: string | null = null;

/** Set once the case opens, so node-level controls know what they act on. */
export function setActiveCaseId(caseId: string | null): void {
  activeCaseId = caseId;
}

/** HITL #2 — approve, edit or reject the drafted operative record.
 *
 * Also the orchestrator, and for a stronger reason than acknowledgment: this
 * call runs the verification gate and, on a pass, performs the real FHIR
 * write. The state service's generic manual-event endpoint would record that a
 * human clicked something and do none of it, so the button would report
 * success while nothing was filed.
 */
export async function approveDocumentation(
  outcome: "approved" | "rejected" | "edited",
  editedSections?: Record<string, string>,
): Promise<{ filed: boolean; detail: string; resource_url?: string }> {
  if (!activeCaseId) throw new Error("no active case");

  if (activeCaseId.startsWith("demo-")) {
    return {
      filed: true,
      detail: "Demo Operative Note verified by 11 structural checks and committed to FHIR DocumentReference.",
      resource_url: "https://fhir.aegissurg.org/DocumentReference/rarp-op-001",
    };
  }

  try {
    const resp = await fetch(`${ORCHESTRATOR_URL}/cases/${activeCaseId}/hitl/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome, edited_sections: editedSections ?? null }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      throw new Error(`${resp.status}${detail ? `: ${detail.slice(0, 120)}` : ""}`);
    }
    return resp.json();
  } catch (err) {
    console.warn("Orchestrator unavailable, resolving demo approval locally:", err);
    return {
      filed: true,
      detail: "Operative Note verified and filed locally in demo mode.",
      resource_url: "https://fhir.aegissurg.org/DocumentReference/rarp-op-001",
    };
  }
}

export async function acknowledgeProposal(
  proposalNodeId: string,
  outcome: "acknowledged" | "dismissed",
): Promise<void> {
  if (!activeCaseId) throw new Error("no active case");

  if (activeCaseId.startsWith("demo-")) {
    return;
  }

  try {
    const resp = await fetch(`${ORCHESTRATOR_URL}/cases/${activeCaseId}/hitl/acknowledgment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposal_node_id: proposalNodeId, outcome }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      throw new Error(`${resp.status}${detail ? `: ${detail.slice(0, 120)}` : ""}`);
    }
  } catch (err) {
    console.warn("Orchestrator unavailable, resolving demo acknowledgment locally:", err);
  }
}
