"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { Journey, Step } from "@/lib/journey/types";

/**
 * Concept preview of Jeevana over SMS.
 *
 * Everything here is scripted and client-side: no gateway, no backend, no
 * persistence. Step names, official sources and verification dates are read
 * from the real journey data so the mock stays accurate to the roadmap, but the
 * conversation itself is a fixed linear script that advances on any reply.
 */

const CONCEPT_NOTICE =
  "Concept preview — SMS access is a planned feature. This mockup demonstrates what it will look like once built.";

const SHORT_CODE = "56070";
const REPLY_DELAY_MS = 650;

type ScriptJourneyId = "birth" | "turning18" | "death";

interface ScriptedStep {
  /** Must match a step id in the corresponding journey JSON. */
  stepId: string;
  /** One or two sentences, written for a 160-character-per-segment medium. */
  sms: string;
}

interface JourneyScript {
  journeyId: ScriptJourneyId;
  label: string;
  /** The keyword a user would text to the short code to start this journey. */
  keyword: string;
  /** Intake answers the script assumes, mirroring the roadmap's questions. */
  assumptions: string;
  steps: readonly ScriptedStep[];
}

const SCRIPTS: readonly JourneyScript[] = [
  {
    journeyId: "birth",
    label: "Birth",
    keyword: "BIRTH",
    assumptions: "Assuming: born within the last 1 year, girl.",
    steps: [
      {
        stepId: "register-birth",
        sms: "Go to the Municipality/Panchayat office with the hospital record and an ID proof. Free within 21 days of birth.",
      },
      {
        stepId: "get-certificate-copy",
        sms: "Take your application reference number to a MeeSeva centre and collect the birth certificate. Later steps need this copy.",
      },
      {
        stepId: "baby-aadhaar",
        sms: "Visit the nearest Aadhaar enrolment centre with the birth certificate and a parent's Aadhaar.",
      },
      {
        stepId: "ration-card-add",
        sms: "At MeeSeva or the Sachivalayam, ask to add the baby to the household rice/ration card. Carry the birth certificate.",
      },
      {
        stepId: "vaccination",
        sms: "Vaccines start at birth and do not wait for paperwork. Ask your ANM or PHC for the U-WIN schedule card.",
      },
      {
        stepId: "sukanya",
        sms: "For a girl child, open a Sukanya Samriddhi account at a post office or bank. Carry the birth certificate and guardian KYC.",
      },
    ],
  },
  {
    journeyId: "turning18",
    label: "Turning 18",
    keyword: "18",
    assumptions: "Assuming: you have a minor bank account and want to drive.",
    steps: [
      {
        stepId: "voter-id",
        sms: "Fill Form 6 to enrol as a voter. Carry address proof and age proof, or ask the BLO in your ward to help.",
      },
      {
        stepId: "aadhaar-biometric",
        sms: "Check whether your Aadhaar biometric update (due at 15) was done. If not, finish it at an enrolment centre first.",
      },
      {
        stepId: "bank-major",
        sms: "Visit your bank branch with KYC documents to convert the minor account to a major account.",
      },
      {
        stepId: "driving-licence",
        sms: "Apply for a learner's licence through AP Transport / Parivahan Sarathi. Needs the updated Aadhaar from step 2.",
      },
    ],
  },
  {
    journeyId: "death",
    label: "Death",
    keyword: "DEATH",
    assumptions: "Assuming: a nominee was registered on the bank account.",
    steps: [
      {
        stepId: "register-death",
        sms: "Report the death at the Municipality, Panchayat or Sachivalayam. Free within 21 days.",
      },
      {
        stepId: "death-certificate",
        sms: "Collect death certificate copies from MeeSeva. Ask each office later whether it needs an original or a copy.",
      },
      {
        stepId: "family-member-certificate",
        sms: "Apply at MeeSeva for the Family Member Certificate. Carry the application form, ration card/EPIC/Aadhaar and the death certificate.",
      },
      {
        stepId: "bank-settlement",
        sms: "The nominee can go to the bank with the death certificate to claim and settle the accounts.",
      },
      {
        stepId: "epf-claim",
        sms: "Start the EPF/pension/EDLI claim. The EPFO claim-form guide shows the route for a nominee or legal heir.",
      },
      {
        stepId: "insurance-claim",
        sms: "Inform LIC or the insurer about the death to start the claim. The death certificate unlocks this.",
      },
    ],
  },
];

interface Message {
  id: number;
  from: "jeevana" | "user";
  text: string;
}

const VERIFIED_DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatVerified(step: Step): string {
  const checked = VERIFIED_DATE.format(new Date(`${step.lastVerified}T00:00:00Z`));
  if (step.officialSource) {
    const domain = new URL(step.officialSource).hostname.replace(/^www\./, "");
    return `Verified: ${domain} · checked ${checked}`;
  }
  return `Verified: no online portal, go to ${step.authority} · checked ${checked}`;
}

function buildStepMessage(script: JourneyScript, journey: Journey, index: number): string {
  const scripted = script.steps[index];
  const step = journey.steps.find((candidate) => candidate.id === scripted.stepId);
  if (!step) {
    throw new Error(`SMS script references unknown step "${scripted.stepId}" in journey "${journey.id}".`);
  }

  return [
    `Step ${index + 1} of ${script.steps.length} — ${step.name}`,
    scripted.sms,
    formatVerified(step),
    "Reply DONE when finished.",
  ].join("\n");
}

function buildIntro(script: JourneyScript, journey: Journey): string {
  return [
    `Jeevana: ${journey.name} journey. ${script.steps.length} steps, sent one at a time in the order they must happen.`,
    script.assumptions,
    "Reply DONE after each step. Reply STOP anytime to end.",
  ].join("\n");
}

function buildAcknowledgement(input: string, stepNumber: number): string {
  return /\bdone\b/i.test(input)
    ? `✓ Step ${stepNumber} marked done.`
    : `Got it. Marking step ${stepNumber} done — reply DONE next time to confirm.`;
}

function buildCompletion(script: JourneyScript): string {
  return [
    `All ${script.steps.length} steps complete. Jeevana will text you if a deadline is near.`,
    "Reply BIRTH, 18 or DEATH to start another journey.",
  ].join("\n");
}

interface SmsDemoProps {
  journeys: readonly Journey[];
}

export function SmsDemo({ journeys }: Readonly<SmsDemoProps>) {
  const [activeId, setActiveId] = useState<ScriptJourneyId>("birth");
  const [messages, setMessages] = useState<Message[]>([]);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const nextMessageId = useRef(1);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const script = useMemo(() => {
    const found = SCRIPTS.find((candidate) => candidate.journeyId === activeId);
    if (!found) throw new Error(`No SMS script for journey "${activeId}".`);
    return found;
  }, [activeId]);

  const journey = useMemo(() => {
    const found = journeys.find((candidate) => candidate.id === activeId);
    if (!found) throw new Error(`Journey "${activeId}" is missing.`);
    return found;
  }, [journeys, activeId]);

  const isComplete = completedSteps >= script.steps.length;

  const makeMessage = useCallback((from: Message["from"], text: string): Message => {
    const id = nextMessageId.current;
    nextMessageId.current += 1;
    return { id, from, text };
  }, []);

  const clearPendingReply = useCallback(() => {
    if (replyTimer.current) {
      clearTimeout(replyTimer.current);
      replyTimer.current = null;
    }
  }, []);

  const startConversation = useCallback(() => {
    clearPendingReply();
    setIsTyping(false);
    setDraft("");
    setCompletedSteps(0);
    setMessages([
      makeMessage("user", `JEEVANA ${script.keyword}`),
      makeMessage("jeevana", buildIntro(script, journey)),
      makeMessage("jeevana", buildStepMessage(script, journey, 0)),
    ]);
  }, [script, journey, makeMessage, clearPendingReply]);

  // (Re)start the scripted conversation whenever the journey changes.
  useEffect(() => {
    startConversation();
  }, [startConversation]);

  useEffect(() => clearPendingReply, [clearPendingReply]);

  // Keep the newest bubble in view.
  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, [messages, isTyping]);

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || isTyping || isComplete) return;

      const stepNumber = completedSteps + 1;
      const nextCompleted = completedSteps + 1;

      setMessages((current) => [...current, makeMessage("user", text)]);
      setDraft("");
      setIsTyping(true);

      replyTimer.current = setTimeout(() => {
        const replies: Message[] = [makeMessage("jeevana", buildAcknowledgement(text, stepNumber))];
        if (nextCompleted < script.steps.length) {
          replies.push(makeMessage("jeevana", buildStepMessage(script, journey, nextCompleted)));
        } else {
          replies.push(makeMessage("jeevana", buildCompletion(script)));
        }
        setMessages((current) => [...current, ...replies]);
        setCompletedSteps(nextCompleted);
        setIsTyping(false);
        replyTimer.current = null;
      }, REPLY_DELAY_MS);
    },
    [completedSteps, isComplete, isTyping, journey, makeMessage, script],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send(draft);
    inputRef.current?.focus();
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
      {/* ——— Concept notice: deliberately outside and unlike the phone UI ——— */}
      <div
        role="note"
        className="flex items-start gap-3 border-2 border-dashed border-[var(--marigold-dark)] bg-[var(--marigold-soft)] px-4 py-3"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--marigold-dark)] font-serif text-sm font-bold text-white"
        >
          !
        </span>
        <p className="font-mono text-[11px] font-bold uppercase leading-5 tracking-[0.12em] text-[var(--ink)]">
          {CONCEPT_NOTICE}
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
        {/* ——— Left: explanation and journey selector ——— */}
        <section aria-labelledby="sms-demo-heading">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--marigold-dark)]">
            Planned · Access without a smartphone
          </p>
          <h1
            id="sms-demo-heading"
            className="mt-3 font-serif text-4xl font-bold leading-tight tracking-tight text-[var(--ink)] sm:text-5xl"
          >
            Jeevana over SMS
          </h1>
          <span aria-hidden="true" className="mt-4 block h-1 w-24 bg-[var(--marigold)]" />
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)]">
            Many families who most need an ordered path have a basic phone and no data plan. The
            same dependency-ordered journeys that power this site could be delivered one step at
            a time over plain text messages: text a keyword, receive the first step, reply DONE,
            receive the next.
          </p>

          <div className="mt-8">
            <p
              id="sms-journey-picker-label"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--leaf)]"
            >
              Choose a journey to load its script
            </p>
            <div
              role="group"
              aria-labelledby="sms-journey-picker-label"
              className="mt-3 inline-flex flex-wrap border-2 border-[var(--ink)] bg-white"
            >
              {SCRIPTS.map((candidate) => {
                const isActive = candidate.journeyId === activeId;
                return (
                  <button
                    key={candidate.journeyId}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveId(candidate.journeyId)}
                    className={`min-h-11 px-5 font-mono text-xs font-bold uppercase tracking-[0.14em] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--marigold)] ${
                      isActive
                        ? "bg-[var(--ink)] text-white"
                        : "text-[var(--ink)] hover:bg-[var(--paper)]"
                    }`}
                  >
                    {candidate.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
              Equivalent to texting{" "}
              <span className="text-[var(--ink)]">JEEVANA {script.keyword}</span> to {SHORT_CODE}
            </p>
          </div>

          <dl className="mt-8 grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Script source
              </dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--ink)]">
                Step names, order and verified sources come from the {journey.name} journey used on
                this site.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                What advances it
              </dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--ink)]">
                Any reply. The mock does not interpret text; it plays the next scripted step.
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                Not built yet
              </dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--ink)]">
                No SMS gateway, short code, backend or saved progress. Reloading resets the demo.
              </dd>
            </div>
          </dl>

          <p className="mt-8 text-sm text-[var(--muted)]">
            Prefer the web version?{" "}
            <Link
              href={`/journey/${journey.id}`}
              className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--leaf)] underline decoration-[var(--marigold)] decoration-2 underline-offset-4 hover:text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2"
            >
              Open the {journey.name} journey <span aria-hidden="true">→</span>
            </Link>
          </p>
        </section>

        {/* ——— Right: the phone mockup ——— */}
        <section aria-label="Simulated SMS conversation" className="mx-auto w-full max-w-sm">
          <div className="rounded-[2.75rem] border-4 border-[var(--ink)] bg-[var(--ink)] p-2 shadow-[8px_8px_0_var(--marigold)]">
            <div className="flex h-[40rem] flex-col overflow-hidden rounded-[2.25rem] bg-white">
              {/* Status bar */}
              <div className="flex items-center justify-between px-6 pb-1 pt-3 font-mono text-[10px] font-bold text-[var(--ink)]">
                <span>10:24</span>
                <span aria-hidden="true" className="h-5 w-24 rounded-full bg-[var(--ink)]" />
                <span className="flex items-center gap-1" aria-label="Signal: 2G, no data">
                  <span aria-hidden="true" className="flex items-end gap-px">
                    <span className="h-1.5 w-1 bg-[var(--ink)]" />
                    <span className="h-2 w-1 bg-[var(--ink)]" />
                    <span className="h-2.5 w-1 bg-[var(--line)]" />
                    <span className="h-3 w-1 bg-[var(--line)]" />
                  </span>
                  <span>2G</span>
                </span>
              </div>

              {/* Conversation header */}
              <div className="border-b border-[var(--line)] px-5 pb-3 pt-2 text-center">
                <p className="font-serif text-base font-bold text-[var(--ink)]">JEEVANA</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  Short code {SHORT_CODE} · Free to reply
                </p>
              </div>

              {/* Thread */}
              <div
                ref={threadRef}
                role="log"
                aria-live="polite"
                aria-label="Messages"
                className="flex-1 space-y-3 overflow-y-auto bg-[var(--paper)] px-4 py-4"
              >
                <p className="text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  Today
                </p>
                {messages.map((message) =>
                  message.from === "user" ? (
                    <div key={message.id} className="flex justify-end">
                      <p className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-br-sm bg-[var(--leaf)] px-3.5 py-2 text-sm leading-5 text-white">
                        {message.text}
                      </p>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start">
                      <p className="max-w-[88%] whitespace-pre-line rounded-2xl rounded-bl-sm border border-[var(--line)] bg-white px-3.5 py-2 text-sm leading-5 text-[var(--ink)]">
                        {message.text}
                      </p>
                    </div>
                  ),
                )}
                {isTyping ? (
                  <div className="flex justify-start" aria-hidden="true">
                    <p className="rounded-2xl rounded-bl-sm border border-[var(--line)] bg-white px-3.5 py-2 font-mono text-xs tracking-[0.3em] text-[var(--muted)]">
                      •••
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Composer */}
              <form onSubmit={handleSubmit} className="border-t border-[var(--line)] bg-white px-3 pb-4 pt-3">
                <div className="flex flex-wrap gap-2 pb-2">
                  <button
                    type="button"
                    onClick={() => send("DONE")}
                    disabled={isTyping || isComplete}
                    className="min-h-8 border border-[var(--leaf)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--leaf)] transition-colors hover:bg-[var(--leaf)] hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--leaf)]"
                  >
                    Reply DONE
                  </button>
                  {isComplete ? (
                    <button
                      type="button"
                      onClick={startConversation}
                      className="min-h-8 border border-[var(--line)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]"
                    >
                      Restart {script.label}
                    </button>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="sms-composer" className="sr-only">
                    Message
                  </label>
                  <input
                    ref={inputRef}
                    id="sms-composer"
                    type="text"
                    autoComplete="off"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      // Explicit Enter-to-send so the composer behaves like a real SMS app
                      // regardless of implicit form-submission quirks.
                      if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        send(draft);
                      }
                    }}
                    disabled={isComplete}
                    placeholder={isComplete ? "Journey complete" : "Text message"}
                    className="min-h-10 flex-1 rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isTyping || isComplete || draft.trim().length === 0}
                    aria-label="Send"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--leaf)] font-mono text-sm font-bold text-white transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    <span aria-hidden="true">↑</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Simulated handset · Nothing is sent
          </p>
        </section>
      </div>
    </main>
  );
}
