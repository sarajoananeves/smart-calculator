## Q&A from Milestone 0

###  What is Node?

**Node.js** is a JavaScript runtime — it lets you run JavaScript *outside* the browser, on your machine or a server.

**Java analogy:** Node is to JavaScript what the JVM is to Java. Before Node, JavaScript only ran inside browsers. Node took the browser's JS engine (V8, from Chrome) and made it standalone, so JS could be used for build tools, servers, CLIs, etc.

You don't necessarily *write* Node code in a React project, but your build tools (Vite, TypeScript compiler, etc.) all run on Node.


### What is npm?

**npm** = Node Package Manager. It's the package manager and registry for JavaScript libraries.

**Java analogy:** npm is JavaScript's Maven or Gradle. It:
- Downloads libraries (called **packages**) from the npm registry (like Maven Central).
- Manages dependencies via `package.json` (like `pom.xml` or `build.gradle`).
- Runs scripts defined in `package.json` (like Maven goals).


### What does npm install do?

It reads `package.json`, downloads every listed dependency (and their dependencies, recursively), and puts them in a `node_modules/` folder in your project.

- `node_modules/` is the equivalent of your local Maven `.m2` cache, except it lives **inside the project** rather than globally. (That's why it's huge and always gitignored.)
- It also creates/updates `package-lock.json`, which pins exact versions for reproducible installs (like a Maven lockfile).

You run it:
- After cloning a repo (to get all dependencies).
- After someone adds a new dependency.
- After changing `package.json` manually.


### What is Vite? Why did we use it?

**Vite** (French for "fast", pronounced *veet*) is a **build tool and dev server** for modern frontend projects.

It does two main jobs:
1. **In development:** runs a local server that serves your app and reloads instantly when you save a file.
2. **For production:** bundles and optimizes your code into static files ready to deploy.

**Why Vite instead of older tools** (like Create React App or Webpack)?
- Dramatically faster startup and hot-reload, even on big projects.
- Sensible defaults — almost no config needed.
- It's become the de facto standard; Create React App is officially deprecated.

**Java analogy:** Vite is roughly like Maven + Spring Boot DevTools combined — it builds your project *and* gives you a fast dev loop with auto-reload.

### What's the difference between git add and git commit?

Git has a **staging area** (also called the "index") that sits between your working files and your commit history. This is the part that trips up most people coming from other VCS tools.

- **`git add <file>`** → moves changes from your working directory *into the staging area*. You're saying "I want this change to be part of the next commit."
- **`git commit`** → takes everything currently staged and saves it as a permanent snapshot in your local repo's history.

**Why two steps?** It lets you craft commits precisely. You might change 5 files but only want 2 of them in this commit — `git add` lets you pick.

**Mental model:**
1. Edit files (working directory)
2. `git add` → put selected changes on the "shipping pallet" (staging)
3. `git commit` → seal and label the pallet (commit)
4. `git push` → send it to the warehouse (remote, e.g. GitHub)



## Q&A from Milestone 1

### What is JSX in one sentence?

JSX is a syntax extension for JavaScript that allows developers to write HTML-like UI code inside React components.

JSX is technically not React-specific — it's a JS syntax extension that happens to be used most often with React. Other libraries (like Preact, Solid) use it too.


### What does `htmlFor` do?

In React, htmlFor is used to associate a <label> element with a form input.

Example:

`<label htmlFor="email">Email</label>`

`<input id="email" type="email" />`

When the user clicks the label, the associated input gets focused.

React uses htmlFor instead of regular HTML’s for attribute because for is a reserved keyword in JavaScript.

Associating a <label> with an input helps:
- screen readers identify the purpose of the field
- users click the label to focus the input
- improve usability on mobile/touch devices
- create larger click targets

With this connection:
- assistive technologies can correctly announce the label
- clicking “Password” focuses the input automatically

It’s both an accessibility improvement and a general usability improvement.


### JSX uses className and htmlFor (not class and for)
Because `class` and `for` are reserved words in JavaScript. JSX renames them.
The final HTML still shows class= and for=.

### Controlled vs Uncontrolled inputs
- Uncontrolled: input manages its own value (current state of our calculator)
- Controlled: React owns the value via state + onChange (what we'll do in M3)
  Controlled gives flexibility for validation, reset, etc.

### Hot Module Replacement (HMR)
Vite watches files → recompiles only the changed module → pushes it to the browser via WebSocket → swaps in memory. No reload, state preserved.


## Milestone 9 

### Decisions
- Round floating-point results in the UI (~10 decimals)
- Manual test 2.4 will start passing once this is implemented

## A11y improvements to investigate
- Result announcement is technically working via aria-live=polite, but can be obscured by VoiceOver's button verbosity after Calculate is pressed
- Try: role="status" on the result element
- Try: separate the result into a region with aria-atomic="true"
- Test with screen reader users if possible, not just VoiceOver dev-testing
- Result announcement is obscured by button verbosity; error/validation messages are audible (likely because they're longer phrases)
- Hypotheses to test:
  - Length matters: prefixing the result with descriptive words ("Result: 10" spoken in full) may help
  - Live-region priority matters: try role="status" or aria-live="assertive" on the result
- Run side-by-side test once changes are applied, with VoiceOver verbosity at default High setting

## Future a11y exploration
- Investigate alternatives to aria-live=polite for Firefox compatibility
  (e.g., role="alert", manual announcement strategies)
- Test with NVDA on Windows for broader screen reader coverage
- Consider hiring/consulting actual screen reader users for real-world validation

## backend polish
- Add @ControllerAdvice for unified error response format - done in M8
- Currently, Jackson deserialization errors return Spring's default error shape ({timestamp, status, error, path}) instead of our ErrorResponse ({error})
- All controller-level validation already uses our format consistently
- Externalize CORS origin to properties - done in M8
- Harden api.ts against malformed responses (?): no need for this project, it would be good if going to production
- Add request timeout to api.ts: also good if going to production, no need here

## UX polish: helpful validation messages
- When user clicks Solve but smart input is empty AND calculator has values:
  "The expression field is empty. Did you mean to click Calculate?"
- When user clicks Calculate but numbers are empty AND expression has text:
  "The number fields are empty. Did you mean to click Solve?"
- Implementation: check both forms' state in each handler before showing
  the generic "Please enter..." message

## Playwright cross-browser automation (in progress / pending)
- Migrate 5.1 (smoke test across browsers) from manual to automated
- Stack: Playwright with @playwright/test runner
- Browsers to cover: Chrome (Chromium), Firefox, Safari (WebKit)
- Scope for v1: 3-4 critical user flows (happy path, divide-by-zero, validation, smart input)
- Configuration: one config file, runs same tests across all 3 browsers automatically
- After this: 5.1 can be removed from manual-tests.md entirely