# Jeevana Journey Engine Design

## Goal

Build a Next.js 14 App Router prototype whose core is a data-driven journey graph for Andhra Pradesh public-service life events. Journey definitions are static JSON loaded at build time; application code resolves visibility and progress without embedding journey-specific rules.

## Selected approach

Use a small typed domain layer with three boundaries:

1. `lib/journey/types.ts` defines the JSON contract and resolver result types.
2. `lib/journey/resolver.ts` is a pure, deterministic function over a journey, intake answers, and completed step IDs.
3. `lib/journey/loadJourneys.ts` imports JSON at build time and validates graph integrity before returning journeys.

This is preferable to class-based journey models or a runtime schema framework because the prototype needs portable data, predictable static builds, and minimal dependencies. The types and validation stay explicit while journey content remains pure JSON.

## Domain model

The JSON contract is represented exactly by these TypeScript shapes:

```ts
interface Journey {
  id: string;
  name: string;
  name_te: string;
  intakeQuestions: Question[];
  steps: Step[];
}

interface Question {
  id: string;
  prompt: string;
  prompt_te: string;
  options: Array<{ id: string; label: string; label_te: string }>;
}

interface Step {
  id: string;
  name: string;
  name_te: string;
  authority: string;
  portal: string;
  fee: string;
  sla: string;
  whyPlain: string;
  whyPlain_te: string;
  documents: string[];
  dependsOn: string[];
  conditions?: Condition[];
  letterTemplateId?: string;
  deadline?: string;
}

interface Condition {
  questionId: string;
  equals: string;
}
```

`Condition` has `questionId` and `equals`. A step with no conditions is visible. A step with conditions is visible only when every condition matches its intake answer. Missing answers do not match, so conditioned steps remain hidden until sufficient intake data exists.

## Resolver behavior

The resolver returns one result for every journey step in source order:

- `HIDDEN`: at least one condition does not match. Stored completion does not affect this computed visibility.
- `DONE`: the step is visible and its ID is present in `completedStepIds`.
- `LOCKED`: the step is visible, incomplete, and at least one visible dependency is incomplete. The result includes all currently blocking dependency IDs.
- `UNLOCKED`: the step is visible, incomplete, and has no incomplete visible dependencies.

Visibility is resolved for all steps before dependency state. A hidden dependency is removed from blocking evaluation and therefore never blocks a visible dependent. Completion is input state only: the resolver never mutates or filters `completedStepIds`. If a completed step later becomes hidden because intake answers change, its completion remains stored and becomes effective again if the step becomes visible.

## Validation and loading

`loadJourneys()` statically imports `data/journeys/birth.json`, `data/journeys/death.json`, and `data/journeys/turning18.json`, then validates each journey before returning it. Each placeholder is a valid empty journey object with the respective ID (`birth`, `death`, or `turning18`), bilingual placeholder names, and empty `intakeQuestions` and `steps` arrays. `validateJourney()` throws descriptive errors for:

- duplicate step IDs;
- `dependsOn` entries that reference unknown step IDs;
- conditions that reference unknown question IDs;
- condition values that reference unknown option IDs for the selected question;
- dependency cycles, detected using depth-first search with visiting/visited states.

Validation happens while the server-rendered debug page is built, so invalid journey data fails the production build rather than producing a partially working UI.

## Client state and persistence

A client-side React context owns intake answers and completed step IDs per journey. It initializes safely for server rendering, hydrates from localStorage key `jeevana:journey-state:v1` after mount, and writes subsequent changes back. The payload is `{ journeys: Record<string, { answers: Record<string, string>; completedStepIds: string[] }> }`. Malformed or unavailable storage falls back to empty state. Actions update answers, toggle step completion, and reset prototype state.

Completion storage is independent of resolver visibility. No action removes completed IDs when answers change.

## Debug surface

The root page is intentionally utilitarian. A server component loads validated journeys and passes them to a client debug component. The component lists journey metadata, intake controls, resolved step states, blocking dependencies, and completion toggles. Empty placeholder journeys render cleanly.

## Testing

Vitest unit tests cover:

- dependency unlock cascade;
- conditional visibility with matching, non-matching, and unanswered intake values;
- multi-dependency locking and blocker reporting;
- hidden dependencies not blocking dependents;
- validation failures for all required invalid graph shapes, including cycles.

The project is verified with the unit suite, ESLint, TypeScript through the Next.js production build, and the production build itself.
