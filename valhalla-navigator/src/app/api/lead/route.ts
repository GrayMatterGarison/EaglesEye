import { NextRequest, NextResponse } from "next/server";

type AnswerMap = Record<string, string>;

function lookup(map: AnswerMap, key: string, fallback = "—"): string {
  return map[key] ?? fallback;
}

const mechanismMap: AnswerMap = {
  mva: "Motor vehicle accident",
  slip: "Slip & fall",
  assault: "Assault / workplace trauma",
  sports: "Sports / recreational",
};
const locMap: AnswerMap = {
  yes_confirmed: "Endorsed by client",
  yes_possible: "Possible — memory gap",
  no: "Not reported",
  unknown: "Not yet asked",
};
const aocMap: AnswerMap = {
  yes: "Confirmed confusion/daze",
  possible: "Possibly",
  no: "Not reported",
};
const timingMap: AnswerMap = {
  same_day: "Same day",
  week: "Within 1 week",
  month: "Within 1 month",
  over_month: "Over 1 month — urgent",
};
const symptomsMap: AnswerMap = {
  cognitive: "Cognitive impairment",
  physical: "Physical symptoms",
  emotional: "Emotional/mood changes",
  sleep: "Sleep & fatigue",
  none: "None reported",
};
const limitsMap: AnswerMap = {
  unknown: "Unknown",
  low: "Low / minimum",
  moderate: "$100K–$500K",
  high: "High / commercial",
};
const priorMap: AnswerMap = {
  none: "None",
  possible: "Possible prior",
  yes: "Documented prior TBI",
};
const treatmentMap: AnswerMap = {
  no: "None",
  chiro: "Chiropractic only",
  ortho: "Orthopedic / pain mgmt",
  neuro: "Already with neurologist",
};
const goalMap: AnswerMap = {
  pre_settle: "Maximize settlement",
  litigation: "Litigation / trial",
  care: "Client care",
  explore: "Exploring TBI",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firmName, attorneyName, email, phone, caseData } = body;

    if (!email || !firmName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const answers = (caseData.answers ?? {}) as AnswerMap;
    const { likelyTBI, possibleTBI, noTBI } = caseData;
    const steps: Array<{ title: string; body: string }> = caseData.summary?.steps ?? [];

    const classification = likelyTBI
      ? "LIKELY TBI"
      : possibleTBI
      ? "POSSIBLE TBI"
      : "NO TBI INDICATED";

    const badgeClass = likelyTBI ? "likely" : possibleTBI ? "possible" : "none";

    const stepsHtml = steps
      .map(
        (s) => `<div class="rec-item"><strong>${s.title}</strong>${s.body}</div>`
      )
      .join("");

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#0C0C0A;color:#F5F2EC;margin:0;padding:0}
  .wrap{max-width:620px;margin:0 auto;padding:40px 32px}
  .logo{font-size:24px;letter-spacing:.18em;color:#C8A96E;font-weight:700;margin-bottom:4px}
  .logo-sub{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(200,169,110,.4);margin-bottom:32px}
  .badge{display:inline-block;padding:6px 14px;font-size:12px;letter-spacing:.15em;text-transform:uppercase;font-weight:600;border-radius:3px;margin-bottom:24px}
  .badge.likely{background:rgba(220,60,60,.2);color:#fca5a5;border:1px solid rgba(220,60,60,.35)}
  .badge.possible{background:rgba(230,160,60,.2);color:#fcd34d;border:1px solid rgba(230,160,60,.35)}
  .badge.none{background:rgba(255,255,255,.06);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.1)}
  h1{font-size:28px;font-weight:300;color:#F5F2EC;line-height:1.2;margin-bottom:8px}
  h1 em{font-style:italic;color:#C8A96E}
  .divider{height:1px;background:rgba(200,169,110,.15);margin:28px 0}
  .section-label{font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(200,169,110,.4);margin-bottom:12px}
  table{width:100%;border-collapse:collapse;margin-bottom:8px}
  td{padding:9px 12px;font-size:13px;border-bottom:1px solid rgba(200,169,110,.08)}
  td:first-child{color:rgba(200,169,110,.55);width:45%;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
  td:last-child{color:#F5F2EC;font-weight:500}
  .rec-item{padding:10px 14px;margin-bottom:5px;background:rgba(200,169,110,.06);border-left:2px solid rgba(200,169,110,.35);font-size:13px;color:#B8B4AB;line-height:1.5}
  .rec-item strong{color:#F5F2EC;display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px}
  .cta{display:block;background:#C8A96E;color:#0C0C0A;text-decoration:none;padding:14px 28px;text-align:center;font-size:13px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-top:28px}
  .footer{margin-top:36px;font-size:11px;color:rgba(200,169,110,.3);letter-spacing:.1em;line-height:1.9}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">VALHALLA</div>
  <div class="logo-sub">Performance Medicine · New Lead</div>
  <span class="badge ${badgeClass}">${classification}</span>
  <h1>New case from <em>${firmName}</em></h1>
  <div class="divider"></div>
  <div class="section-label">Attorney Contact</div>
  <table>
    <tr><td>Firm</td><td>${firmName}</td></tr>
    <tr><td>Attorney</td><td>${attorneyName || "—"}</td></tr>
    <tr><td>Email</td><td>${email}</td></tr>
    <tr><td>Phone</td><td>${phone || "—"}</td></tr>
  </table>
  <div class="divider"></div>
  <div class="section-label">Case Profile</div>
  <table>
    <tr><td>Mechanism</td><td>${lookup(mechanismMap, answers.q1)}</td></tr>
    <tr><td>LOC Status</td><td>${lookup(locMap, answers.q2)}</td></tr>
    <tr><td>AOC Status</td><td>${lookup(aocMap, answers.q3)}</td></tr>
    <tr><td>Time to Intake</td><td>${lookup(timingMap, answers.q4)}</td></tr>
    <tr><td>Symptoms</td><td>${lookup(symptomsMap, answers.q5)}</td></tr>
    <tr><td>Insurance Limits</td><td>${lookup(limitsMap, answers.q6)}</td></tr>
    <tr><td>Prior TBI</td><td>${lookup(priorMap, answers.q7)}</td></tr>
    <tr><td>Current Treatment</td><td>${lookup(treatmentMap, answers.q8)}</td></tr>
    <tr><td>Case Goal</td><td>${lookup(goalMap, answers.q9)}</td></tr>
  </table>
  <div class="divider"></div>
  <div class="section-label">Recommended Next Steps</div>
  ${stepsHtml}
  <a href="mailto:${email}" class="cta">Reply to ${firmName} →</a>
  <div class="footer">
    Valhalla Health · TBI Case Navigator Lead<br>
    performance@valhallahealth.com · valhallahealth.com<br>
    IRB Studied · SaMD / FDA Pathway · 50,000+ Treatments · 41 States
  </div>
</div>
</body>
</html>`;

    const confirmHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#0C0C0A;color:#F5F2EC;margin:0;padding:0}
  .wrap{max-width:580px;margin:0 auto;padding:40px 32px}
  .logo{font-size:22px;letter-spacing:.18em;color:#C8A96E;font-weight:700;margin-bottom:4px}
  .logo-sub{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(200,169,110,.4);margin-bottom:32px}
  h1{font-size:26px;font-weight:300;color:#F5F2EC;line-height:1.25;margin-bottom:16px}
  h1 em{font-style:italic;color:#C8A96E}
  p{font-size:14px;line-height:1.75;color:#A8A49B;margin-bottom:14px}
  p strong{color:#F5F2EC}
  .divider{height:1px;background:rgba(200,169,110,.15);margin:24px 0}
  .badge{display:inline-block;padding:5px 12px;font-size:11px;letter-spacing:.15em;text-transform:uppercase;font-weight:600;border-radius:2px;background:rgba(200,169,110,.12);color:#C8A96E;border:1px solid rgba(200,169,110,.25);margin-bottom:22px}
  .footer{margin-top:32px;font-size:11px;color:rgba(200,169,110,.3);letter-spacing:.1em;line-height:2}
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">VALHALLA</div>
  <div class="logo-sub">Performance Medicine</div>
  <span class="badge">Case Received — ${classification}</span>
  <h1>We have your case,<br><em>${attorneyName || firmName}.</em></h1>
  <p>Your TBI case pathway has been generated and our clinical team has been notified. A Valhalla clinical director will be in touch within one business day to walk through the recommended next steps.</p>
  <p><strong>Classification: ${classification}</strong></p>
  <div class="divider"></div>
  <p style="font-size:13px">Urgent questions? Contact us directly:</p>
  <p style="font-size:13px"><strong>performance@valhallahealth.com</strong><br>IRB Studied · SaMD / FDA Pathway · 50,000+ Treatments · 41 States · Lien-Based</p>
  <div class="footer">Valhalla Performance Medicine<br>performance@valhallahealth.com · valhallahealth.com</div>
</div>
</body>
</html>`;

    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL || "performance@valhallahealth.com";

    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Valhalla Navigator <leads@valhallahealth.com>",
        to: [notifyEmail],
        replyTo: email,
        subject: `[Navigator Lead] ${classification} — ${firmName} — ${attorneyName || email}`,
        html: emailHtml,
      });

      await resend.emails.send({
        from: "Valhalla Health <performance@valhallahealth.com>",
        to: [email],
        subject: "Your Valhalla TBI case pathway — we'll be in touch shortly",
        html: confirmHtml,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
