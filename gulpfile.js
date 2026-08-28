/**
 * Gulp Starter Pack — build pipeline
 *
 * Tasks:
 *   gulp            Clean, build to .tmp/, serve with live reload
 *   gulp build      Optimized production build into dist/
 *   gulp clean      Remove all generated output
 *   gulp zip        Archive the production build into release/
 *   gulp surge      Deploy the production build to surge.sh
 *
 * Paths and options live in ./config.js — you rarely need to edit this file.
 */

import { rm, mkdir, readFile } from "node:fs/promises";
import { Transform } from "node:stream";
import { spawn } from "node:child_process";
import path from "node:path";

import gulp from "gulp";
import browserSync from "browser-sync";
import postcss from "gulp-postcss";
import tailwindcss from "@tailwindcss/postcss";
import concat from "gulp-concat";
import terser from "gulp-terser";
import include from "gulp-file-include";
import gulpZip from "gulp-zip";
import sharp from "sharp";

import config from "./config.js";

const { src, dest, watch, series, parallel } = gulp;
const server = browserSync.create();

/** True when building for production. Set by the `build` task. */
let isProduction = false;

/* -------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------- */

const log = (message) => console.log(`\x1b[36m[starter]\x1b[0m ${message}`);

/** Output directory for the current mode. */
const outDir = () => (isProduction ? config.dist : config.dev);

/**
 * Re-encode raster images with sharp.
 *
 * Runs only on production builds; development copies files untouched so the
 * watch loop stays fast. Anything sharp cannot handle (SVG, fonts, video)
 * passes through unchanged rather than failing the build.
 */
const optimizeImages = () => {
  const { extensions, quality } = config.imageOptimization;

  return new Transform({
    objectMode: true,
    async transform(file, _encoding, callback) {
      if (!file.isBuffer() || !extensions.includes(file.extname.toLowerCase())) {
        callback(null, file);
        return;
      }

      try {
        const before = file.contents.length;
        const optimized = await sharp(file.contents)
          .rotate()
          .toFormat(file.extname.toLowerCase() === ".png" ? "png" : "jpeg", {
            quality,
            mozjpeg: true,
          })
          .toBuffer();

        // Never let "optimization" make a file bigger.
        if (optimized.length < before) {
          const saved = Math.round((1 - optimized.length / before) * 100);
          log(`${file.relative}: -${saved}%`);
          file.contents = optimized;
        }

        callback(null, file);
      } catch (error) {
        log(`skipped ${file.relative} (${error.message})`);
        callback(null, file);
      }
    },
  });
};

/* -------------------------------------------------------------------------
 * Build tasks
 * ---------------------------------------------------------------------- */

/**
 * Compile pages, expanding `@@include(...)` directives.
 * Partials are excluded by the glob in config, so they never reach the output.
 */
export const html = () =>
  src(config.paths.html, { base: config.src })
    .pipe(include({ prefix: "@@", basepath: "@file" }))
    .pipe(dest(outDir()));

/**
 * Compile Tailwind. Minified in production only.
 *
 * Note this always reads from `src/` — never from a previous build — so
 * `gulp build` works correctly on a clean checkout.
 */
export const styles = () => {
  // Tailwind bundles Lightning CSS, so `optimize` minifies without pulling in a
  // separate minifier. cssnano would work too, but it requires Node 22.22.3+
  // and adds ~30 packages for a ~3% smaller file.
  const plugins = [tailwindcss(isProduction ? { optimize: true } : {})];

  return src(config.paths.css)
    .pipe(postcss(plugins))
    .pipe(concat("style.css"))
    .pipe(dest(`${outDir()}/css`))
    .pipe(server.stream());
};

/** Bundle `libs/` then your own scripts into a single `main.js`. */
export const scripts = () =>
  src([config.paths.jsLibs, config.paths.js], { allowEmpty: true })
    .pipe(concat("main.js"))
    .pipe(terser({ format: { comments: false } }))
    .pipe(dest(`${outDir()}/js`));

/** Copy vendor scripts verbatim. */
export const vendorScripts = () =>
  src(config.paths.jsVendor, { base: `${config.src}/js`, allowEmpty: true, encoding: false }).pipe(
    dest(`${outDir()}/js`),
  );

/** Copy images, optimizing them on production builds. */
export const images = () => {
  const stream = src(config.paths.img, { encoding: false });
  return (isProduction ? stream.pipe(optimizeImages()) : stream).pipe(dest(`${outDir()}/img`));
};

/* -------------------------------------------------------------------------
 * Housekeeping
 * ---------------------------------------------------------------------- */

export const clean = async () => {
  await Promise.all(
    [config.dev, config.dist, config.release].map((dir) =>
      rm(dir, { recursive: true, force: true }),
    ),
  );
  log(`removed ${config.dev}/, ${config.dist}/ and ${config.release}/`);
};

const cleanDev = () => rm(config.dev, { recursive: true, force: true });
const cleanDist = () => rm(config.dist, { recursive: true, force: true });

const setProduction = async () => {
  isProduction = true;
};

/* -------------------------------------------------------------------------
 * Dev server
 * ---------------------------------------------------------------------- */

const serve = (done) => {
  server.init(
    {
      server: { baseDir: config.dev },
      port: config.port,
      open: config.open,
      notify: false,
      ui: false,
    },
    () => {
      // Browsersync falls back to the next free port if config.port is taken,
      // so report the port it actually bound rather than the requested one.
      log(`serving ${config.dev} on http://localhost:${server.getOption("port")}`);
      done();
    },
  );
};

const reload = (done) => {
  server.reload();
  done();
};

const watchFiles = (done) => {
  watch(config.paths.htmlWatch, series(html, reload));
  watch(`${config.src}/css/**/*.css`, styles);
  watch([config.paths.jsLibs, config.paths.js], series(scripts, reload));
  watch(config.paths.jsVendor, series(vendorScripts, reload));
  watch(config.paths.img, series(images, reload));

  // Tailwind scans your markup for class names, so a template edit must also
  // rebuild the stylesheet — not just reload the page.
  watch([config.paths.htmlWatch, `${config.src}/js/**/*.js`], styles);

  log("watching for changes");
  done();
};

/* -------------------------------------------------------------------------
 * Release helpers
 * ---------------------------------------------------------------------- */

/**
 * Archive the production build.
 *
 * Writes to `release/` rather than into `dist/` itself, which would otherwise
 * mean zipping a directory while adding a file to it.
 */
export const archive = async () => {
  const pkg = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));
  const filename = `${pkg.name}-${pkg.version}.zip`;

  await mkdir(config.release, { recursive: true });

  return new Promise((resolve, reject) => {
    src(`${config.dist}/**/*`, { base: config.dist, encoding: false, allowEmpty: true })
      .pipe(gulpZip(filename))
      .pipe(dest(config.release))
      .on("end", () => {
        log(`wrote ${path.join(config.release, filename)}`);
        resolve();
      })
      .on("error", reject);
  });
};

/** Deploy `dist/` to surge.sh. Requires `surgeDomain` in config.js. */
const deployToSurge = async () => {
  if (!config.surgeDomain) {
    throw new Error(
      "No deploy target configured. Set `surgeDomain` in config.js " +
        "(for example: 'my-site.surge.sh'), then run `npm run deploy` again.",
    );
  }

  log(`deploying ${config.dist} to ${config.surgeDomain}`);

  await new Promise((resolve, reject) => {
    const child = spawn("npx", ["--yes", "surge", config.dist, config.surgeDomain], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`surge exited with code ${code}`)),
    );
  });

  log(`deployed to https://${config.surgeDomain}`);
};

/* -------------------------------------------------------------------------
 * Public tasks
 * ---------------------------------------------------------------------- */

/** Production build: clean, compile everything optimized, into dist/. */
export const build = series(
  setProduction,
  cleanDist,
  parallel(styles, scripts, vendorScripts, images, html),
  async () => log(`production build ready in ${config.dist}`),
);

/** `gulp zip` — build, then archive the result. */
export const zip = series(build, archive);

/** `gulp surge` — build, then deploy. Always ships a fresh build. */
export const surge = series(build, deployToSurge);

/** Default: development build + server + watchers. */
export default series(
  cleanDev,
  parallel(styles, scripts, vendorScripts, images, html),
  serve,
  watchFiles,
);
