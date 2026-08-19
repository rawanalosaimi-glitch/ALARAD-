import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Bell,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Crosshair,
  Gauge,
  MessageCircle,
  Menu,
  Radio,
  Send,
  Siren,
  Shield,
  ShieldCheck,
  Signal,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

type Alert = {
  id: number;
  severity: "Critical" | "Watch";
  title: string;
  detail: string;
  location: string;
  time: string;
  action: string;
};

const initialAlerts: Alert[] = [
  {
    id: 1,
    severity: "Critical",
    title: "Scatter exposure rising",
    detail: "Dr. Noura Al-Harbi is projected to cross her procedure threshold in 18 min.",
    location: "Cath Lab 03 · PCI",
    time: "2 min ago",
    action: "Move to shielded position",
  },
  {
    id: 2,
    severity: "Watch",
    title: "Coverage gap detected",
    detail: "Two staff members are inside CT-2 while the scheduled rotation is overdue.",
    location: "Imaging · CT-2",
    time: "11 min ago",
    action: "Review rotation",
  },
  {
    id: 3,
    severity: "Watch",
    title: "Dosimeter sync delayed",
    detail: "Badge R-184 has not reported contextual data for 7 minutes.",
    location: "Nuclear Medicine · Hot Lab",
    time: "14 min ago",
    action: "Check device",
  },
];

const navItems = ["Command center", "Exposure map", "People & rotations", "Audit log"];

type DosePeriod = "Today" | "This week" | "This month" | "This year";

type DoseSummary = {
  total: string;
  unit: string;
  budget: string;
  change: string;
  rate: string;
  bars: number[];
};

const doseSummaries: Record<DosePeriod, DoseSummary> = {
  Today: { total: "0.42", unit: "mSv", budget: "1.00 mSv", change: "6% below expected", rate: "12.8 µSv/h", bars: [26, 35, 31, 48, 42, 58, 44, 62, 54, 70, 65, 52] },
  "This week": { total: "2.10", unit: "mSv", budget: "5.00 mSv", change: "12% below expected", rate: "10.4 µSv/h avg", bars: [34, 42, 38, 58, 49, 63, 57, 66, 52, 68, 61, 73] },
  "This month": { total: "8.40", unit: "mSv", budget: "20.00 mSv", change: "9% below expected", rate: "9.7 µSv/h avg", bars: [42, 48, 55, 46, 62, 51, 66, 59, 72, 64, 69, 76] },
  "This year": { total: "86.70", unit: "mSv", budget: "240.00 mSv", change: "14% below expected", rate: "8.9 µSv/h avg", bars: [38, 44, 47, 51, 58, 54, 63, 68, 61, 72, 70, 78] },
};

type AiMessage = {
  role: "assistant" | "user";
  text: string;
  sources?: KnowledgeSource[];
};

type KnowledgeSource = {
  title: string;
  url: string;
  keywords: string[];
  answer: string;
};

const knowledgeBase: KnowledgeSource[] = [
  { title: "NRRC — Compliance with Dose Limits", url: "https://istitlaa.ncc.gov.sa/ar/energy/nrrc/compliancewithdoeslimits/Documents/Compliance%20with%20Dose%20Limits-NRRC-R-01-SR02.pdf", keywords: ["dose limit", "dose limits", "limit", "حد الجرعة", "حدود الجرعات", "جرعة"], answer: "Dose-limit decisions should follow the applicable NRRC requirements and the hospital’s approved radiation-protection program. ALARAD can flag proximity to a configured limit, but the Radiation Safety Officer must confirm the applicable limit and action." },
  { title: "IAEA GSR Part 3 — Radiation Protection and Safety", url: "https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1578_web-57265295.pdf", keywords: ["radiation protection", "safety", "ionizing", "protection", "الحماية من الإشعاع", "السلامة"], answer: "IAEA GSR Part 3 provides the international framework for radiation protection and safety of radiation sources. In this prototype, it supports the principles of monitoring, controlled exposure, optimization, and human review." },
  { title: "IAEA SSG-46 — Medical Uses of Ionizing Radiation", url: "https://www.iaea.org/publications/11102/radiation-protection-andsafety-in-medical-uses-of-ionizing-radiation", keywords: ["medical", "hospital", "clinical", "procedure", "medical uses", "طبي", "مستشفى", "إجراء"], answer: "IAEA SSG-46 addresses radiation protection and safety in medical uses of ionizing radiation, including responsibilities, monitoring, optimization, and safe clinical practice." },
  { title: "NRRC — Nuclear Regulations and Executive Regulations", url: "https://nrrc.gov.sa/en/legal-framework/nuclear-regulations-and-executiveregulations/", keywords: ["nrrc", "regulation", "regulations", "legal", "law", "نظام", "لائحة", "الهيئة"], answer: "The NRRC legal framework is the authoritative Saudi reference for nuclear and radiation regulations. Any operational escalation or compliance decision should be checked against the current NRRC requirements." },
  { title: "NRRC — Quality Control for Medical Radiological Equipment", url: "https://istitlaa.ncc.gov.sa/en/energy/nrrc/establishmentandimplementationofqcprogram/Documents/Establishment%20and%20Implementation%20of%20Quality%20Control%20(QC)%20Program%20for%20Medical%20Radiological%20Equipment-2025_Istitlaa.pdf", keywords: ["quality control", "qc", "equipment", "calibration", "جودة", "معايرة", "معدات"], answer: "The NRRC quality-control reference covers establishment and implementation of QC programs for medical radiological equipment. A suspected unexpected dose increase should be investigated with equipment and shielding checks by qualified staff." },
  { title: "JKSUS — Occupational Radiation Exposure in Saudi MOH Hospitals", url: "https://jksus.org/occupational-radiationexposure-among-diagnostic-radiology-workers-in-the-saudi-ministry-of-health-hospitals-and-medical-centers-a-five-year-national-retrospective-study/", keywords: ["occupational", "worker", "workers", "staff", "employee", "exposure study", "موظف", "عامل", "العاملين"], answer: "This five-year Saudi MOH study provides context on occupational radiation exposure among diagnostic-radiology workers. It supports ALARAD’s focus on staff trends, rotations, and early warnings rather than waiting for a limit breach." },
  { title: "NCA — Operational Technology Cybersecurity Controls", url: "https://cdn.nca.gov.sa/api/files/public/upload/071d52fc-014b-4f15-84ce-1289f3f5c3a9_Operational-Technology-Cybersecurity-Controls-Methodogy-andMapping-Annex.pdf", keywords: ["cyber", "cybersecurity", "security", "operational technology", "ot", "أمن", "سيبراني", "الأمن السيبراني"], answer: "The NCA OT cybersecurity controls reference is relevant to protecting connected monitoring and hospital operational technology. ALARAD should use access control, logging, secure integrations, and incident handling around device data." },
  { title: "SDAIA/NDMO — Data Management and Personal Data Protection Standards", url: "https://sdaia.gov.sa/ndmo/Files/PoliciesEn001.pdf?utm_source=chatgpt.com", keywords: ["data", "privacy", "personal", "governance", "patient", "بيانات", "خصوصية", "حوكمة", "مريض"], answer: "SDAIA/NDMO standards are the relevant reference for data management and personal-data protection. Patient and staff data should be minimized, access-controlled, auditable, and handled according to the hospital’s approved governance process." },
  { title: "ICRP Publication 103 — Recommendations", url: "https://www.icrp.org/docs/icrp_publication_103-annals_of_the_icrp_37(2-4)-free_extract.pdf", keywords: ["icrp", "optimization", "justification", "alara", "principle", "تحسين", "تبرير"], answer: "ICRP Publication 103 is a foundational reference for radiation-protection recommendations, including justification, optimization, and keeping exposure as low as reasonably achievable (ALARA)." },
  { title: "ITU AI Ready — Readiness Framework Report 2.0", url: "https://www.itu.int/dms_pub/itu-t/opb/ai4g/T-AI4GAI4GOOD-2025-6-PDF-E.pdf", keywords: ["ai readiness", "readiness", "governance", "fairness", "ai", "ذكاء اصطناعي", "جاهزية", "إنصاف"], answer: "The ITU AI Ready framework supports assessing AI readiness through governance, people, data, infrastructure, and responsible-use practices. ALARAD keeps recommendations explainable and subject to human review." },
  { title: "ITU AI for Good — Saudi AI Readiness Hackathon", url: "https://aiforgood.itu.int/event/ai-readiness-hackathon-kingdom-of-saudiarabia/", keywords: ["hackathon", "itu", "ai for good", "هاكاثون", "الاتحاد"], answer: "The ITU AI for Good hackathon page is the official event reference for the Saudi AI-readiness challenge that motivated this ALARAD prototype." },
];

function getAssistantReply(question: string, anomalyState: "stable" | "detected" | "escalated"): { text: string; sources?: KnowledgeSource[] } {
  const normalized = question.toLowerCase();
  const rankedSources = knowledgeBase
    .map((source) => ({ source, score: source.keywords.reduce((score, keyword) => score + (normalized.includes(keyword) ? (keyword.length > 5 ? 2 : 1) : 0), 0) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ source }) => source);
  if (rankedSources.length > 0) return { text: rankedSources.map((source) => source.answer).join(" "), sources: rankedSources };
  if (normalized.includes("leak") || normalized.includes("تسرب")) {
    return { text: anomalyState === "stable"
      ? "No confirmed leak pattern is active. The current rate is 12.8 µSv/h and the 15-minute forecast is 0.08 mSv. Run the AI leak check, then ask the Radiation Safety Officer to review any anomaly before escalation."
      : "A possible leak pattern is under review in Cath Lab 03. The calculated rate is 28.4 µSv/h with a 15-minute forecast of 0.18 mSv. Inspect shielding and equipment, then escalate to the Radiation Safety Officer." };
  }
  if (normalized.includes("dose") || normalized.includes("جرع") || normalized.includes("safe")) {
    return { text: "The current demo snapshot is 0.42 mSv today, 2.10 mSv this week, 8.40 mSv this month, and 86.70 mSv this year. These are illustrative values and must be replaced with calibrated dosimeter data and approved limits before clinical use." };
  }
  if (normalized.includes("risk") || normalized.includes("خطر")) {
    return { text: "The current risk index is 34 with a stable trend across 42 active staff. The highest-priority signal is rising scatter exposure in Cath Lab 03, where a shielded-position rotation is recommended." };
  }
  return { text: "I could not find a matching topic in the linked ALARAD Knowledge Base. I can summarize dose totals, explain the current risk, check for a possible leak pattern, or suggest the next safety action. Ask about dose limits, radiation protection, equipment QC, privacy, cybersecurity, or AI governance." };
}

function RiskRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 41;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90 h-full w-full">
        <circle cx="50" cy="50" r="41" fill="none" stroke="#dbe7e5" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke="#e28a42"
          strokeLinecap="round"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-bold text-[#123d45]">{value}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#688489]">risk index</span>
      </div>
    </div>
  );
}

function DoseSnapshot({ period, onPeriodChange }: { period: DosePeriod; onPeriodChange: (period: DosePeriod) => void }) {
  const summary = doseSummaries[period];
  const periodEntries = Object.entries(doseSummaries) as [DosePeriod, DoseSummary][];

  return (
    <section className="rounded-2xl border border-[#dbe7e2] bg-white p-5 shadow-[0_8px_25px_rgba(31,78,75,.04)] md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#3c8a6e]" />
            <h3 className="text-lg font-bold tracking-tight">Dose totals</h3>
          </div>
          <p className="mt-1 text-xs text-[#78918f]">Cumulative exposure against the configured safety budget.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#78918f]"><CalendarDays size={14} /> Updated 10:42 AST</div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {periodEntries.map(([name, value]) => (
          <button key={name} onClick={() => onPeriodChange(name)} className={`rounded-xl border p-3 text-left transition-all ${period === name ? "border-[#8fc4b1] bg-[#edf8f2] shadow-sm" : "border-[#e6efeb] bg-[#fbfdfc] hover:border-[#b8d8ca]"}`}>
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#76908d]">{name}</p>
            <p className="mt-2 font-mono text-xl font-bold tracking-tight text-[#173f46]">{value.total} <span className="font-sans text-xs font-semibold text-[#78918f]">{value.unit}</span></p>
            <p className="mt-1 text-[10px] font-semibold text-[#3f876c]">{value.change}</p>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 border-t border-[#edf2ef] pt-5 md:grid-cols-[.85fr_1.15fr] md:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#668582]">{period} snapshot</p>
          <div className="mt-2 flex items-baseline gap-2"><span className="font-mono text-4xl font-bold tracking-[-.05em] text-[#173f46]">{summary.total}</span><span className="text-sm font-semibold text-[#78918f]">{summary.unit} / {summary.budget} budget</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7efeb]"><div className="h-full rounded-full bg-[#4e9d7d] transition-all duration-500" style={{ width: `${Math.min(100, (Number(summary.total) / Number(summary.budget.split(" ")[0])) * 100)}%` }} /></div>
          <div className="mt-2 flex justify-between text-[11px] text-[#78918f]"><span>Within guardrails</span><span className="font-mono">{summary.rate}</span></div>
        </div>
        <div className="flex h-24 items-end gap-1.5 rounded-xl bg-[#f5faf7] px-4 pb-3 pt-4">
          {summary.bars.map((bar, index) => <div key={`${period}-${index}`} className="flex-1 rounded-t-md bg-[#8fc4b1] transition-all duration-500" style={{ height: `${bar}%`, opacity: index === summary.bars.length - 1 ? 1 : .55 + index / 30 }} />)}
        </div>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-[#879b98]">Illustrative prototype values. Calibrated dosimeter data and approved dose limits should be connected before clinical use.</p>
    </section>
  );
}

function WorkspacePanel({ activeNav, onBack, onOpenAi }: { activeNav: string; onBack: () => void; onOpenAi: () => void }) {
  const panelCopy = {
    "Exposure map": {
      eyebrow: "Live room telemetry",
      title: "See where exposure is building.",
      detail: "Room-level signals combine dose-rate, scatter, shielding availability, and procedure context so the safety team can act before a threshold is crossed.",
    },
    "People & rotations": {
      eyebrow: "Workforce safety",
      title: "Keep every rotation inside guardrails.",
      detail: "Review who is inside each room, who is approaching their rolling baseline, and which preventive rotation ALARAD recommends next.",
    },
    "Audit log": {
      eyebrow: "Decision history",
      title: "Make every safety decision traceable.",
      detail: "The audit trail records alerts, AI recommendations, human review, escalation, and resolution for compliance and incident learning.",
    },
  }[activeNav as "Exposure map" | "People & rotations" | "Audit log"];

  return (
    <div className="mx-auto max-w-[1500px] p-5 md:p-9">
      <section className="overflow-hidden rounded-3xl border border-[#dbe7e2] bg-white shadow-[0_12px_35px_rgba(31,78,75,.06)]">
        <div className="flex flex-col justify-between gap-6 bg-[#174b53] p-6 text-[#e8f4ef] md:flex-row md:items-end md:p-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a4cec0]">{panelCopy?.eyebrow}</p>
            <h2 className="mt-3 max-w-xl text-3xl font-bold tracking-[-.04em] md:text-4xl">{panelCopy?.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#b7d4ce]">{panelCopy?.detail}</p>
          </div>
          <button onClick={onBack} className="rounded-xl bg-[#e1eeea] px-4 py-2.5 text-xs font-bold text-[#123d45] transition hover:bg-white">Back to command center</button>
        </div>

        {activeNav === "Exposure map" && (
          <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
            {[["Cath Lab 03", "Elevated", "28.4 µSv/h", "Inspect mobile shielding", "bg-[#fff3e9] text-[#a75931]"], ["CT-2", "Within baseline", "7.2 µSv/h", "Rotation on schedule", "bg-[#edf8f2] text-[#397563]"], ["Hot Lab", "Signal delayed", "No recent rate", "Check badge R-184", "bg-[#fff8e1] text-[#9b742c]"]].map(([room, status, rate, action, tone]) => (
              <div key={room} className="rounded-2xl border border-[#e4ece8] p-5">
                <div className="flex items-center justify-between"><span className="text-sm font-bold">{room}</span><Signal size={16} className="text-[#4d917b]" /></div>
                <div className={`mt-5 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${tone}`}>{status}</div>
                <p className="mt-4 font-mono text-2xl font-bold text-[#173f46]">{rate}</p>
                <p className="mt-1 text-xs text-[#78918f]">Current room signal</p>
                <button onClick={onOpenAi} className="mt-5 text-xs font-bold text-[#28715e] hover:underline">{action} <ArrowUpRight className="inline" size={13} /></button>
              </div>
            ))}
          </div>
        )}

        {activeNav === "People & rotations" && (
          <div className="grid gap-3 p-6 md:grid-cols-2 md:p-8">
            {[["Dr. Noura Al-Harbi", "Cath Lab 03", "Approaching threshold", "Rotate in 12 min", "text-[#b65e32]"], ["Omar Al-Qahtani", "CT-2", "Within baseline", "Next rotation 14:00", "text-[#397563]"], ["Maha Al-Shehri", "Hot Lab", "Context delayed", "Check badge R-184", "text-[#9b742c]"], ["Sara Al-Dosari", "Radiation Therapy", "Within baseline", "No action needed", "text-[#397563]"]].map(([person, room, status, action, color]) => (
              <div key={person} className="flex items-center gap-4 rounded-2xl border border-[#e4ece8] p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#dbeee8] text-sm font-bold text-[#21545a]">{person.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>
                <div className="min-w-0 flex-1"><p className="text-sm font-bold">{person}</p><p className="mt-1 text-xs text-[#78918f]">{room} · {status}</p></div>
                <span className={`hidden text-right text-[11px] font-bold sm:block ${color}`}>{action}</span>
              </div>
            ))}
            <button onClick={onOpenAi} className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#a9cfc0] bg-[#f4faf7] p-4 text-xs font-bold text-[#397563] hover:bg-[#edf8f2]"><BrainCircuit size={16} /> Ask ALARAD to suggest a safer rotation</button>
          </div>
        )}

        {activeNav === "Audit log" && (
          <div className="space-y-3 p-6 md:p-8">
            {[["10:42:18 AST", "Human review opened", "Dr. Amina acknowledged the scatter exposure recommendation for Cath Lab 03.", "Reviewed"], ["10:40:02 AST", "AI forecast updated", "Time-series model recalculated the next 60-minute risk using room and procedure context.", "System"], ["10:36:44 AST", "Shielding checklist added", "Mobile shielding was added to the next Cath Lab 03 procedure checklist.", "Action"]].map(([time, title, detail, tag]) => (
              <div key={time} className="flex gap-4 rounded-2xl border border-[#e4ece8] p-4">
                <div className="flex w-24 shrink-0 items-start gap-2 text-[11px] font-mono text-[#78918f]"><Clock3 size={14} />{time}</div>
                <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{title}</p><span className="rounded-full bg-[#edf5f1] px-2 py-0.5 text-[10px] font-bold text-[#4b876f]">{tag}</span></div><p className="mt-1 text-xs leading-relaxed text-[#78918f]">{detail}</p></div>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-2xl bg-[#f5faf7] p-4 text-xs text-[#65837f]"><ShieldCheck size={16} className="text-[#4c9a7d]" /> Every AI suggestion remains linked to a human review event.</div>
          </div>
        )}
      </section>
    </div>
  );
}

function AiCopilot({ messages, input, onInputChange, onAsk, onClose, onPrompt }: { messages: AiMessage[]; input: string; onInputChange: (value: string) => void; onAsk: (question: string) => void; onClose: () => void; onPrompt: (question: string) => void }) {
  const quickPrompts = ["What is the current risk?", "Is there a possible leak?", "Summarize dose totals"];

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[430px] flex-col border-l border-[#cfe0d9] bg-[#f7fbf9] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#dbe7e2] bg-[#174b53] px-5 py-4 text-white">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e28a42] text-[#123d45]"><BrainCircuit size={20} /></div><div><p className="text-sm font-bold">ALARAD AI copilot</p><p className="text-[10px] uppercase tracking-[.14em] text-[#a7c7c2]">Safety context assistant</p></div></div>
        <button onClick={onClose} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={19} /></button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <div className="rounded-2xl border border-[#c8dfd5] bg-white p-4 text-xs leading-relaxed text-[#5f7d79]"><p className="font-bold text-[#245c5f]">Ask about the current safety picture.</p><p className="mt-1">I can explain dose totals, identify risk signals, or prepare the next human-review action.</p></div>
        <div className="flex flex-wrap gap-2">{quickPrompts.map((prompt) => <button key={prompt} onClick={() => onPrompt(prompt)} className="rounded-full border border-[#b9d8ca] bg-white px-3 py-2 text-[11px] font-semibold text-[#397361] hover:bg-[#edf8f2]">{prompt}</button>)}</div>
         {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[92%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${message.role === "user" ? "rounded-br-md bg-[#174b53] text-white" : "rounded-bl-md border border-[#dbe7e2] bg-white text-[#527276]"}`}><p>{message.text}</p>{message.sources && message.sources.length > 0 && <div className="mt-3 border-t border-[#e5eeea] pt-2"><p className="mb-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#7a9690]">Knowledge Base sources</p><div className="space-y-1">{message.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="block truncate text-[10px] font-semibold text-[#28715e] hover:underline">{source.title} ↗</a>)}</div></div>}</div></div>)}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); onAsk(input); }} className="border-t border-[#dbe7e2] bg-white p-4">
        <div className="flex items-center gap-2 rounded-xl border border-[#cfe0d9] bg-[#f7fbf9] p-2 focus-within:border-[#8fc4b1]"><input value={input} onChange={(event) => onInputChange(event.target.value)} placeholder="Ask about exposure or risk..." className="min-w-0 flex-1 bg-transparent px-2 text-xs text-[#173f46] outline-none" /><button type="submit" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#174b53] text-white hover:bg-[#0e3b43]"><Send size={15} /></button></div>
        <p className="mt-2 text-[10px] leading-relaxed text-[#8aa09d]">AI copilot is a decision-support prototype. Confirm recommendations with your Radiation Safety Officer.</p>
      </form>
    </aside>
  );
}

export function CommandCenter() {
  const [activeNav, setActiveNav] = useState("Command center");
  const [department, setDepartment] = useState("All departments");
  const [dosePeriod, setDosePeriod] = useState<DosePeriod>("Today");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [anomalyState, setAnomalyState] = useState<"stable" | "detected" | "escalated">("stable");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([{ role: "assistant", text: "I’m ready to help interpret the current ALARAD safety context." }]);

  const visibleAlerts = useMemo(
    () => department === "All departments" ? alerts : alerts.filter((a) => a.location.toLowerCase().includes(department.toLowerCase().split(" ")[0])),
    [alerts, department],
  );

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const acknowledge = (id: number) => {
    setAcknowledged((current) => [...current, id]);
    notify("Recommendation marked for human review");
  };

  const resolve = (id: number) => {
    setAlerts((current) => current.filter((a) => a.id !== id));
    notify("Alert resolved and added to the audit log");
  };

  const runLeakCheck = () => {
    setAnomalyState("detected");
    setAlerts((current) => current.some((alert) => alert.id === 4) ? current : [{
      id: 4,
      severity: "Critical",
      title: "Unexpected dose-rate increase",
      detail: "AI projects a possible shielding or equipment anomaly in Cath Lab 03 within the next 15 min.",
      location: "Cath Lab 03 · Leak forecast",
      time: "Now",
      action: "Escalate to Radiation Safety Officer",
    }, ...current]);
    notify("Unexpected increase detected — review the leak forecast");
  };

  const escalateAnomaly = () => {
    setAnomalyState("escalated");
    setAcknowledged((current) => current.includes(4) ? current : [...current, 4]);
    notify("Alert sent to the Radiation Safety Officer and incident response");
  };

  const askAI = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
     const reply = getAssistantReply(trimmed, anomalyState);
     setAiMessages((current) => [...current, { role: "user", text: trimmed }, { role: "assistant", text: reply.text, sources: reply.sources }]);
    setAiInput("");
  };

  return (
    <main className="min-h-[100dvh] bg-[#f4f8f6] text-[#173c43] selection:bg-[#f0c49a]">
      <div className="pointer-events-none fixed inset-0 opacity-[.035]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.65'/%3E%3C/svg%3E\")" }} />
      <aside className={`${showMobileNav ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 w-72 bg-[#123d45] p-6 text-[#dceeea] shadow-2xl transition-transform md:translate-x-0`}>
        <div className="flex items-center gap-3 border-b border-white/10 pb-7">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#e28a42] text-[#123d45]"><Crosshair size={23} /></div>
          <div><div className="font-mono text-xl font-bold tracking-[.16em]">ALARAD</div><div className="text-[10px] uppercase tracking-[.2em] text-[#a7c7c2]">Safety intelligence</div></div>
        </div>
        <div className="mt-9 text-[10px] font-bold uppercase tracking-[.2em] text-[#78a7a3]">Workspace</div>
        <nav className="mt-3 space-y-1">
          {navItems.map((item, i) => (
            <button key={item} onClick={() => { setActiveNav(item); setShowMobileNav(false); if (item !== "Command center") notify(`${item} opened`); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${activeNav === item ? "bg-[#e1eeea] font-semibold text-[#123d45]" : "text-[#b4ceca] hover:bg-white/10 hover:text-white"}`}>
              {i === 0 ? <Gauge size={17} /> : i === 1 ? <Signal size={17} /> : i === 2 ? <Users size={17} /> : <Activity size={17} />}{item}
              {i === 0 && alerts.length > 0 && <span className="ml-auto rounded-full bg-[#e28a42] px-2 py-0.5 text-[10px] font-bold text-[#123d45]">{alerts.length}</span>}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold"><ShieldCheck size={16} className="text-[#8ed0b9]" /> Human-in-the-loop</div>
          <p className="mt-2 text-xs leading-relaxed text-[#a7c7c2]">AI recommendations remain in review until your Radiation Safety Officer confirms escalation.</p>
        </div>
      </aside>

      <section className="md:ml-72">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#dbe7e2] bg-[#f4f8f6]/90 px-5 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3"><button className="rounded-lg p-2 hover:bg-[#e8f0ed] md:hidden" onClick={() => setShowMobileNav(true)}><Menu size={21} /></button><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#74908f]">King Faisal Specialist Hospital</p><h1 className="mt-1 text-lg font-bold tracking-tight">Good morning, Dr. Amina</h1></div></div>
          <div className="flex items-center gap-2"><button onClick={() => setAiOpen(true)} className="flex items-center gap-2 rounded-xl border border-[#b9d8ca] bg-[#edf8f2] px-3 py-2.5 text-xs font-bold text-[#28715e] transition hover:bg-[#dcefe6]"><MessageCircle size={16} /><span className="hidden sm:inline">Ask ALARAD AI</span></button><div className="hidden items-center gap-2 rounded-full border border-[#cce1da] bg-[#ecf7f1] px-3 py-2 text-xs font-semibold text-[#27725c] sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-[#41a477]" /> Live monitoring</div><button onClick={() => notify("No new notifications")} className="relative rounded-xl border border-[#dbe7e2] bg-white p-2.5 text-[#527276] hover:border-[#a9c9c0]"><Bell size={18} /><span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#f4f8f6] bg-[#e28a42]" /></button><div className="grid h-9 w-9 place-items-center rounded-full bg-[#d2e2dd] text-xs font-bold text-[#21545a]">AA</div></div>
        </header>

         {activeNav !== "Command center" && <WorkspacePanel activeNav={activeNav} onBack={() => setActiveNav("Command center")} onOpenAi={() => setAiOpen(true)} />}

         <div className={`mx-auto max-w-[1500px] p-5 md:p-9 ${activeNav === "Command center" ? "" : "hidden"}`}>
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#62807e]"><span className="h-1.5 w-1.5 rounded-full bg-[#e28a42]" /> Monday, 14 October 2024 <span className="text-[#adc0bd]">/</span> Shift A · 07:00–15:00</div><h2 className="max-w-2xl text-3xl font-bold tracking-[-.04em] text-[#123d45] md:text-4xl">Prevent the next unsafe exposure.</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-[#62807e]">A live view of radiation risk across your teams, rooms, and procedures — before thresholds are crossed.</p></div><div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-[#78918f]" /><select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-xl border border-[#cddfd9] bg-white px-4 py-2.5 text-sm font-semibold text-[#315b60] outline-none focus:ring-2 focus:ring-[#9ccabe]"><option>All departments</option><option>Cath Lab</option><option>Imaging</option><option>Nuclear Medicine</option></select></div></div>

          <div className="grid gap-4 lg:grid-cols-[1.45fr_.85fr_.85fr]">
            <div className="relative overflow-hidden rounded-2xl bg-[#174b53] p-6 text-[#e8f4ef] shadow-[0_14px_35px_rgba(26,74,79,.12)] md:p-7"><div className="absolute -right-14 -top-16 h-52 w-52 rounded-full border border-[#b9dfcc]/20" /><div className="absolute -right-5 -top-7 h-36 w-36 rounded-full border border-[#b9dfcc]/20" /><div className="relative flex items-start justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#a4cec0]"><Radio size={15} /> Current exposure status</div><div className="mt-5 flex items-baseline gap-2"><span className="font-mono text-5xl font-bold tracking-[-.06em]">Low</span><span className="rounded-full bg-[#8ed0b9]/20 px-2 py-1 text-[11px] font-bold text-[#aee3c9]">within guardrails</span></div><p className="mt-3 max-w-xs text-sm leading-relaxed text-[#b7d4ce]">No active personnel are above their rolling 7-day exposure baseline.</p></div><div className="hidden h-16 w-16 place-items-center rounded-2xl border border-[#a9d7c7]/20 bg-[#0d3e47] sm:grid"><Shield size={30} className="text-[#8ed0b9]" /></div></div><div className="relative mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-xs"><span className="text-[#a8c9c2]">Last signal received</span><span className="font-mono text-[#d6ebe4]">14 Oct · 10:42:18 AST</span></div></div>
            <div className="rounded-2xl border border-[#dbe7e2] bg-white p-6 shadow-[0_8px_25px_rgba(31,78,75,.05)]"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#668582]">Predicted risk</p><BrainCircuit size={18} className="text-[#e28a42]" /></div><div className="mt-4 flex items-center gap-4"><RiskRing value={34} /><div><p className="text-sm font-bold text-[#315b60]">Stable trend</p><p className="mt-1 text-xs leading-relaxed text-[#78918f]">Next 60 min across 42 active staff</p></div></div><div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#318065]"><ArrowUpRight size={14} /> 8% safer than last shift</div></div>
            <div className="rounded-2xl border border-[#dbe7e2] bg-[#fffaf4] p-6 shadow-[0_8px_25px_rgba(31,78,75,.05)]"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#826f60]">Active attention</p><AlertTriangle size={18} className="text-[#d7773c]" /></div><div className="mt-5 flex items-end gap-3"><span className="font-mono text-5xl font-bold tracking-[-.06em] text-[#8b4f31]">{alerts.length}</span><span className="mb-2 text-sm text-[#8c7061]">signals need review</span></div><div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#af6538]"><Clock3 size={14} /> Oldest signal · 14 min</div></div>
          </div>

           <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
             <DoseSnapshot period={dosePeriod} onPeriodChange={setDosePeriod} />
             <section className={`rounded-2xl border p-5 shadow-[0_8px_25px_rgba(31,78,75,.04)] transition-colors md:p-6 ${anomalyState === "stable" ? "border-[#dbe7e2] bg-white" : anomalyState === "detected" ? "border-[#e7b08a] bg-[#fff8f1]" : "border-[#9acdb8] bg-[#edf8f2]"}`}>
               <div className="flex items-start justify-between gap-4">
                 <div>
                   <div className="flex items-center gap-2"><Siren size={18} className={anomalyState === "stable" ? "text-[#d7773c]" : "text-[#b65e32]"} /><h3 className="text-lg font-bold tracking-tight">Unexpected increase & leak forecast</h3></div>
                   <p className="mt-1 text-xs leading-relaxed text-[#78918f]">AI compares the live dose-rate with room, procedure, distance, and shielding context.</p>
                 </div>
                 <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${anomalyState === "stable" ? "bg-[#edf5f1] text-[#4b876f]" : anomalyState === "detected" ? "bg-[#f7e1d1] text-[#a75931]" : "bg-[#d9eee4] text-[#397563]"}`}>{anomalyState === "stable" ? "No anomaly" : anomalyState === "detected" ? "Review now" : "RSO notified"}</span>
               </div>
               <div className="mt-5 grid grid-cols-3 gap-2">
                 <div className="rounded-xl bg-white/75 p-3"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#78918f]">Now</p><p className="mt-2 font-mono text-lg font-bold text-[#173f46]">{anomalyState === "stable" ? "12.8" : "28.4"} <span className="font-sans text-[10px] text-[#78918f]">µSv/h</span></p></div>
                 <div className="rounded-xl bg-white/75 p-3"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#78918f]">15 min forecast</p><p className="mt-2 font-mono text-lg font-bold text-[#173f46]">{anomalyState === "stable" ? "0.08" : "0.18"} <span className="font-sans text-[10px] text-[#78918f]">mSv</span></p></div>
                 <div className="rounded-xl bg-white/75 p-3"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#78918f]">Confidence</p><p className="mt-2 font-mono text-lg font-bold text-[#173f46]">{anomalyState === "stable" ? "92" : "87"}<span className="font-sans text-[10px] text-[#78918f]">%</span></p></div>
               </div>
               <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#e7d8c9] bg-white/65 p-3 text-[11px] leading-relaxed text-[#775f50]"><TrendingUp size={15} className="mt-0.5 shrink-0 text-[#c26b35]" /><span>{anomalyState === "stable" ? "Run a live anomaly check to test for a sudden rise, shielding failure, or equipment leak pattern." : "Possible leak pattern: dose-rate is rising faster than the procedure baseline. Inspect shielding and room equipment now."}</span></div>
               <div className="mt-4 flex flex-wrap gap-2">
                 {anomalyState === "stable" && <button onClick={runLeakCheck} className="flex items-center gap-2 rounded-lg bg-[#174b53] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#0e3b43]"><BrainCircuit size={14} /> Run AI leak check</button>}
                 {anomalyState === "detected" && <button onClick={escalateAnomaly} className="flex items-center gap-2 rounded-lg bg-[#b65e32] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#994a28]"><Send size={14} /> Escalate to Radiation Safety Officer</button>}
                 {anomalyState === "escalated" && <div className="flex items-center gap-2 rounded-lg bg-[#d9eee4] px-3 py-2 text-xs font-bold text-[#397563]"><Check size={14} /> RSO and incident response notified</div>}
                 <button onClick={() => notify("Forecast details opened")} className="rounded-lg border border-[#c8d9d2] bg-white/70 px-3 py-2 text-xs font-bold text-[#397361] hover:bg-white">View calculation details</button>
               </div>
             </section>
           </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            <section className="rounded-2xl border border-[#dbe7e2] bg-white p-5 shadow-[0_8px_25px_rgba(31,78,75,.04)] md:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><h3 className="text-lg font-bold tracking-tight">Live alerts</h3><span className="rounded-full bg-[#f7e4d4] px-2 py-0.5 text-[11px] font-bold text-[#a6592f]">{visibleAlerts.length} open</span></div><p className="mt-1 text-xs text-[#78918f]">Prioritized by projected exposure, not just current dose.</p></div><button onClick={() => notify("Alert feed refreshed")} className="rounded-lg p-2 text-[#78918f] hover:bg-[#f1f6f3]"><Activity size={18} /></button></div><div className="mt-5 space-y-3">{visibleAlerts.length === 0 ? <div className="rounded-xl border border-dashed border-[#bfd7cf] bg-[#f6fbf8] px-5 py-10 text-center"><ShieldCheck className="mx-auto text-[#54a486]" size={28} /><p className="mt-3 text-sm font-bold">All clear for this view</p><p className="mt-1 text-xs text-[#78918f]">No open signals in {department}.</p></div> : visibleAlerts.map((alert) => <div key={alert.id} className={`rounded-xl border p-4 transition-all ${acknowledged.includes(alert.id) ? "border-[#c6dfd3] bg-[#f5fbf7]" : "border-[#e5ece8] bg-[#fcfdfc]"}`}><div className="flex gap-3"><div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${alert.severity === "Critical" ? "bg-[#f9e4d7] text-[#b65e32]" : "bg-[#f7efd9] text-[#ae7a2f]"}`}><AlertTriangle size={16} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`text-[10px] font-bold uppercase tracking-[.12em] ${alert.severity === "Critical" ? "text-[#b65e32]" : "text-[#ae7a2f]"}`}>{alert.severity}</span><span className="text-[11px] text-[#9aafac]">{alert.time}</span></div><p className="mt-1 text-sm font-bold">{alert.title}</p><p className="mt-1 text-xs leading-relaxed text-[#718a88]">{alert.detail}</p><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#668582]"><span>{alert.location}</span><span className="text-[#bfd0cc]">•</span><span>Suggested: {alert.action}</span></div></div><div className="flex shrink-0 flex-col gap-2"><button onClick={() => acknowledge(alert.id)} disabled={acknowledged.includes(alert.id)} className="rounded-lg border border-[#bdd8cb] px-2.5 py-1.5 text-[11px] font-bold text-[#397361] transition-colors hover:bg-[#eaf5ef] disabled:cursor-default disabled:border-transparent disabled:bg-[#e8f4ed]">{acknowledged.includes(alert.id) ? <span className="flex items-center gap-1"><Check size={12} /> In review</span> : "Acknowledge"}</button><button onClick={() => resolve(alert.id)} className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#8ba09d] hover:bg-[#f2f6f4]">Resolve</button></div></div></div>)}</div></section>

            <section className="rounded-2xl border border-[#dbe7e2] bg-[#eaf4f0] p-5 md:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><Sparkles size={17} className="text-[#c26b35]" /><h3 className="text-lg font-bold tracking-tight">Recommended actions</h3></div><p className="mt-1 text-xs text-[#668582]">AI-supported actions, awaiting your review.</p></div><button onClick={() => notify("Recommendations recalculated from live context")} className="rounded-lg p-2 text-[#638580] hover:bg-white/60"><Zap size={17} /></button></div><div className="mt-5 space-y-3"><div className="rounded-xl border border-[#c8dfd5] bg-white/80 p-4"><div className="flex items-center justify-between"><span className="rounded-full bg-[#f8e7da] px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#aa5b34]">High confidence</span><span className="font-mono text-xs text-[#72918b]">87%</span></div><p className="mt-3 text-sm font-bold">Rotate cath-lab coverage</p><p className="mt-1 text-xs leading-relaxed text-[#718a88]">Move the circulating technologist into the shielded control zone for the next 12 minutes.</p><button onClick={() => notify("Rotation request sent to charge technologist")} className="mt-3 flex items-center gap-1 text-xs font-bold text-[#28715e] hover:gap-2 transition-all">Review rotation plan <ArrowUpRight size={14} /></button></div><div className="rounded-xl border border-[#c8dfd5] bg-white/80 p-4"><div className="flex items-center justify-between"><span className="rounded-full bg-[#dbeee8] px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#397563]">Preventive</span><span className="font-mono text-xs text-[#72918b]">76%</span></div><p className="mt-3 text-sm font-bold">Confirm mobile shielding</p><p className="mt-1 text-xs leading-relaxed text-[#718a88]">A movable lead screen is available 22 m from Cath Lab 03. Position before the next run.</p><button onClick={() => notify("Shielding request added to room checklist")} className="mt-3 flex items-center gap-1 text-xs font-bold text-[#28715e] hover:gap-2 transition-all">Add to room checklist <ArrowUpRight size={14} /></button></div></div><div className="mt-5 flex gap-2 border-t border-[#c8dfd5] pt-4 text-[11px] leading-relaxed text-[#65837f]"><CircleHelp size={15} className="mt-0.5 shrink-0" /> Recommendations combine dosimeter signals, room context, procedure duration, role, distance, shielding availability, and prior exposure. Review before escalation.</div></section>
          </div>

          <section className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-2xl border border-[#dbe7e2] bg-white p-5 md:p-6"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold tracking-tight">Hospital context</h3><p className="mt-1 text-xs text-[#78918f]">Current operational footprint</p></div><button onClick={() => notify("Context view opened")} className="text-[#78918f]"><ChevronDown size={18} /></button></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#f3f8f5] p-4"><p className="font-mono text-2xl font-bold">42</p><p className="mt-1 text-[11px] font-semibold text-[#76908d]">staff monitored</p></div><div className="rounded-xl bg-[#f3f8f5] p-4"><p className="font-mono text-2xl font-bold">18</p><p className="mt-1 text-[11px] font-semibold text-[#76908d]">rooms online</p></div><div className="rounded-xl bg-[#f3f8f5] p-4"><p className="font-mono text-2xl font-bold">7</p><p className="mt-1 text-[11px] font-semibold text-[#76908d]">procedures active</p></div><div className="rounded-xl bg-[#f3f8f5] p-4"><p className="font-mono text-2xl font-bold text-[#3c8a6e]">98.6%</p><p className="mt-1 text-[11px] font-semibold text-[#76908d]">signal coverage</p></div></div></div><div className="rounded-2xl border border-[#dbe7e2] bg-white p-5 md:p-6"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold tracking-tight">Exposure by department</h3><p className="mt-1 text-xs text-[#78918f]">Relative to rolling 7-day baseline</p></div><span className="flex items-center gap-1 text-[11px] font-semibold text-[#78918f]"><span className="h-2 w-2 rounded-full bg-[#61a98d]" /> Within baseline</span></div><div className="mt-6 space-y-4">{[["Cath Lab", 68, "12 staff", "#e28a42"], ["Imaging", 43, "16 staff", "#6ba896"], ["Nuclear Medicine", 31, "8 staff", "#82b8aa"], ["Radiation Therapy", 22, "6 staff", "#9ccabe"]].map(([name, value, people, color]) => <div key={name as string} className="flex items-center gap-3 text-xs"><span className="w-28 font-semibold text-[#496b6b]">{name}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e7efeb]"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color as string }} /></div><span className="w-12 text-right font-mono text-[#688582]">{people}</span></div>)}</div><div className="mt-6 flex items-center gap-2 border-t border-[#edf2ef] pt-4 text-[11px] text-[#78918f]"><Signal size={14} className="text-[#4c9a7d]" /> Context updated from wearable and room telemetry · 28 sec ago</div></div></section>
          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-[#dbe7e2] pt-5 text-[11px] text-[#8aa09d] sm:flex-row"><span>ALARAD decision-support prototype · v0.8.4</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} /> No device measurement claim · For clinical review only</span></footer>
        </div>
      </section>
      {aiOpen && <AiCopilot messages={aiMessages} input={aiInput} onInputChange={setAiInput} onAsk={askAI} onPrompt={askAI} onClose={() => setAiOpen(false)} />}
      {toast && <div className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#123d45] px-4 py-3 text-xs font-semibold text-white shadow-xl"><Check size={15} className="text-[#8ed0b9]" />{toast}<button onClick={() => setToast("")} className="ml-2 text-white/60 hover:text-white"><X size={14} /></button></div>}
    </main>
  );
}