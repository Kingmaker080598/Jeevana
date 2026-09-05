interface VerifiedSmsMockProps {
  compact?: boolean;
}

const MESSAGES: ReadonlyArray<{ date?: string; time: string; text: string }> = [
  {
    date: "28 Aug 2026",
    time: "9:12 AM",
    text: "JEEVANA: You are registered for the Birth journey. 6 steps in order. Reply DONE after each step. Reply STOP to end.",
  },
  {
    time: "9:13 AM",
    text: "Step 1 of 6 - Register the birth. Go to the Municipality/Panchayat office with the hospital record and an ID proof. Free within 21 days. Verified: crsorgi.gov.in 28-Aug-2026. Reply DONE when finished.",
  },
  {
    time: "6:05 PM",
    text: "JEEVANA: Free birth registration ends in 9 days. After that a late fee and extra paperwork apply. Step 1 is still open. Reply DONE if completed.",
  },
  {
    date: "29 Aug 2026",
    time: "8:30 AM",
    text: "JEEVANA: Sravani turns 18 in 9 months. Start now: Aadhaar biometric update, then voter Form 6 on the 18th birthday. Verified: uidai.gov.in, voters.eci.gov.in.",
  },
];

export function VerifiedSmsMock({ compact = false }: Readonly<VerifiedSmsMockProps>) {
  return (
    <figure className="w-full">
      <div className="mb-3 flex justify-center">
        <span className="border border-[var(--marigold-dark)] bg-[var(--marigold-soft)] px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]">Concept, not live</span>
      </div>
      <div className="rounded-[2.75rem] border-4 border-[var(--ink)] bg-[var(--ink)] p-2 shadow-[8px_8px_0_var(--marigold)]">
        <div className={`flex flex-col overflow-hidden rounded-[2.25rem] bg-white ${compact ? "h-[36rem]" : "h-[43rem]"}`}>
          <div className="flex items-center justify-between px-6 pb-1 pt-3 font-mono text-[10px] font-bold text-[var(--ink)]">
            <span>10:24</span>
            <span aria-hidden="true" className="h-5 w-24 rounded-full bg-[var(--ink)]" />
            <span className="flex items-center gap-1" aria-label="Signal: 2G, no Wi-Fi">
              <span aria-hidden="true" className="flex items-end gap-px"><span className="h-1.5 w-1 bg-[var(--ink)]" /><span className="h-2 w-1 bg-[var(--ink)]" /><span className="h-2.5 w-1 bg-[var(--ink)]" /><span className="h-3 w-1 bg-[var(--line)]" /></span><span>2G</span>
            </span>
          </div>
          <div className="border-b border-[var(--line)] px-5 pb-3 pt-2 text-center">
            <div className="flex items-center justify-center gap-1.5"><h3 className="font-sans text-base font-bold text-[var(--ink)]">JD-JEEVNA</h3><span aria-label="Verified sender" className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--leaf)] text-[10px] font-bold text-white">✓</span></div>
            <p className="mt-0.5 text-[11px] font-medium text-[var(--leaf)]">Verified · Jeevana</p>
          </div>
          <div role="log" aria-label="Verified sender message thread" className="flex-1 space-y-3 overflow-y-auto bg-[var(--paper)] px-3 py-4">
            {MESSAGES.map((message, index) => (
              <div key={`${message.time}-${index}`}>
                {message.date ? <p className="mb-3 text-center font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{message.date}</p> : null}
                <div className="sms-message-in flex justify-start" style={{ animationDelay: `${index * 90}ms` }}><div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-[var(--line)] bg-white px-3 py-2 text-[11px] leading-[1.55] text-[var(--ink)]"><p>{message.text}</p><time className="mt-1 block text-right font-mono text-[8px] text-[var(--muted)]">{message.time}</time></div></div>
              </div>
            ))}
            <div className="sms-message-in flex justify-end" style={{ animationDelay: "360ms" }}><div className="max-w-[70%] rounded-2xl rounded-br-sm bg-[var(--leaf)] px-3.5 py-2 text-sm text-white"><p>DONE</p><time className="mt-1 block text-right font-mono text-[8px] text-white/80">8:42 AM</time></div></div>
            <div className="sms-message-in flex justify-start" style={{ animationDelay: "450ms" }}><div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-[var(--line)] bg-white px-3 py-2 text-[11px] leading-[1.55] text-[var(--ink)]"><p>Step 1 marked done. Step 2 of 6 - Download the birth certificate…</p><time className="mt-1 block text-right font-mono text-[8px] text-[var(--muted)]">8:42 AM</time></div></div>
          </div>
          <div className="border-t border-[var(--line)] bg-white px-4 py-3"><div className="flex min-h-9 items-center rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 text-xs text-[var(--muted)]">Text message</div></div>
        </div>
      </div>
      <figcaption className="mt-4 text-center font-mono text-[9px] uppercase leading-4 tracking-[0.1em] text-[var(--muted)]">Sender ID shown for illustration. Real headers need TRAI DLT registration, which is planned.</figcaption>
    </figure>
  );
}
