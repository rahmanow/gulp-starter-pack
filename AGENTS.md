# AGENTS.md

Guidance for AI coding agents working in this repository. Humans should start
with [README.md](README.md); this file documents the conventions and invariants
that are easy to violate without noticing.

## What this project is

A static-site build pipeline. Gulp 5 orchestrates Tailwind CSS 4, PostCSS,
Terser and sharp to turn `src/` into a deployable folder. There is no
framework, no server, no runtime dependency — the output is plain HTML, CSS, JS
and images.

Everything in `package.json` is a `devDependency`, deliberately. Nothing here
ships to a browser except what the build emits.

## Setup and verification

```sh
npm install       # Node 20.19+ required
npm run check     # lint + format check + production build — run this before finishing
```

`npm run check` is the single command that tells you whether a change is sound.
CI runs exactly the same three steps, so a green `check` locally means a green
CI run. Do not report a change as complete without it passing.

To verify the dev server, run `npm run dev` in the background and request
`http://localhost:9050`. Note that Browsersync only injects its live-reload
snippet when the request sends an HTML `Accept` header:

```sh
curl -s -H 'Accept: text/html' http://localhost:9050/ | grep __bs_script__
```

A plain `curl` without that header will not show the snippet. That is a quirk of
the request, not a broken build.

## Repository map

| Path               | Role                                                           |
| ------------------ | -------------------------------------------------------------- |
| `config.js`        | All paths, ports and options. Most changes belong here.        |
| `gulpfile.js`      | Task definitions. ES modules.                                  |
| `src/index.html`   | A page. Sibling `.html` files are also pages.                  |
| `src/partials/`    | `@@include` fragments. Never emitted as pages.                 |
| `src/css/main.css` | Tailwind entry point, `@theme` tokens, component classes.      |
| `src/js/`          | `main.js` + `libs/` are bundled; `vendor/` is copied verbatim. |
| `dist/`            | Development output. Generated, gitignored.                     |
| `build/`           | Production output. Generated, gitignored.                      |
| `release/`         | Zipped builds. Generated, gitignored.                          |

## Invariants

These encode bugs that were actually shipped in 1.x. Breaking one reintroduces
a real defect, so treat them as hard rules.

1. **Never write generated files into `src/`.** Output goes to `dist/` or
   `build/`. Version 1.x piped compiled CSS back into `src/scss/`, and those
   artifacts ended up committed.

2. **Every Gulp task must return its stream or a promise.** A task that does not
   is treated as finished the moment it starts, so dependent tasks run against
   files that do not exist yet. In 1.x every task was an `async` function that
   returned nothing, and the dev server started before the build had written
   anything.

3. **Production must build from `src/`, never from `dist/`.** The 1.x
   `prodStyles` read from `dist/css`, so `gulp prod` on a clean checkout
   produced a site with no stylesheet at all.

4. **Pages and partials are different things.** Partials live in
   `src/partials/` and are excluded by `config.paths.html`. If you add a
   fragment anywhere else, it will be emitted as a standalone page.

5. **HTML must go through `gulp-file-include` in both modes.** 1.x skipped it in
   production and shipped a literal `@@include(...)` line as the first line of
   the document.

6. **Do not hard-code a deploy target.** `surgeDomain` defaults to empty and the
   task fails with an explanatory error. 1.x hard-coded the author's own
   repository URL and surge domain, so anyone who cloned it deployed to — and
   pushed at — somebody else's infrastructure.

7. **Configuration belongs in `config.js`.** If a change introduces a path, port or
   toggle, expose it there rather than embedding it in `gulpfile.js`.

## Tailwind CSS 4 specifics

This is v4, not v3. The differences bite:

- **No `tailwind.config.js`.** Configuration is the `@theme` block in
  `src/css/main.css`. Do not create a JS config file.
- **`@theme` tokens generate utilities by namespace.** `--color-brand-500` →
  `bg-brand-500`; `--radius-card` → `rounded-card`. Use the generated utility.
- **`rounded-[--radius-card]` is a v3-ism and silently produces invalid CSS**
  (`border-radius:--radius-card`). Use `rounded-card`, or
  `rounded-[var(--radius-card)]` if you genuinely need an arbitrary value.
- **`source(none)` is set**, so automatic content detection is off. A new
  template folder needs an explicit `@source` line or its classes will not be
  generated.
- **No autoprefixer, no PurgeCSS.** v4 prefixes automatically and only emits
  utilities it finds. Do not re-add either.
- **No Sass.** It was removed on purpose; v4 is designed to replace
  preprocessors.

## Gotchas when verifying output

- **Development CSS is not minified; production CSS is.** Grepping for
  `text-transform:uppercase` will miss the dev build, which formats it as
  `text-transform: uppercase` with a space and leading indentation. Match
  loosely, or check `build/` rather than `dist/`.
- **`npm audit` reports 3 high advisories** against `immutable`, via
  `browser-sync`. These are known, dev-server-only, and documented in
  [SECURITY.md](SECURITY.md). **Do not "fix" them with an `overrides` entry** —
  pinning a patched `immutable` breaks Browsersync at runtime
  (`server.get is not a function`). It silences the audit and leaves a dev
  server that cannot start.
- **`npm run build` is fast (~200ms).** If it appears to hang, something is
  wrong; it is not normally slow.

## Style

- ES modules everywhere (`"type": "module"`). Use `import`, not `require`.
- Prettier owns formatting — run `npm run format` rather than hand-aligning.
- `src/partials/` is excluded from Prettier because the fragments are
  intentionally unbalanced HTML and its parser rejects them.
- Comments should explain _why_, particularly where the code guards against one
  of the invariants above.

## Making a change

1. Read `config.js` first — the option you need may already exist.
2. Make the change; prefer editing `config.js` over `gulpfile.js`.
3. Run `npm run check`.
4. If behavior changed, update `README.md` and add a `CHANGELOG.md` entry.
