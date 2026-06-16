# TestCompass

**TestCompass is a test-intelligence layer that helps engineers ship quality software without slowing down the development workflow.**

## Problem

- **Organisationally**: there are no dedicated QAs anymore. Everyone is a software engineer and owns the quality of what they deliver.
- **Strategically**: the company's goal is to automate everything that can be automated.
- **Practically**: the scale is huge — 68,522 tests in JIRA XRay (across all projects), only 11,415 automated (≈17%). The remaining 57,107 sit in the automation backlog, waiting to be prioritised, deduplicated, or marked as not-to-automate.

The hard part isn't running tests. It's deciding *which* tests to focus on — to automate first, to run for a given change, to retire as duplicates — with limited sprint time and without dedicated QA expertise. 
Even for experienced testers, picking a dozen meaningful tests from hundreds in a project is genuinely difficult. Engineers need help making those calls well.

## Users

**Primary**: engineers who own quality for what they ship but lack tooling that fits their workflow.

**Secondary**: teams as a whole, who need a shared view of test landscape (what's covered, what's automatable, what's duplicated).

## What it is

A subagent (and later a CLI tool, possibly an IDE plugin) that lives next to the code in the repo and acts as a test-intelligence layer in the development workflow:

- On code changes, it analyses the diff against the existing test set and suggests what to run, add, update, or remove — across all test types (unit, component, integration, e2e, manual). 
- It surfaces coverage gaps and possible duplicates for the engineer or team to evaluate. 
- It identifies tests that should remain manual (defining the automation backlog by exclusion). 
- It helps prioritise which manual tests to automate next.

For exploratory cases — when an engineer is mid-development and just wants to walk through a manual test informally — it can also suggest which one to run and guide them through and record results locally. This is a secondary use case, not the primary value.

## What it isn't

- Not a replacement for JIRA XRay or other test management platforms — XRay is the source of truth for test definitions
- Not a test automation framework
- Not a CI/CD orchestrator
- Not a bug tracker
- Not a tool that runs tests *for* the engineer — the engineer still does the testing
- Not a tool that requires a server, database, or external service
- Not a tool that writes back to XRay — the engineer records results where they normally would 
- Not a tool for mining or migrating legacy test content

## Design principles

- **Lives next to the code**: TestCompass runs in the engineer's repo and grounds its suggestions in the code being changed
- **Quality bar**: suggestions are only valuable if they match what an experienced tester would suggest. Each phase ships when the agent's output is close enough to that bar to be trustworthy.
- **Force multiplier, not oracle**: the agent isn't a QA — it's a force multiplier for whoever wrote the test plan. If the plan is good, the agent is good. If the plan is shallow, the agent is shallow.
- **Honest by default**: records facts, not stories. Doesn't fabricate, diagnose, or claim bugs are "fixed" or "introduced" without evidence
- **Friendly tone, boring reliability**: conversational on the surface, dependable underneath. The tone never compromises the data.

## Milestones

**Milestone 1 — Walk-through scaffolding (done, tested on the calculator project)**

Proven: read a markdown test plan, walk through tests with the engineer, record results to local JSON, with strong guardrails against fabrication. Useful for exploratory manual testing during development. Slower than running tests by hand, so not the primary value — but a foundation.

**Milestone 2 — Change-awareness (validated on the calculator, pending real-project test)**

Given a code change, TestCompass suggests:

- Which automated tests (unit, component, integration, e2e, manual) to add or update
- Which tests may have become stale or redundant 
- Which existing manual tests to run
- Project-wide coverage analysis with prioritized gaps

Validated on the calculator project: correct test selection across all levels, extend-vs-add judgment, source-grounded test drafting, self-review against source, coverage analysis with vitest + JaCoCo. Next: validation on a real company project.

**Milestone 3 — Team / org integration (vision, for discussion)**

- Read test definitions from JIRA XRay (read-only)
- Identify tests that shouldn't be automated → defines the automation backlog
- Identify possible duplicates for team review
- Prioritise "most wanted" automation candidates based on given criteria and critical use cases documentation

## Build approach

M1 was built as a Claude Code subagent for fast iteration.

M2 was built and validated as a Claude Code subagent. If it proves itself on a real project, the core logic will be extracted into a CLI for portability and later wrapped as an IDE plugin.

## Success criteria

M1: ✓ The walk-through works end-to-end, records honest data, and is fit for exploratory use. Closed.

M2: ✓ On the calculator project, the agent's test suggestions match what an experienced tester would suggest, including identifying tests to update, catching unconstructible test steps, and recognizing implicit negative coverage. Pending: same bar on a real company project.

M3: A team uses TestCompass to prioritise their automation backlog, and the manual testing load measurably decreases over time.


## Open questions

- M2 quality bar: how do we evaluate "good enough" suggestions on a real project? 
- Speed: M1's per-test overhead is structurally limited by LLM turn time. For M3 with JIRA integration, the speed model is different (more reading, less interactive walk-through). Worth re-evaluating when M3 is concrete. 
- Integration: what does read-only XRay access look like in our environment? Who needs to be in that conversation?

## Install

See [SETUP.md](SETUP.md) for installation instructions.

---
