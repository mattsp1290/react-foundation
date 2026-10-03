# react-foundation

Shared foundation for Birb React web applications: the SWEETIE-16 design
tokens, base element styles, theme switching, a cookie-session API client and
the login and registration form primitives. It plays the role that
`flutter-foundation` and `swift-foundation` play for their platforms.

It is one npm package, `@birb/react-foundation`, at the repository root. It is
not published to a registry. Consumers pin an immutable commit SHA.

`DESIGN.md` is a copy of the birbparty design contract that the tokens and
recipes implement. See its provenance header.

## Install

```sh
npm install "github:mattsp1290/react-foundation#<full 40-character commit sha>"
```

Use a full commit SHA, never a branch or tag. npm skips integrity verification
for git dependencies, so the SHA is the package's only identity.

What npm does with that line:

- `package.json` gets `"@birb/react-foundation": "github:mattsp1290/react-foundation#<sha>"`.
- `package-lock.json` records
  `"resolved": "git+ssh://git@github.com/mattsp1290/react-foundation.git#<sha>"`.
  Do not hand-edit it; npm rewrites it on the next install.
- Despite the `git+ssh` text, npm installs a full-SHA pin of this public
  repository from the GitHub tarball endpoint. It needs neither `git` nor an
  SSH key, so `npm ci` works in a plain `node:22-alpine` build stage.
- npm then installs this package's dev dependencies and runs `prepare`
  (a `tsc` build) to produce `dist/`, which is not committed. The
  install therefore needs the npm registry and GitHub.

If this repository ever becomes private, consumers need `git` in the build
image and an `insteadOf` rewrite from `ssh://git@github.com/` to an HTTPS URL
with credentials.

To bump, change the SHA and run `npm install`. To roll back, restore the
consumer's `package.json` and `package-lock.json` together from the previous
commit.

Peer dependencies: `react` and `react-dom` 19. There are no runtime
dependencies, and no router or data-library dependency.

## Use

Import the styles once, in this order, before the application's own styles:

```ts
import '@birb/react-foundation/tokens.css';
import '@birb/react-foundation/base.css';
import './styles.css';
```

`tokens.css` defines the sixteen palette primitives and the semantic roles
(`--surface`, `--on-surface`, `--primary`, `--on-primary`,
`--primary-container`, `--on-primary-container`, `--focus`, `--error`,
`--disabled`) for `:root`, `:root[data-theme='dark']` and, under
`prefers-color-scheme: dark`, `:root[data-theme='system']`. Product CSS uses
the roles, not the primitives.

`base.css` styles native elements (`body`, `a`, `h1`, `form`, `input`,
`button`, `fieldset`, `legend`, `main`, `footer`, `:focus-visible`) and the
classes `.app-shell`, `.masthead`, `.panel`, `.error` and `.inline-nav`. It is
a global stylesheet, not a scoped one.

```tsx
import {
  AppShell,
  LoginForm,
  Panel,
  createBrowserSession,
  createPaintThemeCache,
  createRequest,
} from '@birb/react-foundation';

const paintTheme = createPaintThemeCache('myapp.web.paint-theme.v1');
paintTheme.restore(); // before the first render

const request = createRequest({ resolveUrl: (path) => `/api${path}` });
const session = createBrowserSession(request);
```

## API

### Theme

| Export                              | Description                                                                                                                                                                                               |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ThemeMode`                         | `'system' \| 'light' \| 'dark'`                                                                                                                                                                           |
| `isThemeMode(value)`                | Type guard for `ThemeMode`                                                                                                                                                                                |
| `applyTheme(mode)`                  | Sets `data-theme` on the document element                                                                                                                                                                 |
| `createPaintThemeCache(storageKey)` | Returns a `PaintThemeCache`, `{ restore(), cache(mode) }`, over `localStorage`. `restore` applies the cached mode, or `system` when the value is missing, invalid or storage throws. `cache` never throws |

The cache is a first-paint hint only. Name the key `<app>.web.paint-theme.v1`
so two applications on one origin do not share it.

### Session client

| Export                                                          | Description                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ApiError`                                                      | `Error` with `status` and optional `code`. The message is the code, or `Request failed with <status>`                                                                                                                                                                                                        |
| `createRequest({ resolveUrl })`                                 | Returns `request(path, init?)`: `fetch` with `credentials: 'include'` and `Accept: application/json` (caller headers win). A non-2xx response throws `ApiError(status, code)`, with `code` read from an `{ "error": { "code" } }` body when it parses                                                        |
| `createBrowserSession(request)`                                 | Returns `register(username, password)` (`POST /users`), `currentUser()` (`GET /users/me`), `login(username, password)` (`POST /auth/browser/login` with a Basic header) and `logout()` (`POST /auth/browser/logout`, which throws `ApiError(status, 'unexpected_logout_response')` unless the status is 204) |
| `basicAuthorization(username, password)`                        | UTF-8 safe `Basic` header value                                                                                                                                                                                                                                                                              |
| `validateRegistrationCredentials(username, password)`           | Returns a message, or `undefined` when valid: username 1–256 UTF-8 bytes with no surrounding whitespace, colon or control character; password 1–72 UTF-8 bytes                                                                                                                                               |
| `registrationError(error)`                                      | User-facing message for a failed registration                                                                                                                                                                                                                                                                |
| `CurrentUser`, `RegisteredUser`, `BrowserSession`, `ApiRequest` | Types                                                                                                                                                                                                                                                                                                        |

Paths are passed to `request` unchanged; the host's `resolveUrl` adds any
proxy prefix.

Contract ownership: these paths, status rules, error codes and messages are
the browser API contract of birbparty's `crates/api`. The tests here use mocked
responses and prove only that the client is self-consistent. The real check is
birbparty's `web/e2e/journey.spec.ts`, which runs against the real API.

### Primitives

| Component                                                                                                             | Renders                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell({ titleLink, footer, children })`                                                                           | `div.app-shell` with `header.masthead` (your link, as given), `main` and `footer`                                                                                                                                                                                                                                                                           |
| `Panel({ heading, headingId, className?, children })`                                                                 | `section.panel` labelled by its `h1#headingId`                                                                                                                                                                                                                                                                                                              |
| `StatusMessage({ children })`                                                                                         | `p[role=status]`                                                                                                                                                                                                                                                                                                                                            |
| `ErrorMessage({ children, live? })`                                                                                   | `p.error[role=alert]`, or plain `p.error` with `live={false}`                                                                                                                                                                                                                                                                                               |
| `TextField({ id, label, value, onChange, type?, autoComplete?, required?, disabled?, description?, descriptionId? })` | `label`, `input#id` and, with a description, a `p` that describes the input (id `descriptionId`, default `<id>-description`)                                                                                                                                                                                                                                |
| `LoginForm({ initialUsername?, pending, error?, onSubmit })`                                                          | Username and password fields, a failure alert when `error`, and a submit button that is disabled while `pending`                                                                                                                                                                                                                                            |
| `RegisterForm({ pending, error?, onSubmit, onChange? })`                                                              | Username and password fields with the requirements text. Validates with `validateRegistrationCredentials` before `onSubmit`. Shows one alert: the validation message, else `error`. Editing a field clears the validation message and calls `onChange`, also while `pending`, so a host that resets its mutation there should do so only when it has failed |

Components use native elements only and take no router, query or fetch
dependency. Headings, navigation and mutations belong to the host page.

Limit: the element ids in `LoginForm` (`username`, `password`) and
`RegisterForm` (`register-username`, `register-password`,
`register-requirements`) and all of their visible strings are fixed. They are
birbparty contract text that its tests assert. They cannot be overridden yet,
so render at most one of each form per document.

## Develop

Requires Node 22 (`.nvmrc`) and npm 10.

```sh
npm ci
npx playwright install chromium   # once
npm run verify
```

`npm run verify` runs, in order: Prettier check, ESLint, type-check, the
token freshness check, unit tests with coverage (including a WCAG contrast
test over the shipped `css/tokens.css`), the library build, a packed-install
smoke test (`scripts/verify-pack.sh`: the tarball installs into an empty
project and imports under Node ESM), and a Playwright run against the built
catalog (axe and computed-style checks in light and dark).

There is no CI workflow; run the gate locally before merging.

- Tokens: edit `src/tokens/palette.json` or `src/tokens/roles.json`, then run
  `npm run generate:tokens`. `css/tokens.css` is generated and committed. In
  `src/` and `css/`, only those three files may hold color literals; the
  Playwright spec restates expected values on purpose.
- Source imports use explicit `.js` extensions, because the package builds
  with `tsc` in NodeNext mode so that `dist/` loads under Node ESM, Vitest and
  Vite alike.
- Catalog: after the root `npm ci` (the catalog takes React from the root
  `node_modules`), run `npm --prefix catalog ci`, then
  `npm --prefix catalog run dev`.
  Add `?theme=light|dark|system` and `?login=idle|pending|error` to the URL.
  The catalog is a nested dev-only project, so a consumer's install never pays
  for its tooling.
