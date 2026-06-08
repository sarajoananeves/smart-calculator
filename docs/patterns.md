## Pattern: control-not-responsive

**Triggers**: dropdown, select, selector, operator, option, options,
arrows, can't select, won't change, not selectable, unresponsive, not responsive

**When**: A selectable control (dropdown, radio, segmented,
list box) doesn't respond to expected input on a specific option.

**Try**:
- Other options on the same control — does it fail only on this
  option, or on all of them?
- The default value — does the control work in its initial state?
- Tab focus — does the control receive focus when navigated to?
- Other instances of the same control type on the page (if any) —
  do they behave the same way?

**Why it matters**: narrows down whether the issue is
option-specific (data/value), control-specific (state/event
handler), or page-wide (global focus, keyboard handling).

**Record**: which behaviors fail vs work — helps pinpoint the
scope of the bug.