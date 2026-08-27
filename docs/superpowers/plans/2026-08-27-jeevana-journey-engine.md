# Jeevana Journey Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Build a Next.js 14 prototype whose validated static journey data resolves into personalized, persistent progress states on a minimal debug page.

**Architecture:** Keep the domain core framework-independent: TypeScript data contracts, a pure two-pass resolver, and a build-time loader/validator. Put browser state behind a reducer-backed React context whose stored completion data is independent of computed visibility. A server page loads validated static JSON and passes it to a client debug view.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS 3, Vitest, Testing Library, jsdom, npm

---

## File map

- package.json and .eslintrc.json — scripts, dependencies, and non-interactive Next.js lint rules.
- tsconfig.json, next-env.d.ts, next.config.mjs — Next.js and strict TypeScript configuration.
- postcss.config.mjs, tailwind.config.ts — Tailwind configuration.
- vitest.config.ts, vitest.setup.ts — test environment.
- app/globals.css, app/layout.tsx — application shell.
- app/page.tsx — server boundary that calls loadJourneys().
- lib/journey/types.ts — journey and resolver-result contracts.
- lib/journey/resolver.ts and resolver.test.ts — pure graph resolution and tests.
- lib/journey/loadJourneys.ts and loadJourneys.test.ts — explicit imports, validation, and tests.
- data/journeys/{birth,death,turning18}.json — valid empty placeholders.
- lib/state/journeyState.ts and journeyState.test.ts — reducer and persistence helpers.
- components/JourneyStateProvider.tsx — localStorage context.
- components/DebugJourneys.tsx and DebugJourneys.test.tsx — minimal debug surface.

### Task 1: Scaffold the toolchain and application shell

**Files:**
- Create: package.json
- Create: tsconfig.json
- Create: next-env.d.ts
- Create: next.config.mjs
- Create: postcss.config.mjs
- Create: tailwind.config.ts
- Create: vitest.config.ts
- Create: vitest.setup.ts
- Create: .gitignore
- Create: .eslintrc.json
- Create: app/globals.css
- Create: app/layout.tsx

- [ ] **Step 1: Create the package manifest**

Use scripts dev, build, start, lint (`next lint`), test (vitest run), and test:watch. Keep Next and eslint-config-next on major 14, React on major 18, Tailwind on major 3, pin ESLint to major 8 for Next.js 14 compatibility, and add TypeScript, Vitest, jsdom, Testing Library, PostCSS, Autoprefixer, and type packages. Create `.eslintrc.json` with `{ "extends": "next/core-web-vitals" }` so lint never prompts interactively.

- [ ] **Step 2: Add strict framework and test configuration**

Set strict: true, noEmit: true, resolveJsonModule: true, and the @/* alias in tsconfig.json. Configure Vitest for jsdom, globals, vitest.setup.ts, and the same alias. Configure Tailwind content for app, components, and lib.

- [ ] **Step 3: Add the minimal application shell**

app/layout.tsx sets Jeevana metadata, imports globals.css, and renders the document shell. globals.css contains Tailwind’s base, components, and utilities directives plus simple body colors.

- [ ] **Step 4: Install dependencies**

Run: npm install

Expected: node_modules and package-lock.json are created with no resolution error.

- [ ] **Step 5: Verify the empty test runner**

Run: npm test -- --passWithNoTests

Expected: exit 0 with no tests found.

- [ ] **Step 6: Commit**

~~~bash
git add package.json package-lock.json tsconfig.json next-env.d.ts next.config.mjs postcss.config.mjs tailwind.config.ts vitest.config.ts vitest.setup.ts .gitignore .eslintrc.json app
git commit -m "chore: scaffold Next.js journey prototype"
~~~

### Task 2: Define the journey contract and pure resolver

**Files:**
- Create: lib/journey/types.ts
- Create: lib/journey/resolver.test.ts
- Create: lib/journey/resolver.ts

- [ ] **Step 1: Define exact data and resolver result types**

Implement the approved Journey, Question, Step, and Condition interfaces exactly. Add:

~~~ts
export type IntakeAnswers = Record<string, string>;
export type StepState = "DONE" | "UNLOCKED" | "LOCKED" | "HIDDEN";

export interface ResolvedStep {
  step: Step;
  state: StepState;
  blockingDependencyIds: string[];
  isConditional: boolean;
}
~~~

blockingDependencyIds is empty unless LOCKED. isConditional is true only when the source step has a non-empty conditions array.

- [ ] **Step 2: Write failing resolver tests**

Create compact journey fixtures and test:

~~~ts
it("unlocks dependencies in a completion cascade", () => {
  expect(states(resolveJourney(journey, {}, new Set()))).toEqual({
    apply: "UNLOCKED", verify: "LOCKED", collect: "LOCKED",
  });
  expect(states(resolveJourney(journey, {}, new Set(["apply"])))).toEqual({
    apply: "DONE", verify: "UNLOCKED", collect: "LOCKED",
  });
});

it("shows a conditional step only when every answer matches", () => {
  expect(byId(resolveJourney(conditionalJourney, {}, new Set()), "benefit"))
    .toMatchObject({ state: "HIDDEN", isConditional: true });
  expect(byId(resolveJourney(conditionalJourney, { gender: "boy" }, new Set()), "benefit").state).toBe("HIDDEN");
  expect(byId(resolveJourney(conditionalJourney, { gender: "girl" }, new Set()), "benefit"))
    .toMatchObject({ state: "UNLOCKED", isConditional: true });
});

it("does not badge absent or empty condition arrays as conditional", () => {
  expect(resolveJourney(unconditionalJourney, {}, new Set()).map((result) => result.isConditional))
    .toEqual([false, false]);
});

it("reports all incomplete visible dependencies", () => {
  expect(byId(resolveJourney(multiDependencyJourney, {}, new Set(["one"])), "three"))
    .toMatchObject({ state: "LOCKED", blockingDependencyIds: ["two"] });
});

it("does not let hidden dependencies block a visible dependent", () => {
  expect(byId(resolveJourney(hiddenDependencyJourney, {}, new Set()), "follow-up").state)
    .toBe("UNLOCKED");
});

it("does not mutate completion when a completed step becomes hidden", () => {
  const completed = new Set(["benefit"]);
  expect(byId(resolveJourney(conditionalJourney, {}, completed), "benefit").state).toBe("HIDDEN");
  expect([...completed]).toEqual(["benefit"]);
});
~~~

- [ ] **Step 3: Verify RED**

Run: npm test -- lib/journey/resolver.test.ts

Expected: FAIL because resolveJourney does not exist.

- [ ] **Step 4: Implement the minimal two-pass resolver**

~~~ts
export function resolveJourney(
  journey: Journey,
  answers: IntakeAnswers,
  completedStepIds: ReadonlySet<string>,
): ResolvedStep[] {
  const visibleIds = new Set(
    journey.steps
      .filter((step) =>
        (step.conditions ?? []).every(
          ({ questionId, equals }) => answers[questionId] === equals,
        ),
      )
      .map((step) => step.id),
  );

  return journey.steps.map((step) => {
    const isConditional = (step.conditions?.length ?? 0) > 0;
    if (!visibleIds.has(step.id)) {
      return { step, state: "HIDDEN", blockingDependencyIds: [], isConditional };
    }
    if (completedStepIds.has(step.id)) {
      return { step, state: "DONE", blockingDependencyIds: [], isConditional };
    }
    const blockingDependencyIds = step.dependsOn.filter(
      (id) => visibleIds.has(id) && !completedStepIds.has(id),
    );
    return {
      step,
      state: blockingDependencyIds.length ? "LOCKED" : "UNLOCKED",
      blockingDependencyIds,
      isConditional,
    };
  });
}
~~~

- [ ] **Step 5: Verify GREEN and commit**

~~~bash
npm test -- lib/journey/resolver.test.ts
npm test
git add lib/journey
git commit -m "feat: add pure journey graph resolver"
~~~

Expected: all resolver and full-suite tests pass.

### Task 3: Validate and statically load journey JSON

**Files:**
- Create: lib/journey/loadJourneys.test.ts
- Create: lib/journey/loadJourneys.ts
- Create: data/journeys/birth.json
- Create: data/journeys/death.json
- Create: data/journeys/turning18.json

- [ ] **Step 1: Write failing validation tests**

Use a validJourney() factory and focused assertions:

~~~ts
expect(() => validateJourney(withDuplicateSteps)).toThrow(/duplicate step id/i);
expect(() => validateJourney(withUnknownDependency)).toThrow(/unknown step.*missing/i);
expect(() => validateJourney(withUnknownQuestion)).toThrow(/unknown question.*missing/i);
expect(() => validateJourney(withUnknownOption)).toThrow(/unknown option.*missing/i);
expect(() => validateJourney(withCycle)).toThrow(/dependency cycle.*one.*two.*one/i);
expect(() => validateJourney(withSelfCycle)).toThrow(/dependency cycle.*one.*one/i);
expect(() => validateJourney(withDisconnectedCycle)).toThrow(/dependency cycle/i);
expect(loadJourneys().map(({ id }) => id)).toEqual(["birth", "death", "turning18"]);
~~~

- [ ] **Step 2: Verify RED**

Run: npm test -- lib/journey/loadJourneys.test.ts

Expected: FAIL because the loader module does not exist.

- [ ] **Step 3: Add three valid empty placeholders**

Each file has its respective id, English and Telugu name, and empty intakeQuestions and steps arrays:

~~~json
{
  "id": "birth",
  "name": "Birth",
  "name_te": "జననం",
  "intakeQuestions": [],
  "steps": []
}
~~~

- [ ] **Step 4: Implement validation and explicit static loading**

Export validateJourney(journey: Journey): void for direct tests. Validate duplicate IDs and all references before traversal. Detect cycles with DFS visiting/visited states and include the cycle path in the error. Explicitly import only the three JSON files, cast after structural assignment, validate them, and return them from loadJourneys(). Do not add filesystem discovery or runtime I/O.

- [ ] **Step 5: Verify GREEN and commit**

~~~bash
npm test -- lib/journey/loadJourneys.test.ts
npm test
git add lib/journey/loadJourneys.ts lib/journey/loadJourneys.test.ts data/journeys
git commit -m "feat: validate and load static journeys"
~~~

Expected: all validation and full-suite tests pass.

### Task 4: Add reducer-backed localStorage state

**Files:**
- Create: lib/state/journeyState.test.ts
- Create: lib/state/journeyState.ts
- Create: components/JourneyStateProvider.test.tsx
- Create: components/JourneyStateProvider.tsx

- [ ] **Step 1: Write failing state tests**

~~~ts
it("does not remove completion when an answer changes", () => {
  const initial = {
    journeys: {
      birth: {
        answers: { gender: "girl" },
        completedStepIds: ["benefit"],
      },
    },
  };
  const result = journeyStateReducer(initial, {
    type: "setAnswer",
    journeyId: "birth",
    questionId: "gender",
    optionId: "boy",
  });
  expect(result.journeys.birth.completedStepIds).toEqual(["benefit"]);
});

it("round-trips the persisted payload", () => {
  expect(parseJourneyState(serializeJourneyState(state))).toEqual(state);
});

it("falls back to empty state for malformed storage", () => {
  expect(parseJourneyState("not-json")).toEqual(EMPTY_JOURNEY_STATE);
});

it("rejects structurally invalid JSON", () => {
  expect(parseJourneyState('{"journeys":{"birth":{"completedStepIds":"benefit"}}}'))
    .toEqual(EMPTY_JOURNEY_STATE);
});

it("toggles completion without changing answers", () => {
  const completed = journeyStateReducer(state, {
    type: "toggleCompleted", journeyId: "birth", stepId: "benefit",
  });
  expect(completed.journeys.birth).toEqual({
    answers: state.journeys.birth.answers,
    completedStepIds: ["benefit"],
  });
  expect(journeyStateReducer(completed, {
    type: "toggleCompleted", journeyId: "birth", stepId: "benefit",
  }).journeys.birth.completedStepIds).toEqual([]);
});

it("hydrates and resets the complete payload", () => {
  expect(journeyStateReducer(EMPTY_JOURNEY_STATE, { type: "hydrate", state })).toEqual(state);
  expect(journeyStateReducer(state, { type: "reset" })).toEqual(EMPTY_JOURNEY_STATE);
});
~~~

- [ ] **Step 2: Verify RED**

Run: npm test -- lib/state/journeyState.test.ts

Expected: FAIL because the state module does not exist.

- [ ] **Step 3: Implement the pure state module**

Define STORAGE_KEY = "jeevana:journey-state:v1", the approved payload type, EMPTY_JOURNEY_STATE, safe parse/serialize functions, and immutable actions setAnswer, toggleCompleted, hydrate, and reset. setAnswer copies completedStepIds unchanged. Parsing rejects values that do not have the expected object/array/string structure.

- [ ] **Step 4: Verify GREEN**

Run: npm test -- lib/state/journeyState.test.ts

Expected: all state tests pass.

- [ ] **Step 5: Write failing provider storage tests**

Use a localStorage mock whose methods can throw. Verify rendering the provider does not throw when `getItem` is unavailable, `setItem` is unavailable, or stored JSON is malformed. Also verify the provider does not write the empty initial state before hydration completes and does write after a user action.

~~~tsx
it("falls back safely when storage access throws", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("blocked");
  });
  expect(() => render(<JourneyStateProvider><Probe /></JourneyStateProvider>)).not.toThrow();
});

it("does not overwrite stored progress with the empty server default", async () => {
  const stored = { journeys: { birth: { answers: {}, completedStepIds: ["benefit"] } } };
  vi.spyOn(Storage.prototype, "getItem").mockReturnValue(JSON.stringify(stored));
  const setItem = vi.spyOn(Storage.prototype, "setItem");
  render(<JourneyStateProvider><Probe /></JourneyStateProvider>);
  await waitFor(() => expect(setItem).toHaveBeenCalled());
  expect(JSON.parse(setItem.mock.calls[0][1])).toEqual(stored);
});
~~~

- [ ] **Step 6: Verify provider tests are RED**

Run: npm test -- components/JourneyStateProvider.test.tsx

Expected: FAIL because JourneyStateProvider does not exist.

- [ ] **Step 7: Add the guarded client context**

Create a use-client provider around useReducer. On first effect, read and parse localStorage inside `try/catch`, dispatch hydrate, and mark hydration complete even when access fails. Persist only after hydration, also inside `try/catch`, so blocked/quota-limited storage cannot crash the prototype and the empty server default cannot overwrite stored data. Expose state plus typed setAnswer, toggleCompleted, and reset functions through useJourneyState(), which throws outside its provider.

- [ ] **Step 8: Verify provider tests are GREEN, run all tests, and commit**

~~~bash
npm test -- components/JourneyStateProvider.test.tsx
npm test
git add lib/state components/JourneyStateProvider.tsx components/JourneyStateProvider.test.tsx
git commit -m "feat: persist journey progress locally"
~~~

### Task 5: Build the minimal resolver debug page

**Files:**
- Create: components/DebugJourneys.test.tsx
- Create: components/DebugJourneys.tsx
- Create: app/page.tsx

- [ ] **Step 1: Write a failing component test**

Render DebugJourneys inside JourneyStateProvider with one inline journey containing a question and conditional step. Assert the journey, initial HIDDEN state, and Personalized badge; select the matching answer and assert UNLOCKED. Complete the step, choose the non-matching answer so it becomes HIDDEN, then choose the matching answer again and assert it returns as DONE. This integration proves stored completion survives a visibility transition.

~~~tsx
render(
  <JourneyStateProvider>
    <DebugJourneys journeys={[journey]} />
  </JourneyStateProvider>,
);
expect(screen.getByText("HIDDEN")).toBeInTheDocument();
expect(screen.getByText("Personalized")).toBeInTheDocument();
fireEvent.change(screen.getByLabelText(/gender/i), {
  target: { value: "girl" },
});
expect(screen.getByText("UNLOCKED")).toBeInTheDocument();
fireEvent.click(screen.getByRole("button", { name: /mark complete/i }));
expect(screen.getByText("DONE")).toBeInTheDocument();
fireEvent.change(screen.getByLabelText(/gender/i), {
  target: { value: "boy" },
});
expect(screen.getByText("HIDDEN")).toBeInTheDocument();
fireEvent.change(screen.getByLabelText(/gender/i), {
  target: { value: "girl" },
});
expect(screen.getByText("DONE")).toBeInTheDocument();
~~~

- [ ] **Step 2: Verify RED**

Run: npm test -- components/DebugJourneys.test.tsx

Expected: FAIL because DebugJourneys does not exist.

- [ ] **Step 3: Implement the client debug view**

For each journey:

- render English and Telugu names;
- render each intake question as a labeled select;
- call resolveJourney with stored answers and a Set of stored completion IDs;
- render all resolved states and blocker IDs;
- badge every result whose isConditional is true, including when hidden;
- allow visible unlocked/done steps to toggle completion;
- render “No steps supplied yet” for empty placeholders.

Use Tailwind utilities only. Do not add navigation, design-system packages, or production workflow UI.

- [ ] **Step 4: Add the server page**

app/page.tsx calls loadJourneys() and renders:

~~~tsx
<JourneyStateProvider>
  <DebugJourneys journeys={journeys} />
</JourneyStateProvider>
~~~

This makes invalid static journey data fail during next build.

- [ ] **Step 5: Verify GREEN and commit**

~~~bash
npm test -- components/DebugJourneys.test.tsx
npm test
git add components/DebugJourneys.tsx components/DebugJourneys.test.tsx app/page.tsx
git commit -m "feat: add journey resolver debug page"
~~~

Expected: component and full suites pass.

### Task 6: Verify the complete prototype

**Files:**
- Modify only if a verification command exposes a scoped defect.

- [ ] **Step 1: Run all tests**

Run: npm test

Expected: zero failed tests.

- [ ] **Step 2: Run lint**

Run: npm run lint

Expected: exit 0 with no ESLint errors.

- [ ] **Step 3: Run the production build**

Run: npm run build

Expected: exit 0; the root route builds and the three statically imported journeys validate.

- [ ] **Step 4: Inspect repository state**

Run: git status --short

Expected: no uncommitted implementation files.

- [ ] **Step 5: Commit only verification fixes, if any**

After rerunning tests, lint, and build:

~~~bash
git add <verified-files>
git commit -m "fix: complete Jeevana verification"
~~~
