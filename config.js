/**
 * Build configuration.
 *
 * Every path the pipeline touches is declared here, so the gulpfile itself
 * rarely needs editing. Paths are relative to the project root.
 */
export default {
  /** Port for the Browsersync dev server. */
  port: 9050,

  /** Open a browser automatically when the dev server starts. */
  open: false,

  /** Source folder — everything you edit. */
  src: "./src",

  /**
   * Development output. Rebuilt on every save and served by Browsersync.
   * Scratch space — hidden because you should never deploy or inspect it.
   */
  dev: "./.tmp",

  /** Production output. Minified, optimized, ready to deploy. */
  dist: "./dist",

  /** Where `gulp zip` writes its archive. Kept outside `dist/` on purpose. */
  release: "./release",

  /** Glob patterns, resolved against the project root. */
  paths: {
    /** Pages. Anything under `partials/` is a fragment and is never emitted. */
    html: ["./src/**/*.html", "!./src/partials/**"],

    /** Watched for changes so edits to a partial rebuild the pages that use it. */
    htmlWatch: "./src/**/*.html",

    /** Tailwind entry point. Additional top-level stylesheets are concatenated. */
    css: "./src/css/*.css",

    /** Bundled into a single `main.js`, in this order. */
    jsLibs: "./src/js/libs/**/*.js",
    js: "./src/js/*.js",

    /** Copied verbatim — never concatenated or minified. */
    jsVendor: "./src/js/vendor/**/*.js",

    /** Copied in development, optimized in production. */
    img: "./src/img/**/*",
  },

  /** Image formats sharp will re-encode during a production build. */
  imageOptimization: {
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
    quality: 80,
  },

  /**
   * Deploy target for `npm run deploy` (surge.sh).
   * Leave empty to disable — the task fails with a helpful message rather than
   * publishing to somebody else's domain.
   */
  surgeDomain: "",
};
