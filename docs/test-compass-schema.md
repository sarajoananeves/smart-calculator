> Machine-readable version: [test-compass-result-schema.json](./test-compass-result-schema.json)

# TestCompass Result Schema

Every test run produces one JSON file in `results/`.

## Filename

`{TEST-ID}-YYYY-MM-DD-HHMM.json`

Example: `results/CALC-702_2026-05-26_1042.json`

## Schema

| Field | Type | Description |
|---|---|---|
| `test_id` | string | The test's stable ID (e.g., CALC-702) |
| `test_title` | string | Title at run time (denormalized; survives renames) |
| `test_def_hash` | string | Hash of the test's steps at run time |
| `run.started_at` | ISO timestamp | When the test started |
| `run.finished_at` | ISO timestamp | When the test finished |
| `run.duration_seconds` | integer | Total time spent |
| `run.user` | string | From `git config user.email` |
| `run.git_commit` | string | Short SHA of HEAD at run time |
| `environment.browser` | string | chrome / safari / firefox / etc. |
| `environment.os` | string | OS string |
| `outcome.overall` | enum | `pass` / `fail` |
| `outcome.failed_at_step` | integer? | Present only on failure |
| `outcome.notes` | string | Free-text notes from end of test |
| `steps[].n` | integer | Step number |
| `steps[].status` | enum | `pass` / `fail` |
| `steps[].description` | string? | Present on fail: user's description |
| `steps[].patterns_offered` | string[]? | Patterns the agent surfaced |

## Sample: passing run

```json
{
  "test_id": "CALC-702",
  "test_title": "Full calculation via keyboard only",
  "test_def_hash": "a3f8e2c1",
  "run": {
    "started_at": "2026-05-26T10:42:13Z",
    "finished_at": "2026-05-26T10:45:25Z",
    "duration_seconds": 192,
    "user": "user",
    "git_commit": "8b4d2f1"
  },
  "environment": {
    "browser": "chrome",
    "os": "macOS 14.5"
  },
  "outcome": {
    "overall": "pass",
    "notes": ""
  },
  "steps": [
    { "n": 1, "status": "pass" },
    { "n": 2, "status": "pass" },
    { "n": 3, "status": "pass" },
    { "n": 4, "status": "pass" },
    { "n": 5, "status": "pass" }
  ]
}
```

## Sample: failing run

```json
{
  "test_id": "CALC-702",
  "test_title": "Full calculation via keyboard only",
  "test_def_hash": "a3f8e2c1",
  "run": {
    "started_at": "2026-05-26T10:42:13Z",
    "finished_at": "2026-05-26T10:46:41Z",
    "duration_seconds": 268,
    "user": "user",
    "git_commit": "8b4d2f1"
  },
  "environment": {
    "browser": "chrome",
    "os": "macOS 14.5"
  },
  "outcome": {
    "overall": "fail",
    "failed_at_step": 2,
    "notes": "the + operator works fine, only - is broken"
  },
  "steps": [
    { "n": 1, "status": "pass" },
    { "n": 2, "status": "fail", "description": "only + is selected, arrows don't change it", "patterns_offered": ["control-not-responsive"] },
    { "n": 3, "status": "pass" },
    { "n": 4, "status": "pass" },
    { "n": 5, "status": "pass" }
  ]
}
```