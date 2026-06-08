# TestCompass Results

This folder holds test run outputs from TestCompass.

## What lives here

One JSON file per test run, named:

`YYYY-MM-DD-HHMM-[TEST-ID].json`

Example: `2026-05-26-1042-CALC-702.json`

Each file follows the schema in
[../test-compass-schema.md](../test-compass-schema.md)
(machine-readable: [../test-compass-result-schema.json](../test-compass-result-schema.json)).

## Why version-controlled

Results live next to the code so:
- Test history is visible in PRs and commits
- Coverage and flakiness can be analyzed over time
- The agent can correlate results with code changes