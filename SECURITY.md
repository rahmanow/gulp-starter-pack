# Security Policy

## Supported versions

| Version | Supported                           |
| ------- | ----------------------------------- |
| 2.x     | Yes                                 |
| 1.x     | No — please upgrade (see CHANGELOG) |

## Reporting a vulnerability

Please **do not open a public issue** for a security problem.

Report it privately through GitHub's
[security advisory form](https://github.com/rahmanow/gulp-starter-pack/security/advisories/new).
You should get an initial response within a few days.

## Scope

This is a build toolchain, not a running service. Everything here is a
`devDependency` — nothing in `node_modules/` ships to your users. What lands in
`build/` is plain HTML, CSS, JavaScript and images.

That said, a compromised build tool can compromise your output, so dependency
updates are taken seriously and Dependabot is enabled.

## Known advisories

`npm audit` currently reports **3 high-severity advisories** against
`immutable@3.8.4`, pulled in transitively by `browser-sync`.

These are accepted, not overlooked:

- `browser-sync` is the **local development server**. It never runs in
  production and its code is not part of your build output.
- The advisories describe denial-of-service conditions that require hostile
  input to the dev server, which only listens on your own machine.
- Overriding `immutable` to a patched major version **breaks `browser-sync` at
  runtime** (`server.get is not a function`). This was tested — it silences
  `npm audit` while leaving you with a dev server that cannot start, which is
  strictly worse.

They will clear when `browser-sync` updates its own dependency upstream. If you
would rather not carry them at all, `browser-sync` is only used by the `serve`
task in `gulpfile.js` and can be swapped for any other static server.
