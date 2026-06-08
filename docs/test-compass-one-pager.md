# TestCompass — One-Pager

**TestCompass helps engineers test their own work — so they ship quality software and build testing instincts as they go.**

## Problem

Quality used to be owned by QAs. Now everyone is a software engineer and owns the quality of what they deliver. But:

- **Structurally**: there are no dedicated QAs anymore. Testing knowledge is unevenly distributed across teams of former-devs and former-QAs.
- **Experientially**: manual testing is painful for engineers — reading step-by-step instructions and ticking checkboxes doesn't fit how they work. So manual tests often don't get run.

The result: tests that can't yet be automated either get skipped, or only the former-QAs run them. Quality slips through the cracks.

## Users

**Primary (Phase 0)**: a former-QA-now-engineer (me) who wants to do QA *as a developer* — without losing rigor, but without the friction that makes engineers skip manual testing.

**Later phases**: engineers across teams. Most are former-devs who currently skip manual testing; some are former-QAs. Defaults favor the friction-averse user — the former QA will use it regardless; the former dev is the one who'll abandon it. Power features stay available but out of the way.

## What it is

A Claude Code subagent (and later a CLI tool, possibly an IDE plugin) that lives next to the code in the repo. It reads the project's manual test plan in markdown, guides the engineer through running tests, records results, and over time helps the engineer figure out *what* to test for a given change.

## What it isn't

- Not a replacement for TestRail or other test management platforms
- Not a test automation framework
- Not a CI/CD orchestrator
- Not a bug tracker
- Not a tool that runs tests *for* the engineer — the engineer still does the testing
- Not a tool that requires a server, database, or external service
- Not a tool for mining or migrating legacy test content

## Design principles

- **Lives next to the code**: tests, results, and history all version-controlled in the repo
- **Quality bar**: suggestions are only valuable if they match what an experienced tester would suggest. Each phase ships when the agent's output is close enough to that bar to be trustworthy.
- **Force multiplier, not oracle**: the agent isn't a QA — it's a force multiplier for whoever wrote the test plan. If the plan is good, the agent is good. If the plan is shallow, the agent is shallow.
- **Friendly tone, boring reliability**: conversational on the surface, dependable underneath. The tone never compromises the data.

## Phases

**Phase 0 — Walk-through (now)**
Guide the engineer through manual tests; record results next to the code.

- 0a: one test, step-by-step, save results
- 0b: full-test mode option, save results
- 0c: all tests, with adaptive pacing (step-by-step for first runs or after test changes; full-view for repeats; user override always available)

Results: one file per run, in repo, with date, user, git commit, test definition hash, pass/fail/notes.

**Phase 1 — Change-awareness (suggest tests for a change)**
The agent reads `git diff` and suggests which tests should be run or added.

- 1a: Suggest existing manual tests relevant to the change
- 1b: Suggest unit / component / integration tests relevant to the change
- 1c: Suggest e2e tests (Playwright) that could replace existing manual tests

**Phase 2 — Coverage-awareness (audit the test landscape)**
The agent reads existing automated tests + code to map current coverage and suggest gaps.

- 2a: Map current coverage across test types
- 2b: Suggest missing tests, redundant tests, tests to retire

**Phase 3 — Polish / improvements (ongoing bucket)**
Examples (to be pruned regularly): conversational interpretation of fuzzy answers; automated-test pre-flight integration; CLI extraction; IntelliJ plugin; multi-project support; team conventions.

## Build approach

Phase 0 is built as a **Claude Code subagent**, living in the repo's `.claude/agents/`. This minimizes code volume, accelerates demos, and doubles as ramp-up learning in Claude Code.

If the tool earns broader adoption, the core logic will be extracted into a **CLI** (portable to any terminal), and later into a **plugin** (IntelliJ or others) that wraps the same engine.

## Success criteria

**Phase 0 succeeds when:**
- I voluntarily reach for TestCompass instead of the markdown file to run the calculator's manual tests
- Result history accumulates and is useful to look back on
- The experience is *less painful* than the markdown — measurably, in my own judgment

**Phase 1 succeeds when:**
- For a real change, the agent's test suggestions match what I'd suggest as an experienced tester
- A teammate (not me) can use it on their own change without hand-holding

**Phase 2 succeeds when:**
- The agent identifies at least one real coverage gap I hadn't noticed
- Or: identifies a manual test that's now redundant because automation covers it

## Open questions

- Will Claude Code subagent be the right long-term form, or will the CLI need to come earlier?
- How does the agent's "QA mind" stay accurate across very different projects? (Calculator vs. real microservice)
- What does the markdown test format need beyond what `manual-tests.md` already has? (Test IDs ✓; setup/cleanup ✓; multi-context tests like multi-browser — TBD)
- Naming: TestCompass is the working name; revisit if a better one emerges through use.

---