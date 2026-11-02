# TestMate Studio Plan

Roadmap for the studio extension toward V1
([TMD-5](https://testmate.youtrack.cloud/issue/TMD-5)): recorded lines can be
grouped into reusable, parameterised functions, by hand, by suggestion, or by
inserting existing functions.

## Status

| Step | Work | Status |
|---|---|---|
| — | Cross-browser fixes, state saving, performance, UI rename | Done, tested in Firefox and Chrome |
| — | [TMD-8](https://testmate.youtrack.cloud/issue/TMD-8) Create a function from selected lines | Done, tested in Firefox and Chrome |
| 1 | Field context and suggested parameters | Next |
| 2 | [TMD-11](https://testmate.youtrack.cloud/issue/TMD-11) Auto-recognise form functions | Planned |
| 3 | [TMD-14](https://testmate.youtrack.cloud/issue/TMD-14) Insert a function | Planned |
| 4 | [TMD-12](https://testmate.youtrack.cloud/issue/TMD-12) Function library, nesting, and matching | Planned |
| — | [TMD-13](https://testmate.youtrack.cloud/issue/TMD-13) Edit recorded lines | On hold (needs low-code English, which needs the WebUI) |
| — | Background safeguards | Optional, any time |

## Ground Rules

- **Chrome MV3 is the baseline.** Background code is written for Chrome's
  service worker: no `document`, `window`, `XMLHttpRequest`, or
  `localStorage`, including inside dependencies. Firefox runs the same code.
  The manifest keeps both `background.service_worker` (Chromium) and
  `background.scripts` (Firefox). Chrome's warning about the latter is only
  visible to developers.
- **Parity:** features and look are identical in every Firefox- and
  Chromium-based browser. Browser checks may only smooth over API
  differences, never change features.
- **Scope of functions:** functions belong to the current recording, and each
  new recording starts fresh. Once the WebUI exists, functions come from its
  project.
- **Privacy:** learned fingerprints store only locators, field types, labels,
  and `autocomplete` hints, never typed values (especially passwords).
- **Testing:** check every change in both Firefox and Chrome. After a rebuild,
  press reload on the extension in `chrome://extensions` or
  `about:debugging`. Reopening the window doesn't reload the background.

## Parameters (decided)

### Names and types
- Parameter names use ASCII letters, digits, `_`, and `-`. They start with a
  letter or `_` and don't end with `-`. No brackets (`()`, `{}`, `[]`), `$`,
  `%`, `£`, `€`, or other symbols.
- Function names use letters, digits, and `_`.
- Types come from a dropdown. `any` is the default and is stored as untyped.
  The other types are `string`, `char`, `int`, `float`, `double`, `boolean`,
  `date`, `datetime`, `list`, and `json`.

### References in line values (PHP-style)
- `$username` is replaced by the `username` parameter's value.
- Only declared parameters are replaced, matching the **longest declared
  name**:
  - With only `user` declared, `$user-admin` becomes `user`'s value followed
    by `-admin`.
  - With `user-admin` declared, it becomes `user-admin`'s value.
- There is no brace syntax. If both `user` and `user-admin` exist and you need
  `user` followed by `-admin`, rename one of them.
- Other `$` text, such as `$5`, is left as typed. `\$username` is a literal
  `$username`.

## Data Model Watch-out

TMD-14 inserts copies of a function with their own parameter values, and
TMD-12 replaces copies with library definitions plus calls. Building TMD-14 on
copies would mean migrating saved data again in TMD-12. So the
**definition-plus-call model is introduced at the start of TMD-14**:

- Definitions hold the name, description, parameters, and lines.
- A call holds a definition ID plus its own parameter values and collapsed
  state.

TMD-12 then extends this model with nesting, wrap suggestions, and matching.

---

## 1. Field Context and Suggested Parameters (next)

The foundation for TMD-11 and TMD-14, and the only way to link parameters to
lines until TMD-13 exists.

### Field context
- When a line is recorded, `Recorder.record()` (`src/content/recorder.js`)
  attaches an optional `context` to it:
  `{ fieldName, fieldType, autocomplete, label, groupKey, groupLabel, isFillable }`.
  - `groupKey` is a stable locator for the line's `<form>` (or `form="id"`
    owner), `<fieldset>`, `role="form" | "search" | "dialog"`, `<dialog>`, or
    the nearest container holding both the fields and a button.
  - New module: `src/content/form-context.js`.
- Background `addCommandMessageHandler` (`src/background/recorder.js`) and
  `record()` / `sanitizeStep` (`src/background/index.js`) pass `context`
  through and keep it.
- The UI serialises it too (`serializeStep` in `src/ui/App.vue`).

### Suggested parameters
When a function is created, the modal pre-fills one parameter for each
selected line that has a typed or selected value:

- The name comes from `autocomplete`, `name`, `id`, or the label, made valid
  and unique, e.g. `username`.
- The type comes from the input type:

  | Input type | Parameter type |
  |---|---|
  | `date` | `date` |
  | `datetime-local` | `datetime` |
  | checkbox | `boolean` |
  | `number` | `int`, or `float` if `step` allows decimals |
  | anything else | `string` |

- On save, each line's value becomes `$name`, and the recorded value becomes
  the parameter's starting value.
- The user can rename, retype, or delete a suggestion before saving. A deleted
  suggestion keeps its fixed value in the line.
- The logic is pure and unit tested in `src/ui/utils/function-utils.js`.

## 2. TMD-11: Auto-recognise Form Functions

### How a run of lines is detected
1. **Grouping:** consecutive lines that share a `groupKey`.
2. **Shape:** fill (`type` / `select` / `check`), then commit (a click or
   Enter).
3. **Commit triggers** that close a run:
   - the form's `submit` event (capture phase; it covers clicks, Enter, and
     `requestSubmit()`)
   - a tab URL change (`tabs.onUpdated`)
   - an SPA route change (`webNavigation.onHistoryStateUpdated`)
   - the tracked fields disappearing (MutationObserver)

   Button text is only a weak signal. A bare `<button>` inside a form submits
   it by default.
4. **Scoring:**
   - Strong signals: a form or container, a commit trigger, a password field.
   - Medium signals: field meaning, i.e. `autocomplete` (`username`,
     `current-password`, `email`, `postal-code`, `cc-number`, …) and input
     type.
   - The studio prompts only above a threshold.
5. **Don't prompt** for fewer than 2 fillable lines, while paused, for lines
   already in a function, or for a form signature dismissed this session.

### What the user sees
- A tooltip on the run's last line: "Turn these N lines into a function?"
  with **Create function** and **Dismiss**.
- **Create function** opens `FunctionModal` with suggested parameters (step 1)
  and a new optional **Description** field. Saving reuses the TMD-8 create
  path, then runs the TMD-14 parameter entry flow.
- The name is suggested from the form heading, dialog title, or labels, e.g.
  `signIn`.

### Files
- New: `src/content/form-context.js` (commit reporting) and
  `src/background/form-detector.js` (grouping, scoring, suggestions).
- Suggestions are saved in `syncSessionState` and exposed through the `steps`
  / `status` responses.
- UI: `StepList.vue` (tooltip) and `FunctionModal.vue` (description).
- `description` is added to `serializeItem` (App.vue), `sanitizeItem`
  (background), and `validateFunctionDraft`.

### Later scoring inputs (TMD-11.x)
- A POST/PUT request just after the last field (`webRequest`, observe-only).
- A success or error message appearing (`role="alert"` / `aria-live`).
- Page landmarks (`<nav>`, menus), URL path boundaries, pauses between bursts
  of actions, and lines inside one iframe or popup.

## 3. TMD-14: Insert a Function

1. Introduce the definition-plus-call data model (see Data Model Watch-out),
   and migrate existing function groups to it.
2. A green **+** button sits under the steps, or at the top when there are
   none. It opens a dropdown:
   - **New line** does nothing for now. It needs TMD-13.
   - **Function** opens a searchable list of the recording's functions.
     Typing filters by name.
3. Selecting a function inserts a call, with its lines shown beneath it and
   the cursor in the first parameter.
4. Inline parameter inputs only accept their type:

   | Type | Input |
   |---|---|
   | `int` | whole numbers |
   | `float` / `double` | decimals |
   | `char` | exactly one character |
   | `boolean` | true / false |
   | `date` | native date picker |
   | `datetime` | native date-and-time picker |
   | `list` | CSV |
   | `json` | must parse as JSON |
   | `string` / `any` | free text |

   Native pickers are used unless they look out of place.
5. **Tab** or **Enter** (main or numpad) moves to the next parameter until all
   have values.
6. `$name` in the call's lines is replaced with its values, following the
   reference rules above.
7. The same parameter entry flow runs after creating a function (TMD-8 or a
   TMD-11 suggestion).

## 4. TMD-12: Function Library, Nesting, and Matching

- **Functions inside functions**, e.g. `setUpWorkflow` = `login` →
  `openProject` → `createItem` → `addToWorkflow`. Each inner function stays
  usable on its own. A selection that includes functions can now become a
  function, lifting TMD-8's no-nesting rule.
- **Matching:** recognise recorded lines as an existing function by similar
  selectors (the values will differ). The tooltip offers **Replace with
  existing** or **Add as new**.
- **Wrap suggestions:** when the same functions keep appearing in the same
  order, suggest wrapping them.
- **Learning per application (by origin):**
  - from manual grouping (fingerprints of functions the user created)
  - from accepted, dismissed, and renamed suggestions
  - from a small catalogue of well-known flows (login, sign-up, search,
    checkout, address, payment)
- Until the WebUI exists, everything is limited to the current recording.

## On Hold

- **TMD-13, edit recorded lines:** needs the low-code English layer, which
  needs the main WebUI. Once it exists, **New line** (TMD-14) can also offer
  "Insert Recording" (resume recording after a selected line).

## Optional Safeguards (any time)

- A lint rule blocking `document`, `window`, `XMLHttpRequest`, and
  `localStorage` in `src/background/`.
- A smoke test that loads the built `background.js` without a DOM, which
  catches dependencies too.
- Remove the broken, unused `isChrome()` / `isFirefox()` in
  `src/content/utils.js`. Both are missing `return` and compare browser names.
- Fix the Jest environment so `__tests__/content/recorder.spec.js` runs. It
  currently fails with `window is not defined`.

---

## Done: Cross-browser Fixes and Groundwork

- **Firefox:** `replaceSteps` failed with a DataCloneError on Vue proxies.
  Payloads are now JSON-cloned in `useRecorderApi.js`.
- **Chrome:** `document is not defined` came from engine.io's polling falling
  back to JSONP. The socket now uses WebSocket only.
- **Content recorder:**
  - Mutation observers were bound to the observer, not the recorder
    (`this.record is not a function`).
  - `detach()` didn't remove the bound listeners, so they piled up on every
    stop/start.
  - Fixed the `removeAtrribute` typo.
- **Build:** Vue feature flags are defined in `webpack.config.babel.js`.
- **State:** live state is kept in `storage.session` on every change, so it
  survives the background being unloaded when idle. The pause snapshot in
  `storage.local` still survives browser restarts. Message handlers wait for
  restoration to finish.
- **Performance:** the full-page element count no longer runs on every
  mouseover or page change. This was the cause of the Firefox "slowing down"
  warning.
- **New recordings** start fresh, after a confirmation when lines exist.
- **UI** renamed from "Testmate Recorder" to "Testmate Studio".
- **Selection:** Shift-click range selection. Items between the anchor and the
  clicked item take the clicked item's new state, and a function counts as one
  item.

## Done: TMD-8, Create a Function from Selected Lines

### Behaviour
- **Creating:**
  - `f(x)` in the bulk toolbar is enabled for 2+ adjacent top-level steps.
  - Otherwise a tooltip explains why: too few steps, steps not adjacent, or
    the selection contains a function.
  - It opens a compact modal with a required name and parameters (Name/Type
    columns, type dropdown).
  - The input is checked before saving. Enter saves and Escape cancels.
- **Function header:**
  - Shows `N. name(param: type, …)`, with `: type` omitted for `any`,
    followed by an `n lines` count.
  - Has expand/collapse, edit (reopens the modal), double-click inline
    rename, delete (removes the whole function), and drag (moves the whole
    block).
- **Lines inside a function:** numbered `N.1`, `N.2`, … with no checkbox,
  delete, or drag controls.
- **Bulk actions:** cut, copy, paste, and delete treat a function as one item,
  and paste gives copies new IDs.

### Data model (until TMD-14)
```text
{ type: 'function', id, name, parameters: [{ name, type? }], collapsed, steps: [...] }
```
Steps keep `command`, `target`, `value`, and `insertBeforeLastCommand`.

### Files
- `src/ui/App.vue`
- `src/ui/components/BulkActions.vue`
- `src/ui/components/StepList.vue`
- `src/ui/components/FunctionModal.vue` (new)
- `src/ui/utils/function-utils.js` (new), tested in
  `__tests__/ui/function-utils.spec.js`
- `src/ui/styles/recorder.css` and `src/ui/styles/variables.css`
- `src/background/index.js` (`sanitizeItem`)

---

## Verification (every step)

1. Build with `yarn workspace tms-studio build`, unless `npm start` is already
   watching.
2. Reload the extension in both browsers, using the reload button rather than
   just reopening the window.
3. Run the unit tests for the pure logic with
   `yarn jest packages/tms-studio/__tests__/ui --no-coverage`. Covers
   parameter suggestion, `$name` substitution, per-type validation, and
   grouping and scoring.
4. Manual checks in **both** Firefox and Chrome, including after Chrome's
   service worker has gone idle (wait over 30s, or stop it from
   `chrome://extensions`).
5. TMD-11 test cases:
   - a classic `<form>` login, both clicking submit and pressing Enter
   - an SPA login with no `<form>` that changes route
   - a modal form that closes
   - a single-field search, which should not trigger a prompt
   - a dismissed prompt, which should not reappear
