import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Crosshair,
  Gauge,
  Menu,
  Radio,
  Shield,
  ShieldCheck,
  Signal,
  SlidersHorizontal,
  Sparkles,
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

export function CommandCenter() {
  const [activeNav, setActiveNav] = useState("Command center");
  const [department, setDepartment] = useState("All departments");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [toast, setToast] = useState("");

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
            <button key={item} onClick={() => { setActiveNav(item); setShowMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${activeNav === item ? "bg-[#e1eeea] font-semibold text-[#123d45]" : "text-[#b4ceca] hover:bg-white/10 hover:text-white"}`}>
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
          <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#cce1da] bg-[#ecf7f1] px-3 py-2 text-xs font-semibold text-[#27725c] sm:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-[#41a477]" /> Live monitoring</div><button onClick={() => notify("No new notifications")} className="relative rounded-xl border border-[#dbe7e2] bg-white p-2.5 text-[#527276] hover:border-[#a9c9c0]"><Bell size={18} /><span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#f4f8f6] bg-[#e28a42]" /></button><div className="grid h-9 w-9 place-items-center rounded-full bg-[#d2e2dd] text-xs font-bold text-[#21545a]">AA</div></div>
        </header>

        <div className="mx-auto max-w-[1500px] p-5 md:p-9">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#62807e]"><span className="h-1.5 w-1.5 rounded-full bg-[#e28a42]" /> Monday, 14 October 2024 <span className="text-[#adc0bd]">/</span> Shift A · 07:00–15:00</div><h2 className="max-w-2xl text-3xl font-bold tracking-[-.04em] text-[#123d45] md:text-4xl">Prevent the next unsafe exposure.</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-[#62807e]">A live view of radiation risk across your teams, rooms, and procedures — before thresholds are crossed.</p></div><div className="flex items-center gap-2"><SlidersHorizontal size={16} className="text-[#78918f]" /><select value={department} onChange={(e) => setDepartment(e.target.value)} className="rounded-xl border border-[#cddfd9] bg-white px-4 py-2.5 text-sm font-semibold text-[#315b60] outline-none focus:ring-2 focus:ring-[#9ccabe]"><option>All departments</option><option>Cath Lab</option><option>Imaging</option><option>Nuclear Medicine</option></select></div></div>

          <div className="grid gap-4 lg:grid-cols-[1.45fr_.85fr_.85fr]">
            <div className="relative overflow-hidden rounded-2xl bg-[#174b53] p-6 text-[#e8f4ef] shadow-[0_14px_35px_rgba(26,74,79,.12)] md:p-7"><div className="absolute -right-14 -top-16 h-52 w-52 rounded-full border border-[#b9dfcc]/20" /><div className="absolute -right-5 -top-7 h-36 w-36 rounded-full border border-[#b9dfcc]/20" /><div className="relative flex items-start justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#a4cec0]"><Radio size={15} /> Current exposure status</div><div className="mt-5 flex items-baseline gap-2"><span className="font-mono text-5xl font-bold tracking-[-.06em]">Low</span><span className="rounded-full bg-[#8ed0b9]/20 px-2 py-1 text-[11px] font-bold text-[#aee3c9]">within guardrails</span></div><p className="mt-3 max-w-xs text-sm leading-relaxed text-[#b7d4ce]">No active personnel are above their rolling 7-day exposure baseline.</p></div><div className="hidden h-16 w-16 place-items-center rounded-2xl border border-[#a9d7c7]/20 bg-[#0d3e47] sm:grid"><Shield size={30} className="text-[#8ed0b9]" /></div></div><div className="relative mt-7 flex items-center justify-between border-t border-white/10 pt-4 text-xs"><span className="text-[#a8c9c2]">Last signal received</span><span className="font-mono text-[#d6ebe4]">14 Oct · 10:42:18 AST</span></div></div>
            <div className="rounded-2xl border border-[#dbe7e2] bg-white p-6 shadow-[0_8px_25px_rgba(31,78,75,.05)]"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#668582]">Predicted risk</p><BrainCircuit size={18} className="text-[#e28a42]" /></div><div className="mt-4 flex items-center gap-4"><RiskRing value={34} /><div><p className="text-sm font-bold text-[#315b60]">Stable trend</p><p className="mt-1 text-xs leading-relaxed text-[#78918f]">Next 60 min across 42 active staff</p></div></div><div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#318065]"><ArrowUpRight size={14} /> 8% safer than last shift</div></div>
            <div className="rounded-2xl border border-[#dbe7e2] bg-[#fffaf4] p-6 shadow-[0_8px_25px_rgba(31,78,75,.05)]"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#826f60]">Active attention</p><AlertTriangle size={18} className="text-[#d7773c]" /></div><div className="mt-5 flex items-end gap-3"><span className="font-mono text-5xl font-bold tracking-[-.06em] text-[#8b4f31]">{alerts.length}</span><span className="mb-2 text-sm text-[#8c7061]">signals need review</span></div><div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#af6538]"><Clock3 size={14} /> Oldest signal · 14 min</div></div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            <section className="rounded-2xl border border-[#dbe7e2] bg-white p-5 shadow-[0_8px_25px_rgba(31,78,75,.04)] md:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><h3 className="text-lg font-bold tracking-tight">Live alerts</h3><span className="rounded-full bg-[#f7e4d4] px-2 py-0.5 text-[11px] font-bold text-[#a6592f]">{visibleAlerts.length} open</span></div><p className="mt-1 text-xs text-[#78918f]">Prioritized by projected exposure, not just current dose.</p></div><button onClick={() => notify("Alert feed refreshed")} className="rounded-lg p-2 text-[#78918f] hover:bg-[#f1f6f3]"><Activity size={18} /></button></div><div className="mt-5 space-y-3">{visibleAlerts.length === 0 ? <div className="rounded-xl border border-dashed border-[#bfd7cf] bg-[#f6fbf8] px-5 py-10 text-center"><ShieldCheck className="mx-auto text-[#54a486]" size={28} /><p className="mt-3 text-sm font-bold">All clear for this view</p><p className="mt-1 text-xs text-[#78918f]">No open signals in {department}.</p></div> : visibleAlerts.map((alert) => <div key={alert.id} className={`rounded-xl border p-4 transition-all ${acknowledged.includes(alert.id) ? "border-[#c6dfd3] bg-[#f5fbf7]" : "border-[#e5ece8] bg-[#fcfdfc]"}`}><div className="flex gap-3"><div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${alert.severity === "Critical" ? "bg-[#f9e4d7] text-[#b65e32]" : "bg-[#f7efd9] text-[#ae7a2f]"}`}><AlertTriangle size={16} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`text-[10px] font-bold uppercase tracking-[.12em] ${alert.severity === "Critical" ? "text-[#b65e32]" : "text-[#ae7a2f]"}`}>{alert.severity}</span><span className="text-[11px] text-[#9aafac]">{alert.time}</span></div><p className="mt-1 text-sm font-bold">{alert.title}</p><p className="mt-1 text-xs leading-relaxed text-[#718a88]">{alert.detail}</p><div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#668582]"><span>{alert.location}</span><span className="text-[#bfd0cc]">•</span><span>Suggested: {alert.action}</span></div></div><div className="flex shrink-0 flex-col gap-2"><button onClick={() => acknowledge(alert.id)} disabled={acknowledged.includes(alert.id)} className="rounded-lg border border-[#bdd8cb] px-2.5 py-1.5 text-[11px] font-bold text-[#397361] transition-colors hover:bg-[#eaf5ef] disabled:cursor-default disabled:border-transparent disabled:bg-[#e8f4ed]">{acknowledged.includes(alert.id) ? <span className="flex items-center gap-1"><Check size={12} /> In review</span> : "Acknowledge"}</button><button onClick={() => resolve(alert.id)} className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[#8ba09d] hover:bg-[#f2f6f4]">Resolve</button></div></div></div>)}</div></section>

            <section className="rounded-2xl border border-[#dbe7e2] bg-[#eaf4f0] p-5 md:p-6"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><Sparkles size={17} className="text-[#c26b35]" /><h3 className="text-lg font-bold tracking-tight">Recommended actions</h3></div><p className="mt-1 text-xs text-[#668582]">AI-supported actions, awaiting your review.</p></div><button onClick={() => notify("Recommendations recalculated from live context")} className="rounded-lg p-2 text-[#638580] hover:bg-white/60"><Zap size={17} /></button></div><div className="mt-5 space-y-3"><div className="rounded-xl border border-[#c8dfd5] bg-white/80 p-4"><div className="flex items-center justify-between"><span className="rounded-full bg-[#f8e7da] px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#aa5b34]">High confidence</span><span className="font-mono text-xs text-[#72918b]">87%</span></div><p className="mt-3 text-sm font-bold">Rotate cath-lab coverage</p><p className="mt-1 text-xs leading-relaxed text-[#718a88]">Move the circulating technologist into the shielded control zone for the next 12 minutes.</p><button onClick={() => notify("Rotation request sent to charge technologist")} className="mt-3 flex items-center gap-1 text-xs font-bold text-[#28715e] hover:gap-2 transition-all">Review rotation plan <ArrowUpRight size={14} /></button></div><div className="rounded-xl border border-[#c8dfd5] bg-white/80 p-4"><div className="flex items-center justify-between"><span className="rounded-full bg-[#dbeee8] px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] text-[#397563]">Preventive</span><span className="font-mono text-xs text-[#72918b]">76%</span></div><p className="mt-3 text-sm font-bold">Confirm mobile shielding</p><p className="mt-1 text-xs leading-relaxed text-[#718a88]">A movable lead screen is available 22 m from Cath Lab 03. Position before the next run.</p><button onClick={() => notify("Shielding request added to room checklist")} className="mt-3 flex items-center gap-1 text-xs font-bold text-[#28715e] hover:gap-2 transition-all">Add to room checklist <ArrowUpRight size={14} /></button></div></div><div className="mt-5 flex gap-2 border-t border-[#c8dfd5] pt-4 text-[11px] leading-relaxed text-[#65837f]"><CircleHelp size={15} className="mt-0.5 shrink-0" /> Recommendations combine dosimeter signals, room context, procedure duration, role, distance, shielding availability, and prior exposure. Review before escalation.</div></section>
          </div>

          <section className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-2xl border border-[#dbe7e2] bg-white p-5 md:p-6"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold tracking-tight">Hospital context</h3><p className="mt-1 text-xs text-[#78918f]">Current operational footprint</p></div><button onClick={() => notify("Context view opened")} className="text-[#78918f]"><ChevronDown size={18} /></button></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#f3f8f5] p-4"><p className="font-mono text-2xl font-bold">42</p><p className="mt-1 text-[11px] font-semibold text-[#76908d]">staff monitored</p></div><div className="rounded-xl bg-[#f3f8f5] p-4"><p className="font-mono text-2xl font-bold">18</p><p className="mt-1 text-[11px] font-semibold text-[#76908d]">rooms online</p></div><div className="rounded-xl bg-[#f3f8f5] p-4"><p className="font-mono text-2xl font-bold">7</p><p className="mt-1 text-[11px] font-semibold text-[#76908d]">procedures active</p></div><div className="rounded-xl bg-[#f3f8f5] p-4"><p className="font-mono text-2xl font-bold text-[#3c8a6e]">98.6%</p><p className="mt-1 text-[11px] font-semibold text-[#76908d]">signal coverage</p></div></div></div><div className="rounded-2xl border border-[#dbe7e2] bg-white p-5 md:p-6"><div className="flex items-center justify-between"><div><h3 className="text-lg font-bold tracking-tight">Exposure by department</h3><p className="mt-1 text-xs text-[#78918f]">Relative to rolling 7-day baseline</p></div><span className="flex items-center gap-1 text-[11px] font-semibold text-[#78918f]"><span className="h-2 w-2 rounded-full bg-[#61a98d]" /> Within baseline</span></div><div className="mt-6 space-y-4">{[["Cath Lab", 68, "12 staff", "#e28a42"], ["Imaging", 43, "16 staff", "#6ba896"], ["Nuclear Medicine", 31, "8 staff", "#82b8aa"], ["Radiation Therapy", 22, "6 staff", "#9ccabe"]].map(([name, value, people, color]) => <div key={name as string} className="flex items-center gap-3 text-xs"><span className="w-28 font-semibold text-[#496b6b]">{name}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e7efeb]"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color as string }} /></div><span className="w-12 text-right font-mono text-[#688582]">{people}</span></div>)}</div><div className="mt-6 flex items-center gap-2 border-t border-[#edf2ef] pt-4 text-[11px] text-[#78918f]"><Signal size={14} className="text-[#4c9a7d]" /> Context updated from wearable and room telemetry · 28 sec ago</div></div></section>
          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-[#dbe7e2] pt-5 text-[11px] text-[#8aa09d] sm:flex-row"><span>ALARAD decision-support prototype · v0.8.4</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} /> No device measurement claim · For clinical review only</span></footer>
        </div>
      </section>
      {toast && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#123d45] px-4 py-3 text-xs font-semibold text-white shadow-xl"><Check size={15} className="text-[#8ed0b9]" />{toast}<button onClick={() => setToast("")} className="ml-2 text-white/60 hover:text-white"><X size={14} /></button></div>}
    </main>
  );
}