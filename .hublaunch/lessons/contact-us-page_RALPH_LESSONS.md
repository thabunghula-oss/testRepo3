# HubLaunch Lessons Learned

This file persists context across agent sessions. Update it as you work.

## Current Status
- Phase: COMPLETE ✅
- Last action: Created contact.html + contact.js, verified all paths, committed.
- Blockers: None

## Key Discoveries
- Empty repo: no package.json/build/test runner. Plan is deliberately zero-tooling static HTML + vanilla JS.
- Plan provided verbatim reference implementations for both files — used as-is.
- Node v20 and python3 available in sandbox; live internet works (jsonplaceholder returned 201).

## Solutions That Worked
- Verified JS syntax with `node --check contact.js`.
- Simulated submit handler end-to-end with a mock DOM/FormData/fetch harness in /tmp/harness.mjs
  (not committed). Covered: success (thanks msg + reset + btn re-enabled), non-2xx (error msg,
  no reset), fetch throws/offline (error msg), button disabled-during-flight. All PASS.
- Confirmed live POST to https://jsonplaceholder.typicode.com/posts returns HTTP 201.
- grep-verified every required HTML element/attribute and absence of novalidate/innerHTML.

## Things to Avoid
- Do NOT add package.json, CSS, frameworks, tests, README, or index.html — plan forbids it.
- Do NOT add novalidate or custom JS validation; native HTML5 validation only.
- Do NOT use innerHTML for status; use textContent.

## Files Modified
- contact.html (new, repo root) — form markup, labels, status paragraph, method=post + action.
- contact.js (new, repo root) — CONTACT_ENDPOINT const + submit handler.

## Open Questions
- None.

## Next Steps
- Done. Future (separate work): swap CONTACT_ENDPOINT for a real backend + spam protection.
