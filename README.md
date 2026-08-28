<h1 align="center">Gulp Starter Pack</h1>

<p align="center">
  A small, readable static-site pipeline — HTML partials, Tailwind CSS 4,
  live reload, and a production build that actually works.
</p>

<p align="center">
  <a href="https://github.com/rahmanow/gulp-starter-pack/actions/workflows/ci.yml">
    <img alt="CI" src="https://github.com/rahmanow/gulp-starter-pack/actions/workflows/ci.yml/badge.svg">
  </a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
  <img alt="Node" src="https://img.shields.io/badge/node-%3E%3D20.19-brightgreen">
  <img alt="Gulp" src="https://img.shields.io/badge/gulp-5-cf4647">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/tailwindcss-4-38bdf8">
</p>

---

Not every site needs a framework. This is the build layer for the ones that
don't: write plain HTML with reusable partials, style it with Tailwind, and get
a minified, optimized `dist/` folder you can drop on any host.

- **HTML partials** — `@@include('./partials/header.html')`, no templating language to learn
- **Tailwind CSS 4** — configured in CSS, no `tailwind.config.js`
- **Live reload** — Browsersync reloads on save, and injects CSS without a refresh
- **Real production build** — minified CSS and JS, images re-encoded with `sharp`
- **Zero runtime dependencies** — output is plain HTML, CSS, JS and images

## Quick start

```sh
git clone https://github.com/rahmanow/gulp-starter-pack.git my-site
cd my-site
npm install
npm run dev
```

Then open <http://localhost:9050>. Edit anything in `src/` and the browser
updates itself.

> **Requires Node.js 20.19+.** Run `nvm use` to pick up the version in `.nvmrc`.

Using this as a template? Click **Use this template** on GitHub, or delete the
git history and start fresh:

```sh
rm -rf .git && git init
```

## Commands

| Command          | What it does                                                            |
| ---------------- | ----------------------------------------------------------------------- |
| `npm run dev`    | Build to `.tmp/`, serve on port 9050, watch and live-reload             |
| `npm run build`  | Optimized production build into `dist/`                                 |
| `npm run zip`    | Build, then archive it to `release/gulp-starter-pack-<version>.zip`     |
| `npm run deploy` | Build, then publish to [surge.sh](https://surge.sh) (needs configuring) |
| `npm run clean`  | Delete `.tmp/`, `dist/` and `release/`                                  |
| `npm run lint`   | ESLint over the build config and `src/js/`                              |
| `npm run format` | Format everything with Prettier                                         |
| `npm run check`  | Lint + format check + build — the same suite CI runs                    |

Every script maps to a Gulp task, so `npx gulp build` works too.

## Project structure

```
src/                    Everything you edit
├── index.html          A page. Add more alongside it.
├── partials/           Fragments pulled in with @@include — never emitted
│   ├── header.html
│   └── footer.html
├── css/
│   └── main.css        Tailwind entry point and design tokens
├── js/
│   ├── main.js         Your code — bundled into js/main.js
│   ├── libs/           Bundled first, ahead of your code
│   └── vendor/         Copied verbatim, never bundled or minified
└── img/                Optimized during production builds

config.js               Paths, dev-server port, deploy target
gulpfile.js             The pipeline itself

.tmp/                   Development output (gitignored, scratch)
dist/                   Production output (gitignored)
release/                Zipped builds (gitignored)
```

`.tmp/` is the fast, unminified development build that Browsersync serves. It is
scratch space, which is why it is hidden — you never deploy it. `dist/` is the
optimized build you ship. Both are regenerated from scratch, so never edit them
directly.

## How it works

### Pages and partials

Any `.html` file in `src/` becomes a page. Anything in `src/partials/` is a
fragment: it is included into pages but never emitted on its own.

```html
@@include('./partials/header.html')

<h1>Hello</h1>

@@include('./partials/footer.html')
```

Includes can pass data, which is handy for per-page titles:

```html
@@include('./partials/header.html', { "title": "About us" })
```

Then in the partial, `@@title` is substituted. See
[gulp-file-include](https://github.com/haoxins/gulp-file-include) for the full
syntax.

### Styling

Tailwind CSS 4 is configured **in CSS**, not JavaScript. Open
`src/css/main.css`:

```css
@import "tailwindcss" source(none);

@source "../*.html";
@source "../partials/**/*.html";
@source "../js/**/*.js";

@theme {
  --color-brand-500: oklch(0.68 0.16 155);
  --radius-card: 0.875rem;
}
```

Tokens in `@theme` become utilities automatically — `--color-brand-500` gives
you `bg-brand-500`, `text-brand-500`, `border-brand-500`, and
`--radius-card` gives you `rounded-card`. There is no config file to keep in
sync.

`source(none)` turns off automatic file scanning so the build never walks
`node_modules/` or your own output. The trade-off is that **new template folders
need an `@source` line**, or their classes will not be generated.

Reusable component classes go in `@layer components`:

```css
@layer components {
  .btn {
    @apply rounded-card bg-brand-500 px-4 py-2 font-medium text-white;
  }
}
```

> Coming from 1.x? Sass has been removed — Tailwind 4 is built to replace
> preprocessors and [advises against pairing the two](https://tailwindcss.com/docs/compatibility#sass-less-and-stylus).
> Nesting and `@apply` still work; see [CHANGELOG.md](CHANGELOG.md) to migrate.

### JavaScript

Files in `src/js/libs/` are concatenated first, then everything directly in
`src/js/`, producing a single minified `js/main.js`.

Anything in `src/js/vendor/` is copied through untouched — use it for pre-built
libraries you want to load with their own `<script>` tag.

There is no Babel step. Output targets modern browsers, which is the same
baseline Tailwind 4 requires (Safari 16.4+, Chrome 111+, Firefox 128+).

### Images

Development copies images as-is to keep the watch loop fast. Production
re-encodes them with [sharp](https://sharp.pixelplumbing.com/) — the sample
cover image drops by about 86%. Anything sharp cannot process (SVG, video)
passes through untouched instead of failing the build.

## Configuration

Everything lives in `config.js`:

```js
export default {
  port: 9050, // dev server port
  open: false, // open a browser on start
  src: "./src",
  dev: "./.tmp", // development output (scratch)
  dist: "./dist", // production output
  surgeDomain: "", // set to enable `npm run deploy`
  // ...paths and image options
};
```

Adding a folder of templates? Add its glob to `paths.html` **and** an `@source`
line in `src/css/main.css`, so Tailwind sees the classes you use there.

## Deploying

`dist/` is a static folder — host it anywhere.

**GitHub Pages** is already wired up. Enable it under
_Settings → Pages → Source: **GitHub Actions**_ and every push to `master`
publishes automatically via [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

**Netlify / Vercel / Cloudflare Pages** — build command `npm run build`, publish
directory `dist`.

**surge.sh** — set your domain in `config.js`, then `npm run deploy`:

```js
surgeDomain: "my-site.surge.sh",
```

It refuses to run while that is empty rather than guessing a target.

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
Run `npm run check` before opening a PR; it runs exactly what CI runs.

Working with an AI assistant? [AGENTS.md](AGENTS.md) documents the repo's
conventions and invariants in a form agents can follow.

## License

[MIT](LICENSE) © Azat Rahmanov
