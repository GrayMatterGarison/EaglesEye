"use client";

import { useState, useRef, useEffect } from "react";
import { questions, classify, type Answers } from "@/lib/questions";

/* ─────────────────────────────────────────────
   LEAD MODAL
───────────────────────────────────────────── */
function LeadModal({
  answers,
  onClose,
}: {
  answers: Answers;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    firmName: "",
    attorneyName: "",
    email: "",
    phone: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const { likelyTBI, possibleTBI, noTBI } = classify(answers);
  const classification = likelyTBI ? "Likely TBI" : possibleTBI ? "Possible TBI" : "No TBI Indicated";

  const steps = buildSteps(answers);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firmName || !form.email) return;
    setStatus("sending");
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          caseData: { likelyTBI, possibleTBI, noTBI, answers, summary: { steps } },
        }),
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(10,10,8,0.88)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--mid)",
          border: "1px solid var(--gold-border)",
          borderTop: "2px solid var(--gold)",
          maxWidth: 520,
          width: "100%",
          padding: "36px 36px 32px",
          position: "relative",
          animation: "fadeUp 0.35s ease",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            background: "none",
            border: "none",
            color: "rgba(200,169,110,0.4)",
            cursor: "pointer",
            fontFamily: "var(--mono, monospace)",
            fontSize: "0.8rem",
          }}
        >
          ✕
        </button>

        {status === "done" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1rem",
                letterSpacing: "0.18em",
                color: "var(--gold)",
                marginBottom: 8,
              }}
            >
              VALHALLA
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.8rem",
                fontWeight: 300,
                color: "var(--white)",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Case received.
              <br />
              <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
                We&apos;ll be in touch.
              </em>
            </div>
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.86rem",
                color: "var(--off)",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              Your clinical pathway has been sent to our team. A Valhalla clinical director will
              reach out within one business day. Check your inbox for a confirmation.
            </p>
            <div
              style={{
                background: "rgba(200,169,110,0.06)",
                border: "1px solid var(--gold-border)",
                borderLeft: "2px solid var(--gold)",
                padding: "12px 16px",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.76rem",
                color: "var(--off)",
                lineHeight: 1.6,
                textAlign: "left",
              }}
            >
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                Case classification: {classification}
              </span>
              <br />
              {steps[0]?.body}
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "0.9rem",
                letterSpacing: "0.18em",
                color: "var(--gold)",
                marginBottom: 4,
              }}
            >
              VALHALLA
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.65rem",
                fontWeight: 300,
                color: "var(--white)",
                lineHeight: 1.15,
                marginBottom: 6,
              }}
            >
              Get your complete pathway.
              <br />
              <em style={{ fontStyle: "italic", color: "var(--gold)" }}>
                A clinical director will review it with you.
              </em>
            </div>
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.8rem",
                color: "var(--off)",
                lineHeight: 1.65,
                marginBottom: 24,
              }}
            >
              Your case is classified as{" "}
              <strong style={{ color: likelyTBI ? "#fca5a5" : possibleTBI ? "#fcd34d" : "var(--white)" }}>
                {classification}
              </strong>
              . Enter your details and we&apos;ll send you the full workup
              recommendation and have someone reach out within one business day.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "firmName",     label: "Firm Name *",         placeholder: "Johnson & Associates", required: true },
                { key: "attorneyName", label: "Attorney Name",        placeholder: "Sarah Johnson",        required: false },
                { key: "email",        label: "Email Address *",      placeholder: "sarah@jafirm.com",     required: true },
                { key: "phone",        label: "Phone (optional)",     placeholder: "(555) 000-0000",       required: false },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    style={{
                      display: "block",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.46rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(200,169,110,0.45)",
                      marginBottom: 5,
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    type={f.key === "email" ? "email" : "text"}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      width: "100%",
                      background: "var(--dark)",
                      border: "none",
                      borderBottom: "1px solid rgba(200,169,110,0.25)",
                      color: "var(--white)",
                      padding: "9px 10px",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "0.88rem",
                      fontWeight: 400,
                      letterSpacing: "0.04em",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  marginTop: 8,
                  background: status === "sending" ? "rgba(200,169,110,0.5)" : "var(--gold)",
                  color: "var(--ink)",
                  border: "none",
                  padding: "13px 28px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  cursor: status === "sending" ? "not-allowed" : "pointer",
                  transition: "background 0.2s",
                }}
              >
                {status === "sending" ? "Sending…" : "Get My Clinical Pathway →"}
              </button>

              {status === "error" && (
                <p style={{ color: "#fca5a5", fontSize: "0.74rem", fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Something went wrong. Please email us directly at performance@valhallahealth.com
                </p>
              )}

              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.44rem",
                  letterSpacing: "0.14em",
                  color: "rgba(200,169,110,0.25)",
                  lineHeight: 1.7,
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                No spam. No commitment. A clinical director will reach out within 1 business day.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   QUESTION CARD
───────────────────────────────────────────── */
function QuestionCard({
  q,
  index,
  isActive,
  isAnswered,
  selectedVal,
  onSelect,
}: {
  q: (typeof questions)[0];
  index: number;
  isActive: boolean;
  isAnswered: boolean;
  selectedVal?: string;
  onSelect: (val: string) => void;
}) {
  const answeredLabel = q.options.find((o) => o.val === selectedVal)?.label;

  return (
    <div
      style={{
        background: "var(--mid)",
        border: `1px solid ${isAnswered ? "rgba(60,180,100,0.2)" : "rgba(200,169,110,0.1)"}`,
        borderTop: `2px solid ${isAnswered ? "rgba(60,180,100,0.5)" : isActive ? "var(--gold)" : "rgba(200,169,110,0.12)"}`,
        padding: "18px 18px 16px",
        marginBottom: 5,
        opacity: isActive || isAnswered ? 1 : 0.3,
        transform: isActive || isAnswered ? "translateY(0)" : "translateY(3px)",
        transition: "all 0.35s ease",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.44rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(200,169,110,0.35)",
          marginBottom: 7,
        }}
      >
        {q.num}
      </div>

      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1rem",
          fontWeight: 400,
          color: isAnswered ? "rgba(245,242,236,0.5)" : "var(--white)",
          lineHeight: 1.25,
          marginBottom: isAnswered ? 6 : 10,
        }}
      >
        {q.title}
      </div>

      {isAnswered ? (
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "0.88rem",
            color: "rgba(200,169,110,0.6)",
          }}
        >
          &ldquo;{answeredLabel}&rdquo;
        </div>
      ) : isActive ? (
        <>
          {q.hint && (
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.42rem",
                letterSpacing: "0.14em",
                color: "rgba(200,169,110,0.28)",
                marginBottom: 10,
                fontStyle: "italic",
              }}
            >
              {q.hint}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {q.options.map((o) => (
              <button
                key={o.val}
                onClick={() => onSelect(o.val)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  background:
                    selectedVal === o.val ? "rgba(200,169,110,0.1)" : "var(--dark)",
                  border: `1px solid ${selectedVal === o.val ? "var(--gold)" : "rgba(200,169,110,0.08)"}`,
                  cursor: "pointer",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.82rem",
                  color: selectedVal === o.val ? "var(--white)" : "var(--off)",
                  letterSpacing: "0.04em",
                  textAlign: "left",
                  transition: "all 0.15s",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    border: `1.5px solid ${selectedVal === o.val ? "var(--gold)" : "rgba(200,169,110,0.3)"}`,
                    background: selectedVal === o.val ? "var(--gold)" : "transparent",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                />
                <span style={{ flex: 1 }}>{o.label}</span>
                {o.badge && (
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.4rem",
                      letterSpacing: "0.14em",
                      padding: "2px 7px",
                      background: "rgba(200,169,110,0.08)",
                      border: "1px solid rgba(200,169,110,0.18)",
                      color: "rgba(200,169,110,0.55)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {o.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FLOW NODE
───────────────────────────────────────────── */
type NodeState = "locked" | "active" | "complete" | "warning" | "skipped";

function FlowNode({
  num,
  step,
  owner,
  title,
  body,
  state,
  statusText,
  detail,
}: {
  num: string;
  step: string;
  owner: string;
  title: React.ReactNode;
  body: string;
  state: NodeState;
  statusText: string;
  detail?: React.ReactNode;
}) {
  const borderColor = {
    locked: "rgba(200,169,110,0.08)",
    active: "var(--gold)",
    complete: "rgba(60,180,100,0.6)",
    warning: "rgba(230,160,60,0.7)",
    skipped: "rgba(150,150,150,0.12)",
  }[state];

  const bg = {
    locked: "var(--mid)",
    active: "rgba(200,169,110,0.05)",
    complete: "var(--mid)",
    warning: "rgba(230,160,60,0.04)",
    skipped: "var(--mid)",
  }[state];

  const statusBg = {
    locked: "rgba(200,169,110,0.06)",
    active: "rgba(200,169,110,0.14)",
    complete: "rgba(60,180,100,0.1)",
    warning: "rgba(230,160,60,0.1)",
    skipped: "rgba(150,150,150,0.06)",
  }[state];

  const statusColor = {
    locked: "rgba(200,169,110,0.3)",
    active: "var(--gold)",
    complete: "rgba(60,180,100,0.8)",
    warning: "rgba(230,160,60,0.8)",
    skipped: "rgba(150,150,150,0.3)",
  }[state];

  return (
    <div
      style={{
        background: bg,
        border: "1px solid rgba(200,169,110,0.08)",
        borderLeft: `3px solid ${borderColor}`,
        padding: "16px 18px",
        marginBottom: 3,
        opacity: state === "locked" ? 0.25 : state === "skipped" ? 0.15 : 1,
        transition: "all 0.35s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Watermark number */}
      <div
        style={{
          position: "absolute",
          bottom: -10,
          right: 10,
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "3.5rem",
          color: "rgba(200,169,110,0.04)",
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {num}
      </div>

      {/* Status chip */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 16,
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.4rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          padding: "3px 8px",
          background: statusBg,
          color: statusColor,
          border: `1px solid ${statusColor}20`,
          animation: state === "active" ? "pulseGold 2s infinite" : "none",
        }}
      >
        {statusText}
      </div>

      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.42rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(200,169,110,0.3)",
          marginBottom: 6,
        }}
      >
        {step}
      </div>

      <div
        style={{
          display: "inline-block",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.4rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          border: "1px solid rgba(200,169,110,0.18)",
          color: "rgba(200,169,110,0.5)",
          padding: "2px 6px",
          marginBottom: 8,
        }}
      >
        {owner}
      </div>

      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.1rem",
          fontWeight: 600,
          color: "var(--white)",
          lineHeight: 1.15,
          marginBottom: 7,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "0.76rem",
          fontWeight: 300,
          lineHeight: 1.65,
          color: "var(--off)",
        }}
      >
        {body}
      </div>

      {detail && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(200,169,110,0.1)",
            maxHeight: state === "active" || state === "warning" || state === "complete" ? 600 : 0,
            overflow: "hidden",
            transition: "max-height 0.4s ease, opacity 0.3s ease",
            opacity: state === "active" || state === "warning" || state === "complete" ? 1 : 0,
          }}
        >
          {detail}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DETAIL HELPERS
───────────────────────────────────────────── */
function DetailList({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "0.74rem",
            color: "var(--off)",
            paddingLeft: 14,
            position: "relative",
            lineHeight: 1.45,
          }}
          dangerouslySetInnerHTML={{
            __html: `<span style="position:absolute;left:0;color:var(--gold)">—</span>${item}`,
          }}
        />
      ))}
    </ul>
  );
}

function Alert({ type, children }: { type: "info" | "good" | "warn" | "red"; children: React.ReactNode }) {
  const colors = {
    info: { bg: "rgba(200,169,110,0.06)", border: "rgba(200,169,110,0.3)", text: "rgba(200,169,110,0.75)" },
    good: { bg: "rgba(60,180,100,0.07)",  border: "rgba(60,180,100,0.45)",  text: "rgba(100,220,140,0.85)" },
    warn: { bg: "rgba(230,160,60,0.07)",  border: "rgba(230,160,60,0.45)",  text: "rgba(255,200,100,0.85)" },
    red:  { bg: "rgba(220,60,60,0.07)",   border: "rgba(220,60,60,0.45)",   text: "rgba(255,130,130,0.85)" },
  }[type];
  return (
    <div
      style={{
        padding: "10px 12px",
        marginTop: 10,
        background: colors.bg,
        borderLeft: `2px solid ${colors.border}`,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: "0.74rem",
        color: colors.text,
        lineHeight: 1.58,
      }}
    >
      {children}
    </div>
  );
}

function ClassTiles({ likelyTBI, possibleTBI, noTBI }: { likelyTBI: boolean; possibleTBI: boolean; noTBI: boolean }) {
  const tiles = [
    { key: "likely",   label: "Classification A", val: "Likely TBI",     active: likelyTBI,
      bg: "rgba(220,60,60,0.1)", border: "rgba(220,60,60,0.3)", lbl: "rgba(255,130,130,0.7)", val2: "rgba(255,150,150,0.9)" },
    { key: "possible", label: "Classification B", val: "Possible TBI",   active: possibleTBI,
      bg: "rgba(230,160,60,0.1)", border: "rgba(230,160,60,0.28)", lbl: "rgba(230,160,60,0.7)", val2: "rgba(255,200,100,0.9)" },
    { key: "unlikely", label: "Classification C", val: "No TBI Found",   active: noTBI,
      bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", lbl: "rgba(255,255,255,0.25)", val2: "rgba(255,255,255,0.25)" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginTop: 12 }}>
      {tiles.map((t) => (
        <div
          key={t.key}
          style={{
            padding: "12px 10px",
            background: t.bg,
            border: `1px solid ${t.border}`,
            textAlign: "center",
            transition: "all 0.25s",
            transform: t.active ? "scale(1.03)" : "scale(1)",
            boxShadow: t.active ? "0 0 12px rgba(200,169,110,0.15)" : "none",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.4rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: t.lbl,
              marginBottom: 5,
            }}
          >
            {t.label}
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: t.val2,
            }}
          >
            {t.val}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUMMARY STEPS BUILDER
───────────────────────────────────────────── */
function buildSteps(a: Answers) {
  const { likelyTBI, possibleTBI } = classify(a);
  const urgent = a.q4 === "over_month";
  const highLimits = a.q6 === "high";
  const lowLimits = a.q6 === "low";
  const forTrial = a.q9 === "litigation";
  const chiropractor = a.q8 === "chiro";

  const steps = [];

  if (likelyTBI || possibleTBI) {
    steps.push({
      title: "Deploy CognitraxX at Intake",
      body: urgent
        ? "Over 1 month post-injury — deploy CognitraxX immediately to preserve the acute documentation record. $500 on lien, $0 if no TBI."
        : "Deploy CognitraxX at intake. 12-minute remote screen captures LOC/AOC/PTA per ACRM 2023 criteria. Report in 24 hours. $500 on lien.",
    });
  }

  if (likelyTBI) {
    steps.push({
      title: "Initiate NeuroSentinel P1 Baseline",
      body: "Schedule NeuroSentinel Phase 1 — pre-treatment neurocognitive and neurobehavioral baseline. 45 minutes, remotely administered, proctored, physician-reviewed. $1,500 on lien.",
    });

    steps.push({
      title: "Begin CDL Treatment Protocol",
      body: `Clinically Deployed Light deployed ${a.q5 === "physical" ? "targeting neuroinflammation and vestibular symptoms" : "for full-spectrum cellular recovery"}. In-home deployment available. Every session tracked against P1 baseline.`,
    });

    if (highLimits || forTrial) {
      steps.push({
        title: "Exosome Therapy — Life Care Plan",
        body: "High limits / litigation goal: nebulized exosome therapy indicated. $27,000 per round. $324,000 annual life care plan value. Phase 2 IND study active.",
      });
    }

    steps.push({
      title: "Schedule DTI Imaging Window",
      body: `Optimal DTI/SWI imaging window: ${urgent ? "as soon as possible — document subjective symptoms immediately as a bridge" : "5–9 months post-injury"}. Tesla 3.0 minimum. Valhalla coordinates neuroradiologist referral.`,
    });

    steps.push({
      title: "NeuroSentinel P2 — Post-Treatment Delta",
      body: "After treatment cycle (6–8 weeks), administer P2. Objective pre/post neurological delta. The direct answer to defense's treatment efficacy challenge.",
    });
  }

  if (possibleTBI && !likelyTBI) {
    steps.push({
      title: "30-Day Re-Screen Scheduled",
      body: "Possible TBI classification — monitor and document symptoms. Re-administer CognitraxX at 30 days. If symptoms persist, initiate full workup.",
    });
  }

  if (chiropractor && (likelyTBI || possibleTBI)) {
    steps.push({
      title: "Urgent: Get Ahead of Chiro Delay",
      body: "Client currently at chiropractor — deploy CognitraxX now before PIP exhaustion or referral delay. Get TBI documented acutely before it becomes a problem.",
    });
  }

  return steps;
}

/* ─────────────────────────────────────────────
   CONNECTOR
───────────────────────────────────────────── */
function Connector({ label }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "3px 0",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <div
          style={{
            width: 1,
            height: 16,
            background: "linear-gradient(180deg, rgba(200,169,110,0.2), rgba(200,169,110,0.45))",
          }}
        />
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.55rem",
            color: "rgba(200,169,110,0.45)",
          }}
        >
          ▼
        </div>
        {label && (
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.38rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(200,169,110,0.22)",
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "28px 0 14px",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.44rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(200,169,110,0.45)",
          border: "1px solid rgba(200,169,110,0.15)",
          padding: "3px 9px",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(90deg, rgba(200,169,110,0.15), transparent)",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN NAVIGATOR
───────────────────────────────────────────── */
export default function Navigator() {
  const [answers, setAnswers] = useState<Answers>({});
  const [activeQ, setActiveQ] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  const allAnswered = answeredCount === questions.length;

  function selectOpt(qId: string, val: string) {
    const newAnswers = { ...answers, [qId]: val };
    setAnswers(newAnswers);
    const qIdx = questions.findIndex((q) => q.id === qId);
    if (qIdx + 1 < questions.length) {
      setTimeout(() => setActiveQ(qIdx + 1), 250);
    }
  }

  function reset() {
    setAnswers({});
    setActiveQ(0);
  }

  const a = answers;
  const { likelyTBI, possibleTBI, noTBI } = classify(a);

  const loc = a.q2 === "yes_confirmed";
  const locPossible = a.q2 === "yes_possible";
  const aoc = a.q3 === "yes";
  const aocPossible = a.q3 === "possible";
  const urgent = a.q4 === "over_month";
  const highLimits = a.q6 === "high";
  const lowLimits = a.q6 === "low";
  const priorTBI = a.q7 === "yes";
  const chiropractor = a.q8 === "chiro";
  const forTrial = a.q9 === "litigation";
  const hasSymptoms = a.q5 && a.q5 !== "none";
  const showPhase3 = likelyTBI || possibleTBI;
  const showTreatment = likelyTBI && !!a.q6;
  const exosomeOk = likelyTBI && (highLimits || forTrial) && !lowLimits;

  const steps = buildSteps(a);

  /* Node state helpers */
  function intakeState(): NodeState {
    if (!Object.keys(a).length) return "locked";
    if (a.q1 && a.q2 && a.q3 && a.q4) return "complete";
    return "active";
  }
  function cognitraxState(): NodeState {
    if (!a.q1) return "locked";
    if (a.q5) return "complete";
    return "active";
  }
  function classifyState(): NodeState {
    if (!a.q5) return "locked";
    if (likelyTBI) return "active";
    if (possibleTBI) return "warning";
    if (noTBI) return "complete";
    return "active";
  }
  function n(locked: boolean, warn: boolean, skip: boolean, done: boolean): NodeState {
    if (skip) return "skipped";
    if (locked) return "locked";
    if (done) return "complete";
    if (warn) return "warning";
    return "active";
  }

  return (
    <>
      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(200,169,110,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.022) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {showModal && <LeadModal answers={answers} onClose={() => setShowModal(false)} />}

      {/* ── HEADER ── */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          borderBottom: "1px solid rgba(200,169,110,0.18)",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.1rem",
              letterSpacing: "0.18em",
              color: "var(--gold)",
            }}
          >
            VALHALLA
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.46rem",
              letterSpacing: "0.18em",
              color: "rgba(200,169,110,0.32)",
              marginTop: 2,
            }}
          >
            Performance Medicine
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.3rem",
              fontWeight: 300,
              color: "var(--white)",
            }}
          >
            TBI Case{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Navigator</em>
          </div>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.44rem",
              letterSpacing: "0.16em",
              color: "rgba(200,169,110,0.28)",
              marginTop: 2,
            }}
          >
            Answer 9 questions · Get your clinical pathway
          </div>
        </div>

        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.44rem",
            letterSpacing: "0.12em",
            color: "rgba(200,169,110,0.25)",
            textAlign: "right",
            lineHeight: 1.9,
          }}
        >
          IRB Studied · SaMD Pathway
          <br />
          50,000+ Treatments · 41 States
        </div>
      </header>

      {/* ── MAIN APP ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          minHeight: "calc(100vh - 73px)",
        }}
      >
        {/* ── LEFT: QUESTIONS ── */}
        <div
          style={{
            borderRight: "1px solid rgba(200,169,110,0.16)",
            padding: "28px 22px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 73px)",
            position: "sticky",
            top: 0,
          }}
        >
          {/* Progress */}
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.44rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(200,169,110,0.35)",
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Case Details</span>
            <span>{answeredCount} / {questions.length}</span>
          </div>
          <div
            style={{
              height: 2,
              background: "rgba(200,169,110,0.08)",
              borderRadius: 2,
              marginBottom: 20,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, var(--gold), var(--gold-lt))",
                borderRadius: 2,
                transition: "width 0.5s ease",
              }}
            />
          </div>

          {/* Questions */}
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              q={q}
              index={i}
              isActive={i === activeQ}
              isAnswered={!!answers[q.id] && i !== activeQ}
              selectedVal={answers[q.id]}
              onSelect={(val) => selectOpt(q.id, val)}
            />
          ))}

          {/* CTA + Reset */}
          {allAnswered && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                width: "100%",
                padding: "14px",
                background: "var(--gold)",
                color: "var(--ink)",
                border: "none",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "0.82rem",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
                marginTop: 12,
                transition: "background 0.2s",
              }}
            >
              Get My Clinical Pathway →
            </button>
          )}

          <button
            onClick={reset}
            style={{
              width: "100%",
              marginTop: 8,
              padding: "9px",
              background: "transparent",
              border: "1px solid rgba(200,169,110,0.14)",
              color: "rgba(200,169,110,0.35)",
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.44rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ↺ &nbsp;Start New Case
          </button>
        </div>

        {/* ── RIGHT: FLOW ── */}
        <div
          ref={flowRef}
          style={{
            padding: "28px 32px 80px",
            overflowY: "auto",
            maxHeight: "calc(100vh - 73px)",
          }}
        >
          {/* Phase 1 */}
          <PhaseHeader label="Phase 01 · Intake" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <FlowNode
              num="01"
              step="01 · Trigger"
              owner="Attorney Firm"
              title={<>Client Signs.<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Case Opens.</em></>}
              body="Client retains the firm. Intake fields captured. Insurance limits lookup initiated."
              state={intakeState()}
              statusText={intakeState() === "complete" ? "Complete" : intakeState() === "active" ? "In Progress" : "Pending"}
              detail={
                a.q1 && a.q4 ? (
                  <>
                    <DetailList items={[
                      `Mechanism: <strong style="color:var(--white)">${{ mva:"Motor vehicle accident", slip:"Slip & fall", assault:"Assault / workplace trauma", sports:"Sports / recreational" }[a.q1] || "—"}</strong>`,
                      `Timing: <strong style="color:var(--white)">${{ same_day:"Same day — acute window open", week:"Within 1 week", month:"Within 1 month", over_month:"Over 1 month" }[a.q4] || "—"}</strong>`,
                    ]} />
                    {urgent
                      ? <Alert type="warn">⚠ Over 1 month post-injury — CognitraxX should be deployed immediately. Acute documentation window is closing.</Alert>
                      : <Alert type="good">✓ Case opened within optimal documentation window.</Alert>
                    }
                  </>
                ) : undefined
              }
            />
            <FlowNode
              num="02"
              step="02 · Screen"
              owner="Valhalla · CognitraxX"
              title={<><em style={{ fontStyle: "italic", color: "var(--gold)" }}>CognitraxX</em><br />Deploys at Intake.</>}
              body="ACRM-compliant TBI screen. 12-minute remote assessment. Report in 24 hours. $500 on lien — $0 if no TBI or no settlement."
              state={cognitraxState()}
              statusText={cognitraxState() === "complete" ? "Complete" : cognitraxState() === "active" ? "Ready to Deploy" : "Pending"}
              detail={
                a.q2 && a.q3 && a.q5 ? (
                  <>
                    <DetailList items={[
                      `LOC: <strong style="color:${loc?"#fca5a5":locPossible?"#fcd34d":"var(--off)"}">${{yes_confirmed:"Endorsed",yes_possible:"Possible",no:"Not reported",unknown:"Not asked"}[a.q2]||"—"}</strong>`,
                      `AOC: <strong style="color:${aoc?"#fca5a5":aocPossible?"#fcd34d":"var(--off)"}">${{yes:"Confirmed",possible:"Possibly",no:"Not reported"}[a.q3]||"—"}</strong>`,
                      `Symptoms: <strong style="color:var(--white)">${{cognitive:"Cognitive",physical:"Physical",emotional:"Emotional",sleep:"Sleep/fatigue",none:"None"}[a.q5]||"—"}</strong>`,
                    ]} />
                    {chiropractor && <Alert type="warn">⚠ Client at chiropractor — CognitraxX deployment is urgent to get ahead of referral delay.</Alert>}
                  </>
                ) : undefined
              }
            />
          </div>

          {/* Phase 2 */}
          <PhaseHeader label="Phase 02 · Classification" />
          <Connector label="24-hour turnaround" />

          <FlowNode
            num="03"
            step="03 · Report"
            owner="Valhalla · Clinical Team"
            title={<>Report Generated.<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Case Classified.</em></>}
            body="Within 24 hours, Valhalla issues the CognitraxX classification report with LOC/AOC/PTA findings and full treatment pathway recommendation."
            state={classifyState()}
            statusText={
              !a.q5 ? "Pending" :
              likelyTBI ? "→ Likely TBI" :
              possibleTBI ? "→ Possible TBI" :
              noTBI ? "No TBI Found" : "Awaiting Data"
            }
            detail={
              a.q5 ? (
                <>
                  <ClassTiles likelyTBI={likelyTBI} possibleTBI={possibleTBI} noTBI={noTBI} />
                  {likelyTBI && <Alert type="warn">LOC or AOC endorsed + symptoms present. <strong>Full workup pathway triggered.</strong></Alert>}
                  {possibleTBI && !likelyTBI && <Alert type="warn">Partial criteria met. <strong>Monitoring initiated.</strong> 30-day re-screen recommended.</Alert>}
                  {noTBI && <Alert type="good">No TBI indicators. <strong>Lien written to $0.</strong> Case continues as soft tissue.</Alert>}
                </>
              ) : undefined
            }
          />

          {/* Phase 3 */}
          <PhaseHeader label="Phase 03 · Diagnosis & Baseline" />
          <Connector label="Likely TBI path" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <FlowNode
              num="04"
              step="04A · Referral"
              owner="Valhalla · Network"
              title={<>Neurologist<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Referral.</em></>}
              body="Board-certified neurologist with TBI specialization. Firm's providers or Valhalla network — fully agnostic."
              state={n(!showPhase3 || !a.q6, false, noTBI, false)}
              statusText={noTBI ? "N/A" : !showPhase3 || !a.q6 ? "Pending" : "Schedule"}
              detail={
                showPhase3 && a.q6 ? (
                  <>
                    <DetailList items={[
                      a.q8 === "neuro" ? "Client already with neurologist — integrate Valhalla tools alongside" : "Valhalla supplies credentialed neurologists in all 41 active states",
                      "CognitraxX report travels with referral — pre-fills diagnostic criteria",
                      priorTBI ? `<span style="color:#fcd34d">Prior TBI noted — P1 baseline is especially critical to establish post-injury floor</span>` : "Formal TBI diagnosis documented with severity classification",
                    ]} />
                  </>
                ) : undefined
              }
            />
            <FlowNode
              num="05"
              step="04B · Baseline"
              owner="Valhalla · NeuroSentinel P1"
              title={<><em style={{ fontStyle: "italic", color: "var(--gold)" }}>NeuroSentinel P1</em><br />Baseline Captured.</>}
              body="Pre-treatment neurocognitive + neurobehavioral snapshot. Proctored, recorded, physician-reviewed. $1,500 on lien."
              state={n(!showPhase3 || !a.q6, false, noTBI, false)}
              statusText={noTBI ? "N/A" : !showPhase3 || !a.q6 ? "Pending" : "Initiate"}
              detail={
                showPhase3 && a.q6 ? (
                  <>
                    <DetailList items={[
                      "12 cognitive domains · 45 minutes · computerized adaptive testing",
                      "PHQ-9, GAD-7, PCL-5, HIT-6, PCS neurobehavioral instruments",
                      "Proctored + recorded — auditable chain of evidence from day one",
                    ]} />
                    {highLimits
                      ? <Alert type="good">✓ High limits — full P1/P2 workup strongly recommended for maximum settlement leverage.</Alert>
                      : lowLimits
                      ? <Alert type="warn">⚠ Low limits — P1 baseline still recommended. Discuss P2 and imaging depth with clinical team.</Alert>
                      : <Alert type="info">✓ P1 baseline initiated. P2 follows treatment completion in 6–8 weeks.</Alert>
                    }
                  </>
                ) : undefined
              }
            />
          </div>

          {/* Phase 4 */}
          <PhaseHeader label="Phase 04 · Treatment" />
          <Connector label="Diagnosis confirmed" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
            <FlowNode
              num="06a"
              step="Treatment A"
              owner="Valhalla · CDL"
              title={<>Clinically<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Deployed Light.</em></>}
              body="Photobiomodulation targeting mitochondrial function. In-home deployment. Every session tracked against P1 baseline."
              state={n(!showTreatment, false, noTBI, false)}
              statusText={noTBI ? "N/A" : !showTreatment ? "Pending" : "Deploy"}
              detail={
                showTreatment ? (
                  <DetailList items={[
                    "Biological reversal — not symptom management",
                    "50,000+ documented treatments",
                    `Target focus: ${a.q5 === "cognitive" ? "neurocognitive deficits" : a.q5 === "physical" ? "neuroinflammation + vestibular" : "full-spectrum recovery"}`,
                  ]} />
                ) : undefined
              }
            />
            <FlowNode
              num="06b"
              step="Treatment B"
              owner="Valhalla · Exosome"
              title={<>Nebulized<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Exosome Therapy.</em></>}
              body="Where indicated. 150B exosomes per dose. Phase 2 IND. $27K per round — $324K annual life care value."
              state={n(!showTreatment, !exosomeOk && showTreatment, noTBI, false)}
              statusText={noTBI ? "N/A" : !showTreatment ? "Pending" : exosomeOk ? "Indicated" : "Review Limits"}
              detail={
                showTreatment ? (
                  <>
                    <DetailList items={["$27,000 per round (3 treatments)", "$324,000 annual future care — life care plan", "FDA IND pathway active · ethically sourced"]} />
                    {exosomeOk
                      ? <Alert type="good">✓ High limits / litigation goal — exosome strongly indicated. Significant life care plan value.</Alert>
                      : <Alert type="warn">⚠ Review policy limits before deploying exosome protocol. Discuss with Valhalla clinical team.</Alert>
                    }
                  </>
                ) : undefined
              }
            />
            <FlowNode
              num="06c"
              step="Treatment C"
              owner="Valhalla · Network"
              title={<>Multidisciplinary<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Rehab.</em></>}
              body="Vestibular, ocular motor, CBT, EMDR, ART. Coordinated by Valhalla. All sessions documented with quantitative outcomes."
              state={n(!showTreatment, false, noTBI, false)}
              statusText={noTBI ? "N/A" : !showTreatment ? "Pending" : "Coordinate"}
              detail={
                showTreatment ? (
                  <DetailList items={[
                    a.q5 === "physical" ? "Vestibular + neuro-ocular motor therapy — priority given reported physical symptoms" :
                    a.q5 === "emotional" ? "CBT, EMDR, ART trauma protocols — priority given emotional/mood symptoms" :
                    a.q5 === "sleep" ? "Sleep disorder screening + fatigue management — priority given sleep symptoms" :
                    "Full multidisciplinary rehabilitation protocol",
                    "Unified treatment record — all providers coordinated by Valhalla",
                  ]} />
                ) : undefined
              }
            />
          </div>

          {/* Phase 5 */}
          <PhaseHeader label="Phase 05 · Documentation" />
          <Connector label="Treatment cycle complete · 6–8 weeks" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <FlowNode
              num="07"
              step="05A · Outcome"
              owner="Valhalla · NeuroSentinel P2"
              title={<><em style={{ fontStyle: "italic", color: "var(--gold)" }}>NeuroSentinel P2.</em><br />The Delta.</>}
              body="Post-treatment comparison across all 12 cognitive domains + 8 neurobehavioral instruments. Adaptive testing eliminates practice effect."
              state={n(!showTreatment || !a.q9, false, noTBI, false)}
              statusText={noTBI ? "N/A" : !showTreatment ? "Pending" : !a.q9 ? "After Treatment" : "Post-Treatment"}
              detail={
                showTreatment && a.q9 ? (
                  <>
                    <DetailList items={[
                      "Same adaptive instrument as P1 — practice effect eliminated as defense argument",
                      "Visual P1/P2 comparison report — juries understand it without a science degree",
                      forTrial ? `<span style="color:#c8a96e">Litigation goal — P2 is essential. Direct answer to "why pay for treatment that doesn't work"</span>` : "P2 demonstrates treatment efficacy with objective data",
                    ]} />
                    <Alert type="good">✓ P2 administered ~6–8 weeks post-treatment. Scheduled alongside final sessions.</Alert>
                  </>
                ) : undefined
              }
            />
            <FlowNode
              num="08"
              step="05B · Imaging"
              owner="Valhalla · Imaging"
              title={<>DTI &amp; SWI<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Timed Right.</em></>}
              body="Optimal window 5–9 months post-injury. DTI detects white matter tract damage. SWI irrefutably connects structure to trauma event."
              state={n(!showTreatment || !a.q9, urgent && showTreatment, noTBI, false)}
              statusText={noTBI ? "N/A" : !showTreatment ? "Pending" : urgent ? "Urgent" : !a.q9 ? "Schedule" : "Schedule"}
              detail={
                showTreatment && a.q9 ? (
                  <>
                    <DetailList items={[
                      `Optimal window: <strong style="color:var(--white)">${urgent ? "Order immediately — window is running late" : "5–9 months from incident date"}</strong>`,
                      "Tesla 3.0 minimum · tight slice protocol (4-skip-2 or tighter)",
                      forTrial ? `<span style="color:#c8a96e">Litigation goal — DTI + SWI strongly recommended regardless of initial symptom severity</span>` : "Valhalla coordinates neuroradiologist referral and protocol specs",
                    ]} />
                    {urgent
                      ? <Alert type="warn">⚠ Over 1 month at intake — order DTI promptly. Document subjective symptoms now as a bridge record.</Alert>
                      : <Alert type="good">✓ Imaging timing on track. Valhalla coordinates neuroradiologist referral and protocol specifications.</Alert>
                    }
                  </>
                ) : undefined
              }
            />
          </div>

          {/* Phase 6 */}
          <PhaseHeader label="Phase 06 · Court-Ready Record" />
          <Connector label="Complete record assembled" />

          <FlowNode
            num="09"
            step="06 · Resolution"
            owner="Attorney Firm + Valhalla"
            title={<>Complete Record.<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Defense Has No Answer.</em></>}
            body="CTX report + P1 baseline + P2 delta + DTI/SWI imaging. Physician-reviewed. Traceable to 50,000-treatment dataset. IRB studied. Built for mediation or trial."
            state={n(!showTreatment || !a.q9, false, noTBI, false)}
            statusText={noTBI ? "N/A" : !showTreatment || !a.q9 ? "Pending" : "Building"}
            detail={
              showTreatment && a.q9 ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 2,
                      marginBottom: 10,
                    }}
                  >
                    {[
                      { abbr: "CTX", label: "CognitraxX Report",      body: "Acute LOC/AOC/PTA documentation from day one" },
                      { abbr: "P1",  label: "NeuroSentinel Baseline",  body: "Pre-treatment neurocognitive + neurobehavioral" },
                      { abbr: "P2",  label: "NeuroSentinel Delta",     body: "Post-treatment comparison — objective proof" },
                      { abbr: "IMG", label: "DTI + SWI Imaging",       body: "Structural evidence timed to optimal window" },
                    ].map((item) => (
                      <div
                        key={item.abbr}
                        style={{
                          background: "var(--dark)",
                          border: "1px solid rgba(200,169,110,0.1)",
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "1.2rem",
                            color: "var(--gold)",
                            lineHeight: 1,
                            marginBottom: 4,
                          }}
                        >
                          {item.abbr}
                        </div>
                        <div
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "0.4rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--off)",
                            marginBottom: 5,
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "0.68rem",
                            color: "rgba(184,180,171,0.6)",
                            lineHeight: 1.5,
                          }}
                        >
                          {item.body}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Alert type="good">✓ Complete Valhalla clinical package. Defense has no answer for objective pre/post data backed by 50,000-treatment dataset.</Alert>
                </>
              ) : undefined
            }
          />

          {/* Summary bar */}
          {allAnswered && showTreatment && (
            <div
              style={{
                marginTop: 32,
                padding: "20px 24px",
                background: "rgba(200,169,110,0.04)",
                border: "1px solid rgba(200,169,110,0.16)",
                borderTop: "2px solid var(--gold)",
                display: "flex",
                gap: 20,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  val: likelyTBI ? "LIKELY" : possibleTBI ? "POSSIBLE" : "NONE",
                  lbl: "TBI Classification",
                },
                {
                  val: likelyTBI && (loc || aoc) && !lowLimits ? "Strong" : likelyTBI ? "Good" : "Developing",
                  lbl: "Case Strength",
                },
                {
                  val: likelyTBI ? (highLimits || forTrial ? "$3,500+" : lowLimits ? "$500" : "$2,000") : "$500",
                  lbl: "Est. Valhalla Lien",
                },
                {
                  val: urgent || chiropractor ? "Act Now" : a.q4 === "month" ? "Prompt" : "On Track",
                  lbl: "Urgency",
                },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "1.5rem",
                      color: "var(--gold)",
                      lineHeight: 1,
                    }}
                  >
                    {item.val}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.4rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(200,169,110,0.35)",
                    }}
                  >
                    {item.lbl}
                  </div>
                </div>
              ))}
              <div
                style={{
                  flex: 1,
                  minWidth: 200,
                  height: 1,
                  background: "rgba(200,169,110,0.12)",
                  margin: "0 4px",
                }}
              />
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: "12px 24px",
                  background: "var(--gold)",
                  color: "var(--ink)",
                  border: "none",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Get Full Pathway →
              </button>
            </div>
          )}

          {/* No-TBI outcome */}
          {noTBI && a.q5 && (
            <div
              style={{
                marginTop: 24,
                padding: "20px 24px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderTop: "2px solid rgba(60,180,100,0.5)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  color: "rgba(100,220,140,0.85)",
                  marginBottom: 8,
                }}
              >
                No TBI Indicators at This Time
              </div>
              <p
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 300,
                  color: "var(--off)",
                  lineHeight: 1.7,
                }}
              >
                Based on the case profile provided, CognitraxX does not indicate TBI criteria at this time.
                The lien is written to $0 — no cost to your firm. The case continues as soft tissue. If
                symptoms develop or the client reports new neurological complaints within 30 days, re-deploy
                CognitraxX at no additional charge.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
