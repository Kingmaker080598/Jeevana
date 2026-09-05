# Codex brief: Jeevana v2 — Landing page, Household Life Map, verified-sender SMS mock

You are working in the repository `Kingmaker080598/Jeevana`. Read this whole brief before touching code.
Work on a new branch off `main` named `codex/jeevana-v2`. Commit in small, well-described commits.

## 0. What Jeevana is, and what already exists

Jeevana turns scattered Indian government services into one ordered path through life's major events.
It is a hackathon prototype piloted for Andhra Pradesh. It is an independent demonstration, not a government service, and every page must keep saying so.

Stack: Next.js 14 (App Router), TypeScript strict, Tailwind 3.4, React 18, Vitest + Testing Library. Deployed on Vercel with zero environment variables required. No database, no auth.

Key existing files. Read them before designing anything:

- `app/globals.css` — the design tokens. Use only these colours: `--paper #f6f1e6`, `--ink #17201d`, `--muted #5f6762`, `--line #c9c5b9`, `--marigold #e5a719`, `--marigold-dark #9a6500`, `--marigold-soft #fff0bd`, `--leaf #23634d`. You may add exactly one semantic token for "blocked": `--brick #b0432b` with a soft variant `--brick-soft #f7e3dd`.
- `app/layout.tsx` — fonts via `next/font`: Playfair Display (`font-serif`, display/headings), Poppins (`font-sans`, body), IBM Plex Mono (`font-mono`, labels and eyebrows, uppercase with letter-spacing). Do not add fonts.
- `components/HomeContent.tsx` — the current landing page. Study its visual language: framed hero with corner marks, marigold rule, hard offset shadows (`shadow-[5px_5px_0_var(--marigold)]`), square corners, dotted spine on the roadmap, mono eyebrows. Keep this language everywhere.
- `components/AppShell.tsx` — sticky header with the DEMO badge and nav. Extend the nav; do not remove the badge.
- `data/lifeStages.ts` — the 16 life stages in order, 3 `live` (birth, turning18, death) and 13 `planned`.
- `data/journeys/*.json` — the three live journeys with steps, `documents`, `dependsOn`, `officialSource`, `lastVerified`, `deadline`, and Telugu fields (`name_te`, `whyPlain_te`). **Do not modify these files.**
- `lib/journey/resolver.ts`, `loadJourneys.ts`, `types.ts` — the dependency engine for a single journey. **Do not change its behaviour.** You may import from it.
- `components/SmsDemo.tsx` and `app/sms-demo/page.tsx` — an existing interactive SMS concept page. Keep the route working; you may reuse its message-building helpers.
- `components/HomeContent.test.tsx` — existing tests. You may update tests to match the new landing page, but keep these invariants: the "Open now" region contains exactly three journey links; planned stages in the roadmap render no links.
- `lib/features.ts` — `NEXT_PUBLIC_ENABLE_TE` toggles the Telugu UI. New UI must work with the flag on and off.
- `docs/mocks/household-life-map.html` — an interactive HTML mock of the Household Life Map. **Open it in a browser and use it as the visual and behavioural reference for Part 2.** Its dependency data is illustrative; you will write the real data.

Hard rules:
- Additive work only. Existing routes must keep working exactly as they do.
- No new runtime dependencies unless genuinely unavoidable; if you add one, say why in the PR.
- No environment variables, no backend routes, no persistence beyond `localStorage`.
- Never hardcode secrets. Never use `innerHTML` with anything but constants.
- Every mock must carry a visible, honest label that it is a concept and not live.
- `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` must all pass before you finish.

---

## 1. Redo the landing page

Rebuild `components/HomeContent.tsx` (and `app/page.tsx` if needed) so the landing page tells the new story. Keep the brand language described above; this is a re-composition, not a re-brand.

Narrative the page must carry, in this order:

1. **Hero.** Keep the headline "Life doesn't happen department by department." Add a second line under it: "Jeevana tells you what to do next, what you missed, and what's coming." Keep the framed plate, corner marks, marigold rule, and `JourneyPathArt`. Two CTAs: "Start a journey" and "Map your household".
2. **Evidence strip.** Keep as is (steps, departments, portals, documented sequences from the death journey).
3. **Open now.** Keep the three live journey cards exactly as they are.
4. **NEW — Household Life Map.** A feature section with an eyebrow "New", a heading, two sentences of explanation, and a compact live preview: render the real `LifeMap` component from Part 2 in a read-only "sample family" state showing one member's 16-stop map with a couple of blocked and upcoming stops visible. CTA: "Open the Life Map" → `/life-map`.
5. **NEW — Jeevana reaches you where you are.** Split section. Left: heading and copy explaining that the same engine can deliver a path on a screen, on paper, and by SMS. Right: the verified-sender SMS phone mock from Part 3. Under it, three small pills: "SMS · planned", "WhatsApp · planned", "Printable card · in the Life Map". Link to `/sms-demo` labelled "Try the interactive SMS preview".
6. **How Jeevana works.** Update to four steps: choose a life event or describe your household; answer a few questions or tick the papers you hold; receive an ordered path and what to fix first; continue through official sources.
7. **Roadmap.** Keep the 16-stop timeline as is.
8. **Why Jeevana** and the footer disclaimer. Keep.

Header nav: add "Life Map". Keep the DEMO badge.

Quality bar: the page must render fully on first paint with no content hidden behind scroll-triggered animation; hero must not be viewport-height; body must never scroll horizontally on mobile; all interactive elements have visible focus rings; `prefers-reduced-motion` disables the existing entrance animations (already handled in `globals.css`, keep it working).

---

## 2. Household Life Map (route `/life-map`)

### What it is

Describe a household once. For each member, Jeevana shows the 16 life stages coloured by status, what they missed and what it is blocking, the one paper to fix first, what is coming in the next 24 months, and a printable bilingual path card. It runs entirely in the browser.

Open `docs/mocks/household-life-map.html` now. Match its layout, states, and behaviour. The three-column layout is: household panel (left), life map (centre), "Do this first" + "Coming up" + path card (right). On narrow screens the columns stack.

### Data (new files, additive)

`data/documents.ts` — a registry of papers a person can hold. Each entry: `id`, `label`, `label_te`, and `howToGet: { title, title_te, where, carry, officialSource | null, lateTrack?: {...same fields} }`. Start from the 13 documents in the mock (birth, aadhaar, ration, school, caste, voter, bank, nominee, pan, dl, marriage, insurance, pension). Where a live journey already has a step for obtaining that document, copy its `officialSource` and `lastVerified` from the journey JSON rather than inventing them. Where there is no official portal, set `officialSource: null` and name the physical office in `where`.

`data/stageDependencies.ts` — one entry per stage id in `data/lifeStages.ts`: `ageFrom: number | null` (null = event-driven), `coreDocuments: string[]` (documents that prove the stage is done), `requiredDocuments: string[]` (documents the stage needs), `prepNow: string` and `prepNow_te: string` (what to start early when the stage is upcoming). Use the table in the mock as the starting point, then check the three live stages against their journey JSON `documents` arrays and correct anything that disagrees. Add a unit test that every document id referenced exists in the registry and every stage id exists in `lifeStages`.

### Engine (`lib/lifeMap/`)

Pure, deterministic, fully unit-tested. Do not touch `lib/journey/resolver.ts`.

Types:
- `DocState = "have" | "no" | "unsure"` — `unsure` is treated as missing everywhere, deliberately.
- `Member = { id, name, role, birthDate: ISO string, docs: Record<documentId, DocState> }`. Age is derived from `birthDate` and a `today` argument passed in (never `Date.now()` inside the engine, so tests are stable).
- `StageStatus = "done" | "ready" | "blocked" | "upcoming" | "future" | "past"`.

`stageStatus(member, stage, today)` rules, in this order:
1. If `coreDocuments` is non-empty and all are held → `done`.
2. If stage is `birth` and the birth certificate is missing → `blocked`, with `missing: ["birth"]`. If the member is under 21 days old, attach `deadlineDaysLeft = 21 - ageInDays`. If the member is 1 year or older, mark `lateTrack: true`.
3. If `ageFrom` is set and the member is younger → `upcoming` with `monthsUntil` when that is 24 or fewer, otherwise `future`.
4. If `ageFrom` is set, `coreDocuments` is non-empty, and the member is more than 12 years past `ageFrom` → `past` (no action; the moment has gone).
5. If any `requiredDocuments` are missing → `blocked` with the missing list.
6. Otherwise `ready`.

`analyseMember(member, today)` returns the 16 rows, `doFirst`, `upcoming`, and counts. `doFirst` is the missing document that appears in the most `blocked` rows; ties break by the document registry order. Exception: a newborn with an unregistered birth always gets `birth` first. `upcoming` is the list of `upcoming` rows plus the birth deadline if present, sorted soonest first.

`analyseHousehold(members, today)` returns totals for the summary strip: members, blocked stages, items due within 24 months, deadlines.

Tests must cover at minimum: the sample family below; removing Sravani's birth certificate turns three stages blocked and makes `doFirst` the late birth track; Venkata Rao's `doFirst` is `nominee`, not `birth`; the 12-day-old baby has a 9-day deadline; `unsure` counts as missing; a member with every paper has `doFirst` null.

### State and screens

- State lives in React and is mirrored to `localStorage` under one key. Reloading restores it. A "Clear household" action wipes it after a confirm.
- Empty state on first visit: a short explanation and two buttons, "Add a person" and "Try a sample family". The sample family is exactly the one in the mock: Venkata Rao (grandfather, 68), Lakshmi (mother, 34), Sravani (daughter, 17 years 3 months), Baby boy (12 days old). Derive their `birthDate`s from `today` at load time so the demo numbers stay correct on any date.
- Household panel: add, edit, and remove members (name or role, date of birth, or "approximate age" that converts to a birth date). Selecting a member drives the other columns. Under the selected member, the document list as tri-state buttons cycling have → missing → not sure, each with English and Telugu labels. Hide papers that cannot apply to a member's age (the mock shows the rule).
- Life map: reuse the visual system of the roadmap in `HomeContent.tsx` (numbered circles, dotted spine, two columns of eight). Status colours: done = leaf fill; ready = leaf outline; blocked = brick fill; upcoming = marigold fill; past/future = dashed line outline, muted title. Each stop shows a one-line reason. Live stages link to their journey page.
- Do this first: the card with the strongest treatment on the page (ink border, marigold offset shadow). Title in English and Telugu, how many stages it unblocks, where to go, what to carry, verified source and date when present, and the list of stages it unblocks as small tags. When nothing is blocked, say so plainly.
- Coming up: the birth deadline (in days, in brick) and upcoming stages (in months, in marigold-dark) with their `prepNow` text.
- Path card: bilingual, "In this order", the do-first item followed by the remaining missing papers (max 4), each with office and what to carry, a tick box per line, and the disclaimer. A "Print this card" button. Add a print stylesheet so printing shows only the card, A4 portrait, black on white, large type, one member per page.
- Telugu: the card is always bilingual. The rest of the page follows the existing language toggle when `NEXT_PUBLIC_ENABLE_TE` is on, using `useLanguage()` from `components/LanguageProvider.tsx`.
- Accessibility: member and document controls are real buttons with `aria-pressed`/`aria-selected`; the map is an ordered list; status is conveyed by text as well as colour; everything works by keyboard.
- Privacy: nothing leaves the browser. Say so on the page in one sentence.
- Label: a small persistent note at the top of the page reading "Preview — dependency data across the 13 planned stages is a first draft. Confirm at the office." Keep the concept label style used on `/sms-demo`.

---

## 3. Verified-sender SMS mock (component used on the landing page)

Build `components/VerifiedSmsMock.tsx`: a static phone mock of how Jeevana's SMS would appear in an Indian messaging app, the way a message from Airtel or SBI does.

Realism requirements, because this is what sells it:

- **Sender ID in Indian DLT header format**: a two-letter route prefix, a hyphen, and a six-character alphanumeric header. Use `JD-JEEVNA`. Show it exactly where the phone shows a sender name, with the "verified sender" tick and "Verified · Jeevana" line that Google Messages shows for verified businesses. Below the phone, a mono caption: "Sender ID shown for illustration. Real headers need TRAI DLT registration, which is planned."
- **Transactional-SMS tone**: short, plain, template-like sentences with a reference-style tail, no emoji, no marketing voice. Include a timestamp per message and a date divider.
- **Messages to show**, as a thread over two days. All content comes from real journey data or the Life Map sample family, never invented offices or fees:
  1. Welcome: "JEEVANA: You are registered for the Birth journey. 6 steps in order. Reply DONE after each step. Reply STOP to end."
  2. Step message built with the same format as `components/SmsDemo.tsx`: "Step 1 of 6 - Register the birth. Go to the Municipality/Panchayat office with the hospital record and an ID proof. Free within 21 days. Verified: crsorgi.gov.in 28-Aug-2026. Reply DONE when finished."
  3. Deadline reminder: "JEEVANA: Free birth registration ends in 9 days. After that a late fee and extra paperwork apply. Step 1 is still open. Reply DONE if completed."
  4. Life Map nudge: "JEEVANA: Sravani turns 18 in 9 months. Start now: Aadhaar biometric update, then voter Form 6 on the 18th birthday. Verified: uidai.gov.in, voters.eci.gov.in."
  5. An outgoing "DONE" and the acknowledgement "Step 1 marked done. Step 2 of 6 - Download the birth certificate ..." (truncate with an ellipsis inside the bubble).
- **Phone frame**: reuse the bezel and status-bar treatment from `components/SmsDemo.tsx` so both mocks feel like the same device. Status bar shows "2G" and no Wi-Fi, because the point is that this works without data.
- Static by default. Optionally, messages fade in one after another on first view; must be disabled under `prefers-reduced-motion`, and every message must be present in the DOM at rest.
- The component takes no props except an optional `compact` boolean for the landing page. It is also rendered at the top of `/sms-demo` above the interactive handset, with a heading "What it looks like on a real phone".

---

## 4. Definition of done

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` all pass.
- `/`, `/life-map`, `/sms-demo`, `/journey/birth`, `/journey/turning18`, `/journey/death`, and every step page still render.
- Lighthouse on `/` and `/life-map`: accessibility 95+, no horizontal scroll at 360px width.
- Screenshots of `/` (desktop and 375px), `/life-map` with the sample family and Sravani's birth certificate removed, and the print preview of a path card, attached to the PR.
- PR description lists every new file, every modified file, any dependency added and why, and anything left out with the reason.
