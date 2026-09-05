"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { DOCUMENTS, DOCUMENT_BY_ID, type HowToGetDocument } from "@/data/documents";
import { analyseHousehold, analyseMember } from "@/lib/lifeMap/engine";
import { ageInCompletedYears, createSampleFamily } from "@/lib/lifeMap/sampleFamily";
import type { DocState, FirstAction, LifeMapRow, Member } from "@/lib/lifeMap/types";
import { useLanguage } from "./LanguageProvider";

export const LIFE_MAP_STORAGE_KEY = "jeevana.household-life-map.v1";

const STATUS_LABELS = {
  done: "Done",
  ready: "Ready when it happens",
  blocked: "Blocked",
  upcoming: "Coming up",
  future: "Not yet",
  past: "Passed",
} as const;

const STATUS_LABELS_TE = {
  done: "పూర్తి",
  ready: "సిద్ధం",
  blocked: "ఆగింది",
  upcoming: "త్వరలో",
  future: "ఇంకా సమయం ఉంది",
  past: "దాటిపోయింది",
} as const;

const STAGE_TITLES_TE: Record<string, string> = {
  birth: "బిడ్డ పుట్టడం", "school-entry": "పాఠశాల ప్రారంభం", "turning-18": "18 సంవత్సరాలు నిండడం",
  "higher-education": "ఉన్నత విద్య", "first-job": "మొదటి ఉద్యోగం", "going-abroad": "విదేశాలకు వెళ్లడం",
  marriage: "వివాహం", "becoming-a-parent": "తల్లిదండ్రులు కావడం", "buying-a-vehicle": "వాహనం కొనడం",
  "buying-property": "ఆస్తి కొనడం", moving: "నగరం లేదా రాష్ట్రం మారడం", "starting-a-business": "వ్యాపారం ప్రారంభం",
  "illness-disability": "అనారోగ్యం లేదా వైకల్యం", "losing-a-job": "ఉద్యోగం కోల్పోవడం", retirement: "పదవీ విరమణ", death: "కుటుంబంలో మరణం",
};

const STATUS_STYLES = {
  done: "bg-[var(--leaf)] text-white border-[var(--leaf)]",
  ready: "bg-white text-[var(--leaf)] border-[var(--leaf)]",
  blocked: "bg-[var(--brick)] text-white border-[var(--brick)]",
  upcoming: "bg-[var(--marigold)] text-[var(--ink)] border-[var(--marigold)]",
  future: "bg-white text-[var(--muted)] border-dashed border-[var(--line)]",
  past: "bg-white text-[var(--muted)] border-dashed border-[var(--line)]",
} as const;

interface LifeMapProps {
  readOnly?: boolean;
  compact?: boolean;
  today?: Date;
}

interface MemberForm {
  id?: string;
  name: string;
  role: string;
  birthDate: string;
  approximateAge: string;
}

const EMPTY_FORM: MemberForm = { name: "", role: "", birthDate: "", approximateAge: "" };

function documentApplies(documentId: string, age: number): boolean {
  if (age < 1) return ["birth", "aadhaar", "ration", "insurance"].includes(documentId);
  if (age < 16) return !["voter", "bank", "nominee", "pan", "dl", "marriage", "pension"].includes(documentId);
  if (age < 21) return documentId !== "pension";
  return true;
}

function visibleReason(row: LifeMapRow, language: "en" | "te"): string {
  if (language === "te") {
    if (row.status === "done") return "పూర్తైంది";
    if (row.status === "blocked") return `ఆగింది. కావాల్సినవి: ${row.missing.map((id) => DOCUMENT_BY_ID.get(id)?.label_te ?? id).join(", ")}`;
    if (row.status === "upcoming") return `${row.monthsUntil} నెలల్లో`;
    if (row.status === "future") return "ఇంకా సమయం ఉంది";
    if (row.status === "past") return "ఈ దశ దాటిపోయింది";
    return "పత్రాలు సిద్ధంగా ఉన్నాయి";
  }
  const lead = row.status === "blocked" ? "Blocked. " : row.status === "upcoming" ? "Coming up. " : "";
  return `${lead}${row.reason}`;
}

function LifeMapStops({ member, today }: Readonly<{ member: Member; today: Date }>) {
  const { language } = useLanguage();
  const analysis = analyseMember(member, today);
  const renderRow = (row: LifeMapRow, isLast: boolean) => (
    <li key={row.stage.id} className="relative min-h-20 pb-5 pl-11">
      <span aria-hidden="true" className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 font-serif text-sm font-bold ${STATUS_STYLES[row.status]}`}>{row.stage.order}</span>
      {!isLast ? <span aria-hidden="true" className="absolute bottom-1 left-4 top-9 border-l-2 border-dotted border-[var(--line)]" /> : null}
      <div className="flex flex-wrap items-baseline gap-2">
        {row.stage.status === "live" ? (
          <Link href={`/journey/${row.stage.journeyId}`} className="font-serif font-bold underline decoration-[var(--marigold)] decoration-2 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]">{language === "te" ? STAGE_TITLES_TE[row.stage.id] : row.stage.title}</Link>
        ) : <h3 className={`font-serif font-bold ${row.status === "past" || row.status === "future" ? "text-[var(--muted)]" : ""}`}>{language === "te" ? STAGE_TITLES_TE[row.stage.id] : row.stage.title}</h3>}
        <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[var(--muted)]">{language === "te" ? STATUS_LABELS_TE[row.status] : STATUS_LABELS[row.status]}</span>
      </div>
      <p className={`mt-1 text-xs leading-5 ${row.status === "blocked" ? "text-[var(--brick)]" : row.status === "upcoming" ? "text-[var(--marigold-dark)]" : "text-[var(--muted)]"}`}>{visibleReason(row, language)}</p>
    </li>
  );
  return (
    <section aria-label={`${member.name}'s life map`} className="min-w-0 border border-[var(--line)] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-[var(--ink)] pb-2">
        <h2 className="font-serif text-2xl font-bold">{language === "te" ? `${member.name} జీవన పటం` : `${member.name}'s life map`}</h2>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">2 · See</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        {(["done", "ready", "blocked", "upcoming", "future"] as const).map((status) => (
          <span key={status} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded-full border-2 ${STATUS_STYLES[status]}`} />{language === "te" ? STATUS_LABELS_TE[status] : status === "future" ? "Passed / not yet" : STATUS_LABELS[status]}</span>
        ))}
      </div>
      <div className="mt-6 grid gap-x-8 md:grid-cols-2">
        <ol>{analysis.rows.slice(0, 8).map((row, index) => renderRow(row, index === 7))}</ol>
        <ol start={9}>{analysis.rows.slice(8).map((row, index) => renderRow(row, index === 7))}</ol>
      </div>
    </section>
  );
}

function FirstActionCard({ action }: Readonly<{ action: FirstAction | null }>) {
  if (!action) {
    return <section className="border-2 border-[var(--ink)] bg-white p-5 shadow-[5px_5px_0_var(--marigold)]"><h3 className="font-serif text-xl font-bold">Nothing is blocked.</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Every paper this person needs is in place. Keep them together in one folder.</p></section>;
  }
  const standard = action.document.howToGet;
  const fix = action.lateTrack && standard.lateTrack ? standard.lateTrack : standard;
  return (
    <section className="border-2 border-[var(--ink)] bg-white p-5 shadow-[5px_5px_0_var(--marigold)]">
      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">3 · Do this first</p>
      <h3 className="mt-3 font-serif text-2xl font-bold leading-tight">{fix.title}<span className="mt-1 block text-lg text-[var(--leaf)]">{fix.title_te}</span></h3>
      <p className="mt-3 text-sm leading-6">Unblocks <strong>{action.count}</strong> {action.count === 1 ? "stage" : "stages"} of life.</p>
      <dl className="mt-4 grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Where</dt><dd>{fix.where}</dd>
        <dt className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Carry</dt><dd>{fix.carry}</dd>
        {fix.officialSource ? <><dt className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Verified</dt><dd className="break-all font-mono text-[10px]"><a href={fix.officialSource} target="_blank" rel="noreferrer" className="underline decoration-[var(--marigold)] underline-offset-2">{new URL(fix.officialSource).hostname.replace(/^www\./, "")}</a>{fix.lastVerified ? ` · ${fix.lastVerified}` : ""}</dd></> : null}
      </dl>
      <div className="mt-4 flex flex-wrap gap-1.5">{action.stageIds.map((id) => <span key={id} className="border border-[var(--line)] px-2 py-1 font-mono text-[8px] uppercase tracking-wider">{id.replaceAll("-", " ")}</span>)}</div>
    </section>
  );
}

function howToGet(action: FirstAction): HowToGetDocument {
  const standard = action.document.howToGet;
  return action.lateTrack && standard.lateTrack ? standard.lateTrack : standard;
}

function PathCard({ member, today }: Readonly<{ member: Member; today: Date }>) {
  const analysis = analyseMember(member, today);
  const ids: string[] = [];
  if (analysis.doFirst) ids.push(analysis.doFirst.document.id);
  for (const row of analysis.rows.filter((candidate) => candidate.status === "blocked")) {
    for (const id of row.missing) if (!ids.includes(id) && ids.length < 4) ids.push(id);
  }
  const fixes = ids.map((id) => {
    const document = DOCUMENT_BY_ID.get(id)!;
    const first = analysis.doFirst?.document.id === id ? analysis.doFirst : null;
    return { document, fix: first ? howToGet(first) : document.howToGet };
  });

  return (
    <div className="print-card border border-[var(--line)] bg-white p-4" aria-label="Printable path card">
      <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--leaf)] font-serif font-bold text-white">J</span><span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em]">Path card · మార్గ కార్డు</span></div>
      <h3 className="mt-3 font-serif text-2xl font-bold">{member.name}</h3>
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--muted)]">{member.role} · In this order</p>
      {fixes.length ? <ol className="mt-4 space-y-3">{fixes.map(({ document, fix }) => <li key={document.id} className="relative pl-6 text-sm leading-5"><span aria-hidden="true" className="absolute left-0 top-0.5 h-3.5 w-3.5 border border-[var(--ink)]" /><strong>{fix.title}</strong> · {fix.title_te}<small className="mt-0.5 block text-[11px] leading-4 text-[var(--muted)]">{fix.where} · Carry: {fix.carry}</small></li>)}</ol> : <p className="mt-4 text-sm">All papers are in place. Keep them together in one folder.</p>}
      <p className="mt-4 border-t border-[var(--line)] pt-3 text-[10px] leading-4 text-[var(--muted)]">Independent guide, not a government service. Confirm at the office. · ప్రభుత్వ సేవ కాదు, కార్యాలయంలో నిర్ధారించుకోండి.</p>
    </div>
  );
}

function SidePanel({ member, today }: Readonly<{ member: Member; today: Date }>) {
  const { language } = useLanguage();
  const analysis = analyseMember(member, today);
  return <aside className="min-w-0 space-y-5"><FirstActionCard action={analysis.doFirst} /><section className="border border-[var(--line)] bg-white p-4"><div className="flex items-baseline justify-between border-b border-[var(--line)] pb-2"><h2 className="font-serif text-xl font-bold">{language === "te" ? "త్వరలో" : "Coming up"}</h2><span className="font-mono text-[8px] uppercase tracking-wider text-[var(--muted)]">{language === "te" ? "రాబోయే 24 నెలలు" : "Next 24 months"}</span></div><ul className="divide-y divide-[var(--line)]">{analysis.upcoming.length ? analysis.upcoming.map((item) => <li key={`${item.kind}-${item.stageId}`} className="grid grid-cols-[3.25rem_1fr] gap-3 py-3"><div className={`font-serif text-2xl font-bold ${item.kind === "deadline" ? "text-[var(--brick)]" : "text-[var(--marigold-dark)]"}`}>{item.kind === "deadline" ? item.daysUntil : item.monthsUntil}<small className="block font-mono text-[7px] uppercase tracking-wider">{language === "te" ? (item.kind === "deadline" ? "రోజులు" : "నెలలు") : (item.kind === "deadline" ? "days" : "months")}</small></div><div className="text-xs leading-5"><strong className="block font-serif text-sm">{language === "te" && item.kind === "stage" ? STAGE_TITLES_TE[item.stageId] : item.label}</strong>{language === "te" && item.kind === "stage" ? item.prepNow_te : item.prepNow}</div></li>) : <li className="py-4 text-sm text-[var(--muted)]">{language === "te" ? "రాబోయే రెండేళ్లలో ఏదీ లేదు." : "Nothing due in the next two years."}</li>}</ul></section><PathCard member={member} today={today} /><button type="button" onClick={() => window.print()} className="print-button min-h-11 w-full bg-[var(--ink)] px-4 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[4px_4px_0_var(--marigold)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2">Print this card · ఈ కార్డును ప్రింట్ చేయండి</button></aside>;
}

export function LifeMap({ readOnly = false, compact = false, today: todayProp }: Readonly<LifeMapProps>) {
  const { language } = useLanguage();
  const [today] = useState(() => todayProp ?? new Date());
  const [members, setMembers] = useState<Member[]>(() => readOnly ? createSampleFamily(today) : []);
  const [selectedId, setSelectedId] = useState(() => readOnly ? "sravani" : "");
  const [hydrated, setHydrated] = useState(readOnly);
  const [form, setForm] = useState<MemberForm | null>(null);

  useEffect(() => {
    if (readOnly) return;
    try {
      const stored = window.localStorage.getItem(LIFE_MAP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { members: Member[]; selectedId: string };
        if (Array.isArray(parsed.members)) { setMembers(parsed.members); setSelectedId(parsed.selectedId || parsed.members[0]?.id || ""); }
      }
    } catch { window.localStorage.removeItem(LIFE_MAP_STORAGE_KEY); }
    setHydrated(true);
  }, [readOnly]);

  useEffect(() => {
    if (!readOnly && hydrated) {
      if (members.length) window.localStorage.setItem(LIFE_MAP_STORAGE_KEY, JSON.stringify({ members, selectedId }));
      else window.localStorage.removeItem(LIFE_MAP_STORAGE_KEY);
    }
  }, [hydrated, members, readOnly, selectedId]);

  const selected = useMemo(() => members.find((member) => member.id === selectedId) ?? members[0], [members, selectedId]);
  const summary = analyseHousehold(members, today);

  const loadSample = () => { const sample = createSampleFamily(today); setMembers(sample); setSelectedId("sravani"); setForm(null); };
  const saveMember = (event: FormEvent) => {
    event.preventDefault();
    if (!form || !form.name.trim() || !form.role.trim()) return;
    let birthDate = form.birthDate;
    if (form.approximateAge) {
      const age = Math.max(0, Number.parseInt(form.approximateAge, 10) || 0);
      birthDate = new Date(Date.UTC(today.getUTCFullYear() - age, today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0, 10);
    }
    if (!birthDate) return;
    const member: Member = { id: form.id ?? `member-${Date.now()}`, name: form.name.trim(), role: form.role.trim(), birthDate, docs: form.id ? members.find((candidate) => candidate.id === form.id)?.docs ?? {} : {} };
    setMembers((current) => form.id ? current.map((candidate) => candidate.id === form.id ? member : candidate) : [...current, member]);
    setSelectedId(member.id); setForm(null);
  };
  const cycleDocument = (documentId: string) => {
    if (!selected) return;
    const current = selected.docs[documentId] ?? "no";
    const next: DocState = current === "have" ? "no" : current === "no" ? "unsure" : "have";
    setMembers((items) => items.map((member) => member.id === selected.id ? { ...member, docs: { ...member.docs, [documentId]: next } } : member));
  };

  if (!readOnly && !hydrated) return <div className="min-h-48" aria-label="Loading household" />;
  if (!readOnly && members.length === 0) return <section className="border border-[var(--line)] bg-white px-6 py-12 text-center"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--marigold-dark)]">{language === "te" ? "ఇక్కడ ప్రారంభించండి" : "Start here"}</p><h2 className="mt-3 font-serif text-3xl font-bold">{language === "te" ? "కుటుంబాన్ని ఒక్కసారి నమోదు చేయండి" : "Map the household once"}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">{language === "te" ? "ప్రతి వ్యక్తిని చేర్చి, వారి వద్ద ఉన్న పత్రాలను గుర్తించండి. ఏది ఆగింది, తర్వాత ఏముంది, ఏ పత్రం ఎక్కువగా ఉపయోగపడుతుంది అన్నది జీవన చూపిస్తుంది." : "Add each person and tick the papers they hold. Jeevana will show what is blocked, what comes next, and which paper helps most."}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => setForm(EMPTY_FORM)} className="min-h-11 border-2 border-[var(--ink)] bg-[var(--ink)] px-5 font-mono text-[10px] font-bold uppercase tracking-wider text-white focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2">{language === "te" ? "వ్యక్తిని చేర్చండి" : "Add a person"}</button><button type="button" onClick={loadSample} className="min-h-11 border-2 border-[var(--ink)] px-5 font-mono text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2">{language === "te" ? "నమూనా కుటుంబాన్ని చూడండి" : "Try a sample family"}</button></div>{form ? <MemberEditor form={form} setForm={setForm} onSubmit={saveMember} /> : null}</section>;

  if (!selected) return null;
  if (compact) return <LifeMapStops member={selected} today={today} />;

  return <div>
    <dl className="grid grid-cols-2 divide-x divide-y divide-[var(--line)] border border-[var(--line)] bg-white sm:grid-cols-4 sm:divide-y-0">{[[summary.members, language === "te" ? "సభ్యులు" : "Members"], [summary.blockedStages, language === "te" ? "ఆగిన దశలు" : "Blocked stages"], [summary.dueWithin24Months, language === "te" ? "24 నెలల్లో" : "Due in 24 months"], [summary.deadlines, language === "te" ? "గడువులు" : "Deadlines"]].map(([value, label], index) => <div key={label} className="px-4 py-3"><dd className={`font-serif text-3xl font-bold ${index === 1 || index === 3 ? "text-[var(--brick)]" : ""}`}>{value}</dd><dt className="font-mono text-[8px] font-bold uppercase tracking-wider text-[var(--muted)]">{label}</dt></div>)}</dl>
    <div className="mt-5 grid items-start gap-5 xl:grid-cols-[17rem_minmax(0,1fr)_19rem]">
      <aside className="min-w-0 border border-[var(--line)] bg-white p-4"><div className="flex items-baseline justify-between border-b-2 border-[var(--ink)] pb-2"><h2 className="font-serif text-xl font-bold">{language === "te" ? "కుటుంబం" : "The household"}</h2><span className="font-mono text-[8px] uppercase tracking-wider text-[var(--muted)]">1 · Describe</span></div><div role="tablist" aria-label="Family members" className="mt-3 space-y-2">{members.map((member) => { const analysis = analyseMember(member, today); const active = member.id === selected.id; return <button key={member.id} type="button" role="tab" aria-selected={active} onClick={() => setSelectedId(member.id)} className={`flex min-h-14 w-full items-center gap-2 border p-2 text-left focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] ${active ? "border-[var(--ink)] bg-[var(--marigold-soft)]" : "border-[var(--line)]"}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)] font-serif font-bold text-white">{member.name.charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><strong className="block truncate font-serif">{member.name}</strong><small className="block truncate text-[10px] text-[var(--muted)]">{member.role} · {ageInCompletedYears(member.birthDate, today)}</small></span><span className="font-mono text-[8px] uppercase text-[var(--brick)]">{analysis.counts.blocked} blocked</span></button>; })}</div>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setForm(EMPTY_FORM)} className="min-h-9 border border-[var(--ink)] px-3 font-mono text-[9px] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]">Add</button><button type="button" onClick={() => setForm({ id: selected.id, name: selected.name, role: selected.role, birthDate: selected.birthDate, approximateAge: "" })} className="min-h-9 border border-[var(--line)] px-3 font-mono text-[9px] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]">Edit</button><button type="button" onClick={() => { if (window.confirm(`Remove ${selected.name}?`)) { const next = members.filter((member) => member.id !== selected.id); setMembers(next); setSelectedId(next[0]?.id ?? ""); } }} className="min-h-9 border border-[var(--brick)] px-3 font-mono text-[9px] font-bold uppercase text-[var(--brick)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]">Remove</button></div>
      {form ? <MemberEditor form={form} setForm={setForm} onSubmit={saveMember} /> : null}
      <p className="mt-5 border-b border-[var(--line)] pb-2 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">Papers {selected.name} holds</p><div className="mt-2 space-y-1">{DOCUMENTS.filter((document) => documentApplies(document.id, ageInCompletedYears(selected.birthDate, today))).map((document) => { const state = selected.docs[document.id] ?? "no"; const stateLabel = state === "have" ? "have" : state === "unsure" ? "not sure" : "missing"; return <button key={document.id} type="button" aria-pressed={state === "have"} onClick={() => cycleDocument(document.id)} aria-label={`${document.label} ${document.label_te} ${stateLabel}`} className="grid min-h-11 w-full grid-cols-[1.5rem_1fr_auto] items-center gap-2 px-1 text-left focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]"><span className={`flex h-4 w-4 items-center justify-center border text-[10px] ${state === "have" ? "border-[var(--leaf)] bg-[var(--leaf)] text-white" : "border-[var(--brick)] text-[var(--brick)]"}`}>{state === "have" ? "✓" : state === "unsure" ? "?" : ""}</span><span className="text-[11px] leading-4">{language === "te" ? document.label_te : document.label}<small className="block text-[9px] text-[var(--muted)]">{language === "te" ? document.label : document.label_te}</small></span><span className={`font-mono text-[7px] uppercase ${state === "have" ? "text-[var(--leaf)]" : "text-[var(--brick)]"}`}>{stateLabel}</span></button>; })}</div></aside>
      <LifeMapStops member={selected} today={today} /><SidePanel member={selected} today={today} />
    </div>
    <div className="mt-6 flex justify-end"><button type="button" onClick={() => { if (window.confirm("Clear the household life map?")) { setMembers([]); setSelectedId(""); window.localStorage.removeItem(LIFE_MAP_STORAGE_KEY); } }} className="min-h-10 border border-[var(--brick)] px-4 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--brick)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]">Clear household</button></div>
  </div>;
}

function MemberEditor({ form, setForm, onSubmit }: Readonly<{ form: MemberForm; setForm: (form: MemberForm | null) => void; onSubmit: (event: FormEvent) => void }>) {
  return <form onSubmit={onSubmit} className="mt-4 space-y-3 border border-[var(--line)] bg-[var(--paper)] p-3"><label className="block text-[11px]">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 min-h-10 w-full border border-[var(--line)] bg-white px-2 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]" /></label><label className="block text-[11px]">Role<input required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-1 min-h-10 w-full border border-[var(--line)] bg-white px-2 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]" /></label><label className="block text-[11px]">Date of birth<input type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value, approximateAge: "" })} className="mt-1 min-h-10 w-full border border-[var(--line)] bg-white px-2 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]" /></label><span className="block text-center font-mono text-[8px] uppercase text-[var(--muted)]">or</span><label className="block text-[11px]">Approximate age (years)<input type="number" min="0" max="120" value={form.approximateAge} onChange={(event) => setForm({ ...form, approximateAge: event.target.value, birthDate: "" })} className="mt-1 min-h-10 w-full border border-[var(--line)] bg-white px-2 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]" /></label><div className="flex gap-2"><button type="submit" className="min-h-9 bg-[var(--ink)] px-3 font-mono text-[9px] font-bold uppercase text-white focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]">Save person</button><button type="button" onClick={() => setForm(null)} className="min-h-9 border border-[var(--line)] px-3 font-mono text-[9px] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]">Cancel</button></div></form>;
}
