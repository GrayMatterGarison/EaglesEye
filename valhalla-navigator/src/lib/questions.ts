export type Option = {
  val: string;
  label: string;
  badge?: string;
};

export type Question = {
  id: string;
  num: string;
  title: string;
  hint?: string;
  options: Option[];
};

export const questions: Question[] = [
  {
    id: "q1",
    num: "01 / 09",
    title: "What was the mechanism of injury?",
    hint: "Select the incident type",
    options: [
      { val: "mva",     label: "Motor vehicle accident",       badge: "Most common" },
      { val: "slip",    label: "Slip & fall",                  badge: "" },
      { val: "assault", label: "Assault / workplace trauma",   badge: "" },
      { val: "sports",  label: "Sports / recreational",        badge: "" },
    ],
  },
  {
    id: "q2",
    num: "02 / 09",
    title: "Did the client report any loss of consciousness?",
    hint: "LOC — ACRM 2023 criterion",
    options: [
      { val: "yes_confirmed", label: "Yes — confirmed by client",     badge: "LOC Endorsed" },
      { val: "yes_possible",  label: "Possible — gap in memory",      badge: "Review" },
      { val: "no",            label: "No loss of consciousness",       badge: "" },
      { val: "unknown",       label: "Unknown / not yet asked",        badge: "" },
    ],
  },
  {
    id: "q3",
    num: "03 / 09",
    title: "Was there alteration or confusion immediately after impact?",
    hint: "AOC — feeling dazed, disoriented, foggy",
    options: [
      { val: "yes",      label: "Yes — confirmed confusion or daze",  badge: "AOC Endorsed" },
      { val: "possible", label: "Possibly — client unsure",           badge: "" },
      { val: "no",       label: "No alteration reported",             badge: "" },
    ],
  },
  {
    id: "q4",
    num: "04 / 09",
    title: "How soon after the incident is the client signing?",
    hint: "Time from accident to intake — affects acute documentation window",
    options: [
      { val: "same_day",   label: "Same day or next day",     badge: "Ideal" },
      { val: "week",       label: "Within 1 week",            badge: "Good" },
      { val: "month",      label: "Within 1 month",           badge: "Workable" },
      { val: "over_month", label: "Over 1 month post-injury", badge: "Act fast" },
    ],
  },
  {
    id: "q5",
    num: "05 / 09",
    title: "What symptoms is the client currently reporting?",
    hint: "Select the most significant",
    options: [
      { val: "cognitive", label: "Memory loss, word-finding, concentration", badge: "" },
      { val: "physical",  label: "Headaches, dizziness, visual changes",     badge: "" },
      { val: "emotional", label: "Mood changes, irritability, anxiety",      badge: "" },
      { val: "sleep",     label: "Sleep disruption, fatigue",                badge: "" },
      { val: "none",      label: "No significant symptoms reported",         badge: "" },
    ],
  },
  {
    id: "q6",
    num: "06 / 09",
    title: "What are the available insurance limits?",
    hint: "Helps determine workup depth and treatment recommendations",
    options: [
      { val: "unknown",  label: "Unknown — limits lookup pending",  badge: "" },
      { val: "low",      label: "Low / minimum limits only",        badge: "" },
      { val: "moderate", label: "Moderate — $100K–$500K",          badge: "" },
      { val: "high",     label: "High / commercial policy",         badge: "Full workup" },
    ],
  },
  {
    id: "q7",
    num: "07 / 09",
    title: "Has the client had any prior head injuries or TBI history?",
    hint: "Pre-injury baseline affects NeuroSentinel scoring",
    options: [
      { val: "none",     label: "No prior head injuries",            badge: "Clean baseline" },
      { val: "possible", label: "Possible — sports or minor prior",  badge: "Note" },
      { val: "yes",      label: "Yes — documented prior TBI",        badge: "Flag" },
    ],
  },
  {
    id: "q8",
    num: "08 / 09",
    title: "Is the client currently treating with a provider?",
    hint: "Affects referral pathway and documentation timing",
    options: [
      { val: "no",    label: "No current treatment",             badge: "" },
      { val: "chiro", label: "Yes — chiropractic only",          badge: "TBI screening urgent" },
      { val: "ortho", label: "Yes — orthopedic / pain mgmt",     badge: "" },
      { val: "neuro", label: "Already with neurologist",         badge: "Integrate" },
    ],
  },
  {
    id: "q9",
    num: "09 / 09",
    title: "What is the primary case goal?",
    hint: "Determines documentation depth and life care plan strategy",
    options: [
      { val: "pre_settle", label: "Maximize pre-settlement value",    badge: "Most common" },
      { val: "litigation", label: "Preparing for litigation / trial", badge: "Full workup" },
      { val: "care",       label: "Client care is primary concern",   badge: "" },
      { val: "explore",    label: "Exploring if TBI is present",      badge: "" },
    ],
  },
];

export type Answers = Record<string, string>;

export function classify(a: Answers) {
  const loc = a.q2 === "yes_confirmed";
  const locPossible = a.q2 === "yes_possible";
  const aoc = a.q3 === "yes";
  const aocPossible = a.q3 === "possible";
  const hasSymptoms = a.q5 && a.q5 !== "none";
  const noSymptoms = a.q5 === "none";

  const likelyTBI = !!(loc || (locPossible && aoc) || (aoc && hasSymptoms));
  const possibleTBI = !!((!likelyTBI) && (locPossible || aoc || aocPossible || !!hasSymptoms));
  const noTBI = !!(a.q2 === "no" && a.q3 === "no" && noSymptoms);

  return { likelyTBI, possibleTBI, noTBI };
}

export const mechanismLabels: Record<string, string> = {
  mva: "Motor vehicle accident",
  slip: "Slip & fall",
  assault: "Assault / workplace trauma",
  sports: "Sports / recreational",
};

export const timingLabels: Record<string, string> = {
  same_day: "Same day — acute window open",
  week: "Within 1 week",
  month: "Within 1 month",
  over_month: "Over 1 month — act immediately",
};

export const limitsLabels: Record<string, string> = {
  unknown: "Unknown",
  low: "Low / minimum",
  moderate: "$100K–$500K",
  high: "High / commercial",
};
