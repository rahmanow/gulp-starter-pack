# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-08-28

A full modernization of the toolchain. This release contains breaking changes —
see [Migrating from 1.x](#migrating-from-1x) below.

### Fixed

- **`gulp prod` produced an unusable site.** The production build emitted no CSS
  at all, because `prodStyles` read from `dist/` — a folder that only exists
  after running the _development_ task. Styles are now compiled from `src/` in
  both modes, so a production build works on a clean checkout.
- **Production HTML was not a valid document.** `prodHTML` copied pages without
  running them through `gulp-file-include`, so `build/index.html` shipped a
  literal `@@include('./header.html')` line and no `<html>`, `<head>` or
  `<body>` element.
- **Partials leaked into the production build.** `header.html` and `footer.html`
  were emitted as standalone pages. Fragments now live in `src/partials/` and
  are excluded by a single glob rule.
- **Build tasks did not report completion.** Every `dev*` task was an `async`
  function that never returned its stream, so Gulp treated them as finished
  immediately and started the dev server before files were guaranteed written.
- **The archive zipped the directory it was writing into.** `build.zip` was
  created inside `build/`. Archives now go to `release/`, named by version.
- **Compiled CSS was written back into `src/`**, and the generated files were
  committed to the repository.
- Every task was declared as an implicit global (`preview = ...`), leaking into
  global scope and breaking under strict mode.

### Security

- Vulnerability count went from **96 (8 critical) to 3**. The remaining three
  are dev-server-only and documented in [SECURITY.md](SECURITY.md).
- Removed `gulp-imagemin`, whose abandoned binary-wrapper dependency chain
  accounted for 29 of the advisories. Image optimization now uses `sharp`.

### Removed

- **`gulp git` and `gulp push`.** These ran `git add` + auto-commit + push
  against a URL hard-coded to the original author's repository. Anyone who
  cloned the project and ran them would push to somebody else's remote.
- **Sass** (`gulp-sass`, `sass`). Tailwind CSS 4 is designed to replace
  preprocessors and advises against pairing the two.
- **`autoprefixer`** — Tailwind 4 handles vendor prefixing itself.
- **`gulp-purgecss`** — Tailwind 4 only generates the utilities you use, so
  there is nothing left to purge.
- **`gulp-babel`** — Terser handles modern syntax, and Tailwind 4 already
  requires a modern browser baseline.
- `superchild`, `gulp-surge`, `gulp-open`, `gulp-if`, `gulp-replace`,
  `gulp-webp`, `del`, `log-symbols`, `fancy-log`: replaced by Node built-ins or
  no longer needed.
- `_config.yml`, which referenced a GitHub Pages theme that does not exist.
- The committed `.idea/` editor directory.

### Added

- ESLint and Prettier, with `npm run check` running the same suite as CI.
- GitHub Actions CI across Node 20, 22 and 24, plus an optional Pages deploy.
- `src/js/vendor/` for scripts copied verbatim, replacing the `src/js/external/`
  folder that was excluded from bundling but never actually copied anywhere.
- MIT `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue
  and pull request templates, and Dependabot.
- `AGENTS.md` / `CLAUDE.md` so AI coding assistants can work in the repo without
  guessing at its conventions.
- `.editorconfig`, `.gitattributes`, `.nvmrc`.

### Changed

- Gulp 4 → **Gulp 5**; Tailwind CSS 3 → **Tailwind CSS 4**; Browsersync 2 → 3.
- The gulpfile and `config.js` are now ES modules.
- Tailwind is configured in CSS (`@theme` in `src/css/main.css`) rather than in
  `tailwind.config.js`.
- Images are optimized only in production, keeping the watch loop fast.
- The dev server reports the port it actually bound, which matters when the
  configured port is already taken.
- All dependencies are now `devDependencies` — none of this ships to users.

### Migrating from 1.x

1. Delete `node_modules/` and `package-lock.json`, then run `npm install`.
2. Move your pages' partials into `src/partials/` and update the paths in your
   `@@include(...)` calls.
3. Port `src/scss/*.scss` to `src/css/main.css`. Nesting and `@apply` still
   work; `$variables` become `@theme` tokens.
4. Replace `tailwind.config.js` with a `@theme` block. A `--color-brand-500`
   token gives you `bg-brand-500`, `text-brand-500` and so on.
5. If you used `gulp git` / `gulp push`, use `git` directly.
6. Set `surgeDomain` in `config.js` if you deploy with `npm run deploy`.

## [1.3.0] - 2022

Initial public releases: Gulp 4 pipeline with Tailwind CSS 3, Sass, Browsersync
live reload, surge.sh deploy and git helper tasks.

[2.0.0]: https://github.com/rahmanow/gulp-starter-pack/releases/tag/v2.0.0
