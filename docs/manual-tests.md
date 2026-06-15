# Smart Calculator — Manual Test Plan

## Purpose
Manual tests that complement the automated suite. Focus on:
- Accessibility experience (screen reader, keyboard)
- Visual/UX checks that automated tests can't capture

## How to use this document
- Run before each PR that changes UI behavior
- Check off each test as you complete it
- Note any failures with date, browser, and steps to reproduce
- Update when new UI behavior is added

## Session setup (applies to all tests)
Done once at the start of a TestCompass session:
- Open the app in your chosen browser
- Confirm browser and OS when the agent asks

## Test format

Each test in this file follows this shape:

```
### [TEST-ID] Title
**Why**: brief reason this test exists
**Setup** (optional): preconditions specific to this test
**Patterns** (optional): comma-separated pattern names from patterns.md
**Steps**:
1. action → expect outcome
2. ...
**Pass criteria**: what overall success means
**On failure** (optional): test-specific hints
**Cleanup** (optional): post-test actions
**Notes** (optional): known limitations, history, etc.
```

Test IDs follow the format `[PROJECT-KEY-NUMBER]` (e.g., `[CALC-702]`).  
Each section gets a range of 100 numbers (1.x → 001–099, 2.x → 100–199, ...).

---

## Contents

1. [Validation and input behavior](#1-validation-and-input-behavior)
2. [Accessibility — keyboard navigation](#2-accessibility--keyboard-navigation)
3. [Accessibility — screen reader (VoiceOver on macOS)](#3-accessibility--screen-reader-voiceover-on-macos)
4. [Error handling and resilience](#4-error-handling-and-resilience)

---

## 1. Validation and input behavior

### [CALC-700] Decimals
**Why**: Verifies floating-point precision is displayed in a user-friendly way (rounded).

**Steps**:
1. Enter `0.1`, enter `0.2`, click Calculate → expect `Result: 0.3`
2. Enter `1.5`, enter `2.5`, click Calculate → expect `Result: 4`
3. Enter `0.3`, enter `0.2`, click Calculate → expect `Result: 0.5`

**Pass criteria**: Results display rounded floating-point (~10 decimals max).

---

## 2. Accessibility — keyboard navigation

### [CALC-701] Tab order and focus visibility
**Why**: Verifies users navigating by keyboard reach all controls in a sensible order, with visible focus at each step.

**Setup**: do not use the mouse during this test.

**Steps**:
1. Tab from the address bar repeatedly → expect path: First number → Operator → Second number → Calculate → Expression field → Solve → (back to browser chrome)
2. Repeat pressing Tab to check the whole flow → expect a **visible focus indicator** (outline, glow, or similar) on each focused element
3. Shift+Tab from Solve back to First number → expect the reverse path and focus indicators

**Pass criteria**: All six interactive elements are reachable in the expected order. Focus is always visible. No element is skipped, no focus trap.

---

### [CALC-702] Full calculation via keyboard only
**Why**: Verifies a complete calculation flow can be performed without a mouse.

**Setup**: do not use the mouse during this test.

**Patterns**: control-not-responsive

**Steps**:
1. Tab to navigate to first number, type `3` → expect the first number to contain `3`
2. Tab to navigate to operator, **use Up/Down arrows** to select `-` → expect the operator to be `-`
3. Tab to navigate to second number, type `-2` → expect the second number to contain `-2`
4. Tab to navigate to Calculate, **press Enter** → expect `Result: 5`
5. Shift+Tab back to First number, **select all (Cmd+A) and press Delete** → expect first number to be empty and the result to clear to `—`

**Pass criteria**: The full calculation completes using only keyboard input. Pressing Enter on Calculate triggers the calculation. Clearing an input resets the result.

---

### [CALC-703] Enter key behavior in number inputs
**Why**: Verifies pressing Enter inside a number input does not accidentally submit the form (which would reload the page) or change focus unexpectedly.

**Steps**:
1. Tab to first number, type `5` → expect a **visible focus indicator** (outline, glow, or similar) on the focused element
2. Press **Enter** → expect no visible effect: no reload, no focus change, value remains `5`
3. Tab to second number, type `2` → expect a **visible focus indicator** (outline, glow, or similar) on the focused element
4. Press **Enter** → expect no visible effect: no reload, no focus change, value remains `2`

**Pass criteria**: Pressing Enter in a number input has no visible effect. The page does not reload. Typed values remain. Focus does not move.

**Notes**: Behavior verified in Chrome on macOS. Cross-browser coverage is automated; if the automated suite reveals different behavior elsewhere, re-evaluate this test.

--- 

## 3. Accessibility — screen reader (VoiceOver on macOS)

**General setup for this section**:
- Turn on VoiceOver: `Cmd + F5`
- If you've never used it, run System Settings → Accessibility → VoiceOver → Open VoiceOver Training (10-min interactive tutorial)
- Turn off when done: `Cmd + F5`

---

**Known limitation across this section**:
VoiceOver's verbosity around the Calculate button can partially obscure the aria-live announcement of the **result**.
The error and validation messages remain audible — likely because they are longer phrases that overlap with the button chatter.

Hypothesis: prefixing the result with descriptive words (e.g., "Result: 10" spoken in full, rather than just "10") may also help cut through the verbosity.
To be revisited as part of future a11y improvements (see `NOTES.md`).

---

### [CALC-705] Result is announced after Calculate
**Why**: Verifies the result is announced to screen reader users automatically, without them needing to navigate to it. Catches bugs in the `aria-live` setup.

**Setup**: Turn on VoiceOver (`Cmd + F5`)

**Steps**:
1. Tab to first number → expect the screen reader to announce the focused element and the actions available to interact with it
2. Type `7` → expect the screen reader to announce the input 
3. Tab to Operator, ensure `+` is selected (default) → expect the screen reader to announce the focused element and the actions available to interact with it 
4. Tab to second number → expect the screen reader to announce the focused element and the actions available to interact with it 
5. Type `3` → expect the screen reader to announce the input
6. Tab to Calculate → expect the screen reader to announce the focused element and the actions available to interact with it 
7. Press Space or Enter to activate Calculate → expect the screen reader to announce "10" without navigating to the result

**Pass criteria**:
- The result text is spoken automatically after Calculate is activated
- The announcement is polite (does not interrupt other speech)

**Cleanup**: Turn off VoiceOver (`Cmd + F5`)

---

### [CALC-706] Error message is announced when dividing by zero
**Why**: Verifies the error message is announced to screen reader users automatically, without them needing to navigate to it. Catches bugs in the `aria-live` setup.

**Setup**: Turn on VoiceOver (`Cmd + F5`)

**Steps**:
1. Tab to first number → expect the screen reader to announce the focused element and the actions available to interact with it
2. Type `7` → expect the screen reader to announce the input
3. Tab to Operator → expect the screen reader to announce the focused element and the actions available to interact with it
4. Use **Up/Down arrows** to select `/` → expect the screen reader to announce the selected operator 
5. Tab to second number → expect the screen reader to announce the focused element and the actions available to interact with it 
6. Type `0` → expect the screen reader to announce the input 
7. Tab to Calculate → expect the screen reader to announce the focused element and the actions available to interact with it 
8. Press Space or Enter to activate Calculate → expect the screen reader to announce "Cannot divide by zero" without navigating to the result

**Pass criteria**:
- The error message is spoken automatically after Calculate is activated
- The announcement is polite (does not interrupt other speech)

**Cleanup**: Turn off VoiceOver (`Cmd + F5`)

---

### [CALC-707] Validation message is announced when number fields are empty
**Why**: Verifies the calculator's validation messages are announced to screen reader users automatically, without them needing to navigate to the result. Covers both the generic empty-fields message and the "Did you mean to click Solve?" hint that fires when both number fields are empty but the expression field holds text. Catches bugs in the `aria-live` setup.

**Setup**: Turn on VoiceOver (`Cmd + F5`)

**Steps**:
1. Without typing anything, Tab to Calculate → expect the screen reader to announce the focused element and the actions available to interact with it
2. Press Space or Enter to activate Calculate → expect the screen reader to announce "Please enter valid numbers in both fields" without navigating to the result 
3. Tab to first number, type `3`, second number remains empty, Tab to Calculate → expect the screen reader to announce the focused element and the actions available to interact with it 
4. Press Space or Enter to activate Calculate → expect the screen reader to announce "Please enter valid numbers in both fields" without navigating to the result 
5. Tab to first number, clear it, Tab to second number, type `4`, Tab to Calculate → expect the screen reader to announce the focused element and the actions available to interact with it
6. Press Space or Enter to activate Calculate → expect the screen reader to announce "Please enter valid numbers in both fields" without navigating to the result
7. Tab to the Expression field, type `7 plus 3` (this clears both number fields), then Tab to Calculate → expect the screen reader to announce the focused element and the actions available to interact with it
8. Press Space or Enter to activate Calculate → expect the screen reader to announce "The number fields are empty. Did you mean to click Solve?" without navigating to the result

**Pass criteria**:
- The generic validation message ("Please enter valid numbers in both fields") is spoken automatically when at least one number field is empty and the expression field is empty
- The "Did you mean to click Solve?" hint is spoken automatically when both number fields are empty and the expression field holds text
- All announcements are polite (do not interrupt other speech)

**Cleanup**: Turn off VoiceOver (`Cmd + F5`)

---

### [CALC-708] Result is announced after Solve
**Why**: Verifies the result from a natural-language calculation is announced to screen reader users automatically, same as the regular Calculate flow.

**Setup**: Turn on VoiceOver (`Cmd + F5`)

**Steps**:
1. Tab past the calculator form to Expression → screen reader announces the focused element and actions
2. Type `7 plus 3` → screen reader announces input
3. Tab to Solve → screen reader announces the focused element
4. Press Space or Enter to activate Solve → screen reader announces "10" (or "Result: 10") without navigating to the result

**Pass criteria**:
- The result is announced via aria-live without the user needing to navigate to it
- The announcement is polite (does not interrupt other speech)

**Cleanup**: Turn off VoiceOver (`Cmd + F5`)

---

### [CALC-709] Validation message is announced when expression field is empty
**Why**: Verifies the Solve button's validation messages are announced to screen reader users automatically, without them needing to navigate to the result. Covers both the generic empty-expression message and the "Did you mean to click Calculate?" hint that fires when the expression field is empty but at least one number field holds a value. Catches bugs in the `aria-live` setup.

**Setup**: Turn on VoiceOver (`Cmd + F5`)

**Steps**:
1. Without typing anything, Tab to Solve → expect the screen reader to announce the focused element and the actions available to interact with it
2. Press Space or Enter to activate Solve → expect the screen reader to announce "Please enter an expression" without navigating to the result
3. Tab to first number, type `5` (this leaves the expression field empty), then Tab to Solve → expect the screen reader to announce the focused element and the actions available to interact with it
4. Press Space or Enter to activate Solve → expect the screen reader to announce "The expression field is empty. Did you mean to click Calculate?" without navigating to the result

**Pass criteria**:
- The generic validation message ("Please enter an expression") is spoken automatically when the expression field is empty and both number fields are empty
- The "Did you mean to click Calculate?" hint is spoken automatically when the expression field is empty and at least one number field holds a value
- All announcements are polite (do not interrupt other speech)

**Cleanup**: Turn off VoiceOver (`Cmd + F5`)

---



### Known limitations — Firefox + VoiceOver
On macOS Firefox + VoiceOver, the aria-live announcements (result, error, validation)
do not fire reliably. The text appears visually but is not announced.

- Chrome + VoiceOver: ✅ announces correctly
- Safari + VoiceOver: ✅ announces correctly
- Firefox + VoiceOver: ❌ does not announce reliably

This is a known limitation of the Firefox/VoiceOver pairing and not specific to this app.
For screen reader users, we recommend Chrome or Safari on macOS.

---

## 4. Error handling and resilience

### [CALC-711] Calculator service unreachable
**Why**: Both Calculate and Solve call the backend over HTTP (`api.ts`). When the backend is down, the fetch rejects and the app must surface a clear, recoverable message rather than failing silently or showing a stack trace. This path can't be exercised by the component tests (they mock `api.ts`) or the e2e smoke test (it needs the backend up), so it is verified manually.

**Setup**:
- Make sure the backend is **stopped** (no process listening on `http://localhost:8081`). If it's running, stop it before starting this test.
- The frontend dev server stays running; reload the page so it starts from a clean state.

**Steps**:
1. Enter `7`, operator `+`, enter `3`, click **Calculate** → expect the result region to announce/show `Cannot reach the calculator service. Is it running?` (not a result, not a blank screen, no uncaught error in the console)
2. In the Expression field, type `7 plus 3`, click **Solve** → expect the same message: `Cannot reach the calculator service. Is it running?`
3. Start the backend (`cd backend && ./mvnw spring-boot:run`), wait until it's listening on `8081`, then click **Calculate** again → expect `Result: 10` (the app recovers without a page reload)

**Pass criteria**:
- Both Calculate and Solve show `Cannot reach the calculator service. Is it running?` while the backend is down
- The message is presented in the same result/aria-live region used for normal results and validation errors
- No uncaught exception appears in the browser console
- Once the backend is back up, a calculation succeeds without reloading the page

**On failure**: confirm nothing else is bound to port `8081` and that the page was reloaded after stopping the backend. If the message text differs, check the hardcoded string in `src/api.ts` (it is intentionally not in `messages.ts`).

**Cleanup**: leave the backend running for any subsequent tests.

---

## Notes
- Last reviewed: [12 June 2026]
