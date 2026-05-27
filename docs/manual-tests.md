# Smart Calculator — Manual Test Plan

## Purpose
Manual tests that complement the automated suite. Focus on:
- User flows that span multiple actions in one session
- Accessibility experience (screen reader, keyboard)
- Visual/UX checks that automated tests can't capture
- Browser compatibility spot checks

## How to use this document
- Run before each PR that changes UI behavior
- Check off each test as you complete it
- Note any failures with date, browser, and steps to reproduce
- Update when new UI behavior is added

---

## Contents

1. [Functional flows (chained operations)](#1-functional-flows-chained-operations)
2. [Validation and input behavior](#2-validation-and-input-behavior)
3. [Accessibility — keyboard navigation](#3-accessibility--keyboard-navigation)
4. [Accessibility — screen reader (VoiceOver on macOS)](#4-accessibility--screen-reader-voiceover-on-macos)
5. [Browser compatibility](#5-browser-compatibility)

---

## 1. Functional flows (chained operations)

### 1.1 Multiple calculations in sequence
**Why**: Verifies state doesn't leak between calculations.

**Steps**:
1. Open the app
2. Enter `5`, select `-`, enter `3`, click Calculate → expect `Result: 2`
3. Change first number to `10` → expect the result to be cleared
4. Click Calculate → expect `Result: 7`
5. Change operator to `*`, click Calculate → expect `Result: 30`
6. Change second number to `0` → expect the result to be cleared
7. Change operator to `/`, click Calculate → expect "Cannot divide by zero"
8. Change second number to `2` → expect the result to be cleared
9. Click Calculate → expect `Result: 5`
10. Change operator to `+`, click Calculate → expect `Result: 7`

**Pass criteria**: All results match. No flicker, no stale values, no leftover error message.

---

## 2. Validation and input behavior

### 2.1 Empty fields validation
**Why**: Verifies empty field validation in chained context.

**Steps**:
1. Open the app
2. Enter `5` on first number, leave second number empty, select `*`, click Calculate → expect "Please enter valid numbers in both fields"
3. Enter `10` on second number, click Calculate → expect `Result: 50`
4. Clear the first number, click Calculate → expect "Please enter valid numbers in both fields"
5. Change operator to `+`, click Calculate → expect "Please enter valid numbers in both fields"
6. Enter `0` on first number, click Calculate → expect `Result: 10`
7. Clear first and second numbers, click Calculate → expect "Please enter valid numbers in both fields"
8. Change operator to `/`, click Calculate → expect "Please enter valid numbers in both fields"
9. Enter `21`, enter `3`, click Calculate → expect `Result: 7`

**Pass criteria**: All results match. No flicker, no stale values, no leftover error message.

---

### 2.2 Pasted values validation
**Why**: Verifies copying and pasting valid and invalid input.

**Steps**:
1. Open the app
2. Copy and paste `abc` on first number → expect the field to be empty
3. Click Calculate → expect "Please enter valid numbers in both fields"
4. Copy and paste `abc` on second number, change operator to `*` → expect the field to be empty
5. Click Calculate → expect "Please enter valid numbers in both fields"
6. Copy and paste `5` on first number and second number, operator stays `*`, click Calculate → expect `Result: 25`
7. Clear the number fields → expect the fields to be empty and result to reset 
8. Copy and paste `5.5e2` on first number, enter `0` on second number, change operator to `+`, click Calculate → observe: scientific notation handling varies by browser. Record what you see (does the field show `5.5e2` or `550`? does the result equal `550` or something else?)


**Pass criteria**:
- Steps 2–5: invalid pastes never reach the result
- Step 6: valid pastes calculate correctly
- Step 7: clearing fields resets the result
- Step 8: discovery — record findings; expected to differ across browsers

---

### 2.3 Rapid double-click
**Why**: Verifies the UI handles fast clicks without duplicate processing or race conditions.

**Steps**:
1. Open the app
2. Enter `5`, enter `3`, double-click rapidly on Calculate → expect `Result: 8`
3. Change operator to `*`, double-click rapidly on Calculate → expect `Result: 15`
4. Change operator to `/`, change second number to `0`, double-click rapidly on Calculate → expect "Cannot divide by zero", no duplicate error message

**Pass criteria**: Same result as a single click. No flashing, no double-rendered text, no duplicated UI elements.

---

### 2.4 Decimals
**Why**: Verifies floating-point precision is displayed in a user-friendly way (rounded).

**Steps**:
1. Open the app
2. Enter `0.1`, enter `0.2`, click Calculate → expect `Result: 0.3`
3. Enter `1.5`, enter `2.5`, click Calculate → expect `Result: 4`
4. Enter `0.3`, enter `0.2`, click Calculate → expect `Result: 0.5`

**Pass criteria**: Results display rounded floating-point (~10 decimals max).

---

## 3. Accessibility — keyboard navigation

### 3.1 Tab order and focus visibility
**Why**: Verifies users navigating by keyboard reach all controls in a sensible order, with visible focus at each step.

**Setup**: do not use the mouse during this test.

**Steps**:
1. Open the app
2. Tab from the address bar repeatedly → expect path: First number → Operator → Second number → Calculate → (back to browser chrome)
3. Repeat pressing Tab to check the whole flow → expect a **visible focus indicator** (outline, glow, or similar) on each focused element
4. Shift+Tab from Calculate back to First number → expect the reverse path and focus indicators

**Pass criteria**: All four interactive elements are reachable in the expected order. Focus is always visible. No element is skipped, no focus trap.

---

### 3.2 Full calculation via keyboard only
**Why**: Verifies a complete calculation flow can be performed without a mouse.

**Setup**: do not use the mouse during this test.

**Steps**:
1. Open the app 
2. Tab to navigate to first number, type `3` → expect the first number to contain `3`
3. Tab to navigate to operator, **use Up/Down arrows** to select `-` → expect the operator to be `-`
4. Tab to navigate to second number, type `-2` → expect the second number to contain `-2`
5. Tab to navigate to Calculate, **press Enter** → expect `Result: 5`
6. Shift+Tab back to First number, **select all (Cmd+A) and press Delete** → expect first number to be empty and the result to clear to `—`

**Pass criteria**: The full calculation completes using only keyboard input. Pressing Enter on Calculate triggers the calculation. Clearing an input resets the result.

---

### 3.3 Enter key behavior in number inputs
**Why**: Verifies pressing Enter inside a number input does not accidentally submit the form (which would reload the page) or change focus unexpectedly.

**Steps**:
1. Open the app
2. Tab to first number, type `5`, **press Enter** → expect no visible effect: no reload, no focus change, value remains `5`
3. Tab to second number, type `2`, **press Enter** → expect no visible effect: no reload, no focus change, value remains `2`

**Pass criteria**: Pressing Enter in a number input has no visible effect. The page does not reload. Typed values remain. Focus does not move.

**Notes**: Behavior verified in Chrome on macOS. If Section 5 (browser compatibility) reveals different behavior elsewhere, re-evaluate this test.

---

## 4. Accessibility — screen reader (VoiceOver on macOS)

**General setup for this section**:
- Turn on VoiceOver: `Cmd + F5`
- If you've never used it, run System Settings → Accessibility → VoiceOver → Open VoiceOver Training (10-min interactive tutorial)
- Turn off when done: `Cmd + F5`

---

**Known limitation across this section**:
VoiceOver's verbosity around the Calculate button can partially obscure the aria-live announcement of the **result**.
The error and validation messages remain audible — likely because they are longer phrases that overlap with the button chatter.

Hypothesis: prefixing the result with descriptive words (e.g., "Result: 10" spoken in full, rather than just "10") may also help cut through the verbosity.
To be revisited during Milestone 9 a11y polish (see `NOTES.md`).

---

### 4.1 Result is announced after Calculate
**Why**: Verifies the result is announced to screen reader users automatically, without them needing to navigate to it. Catches bugs in the `aria-live` setup.

**Setup**:
- Turn on VoiceOver (`Cmd + F5`)
- Open the app in your browser

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

### 4.2 Error message is announced when dividing by zero
**Why**: Verifies the error message is announced to screen reader users automatically, without them needing to navigate to it. Catches bugs in the `aria-live` setup.

**Setup**:
- Turn on VoiceOver (`Cmd + F5`)
- Open the app in your browser

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

### 4.3 Validation message is announced when fields are empty
**Why**: Verifies the validation message is announced to screen reader users automatically, without them needing to navigate to it. Catches bugs in the `aria-live` setup.

**Setup**:
- Turn on VoiceOver (`Cmd + F5`)
- Open the app in your browser

**Steps**:
1. Without typing anything, Tab to Calculate → expect the screen reader to announce the focused element and the actions available to interact with it
2. Press Space or Enter to activate Calculate → expect the screen reader to announce "Please enter valid numbers in both fields" without navigating to the result 
3. Tab to first number, type `3`, second number remains empty, Tab to Calculate → expect the screen reader to announce the focused element and the actions available to interact with it 
4. Press Space or Enter to activate Calculate → expect the screen reader to announce "Please enter valid numbers in both fields" without navigating to the result 
5. Tab to first number, clear it, Tab to second number, type `4`, Tab to Calculate → expect the screen reader to announce the focused element and the actions available to interact with it
6. Press Space or Enter to activate Calculate → expect the screen reader to announce "Please enter valid numbers in both fields" without navigating to the result

**Pass criteria**:
- The validation message is spoken automatically after Calculate is activated
- The announcement is polite (does not interrupt other speech)

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

## 5. Browser compatibility

### 5.1 Smoke test across major browsers
**Why**: Verifies the calculator's core functionality works across major browsers. Catches regressions from browser-specific quirks (input handling, focus styling, form behavior).

**Steps** — repeat the following in each browser listed below:
1. Open the app
2. Calculate `7 + 3` → expect `Result: 10`
3. Calculate `10 / 0` → expect "Cannot divide by zero"
4. Click Calculate with empty fields → expect "Please enter valid numbers in both fields"
5. Tab through controls → verify focus is visible on each
6. Open the browser's developer console → verify no JavaScript errors

**Browsers to test** (latest stable versions):
- Chrome on macOS
- Safari on macOS
- Firefox on macOS

**Pass criteria**:
- Core calculation works identically in each browser
- Validation and error messages display correctly
- Keyboard navigation works
- No JavaScript errors in the console
- Minor visual differences (focus ring style, default fonts) are acceptable

**Notes from last run**: (Browser, OS, date, observations)

---

## Notes
- Last reviewed: [date]
- Tested on: macOS 14, Chrome xx, Safari xx, Firefox xx (example — keep current)