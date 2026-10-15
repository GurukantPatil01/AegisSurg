import React from "react";
import type { DentalGateStatus } from "./dentalTypes";

interface DentalVerificationGateCardProps {
  gateStatus: DentalGateStatus;
  onDentistSignoff: () => void;
}

export const DentalVerificationGateCard: React.FC<DentalVerificationGateCardProps> = ({
  gateStatus,
  onDentistSignoff,
}) => {
  const passedCount = gateStatus.checks.filter((c) => c.passed).length;
  const totalCount = gateStatus.checks.length;
  const isFullyApproved = gateStatus.dentist_approved && gateStatus.passed;

  return (
    <div className="cockpit-card" style={{ height: "100%" }}>
      {/* Header */}
      <div className="card-header">
        <div>
          <div className="card-title">
            <span
              style={{
                width: "8px",
                height: "8px",
                background: isFullyApproved ? "var(--brutal-success)" : "var(--brutal-alert)",
                display: "inline-block",
              }}
            />
            Verification Gate [Fail-Closed]
          </div>
          <div className="card-subtitle">
            10 Deterministic Safety Invariants
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              background: "#ffffff",
              border: "1px solid #000",
              padding: "2px 6px",
              fontWeight: 800,
            }}
          >
            {passedCount}/{totalCount} PASSED
          </span>
          <span
            className="dental-pill"
            style={{
              background: isFullyApproved ? "#000000" : "#ffffff",
              color: isFullyApproved ? "#ffffff" : "#000000",
              borderColor: "#000000",
            }}
          >
            {isFullyApproved ? "[ EHR APPROVED ]" : "[ SIGN-OFF PENDING ]"}
          </span>
        </div>
      </div>

      {/* 10 Checks List */}
      <div className="gate-checks-list">
        {gateStatus.checks.map((check) => (
          <div
            key={check.id}
            className={`gate-check-row ${check.passed ? "pass" : "fail"}`}
          >
            <div className="gate-check-top">
              <span>
                {check.label}
              </span>
              <span className={`gate-badge ${check.passed ? "gate-badge-pass" : "gate-badge-fail"}`}>
                {check.passed ? "[ PASS ]" : "[ FAIL ]"}
              </span>
            </div>
            <div className="gate-check-desc">{check.description}</div>
            {check.detail && (
              <div className="gate-check-detail">
                DETAILS: {check.detail}
              </div>
            )}
            {check.citation && (
              <div className="gate-check-citation">
                GROUNDING: {check.citation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer / Dentist HITL Action */}
      <div className="gate-footer">
        <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--brutal-text-secondary)", maxWidth: "60%", textTransform: "uppercase" }}>
          {gateStatus.dentist_approved ? (
            <span style={{ color: "var(--brutal-black)", fontWeight: 800 }}>
              ✓ SIGNED OFF BY DR. G. PATIL, DDS • FHIR PROCEDURE COMMITTED.
            </span>
          ) : (
            <span>EXTERNAL EHR WRITE REQUIRES CLINICIAN AUTHORIZATION.</span>
          )}
        </div>
        <button
          type="button"
          disabled={gateStatus.dentist_approved}
          onClick={onDentistSignoff}
          className="gate-btn"
        >
          {gateStatus.dentist_approved ? "APPROVED & COMMITTED" : "AUTHORIZE EHR WRITE"}
        </button>
      </div>
    </div>
  );
};
