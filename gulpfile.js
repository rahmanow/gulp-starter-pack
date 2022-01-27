/**
*   Gulp Starter Pack
*   Author: Azat Rahmanov
*   URL : blog.rahmanow.com
*   Twitter : @Azadik
 *  Instagram: @Azadik
**/

/*
  npm install   //To install all dev dependencies of package
  gulp          //To start development and server for live preview
  gulp prod     //To generate minifed files for live server
  gulp deploy   //To deploy your static website to surge.sh
  gulp gitter   // To add, commit and push to repository

*/

const { src, dest, watch, series, parallel } = require('gulp');
//const gulpif = require('gulp-if');
const del = require('del');                             //For Cleaning build/dist for fresh export

//CSS
const sass = require('gulp-sass')(require('sass'));     //For Compiling SASS files
const post = require('gulp-postcss');                //For Compiling tailwind utilities with tailwind config
const clean = require('gulp-clean-css');             //To Minify CSS files
const purge = require('gulp-purgecss');              // Remove Unused CSS from Styles
const tailwind = require('tailwindcss');

// Image
const imagemin = require('gulp-imagemin');              //To Optimize Images
//Note : Webp still not supported in major browsers including firefox
// const webp = require('gulp-webp'); //For converting images to WebP format
// const replace = require('gulp-replace'); //For Replacing img formats to webp in html

// JavaScript
const concat = require('gulp-concat');                  //For Concatinating js,scss, css files
const uglify = require('gulp-terser');                  //To Minify JS files
const babel = require('gulp-babel');

// HTML
const fileInclude = require('gulp-file-include');       // Include header and footer files to work faster :)

// Server
const browserSync = require('browser-sync');
const superChild = require('superchild');               // run terminal commands
const zip = require('gulp-zip');                        // create a zip file
const git = require('gulp-git');                        // Execute command line shell for git push
const open = require('gulp-open');                      // Opens a URL in a web browser
const logSymbols = require('log-symbols');              //For Symbolic Console logs :) :P
const log = require('fancy-log');

// Other
const opt = require("./config");                    //paths and other options from config.js


//Load Previews on Browser on dev
livePreview = (done) =>
  {
    browserSync.init({
        server: {
            baseDir: opt.dist
        },
        port: opt.port || 5000
    });

      watch(opt.tailwind, devStyles);
      watch(opt.scss, devStyles);

      done();
  }

// Triggers Browser reload
previewReload = (done) =>
  {
    console.log("\n\t" + logSymbols.info,"Reloading Browser Preview.\n");
    browserSync.reload();
    done();
  }

//Development Tasks
devHTML = async () =>
  {
    src([opt.html,
        '!' + opt.src + '/header.html', // ignore
        '!' + opt.src + '/footer.html' // ignore
        ])
    .pipe(fileInclude({ prefix: '@@', basepath: '@file'}))
    .pipe(dest(opt.dist));
  }

devStyles = async () =>
  {
    src([opt.scss, opt.tailwind])
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(opt.src + '/scss'))
    .pipe(post([
        tailwind(opt.tailConfig),
        require('autoprefixer'),
    ]))
    .pipe(concat({ path: 'style.css'}))
    .pipe(dest(opt.dist + '/css'))
    .pipe(browserSync.stream())
  }

devScripts = async () =>
  {
    src([
        opt.jsLibs,
        opt.js,
        '!' + opt.src + '/js/external/*'
    ])
    .pipe(babel({ignore: [opt.jsLibs] }))
    .pipe(concat({ path: 'main.js'}))
    .pipe(uglify())
    .pipe(dest(opt.dist + '/js'));
  }

devImages = async () => {
    src(opt.img)
    .pipe(dest(opt.dist + '/img'));
}

watchFiles = () => {
  watch(opt.html, series(devHTML, previewReload));
  watch(opt.js, series(devScripts, previewReload));
  watch(opt.img, series(devImages, previewReload));
  console.log("\n\t" + logSymbols.info,"Watching for Changes..\n");
}

devClean = () => {
  console.log("\n\t" + logSymbols.info,"Cleaning dist folder for fresh start.\n");
  return del([opt.dist]);
}

//Production Tasks (Optimized Build for Live/Production Sites)
prodHTML = () => {
  return src(opt.html)
  .pipe(dest(opt.build));
}

prodStyles = () => {
  return src(opt.dist + '/css/**/*')
  .pipe(purge(
      {
        content: ['src/**/*.{html,js}'],
        defaultExtractor: content => {
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
          const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || []
          return broadMatches.concat(innerMatches)
        }
      }))
  .pipe(clean({compatibility: 'ie8'}))
  .pipe(dest(opt.build + '/css'));
}

prodScripts = () => {
  return src([
    opt.jsLibs,
    opt.js
  ])
  .pipe(concat({ path: 'scripts.js'}))
  .pipe(uglify())
  .pipe(dest(opt.build + '/js'));
}

prodImages = () => {
  return src(opt.img)
  .pipe(imagemin())
  .pipe(dest(opt.build + '/img'));
}

prodClean = () => {
  console.log("\n\t" + logSymbols.info,"Cleaning build folder for fresh start.\n");
  return del([opt.build]);
}

buildFinish = (done) => {
    console.log("\n\t" + logSymbols.info,`Production build is complete. Files are located at ${opt.build}\n`);
    return src(opt.build + '/*')
        .pipe(zip('build.zip'))
        .pipe(dest(opt.build));
  done();
}

gitter = async () => {
    const child = superChild(`rm -rf .git/index.lock`);
    child.on('stdout_line', (line) => {log(line + ' index lock removed')});

    return src(opt.root)
        .pipe(git.add())
        .on('end', () => { log('git add Done!'); })
        .pipe(git.commit(opt.git.m, {args: opt.git.args}))
        .on('end', () => { log('git commit Done!'); })
}

push = async () => {
    git.push(opt.git.url, opt.git.branch, errorFunction);
    log('git push done!');
}

surgeDeploy = async () => {
  const child = superChild(`surge ${opt.dist} ${opt.surgeUrl}`);
  child.on('stdout_line', (line) => { log(line) });
}

openBrowser = async () => {
  const site = {uri: 'https://' + opt.surgeUrl};
  return src(opt.dist)
  .pipe(open(site));
}

errorFunction = (err) => { if (err) throw err; }

exports.surge = series(surgeDeploy, openBrowser);
exports.git = series(gitter);
exports.push = series(push);


// Default gulp command - gulp
exports.default = series(
  devClean, // Clean Dist Folder
  parallel(devStyles, devScripts, devImages, devHTML), //Run All tasks in parallel
  livePreview, // Live Preview Build
  watchFiles // Watch for Live Changes
);

// Production command - gulp prod
exports.prod = series(
  prodClean, // Clean Build Folder
  parallel(prodStyles, prodScripts, prodImages, prodHTML), //Run All tasks in parallel
  buildFinish
);