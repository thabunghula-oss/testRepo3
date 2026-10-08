# Add a static Contact Us page that POSTs the form to a dummy endpoint

## Plan Summary

- **What/why**: Adds a standalone `contact.html` page with a Name / Email / Message form. On submit it POSTs JSON to a placeholder endpoint and shows an inline success or error message. The repository currently has no web pages at all, so this is the first user-facing page.
- **Key decision**: Plain static HTML + vanilla JavaScript, no build step, no `package.json`, no framework, no CSS. Chosen because the repository is empty and the user explicitly asked for the simplest possible option. The endpoint URL lives in a single constant so it can be swapped for a real backend later.
- **Most important files**: `contact.html` (new) and `contact.js` (new), both at the repository root.
- **Priority/complexity**: Low priority, Simple complexity.

## Problem Statement

The repository has no contact page. Visitors need a way to send a name, email address, and message. A real backend does not exist yet, so for now the form must send its data to a dummy endpoint that accepts POST requests and returns success, proving the wiring works end to end.

### Planning Context

**Key Requirements Discussed:**

- Only the form. No header, footer, navigation, hero text, or site layout.
- The form sends to a dummy endpoint for now. A real endpoint comes later in a separate piece of work.
- Simplest possible implementation at every decision point.

**Decisions Made:**

- **Static HTML + vanilla JS over React / Next.js**: the repository is empty (one empty file named `test`). Adding a framework and build pipeline for a single form is disproportionate. A static page needs zero dependencies and zero tooling.
- **Dummy endpoint = `https://jsonplaceholder.typicode.com/posts`**: a public, free, CORS-enabled fake REST API that accepts `POST` and replies `201 Created` with the posted body plus an `id`. Chosen over a local mock route (impossible without a server) and over a bare placeholder constant (would not actually send anything, so the submit path could not be verified).
- **Endpoint URL in one constant** (`CONTACT_ENDPOINT` at the top of `contact.js`) so swapping to the real backend is a one-line change.
- **HTML5 validation only** (`required`, `type="email"`). No custom JS validation.
- **Inline success message and form reset on success. Inline error message and values kept on failure.** No redirects, no `alert()`.
- **No CSS.** Browser default styling.
- **No automated tests.** Manual checklist only. There is no test runner in the repo and adding one for a static page contradicts the "simplest" directive.

**Out of Scope:**

- Any real backend or email delivery.
- Spam protection (captcha, honeypot, rate limiting).
- Styling, responsive layout, branding.
- Site navigation, linking the page from anywhere else.
- Automated tests, CI, linting, `package.json`.
- Internationalisation, accessibility beyond native form semantics and `<label>` elements.

### Background & Context

- **Current state**: the repository contains only an empty file `test`, a `.gitignore`, and HubLaunch tooling under `.hublaunch/` and `.agents/`. There is no `package.json`, no framework, no existing page, no conventions to follow.
- **Who is affected**: future site visitors who want to contact the owner, and the developer who will later replace the dummy endpoint.

**Current Behavior**:

- No contact page exists.

**Desired Behavior**:

- Opening `contact.html` in a browser shows a form with Name, Email, Message fields and a Send button.
- Submitting with empty or malformed fields is blocked by the browser's native validation.
- Submitting valid data sends a JSON `POST` to the dummy endpoint, then shows "Thanks, your message was sent." and clears the form.
- If the request fails, the page shows "Sorry, something went wrong. Please try again." and keeps the entered values.

## Detailed Requirements

### Functional Requirements

1. **Page and form markup** (`contact.html`)

   - Must be a complete HTML5 document: `<!doctype html>`, `<html lang="en">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<title>Contact Us</title>`.
   - Contains exactly one `<form id="contact-form" novalidate="false">` (do not add `novalidate`; native validation must stay on).
   - Fields, each with an associated `<label for="...">`:
     - `name`: `<input type="text" id="name" name="name" required>`
     - `email`: `<input type="email" id="email" name="email" required>`
     - `message`: `<textarea id="message" name="message" required rows="5"></textarea>`
   - A submit button: `<button type="submit" id="submit-btn">Send</button>`.
   - A status element below the form for feedback: `<p id="form-status" role="status" aria-live="polite"></p>`. Empty by default.
   - Loads the script at the end of `<body>`: `<script src="contact.js"></script>`.
   - Edge case: if JavaScript is disabled the browser will perform a normal form submission. Set `method="post"` and `action="https://jsonplaceholder.typicode.com/posts"` on the form so the no-JS path still reaches the dummy endpoint instead of reloading the page with a GET query string.

2. **Submit behaviour** (`contact.js`)

   - Declare `const CONTACT_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';` as the first statement so it is trivially replaceable.
   - On `submit`, call `event.preventDefault()`.
   - Read values via `new FormData(form)` and build a plain object `{ name, email, message }`.
   - Disable the submit button and clear `#form-status` while the request is in flight, to prevent double submission.
   - `fetch(CONTACT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })`.
   - **Success** (`response.ok` is `true`): set `#form-status` text to `Thanks, your message was sent.`, call `form.reset()`.
   - **Failure** (`response.ok` is `false`, or `fetch` throws, e.g. offline): set `#form-status` text to `Sorry, something went wrong. Please try again.`. Do not reset the form.
   - Always re-enable the submit button in a `finally` block.
   - Use `textContent`, never `innerHTML`, when writing status text.

3. **Validation**

   - Rely entirely on native HTML5 validation (`required`, `type="email"`). The submit event does not fire until the browser's validation passes, so `contact.js` performs no additional checks.

### Technical Requirements

- **Technology/Framework**: HTML5, vanilla ES2017+ JavaScript (uses `fetch`, `async`/`await`, `const`). No TypeScript, no bundler, no `package.json`.
- **Location**: two new files at the repository root: `contact.html` and `contact.js`.
- **Dependencies**: none. The only external dependency at runtime is the public dummy endpoint.
- **Constraints**: must work when opened directly from disk via `file://` in a modern browser (Chrome, Firefox, Safari, Edge current versions). `jsonplaceholder.typicode.com` sends `Access-Control-Allow-Origin: *`, so cross-origin `fetch` from `file://` or `localhost` succeeds.

### Non-Functional Requirements

- **Performance**: single HTML file plus a script under 2 KB. No measurable concern.
- **Security**: no secrets. Status text written with `textContent` to avoid HTML injection. User input is sent as JSON, not interpolated into markup.
- **Backwards Compatibility**: nothing to break. The repository has no existing pages.
- **Error Handling**: every failure path (non-2xx response, network error, thrown exception) shows the same inline error message and keeps the user's input.

## Proposed Solution

**High-level approach**: create a single static page and a single script. The script intercepts the form submit, POSTs JSON to the dummy endpoint using `fetch`, and reports the result inline. Nothing else is added to the repository.

### Key Components

1. **`contact.html`**

   - Holds the form markup, labels, and the status paragraph.
   - Why: a static document is the minimum that can render a form.
   - Integrates with nothing. It is standalone.

2. **`contact.js`**

   - Holds the endpoint constant and the submit handler.
   - Why a separate file instead of an inline `<script>`: keeps the endpoint constant easy to find and lets the HTML stay markup only.
   - Loaded by `contact.html` via a relative `<script src="contact.js">`.

### Files Likely to Change

- `contact.html` - new file, form markup.
- `contact.js` - new file, submit handler and endpoint constant.

No existing file changes. Do not create `package.json`, `index.html`, CSS files, or test files.

### Code Patterns to Follow

**Pattern References:**

- There is no existing application code in this repository, so there are no in-repo patterns to follow. Use the reference implementations below verbatim as the pattern.

**Reference `contact.html`:**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Contact Us</title>
  </head>
  <body>
    <h1>Contact Us</h1>

    <form id="contact-form" method="post" action="https://jsonplaceholder.typicode.com/posts">
      <p>
        <label for="name">Name</label><br />
        <input type="text" id="name" name="name" required />
      </p>
      <p>
        <label for="email">Email</label><br />
        <input type="email" id="email" name="email" required />
      </p>
      <p>
        <label for="message">Message</label><br />
        <textarea id="message" name="message" rows="5" required></textarea>
      </p>
      <p>
        <button type="submit" id="submit-btn">Send</button>
      </p>
    </form>

    <p id="form-status" role="status" aria-live="polite"></p>

    <script src="contact.js"></script>
  </body>
</html>
```

**Reference `contact.js`:**

```js
// Replace with the real backend URL when it exists.
const CONTACT_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts';

const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const payload = {
    name: data.get('name'),
    email: data.get('email'),
    message: data.get('message'),
  };

  submitBtn.disabled = true;
  statusEl.textContent = '';

  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    statusEl.textContent = 'Thanks, your message was sent.';
    form.reset();
  } catch (error) {
    statusEl.textContent = 'Sorry, something went wrong. Please try again.';
  } finally {
    submitBtn.disabled = false;
  }
});
```

**Anti-Patterns to Avoid:**

- Do not use `innerHTML` for status messages. Use `textContent`.
- Do not add `novalidate` to the form. Native validation is the only validation layer.
- Do not add custom JS validation, regex email checks, or third-party libraries.
- Do not add a `package.json`, bundler, framework, or CSS. The directive is the simplest possible page.
- Do not use `alert()` or `window.location` redirects for feedback.
- Do not hardcode the endpoint URL inside the `fetch` call. It must stay in `CONTACT_ENDPOINT`.

## Implementation Steps

### Phase 1: Create the page

- [ ] Create `contact.html` at the repository root with the markup from the "Reference `contact.html`" block above.
- [ ] Confirm every input has a matching `<label for>` and the form has `method="post"` and `action` set to the dummy endpoint.

### Phase 2: Create the script

- [ ] Create `contact.js` at the repository root with the code from the "Reference `contact.js`" block above.
- [ ] Confirm `CONTACT_ENDPOINT` is the first statement in the file.
- [ ] Confirm the submit button is disabled during the request and re-enabled in `finally`.

### Phase 3: Manual verification

- [ ] Open `contact.html` directly in a browser (double-click or `file://` URL).
- [ ] Run the Manual Testing Checklist in section 8 and confirm every expected result.

<details>
<summary><b>Implementation Detail</b></summary>

### 6. Edge Cases & Considerations

#### Edge Cases to Handle

1. **Empty field submitted**: browser blocks submission and focuses the first invalid field. `contact.js` never runs. No code needed.
2. **Malformed email (e.g. `foo`)**: browser blocks submission via `type="email"`. No code needed.
3. **Network offline**: `fetch` rejects. The `catch` block shows the error message and keeps the values.
4. **Endpoint returns non-2xx**: `response.ok` is `false`, the handler throws, `catch` shows the error message, values kept.
5. **Double click on Send**: button is disabled on first submit, so the second click is ignored until the request settles.
6. **JavaScript disabled**: native form POST goes to the dummy endpoint via `action`. The browser navigates to the JSON response. Acceptable for a dummy endpoint.
7. **Resubmit after success**: form is reset and the button re-enabled, so the user can send another message.

#### Potential Challenges

- ⚠️ **Dummy endpoint availability**: `jsonplaceholder.typicode.com` is a third-party free service. If it is down, the page shows the error message, which is the correct behaviour. Nothing further to handle.
- ⚠️ **Dummy endpoint does not persist**: the service fakes success and discards the data. This is expected and documented in the HTML comment above `CONTACT_ENDPOINT`.

#### Security Considerations

- No credentials, tokens, or secrets are involved.
- Status text is written with `textContent`, so user-controlled or server-controlled strings cannot inject markup.
- The payload is sent as `application/json`. The dummy endpoint is public. No sensitive data should be entered during testing.

### 7. Technical Considerations

#### Dependencies

- None. No npm packages, no CDN scripts.

#### Configuration Changes

- None. No `hublaunch.config.js` or other config changes.

#### Environment Variables

- None.

#### API Rate Limiting

- `jsonplaceholder.typicode.com` imposes no documented rate limit for light use. No retry or backoff logic needed.

#### Error Handling Strategies

- Single `try` / `catch` / `finally` around the `fetch`. All failures collapse to one user-facing message. Button is always re-enabled.

### 8. Testing Requirements

#### Unit Tests

- None. No test runner exists in the repository and none is to be added.

#### Integration Tests

- None.

#### Manual Testing Checklist

1. **Setup**: open `contact.html` in a current Chrome, Firefox, Safari, or Edge. Open the browser DevTools Network tab.
2. **Empty submit**: click Send with all fields empty.
   - Expected result: browser shows a native "Please fill out this field" tooltip on Name. No network request appears.
3. **Bad email**: fill Name and Message, enter `notanemail` in Email, click Send.
   - Expected result: native validation tooltip on Email. No network request.
4. **Valid submit**: fill all three fields with valid data, click Send.
   - Expected result: a `POST` to `https://jsonplaceholder.typicode.com/posts` appears in Network with status `201`. Request payload is JSON with `name`, `email`, `message`. Status paragraph reads `Thanks, your message was sent.` All fields are cleared.
5. **Failure path**: in DevTools, set Network to "Offline", fill all fields, click Send.
   - Expected result: status paragraph reads `Sorry, something went wrong. Please try again.` Field values remain.
6. **Double submit**: set Network throttling to "Slow 3G", fill all fields, click Send twice quickly.
   - Expected result: only one `POST` in Network. Button is greyed out until the response arrives.

#### Test Data Requirements

- Any non-empty name, any syntactically valid email such as `test@example.com`, any non-empty message.

### 9. Documentation Updates

#### User-Facing Documentation

- [ ] None. The repository has no README. Do not create one as part of this plan.

#### Code Documentation

- [ ] Keep the single comment above `CONTACT_ENDPOINT` explaining it is a placeholder to be replaced.

#### Examples to Include

```bash
# Open the page directly
open contact.html

# Or serve the repo root with any static server, e.g.
python3 -m http.server 8000
# then visit http://localhost:8000/contact.html
```

### 10. Acceptance Criteria

- [ ] **AC1**: `contact.html` and `contact.js` exist at the repository root and no other files were added or modified.
- [ ] **AC2**: Opening `contact.html` shows Name, Email, Message fields with labels and a Send button.
- [ ] **AC3**: Submitting with any empty field or an invalid email is blocked by native validation and sends no request.
- [ ] **AC4**: Submitting valid data sends a JSON `POST` to `CONTACT_ENDPOINT`, receives `201`, shows `Thanks, your message was sent.`, and clears the form.
- [ ] **AC5**: A failed request shows `Sorry, something went wrong. Please try again.` and preserves the entered values.
- [ ] **AC6**: The Send button is disabled while a request is in flight and re-enabled afterwards.
- [ ] **AC7**: The endpoint URL is defined once as `CONTACT_ENDPOINT` at the top of `contact.js`.

#### Definition of Done

- All acceptance criteria met.
- Manual Testing Checklist steps 2 through 6 pass.
- No `package.json`, CSS, test files, or framework code added.

### 11. Dependencies & Related Work

#### Dependencies

- [ ] Depends on: nothing.
- [ ] Required external setup: none. Public dummy endpoint needs no account.

#### Blockers

- [ ] None.

#### Related Issues/PRs

- Future work: replace `CONTACT_ENDPOINT` with a real backend and add spam protection. Not tracked yet.

</details>
