# CLAUDE.md

This project keeps its agent guidance in **[AGENTS.md](AGENTS.md)** so that every
AI tool reads the same instructions.

Please read [AGENTS.md](AGENTS.md) before making changes. In short:

- Run `npm run check` (lint + format + build) to verify any change.
- Configuration belongs in `config.js`, not `gulpfile.js`.
- Never write generated files into `src/`; output goes to `dist/` or `build/`.
- Every Gulp task must return its stream or a promise.
- This is Tailwind CSS **4** — configured in CSS via `@theme`, with no
  `tailwind.config.js`, no autoprefixer, no PurgeCSS and no Sass.
- The 3 `npm audit` advisories from `browser-sync` are known and documented in
  [SECURITY.md](SECURITY.md). Do not add an `overrides` entry for them — it
  breaks the dev server.
