# Jeevana Vision Site Design

## Goal

Reframe the existing Jeevana prototype as a vision-led public website for two audiences: residents who want to try concrete life-event guidance and institutional stakeholders evaluating Jeevana as a national public-service sequence layer. The national idea leads; the working Andhra Pradesh journeys provide proof.

## Positioning

Jeevana begins with the premise that life does not happen department by department. Government services are commonly published by the office that owns them, while residents experience them as sequences triggered by events such as a birth, turning 18, or a death in the family. Jeevana organizes those scattered services into a clear path through each event.

The site presents Andhra Pradesh as the initial pilot and the current journeys as demonstrations of the broader model. It must not imply official government ownership, nationwide operational coverage, or production integrations that do not exist.

## Audience and language

The primary experience serves both audiences in this order:

1. Residents can recognize their life event and enter a working journey quickly.
2. Stakeholders can understand the systemic problem, the sequence-layer model, the pilot evidence, and the intended national scope.

The website is English-only for this release. Telugu controls, secondary labels, and bilingual branding are not shown. The existing Telugu source fields may remain in the journey data, but they are not part of the rendered experience.

## Selected visual direction

Use the approved **Civic manifesto** direction. It combines a bold public-interest thesis with immediate proof and accessible pilot journeys. It is preferable to a cinematic national campaign, which would bury resident utility, and to a journey-first directory, which would understate the national idea.

The visual system retains the existing civic-editorial character:

- warm paper background and near-black ink;
- marigold highlights and deep green accents;
- large serif headlines for the public-interest narrative;
- compact monospaced labels for evidence, stages, and service metadata;
- clear borders, numbered sequences, and restrained offset shadows;
- minimal, purposeful motion and strong keyboard focus states.

The site should feel authoritative and tangible without imitating a government portal or adopting generic startup styling.

## Information architecture

The homepage uses the following sequence:

1. **Hero:** “Life doesn’t happen department by department.” Supporting copy defines Jeevana as one clear path through major life events. Primary action: “Explore the pilot.” Secondary action: “How Jeevana works.”
2. **Proof strip:** 16 life stages mapped, 3 pilot journeys, and one ordered path. Values come from existing project data where practical rather than duplicated constants.
3. **Pilot journeys:** prominent cards for A child is born, Turning 18, and A death in the family. Each card links to the existing intake and roadmap flow.
4. **How Jeevana works:** a four-part sequence — choose an event, answer a few questions, receive an ordered path, and continue through verified official sources.
5. **National roadmap:** all remaining mapped stages appear as future coverage. They are described as the roadmap, not as broken or unfinished product features, and are not interactive.
6. **Why Jeevana:** explains departmental fragmentation, the absence of a published cross-department sequence, and the role of an independent sequence layer.
7. **Stakeholder section:** summarizes the intended public value, guiding principles, Andhra Pradesh pilot, and an invitation to collaborate. The invitation is informational in this release; no contact form or external integration is added.
8. **Footer disclosure:** states that Jeevana is an independent demonstration, that official requirements can change, and that visitors should confirm details through linked official sources.

The global header keeps the Jeevana wordmark, a link to the journeys/homepage, and a context-appropriate reset action inside an active journey. It does not show the former language toggle.

## Journey experience

The three existing journeys remain the core product proof. Their current behavior is preserved unless a homepage or English-only change requires a focused adjustment:

- a short intake captures only answers needed to personalize visibility;
- the resolver creates an ordered list of visible, available, completed, and blocked steps;
- each step presents its authority, fee, expected timing, documents, plain-language purpose, verification date, and official source when present;
- completion progress is stored only in browser local storage;
- no account, server database, analytics identity, uploads, or personal-data submission is introduced;
- official-source links open the responsible government page, and the surrounding copy makes clear that fees, rules, and timelines can change.

## Component boundaries

Keep the implementation focused and compatible with the current Next.js App Router structure.

- `HomeContent` owns homepage composition and receives existing life-stage and evidence data from the server page.
- Small presentational components may be extracted when a section has an independent purpose or repeated structure, but the homepage should not become a framework of speculative abstractions.
- Existing journey-domain, resolver, state, and route boundaries remain unchanged.
- English-only rendering should be achieved at the presentation boundary. Removing unused visible language controls is in scope; rewriting the underlying journey schema or deleting bilingual source data is not.
- Homepage anchor links provide in-page navigation for “Explore the pilot” and “How Jeevana works.” No additional route is required for the stakeholder narrative.

## Data flow and privacy

Static journey JSON and the life-stage catalog remain the source of truth. The server-rendered homepage loads and summarizes this data, then passes only the required view data into client components. Journey intake answers and completed-step identifiers remain device-local under the existing versioned local-storage key.

The site adds no network submission, authentication, cookies, tracking pixels, or persistent backend storage. It must not request sensitive personal information.

## Failure behavior

- Invalid journey graphs continue to fail the production build through existing validation rather than rendering a misleading partial path.
- A missing required pilot journey fails clearly during rendering/build.
- Optional step fields use neutral fallbacks already established by the product, such as an em dash or “No documents listed.”
- The stakeholder invitation remains plain content so it cannot fail due to an unavailable external service.
- External official pages are outside Jeevana’s control; links are accompanied by a last-verified date and a confirmation notice.

## Accessibility and responsive behavior

- The homepage is mobile-first and preserves a clear reading and focus order.
- All interactive cards are semantic links with descriptive accessible names.
- Anchor targets account for the persistent page context and remain reachable by keyboard.
- Text and controls maintain sufficient contrast against paper, marigold, green, and ink surfaces.
- Planned life stages are visibly non-interactive and are not styled as disabled controls that imply hidden functionality.
- Motion is optional, restrained, and respects reduced-motion preferences.
- Journey roadmaps preserve their compact mobile step navigator and desktop sidebar behavior.

## Metadata and sharing

Site metadata describes Jeevana as a public-service sequence layer for life events, built for India and piloted in Andhra Pradesh. The page title and description must match the approved positioning. A site-wide social preview should use the Jeevana title, the primary headline, the established palette, and no invented government affiliation or personal data.

## Testing and validation

Automated tests should verify:

- the approved hero message and both hero actions;
- proof values and the three pilot journey links;
- the four-step “How Jeevana works” explanation;
- roadmap and stakeholder narrative content;
- absence of visible Telugu controls or labels in the English-only release;
- semantic and non-interactive treatment of planned stages;
- preservation of journey routing, resolver behavior, and device-local progress state.

Run the existing unit suite and the production build. The site is ready to publish only after both succeed. Because browser QA was not requested, visual validation is limited to the approved visual-companion direction and build-time/runtime checks required by the Sites workflow.

## Out of scope

- Telugu or other language support in the rendered interface;
- new life-event journey content beyond the existing three pilots;
- government authentication or integration;
- accounts, cloud persistence, analytics profiles, uploads, or forms;
- office lookup, letter generation, payments, notifications, or case tracking;
- claims of official government status or nationwide live coverage.
