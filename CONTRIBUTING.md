# Contributing

Thanks for taking the time to contribute. This is a small project, so the
process is deliberately light.

## Getting set up

```sh
git clone https://github.com/rahmanow/gulp-starter-pack.git
cd gulp-starter-pack
npm install
npm run dev
```

You need **Node.js 20.19 or newer** (see `.nvmrc` — `nvm use` picks the right
version automatically).

## Before you open a pull request

Run the full check suite. CI runs exactly this, so a green run locally means a
green run on GitHub:

```sh
npm run check
```

That is shorthand for three things:

| Command                | What it does                                   |
| ---------------------- | ---------------------------------------------- |
| `npm run lint`         | ESLint over the gulpfile, config and `src/js/` |
| `npm run format:check` | Prettier formatting check                      |
| `npm run build`        | A full production build                        |

`npm run format` fixes formatting, and `npm run lint:fix` fixes what ESLint can
fix on its own.

## Reporting a bug

Open an issue with the bug report template. The two things that help most are
your **Node version** (`node --version`) and the **exact command** you ran.

## Making a change

1. Fork the repository and create a branch from `master`.
2. Make your change. Keep it focused — one concern per pull request.
3. Run `npm run check`.
4. Open a pull request describing what changed and why.

### A few conventions

- **Configuration belongs in `config.js`**, not hard-coded in `gulpfile.js`.
  If your change adds a path or an option, expose it there.
- **Gulp tasks must return** their stream or a promise. A task that does not
  return one is treated as finished immediately, which silently reintroduces
  race conditions between tasks.
- **Never write generated files back into `src/`.** Output goes to `dist/`
  (development) or `build/` (production), both of which are gitignored.
- **Styling is Tailwind-first.** Prefer utilities and `@theme` tokens in
  `src/css/main.css` over bespoke CSS.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By taking
part, you agree to abide by it.
