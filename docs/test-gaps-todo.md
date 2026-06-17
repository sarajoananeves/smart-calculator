# Test Coverage Gaps — Work Plan

> Drafted 2026-06-17 from a Test Compass analysis. Not yet started.
> Goal: close the highest-value test gaps across all tiers and add guards
> that current line/branch coverage cannot see.

## Background: why coverage shows ~100% but gaps remain

Line/branch coverage is a **union across all tests** — a line is "covered" if
*any* test runs it. Unit tests run the real service/parser; controller tests
(`@WebMvcTest`) run the controllers with the collaborator **mocked**. Every line
is hit by *some* test, so coverage reports high — but the controller and the
real service are **never executed together**, so the integration seam is
invisible to the coverage tool. Integration/contract tests exist to catch what
coverage structurally cannot: wiring mismatches, serialization shapes, and
cross-tier contracts.

Caveat to verify: `GlobalExceptionHandler` and `CorsConfig` appear to have **no
test at any level** — confirm whether the coverage report excludes them from the
denominator (otherwise a true 100% would already flag them).

---

## Priority list

### Backend integration (controller → real service seam)
- [ ] **INT-1** Full `/api/calculate` stack — real `CalculatorService`, no mocks.
      `CalculatorController.java:20` → `CalculatorService.java:8`.
      Verify: real arithmetic 200 `{"result":10.0}`; `{a:5,b:0,op:"/"}` → 422
      `{"error":"Cannot divide by zero"}`.
- [ ] **INT-2** Full `/api/parse` stack — real `ExpressionParser`, no mocks.
      `ParserController.java:17` → `ExpressionParser.java:31`.
      Verify: `"7 plus 3"` → `{a:7.0,b:3.0,op:"+"}`; `"15% of 80"` →
      `{a:0.15,b:80.0,op:"*"}`; gibberish → 400 with real error message.
- [ ] **INT-3** Malformed JSON → `GlobalExceptionHandler.java:11` → 400
      `{"error":"Invalid format"}`. Currently exercised by no test.
- [ ] **INT-4** CORS preflight — `OPTIONS` from `localhost:5173` echoes allowed
      origin/methods. `CorsConfig.java:15`. Currently unverified.
- [ ] **INT-5** (low) Upgrade `CalculatorApplicationTest.contextLoads()`
      (`CalculatorApplicationTest.java:12`) to assert wiring, or drop once
      INT-1..3 land as full-context tests.

### Frontend / unit
- [ ] **P1** `formatResult` precision logic — `src/App.tsx:16-18`. Mock
      `calculateRemote` to resolve `0.30000000000000004` → display `0.3`;
      >10-decimal value → correct truncation. **Highest value, cheap.**
- [ ] **P5** `api.ts` non-JSON error body — `src/api.ts:26,48`. `.json()` is
      called before the `ok` check; a 500 HTML page / 204 throws raw
      `SyntaxError` instead of the friendly fallback. **May need a code fix**
      (try/catch around `.json()`), not just a test.

### Backend unit / boundary
- [ ] **P3** `CalculatorService` boundaries — `CalculatorService.java:8-23`.
      `Double.MAX_VALUE` overflow → `Infinity`, NaN propagation. None tested.
- [ ] **P4** `ExpressionParser` branches — `ExpressionParser.java`. Add cases:
      symbol `-` (`10 - 4`), symbol `/` (`20 / 4`), negative operand
      (`5 plus -3`); negative cases `20 divided 4`, multi-space operator.

### End-to-end
- [ ] **P2** e2e parse→calculate round-trip against the real backend. e2e
      already launches the real backend (`e2e/playwright.config.ts:32-49`), but
      no test drives a percentage / word-operator through `/api/parse` →
      `/api/calculate`. Extend `CALC-710`: `15% of 80` → `Result: 12`;
      `20 divided by 4` → `Result: 5`.
- [ ] **P6** "Cannot reach service" path — only tested in mocked halves today.
      **Automatable** via Playwright route interception, not a real process kill:
      `await page.route('**/api/**', route => route.abort())` makes `fetch`
      reject → `api.ts:22`/`:44` catch → message renders. Deterministic, no
      flakiness. Same trick yields timeouts (route + delay) and the P5
      500/HTML-body case.

### Cross-cutting / contract
- [ ] **X1** Operator-set drift — parser can return any op from `OPERATOR_MAP`;
      frontend feeds it to calculate without re-validating (`App.tsx:62-63`).
      Add a contract/e2e test exercising each operator family parse→calculate so
      a new parser op (e.g. `^`) can't fail silently at runtime.
- [ ] **X4** Error-string drift — strings duplicated in `src/messages.ts` and
      `Messages.java` with no shared source/guard. No e2e asserts the backend's
      parse-error / invalid-operator text renders in the UI.

---

## Automation classification

Almost everything here is automatable. Summary:

**Cleanly automatable now**
- INT-1..4 — `@SpringBootTest` + MockMvc/TestRestTemplate, no mocks (CORS via
  preflight OPTIONS, malformed JSON via raw broken body).
- P1 — Vitest component test (mock `calculateRemote` → messy float → assert text).
- P3 — JUnit params (`Double.MAX_VALUE`, NaN, overflow).
- P4 — extra `@CsvSource` rows.
- P2 — extend `CALC-710`; Playwright already launches the real backend.
- X1 — data-driven e2e looping each operator family through parse→calculate.

**Automatable, but pair with a code/design decision first**
- P5 — test is easy but will fail against current code (`.json()` runs before the
  `ok` check, `api.ts:26`/`:48`). Decide desired behavior → fix → guard.
- X4 — give `messages.ts` / `Messages.java` a shared source of truth, *then*
  guard it; otherwise a test just cements the duplication in a third place.

**Looked manual, actually automatable**
- P6 — Playwright `route.abort()` simulates an unreachable backend
  deterministically (see P6 above). No real process kill needed.
- `CALC-017` paste test — fragile only because JSDOM fakes paste; promote to a
  real-browser e2e and it becomes reliable.

**Genuinely manual (not a product test)**
- Real "is the deployed service reachable" smoke against a live environment —
  that's deployment/environment validation, out of scope for the test suite.

Net: there is essentially no *product* behavior here that must stay manual.

## Manual-test automation review (`docs/manual-tests.md`)

Per-test verdict on whether each existing manual test can move to automation.
Key move: separate the *mechanical* assertion (automatable) from the
*perceptual* experience (human).

**Move to automated — no human eye needed**
- [ ] **CALC-700 Decimals** — pure behavioral rounding asserts (`0.1+0.2→0.3`).
      This IS the P1 `formatResult` gap; mislabeled as manual. Automate
      (component or e2e), then delete from manual-tests.md. **Duplicate of P1.**
- [ ] **CALC-702 Full calculation via keyboard** — Playwright handles Tab, arrow
      keys on the operator `<select>`, Enter on Calculate, Cmd+A/Delete. All
      assertions checkable. Full e2e.
- [ ] **CALC-703 Enter key in number inputs** — press Enter, assert no nav/reload,
      value persists, `activeElement` unchanged. Automatable.
- [ ] **CALC-711 Service unreachable** — `page.route('**/api/**', r => r.abort())`
      reproduces it deterministically; recovery step automates by removing the
      route mid-test. No real backend stop/start. **Duplicate of P6.**

**Partially automatable — automate the wiring, keep a human pass**
- [ ] **CALC-701 Tab order + focus visibility** — tab *order* fully automatable
      (walk Tab, assert `:focus` sequence, no trap); assert `:focus-visible`
      outline styles are applied as a proxy. Human keeps "is it perceptibly
      visible."
- [ ] **CALC-705–709 aria-live announcements** — cannot automate VoiceOver
      *speaking*, but each test's stated Why is "catches bugs in the aria-live
      setup" — that wiring IS automatable: assert text lands in an
      `aria-live="polite"` / `role="status"` region with correct content and no
      focus theft. Human keeps the auditory/verbosity experience.

**Genuinely manual — agree, leave as-is**
- The *audible* screen-reader experience behind CALC-705–709 (VoiceOver verbosity
  obscuring the result; the "prefix with 'Result:'" hypothesis) — perceptual.
- Firefox + VoiceOver aria-live limitation — cross-browser/SR behavior.

Net: of 9 manual tests, 4 should move to automated (700, 702, 703, 711 — two of
them duplicates of P1/P6), 2 are mostly automatable with a thin human residue
(701, wiring half of 705–709), and the truly human core is narrow: the audible
SR experience and the Firefox/VoiceOver gap. manual-tests.md could shrink to a
focused a11y-perception checklist.

## Stale / low-value (review, mostly leave as-is)
- `calculate.ts` + 14 tests (`CALC-100..114`) — documented dead learning
  artifact; harmless but inflates frontend coverage. Leave, don't count toward
  live-path coverage.
- `CALC-017` (`App.test.tsx:372`) — asserts JSDOM paste behavior, not product
  behavior; fragile.
- `CALC-300` — redundant with `CALC-301`; consolidation candidate.

---

## Suggested first session
Start with **P1** (trivial, guards the only real frontend transform) and
**P2 + X1** (one e2e that parses then calculates each operator family — closes
both the round-trip and contract-drift gaps). Then the backend integration
batch INT-1..INT-4.
