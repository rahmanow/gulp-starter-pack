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
  gulp prod     //To generate minified files for live server
  gulp surge    //To deploy your static website to surge.sh
  gulp git      // To add, commit and push to repository
  gulp push     // pushes to GitHub
*/

// Gulp
const { src, dest, watch, series, parallel } = require('gulp');
//const gulpIf = require('gulp-if');
const del = require('del');                             //For Cleaning build/dist for fresh export
const symbol = require('log-symbols');              //For Symbolic Console logs :) :P
const log = require('fancy-log');

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
const include = require('gulp-file-include');       // Include header and footer files to work faster :)

// Server
const sync = require('browser-sync');
const exec = require('superchild');               // run terminal commands
const zip = require('gulp-zip');                        // create a zip file
const git = require('gulp-git');                        // Execute command line shell for git push
const open = require('gulp-open');                      // Opens a URL in a web browser


// Other
const opt = require("./config");
const {exit} = require("browser-sync");
//const {openBrowser} = require("browser-sync/dist/utils");
//const {reload} = require("browser-sync");
//const {openBrowser} = require("browser-sync/dist/utils");                    //paths and other options from config.js

//Load Previews on Browser on dev
preview = (done) => {
    sync.init({
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
previewReload = (done) => {
    log("\n\t" + symbol.info,"Reloading Browser Preview.\n");
    sync.reload();
    done();
  }

//Development Tasks
devHTML = async () => {
    src([opt.html,
        '!' + opt.src + '/header.html', // ignore
        '!' + opt.src + '/footer.html' // ignore
        ])
    .pipe(include({ prefix: '@@', basepath: '@file'}))
    .pipe(dest(opt.dist));
  }

devStyles = async () => {
    src([opt.scss, opt.tailwind])
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(opt.src + '/scss'))
    .pipe(post([
        tailwind(opt.tailConfig),
        require('autoprefixer'),
    ]))
    .pipe(concat({ path: 'style.css'}))
    .pipe(dest(opt.dist + '/css'))
    .pipe(sync.stream())
  }

devScripts = async () => {
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
  log("\n\t" + symbol.info,"Watching for Changes..\n");
}

devClean = () => {
  log("\n\t" + symbol.info,"Cleaning dist folder for fresh start.\n");
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
  log("\n\t" + symbol.info,"Cleaning build folder for fresh start.\n");
  return del([opt.build]);
}

buildFinish = (done) => {
    log("\n\t" + symbol.info,`Production build is complete. Files are located at ${opt.build}\n`);
    return src(opt.build + '/*')
        .pipe(zip('build.zip'))
        .pipe(dest(opt.build));
  done();
}

gitter = async () => {
    const child = exec(`rm -rf .git/index.lock`)
    child.on('stdout_line', (line) => { log (line + ' index lock removed')});

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
    const child = exec(`surge ${opt.dist} ${opt.surgeUrl}`);
    child.on('stdout_line', (line) => {
        log( line);
        if(line.includes('Success!')) {
            openBrowser();
            log('\n\n\t' + symbol.success + ' Deployed to surge \n\n\t');
        }
    });
}

openBrowser = async () => {
    const site = {uri: 'https://' + opt.surgeUrl};
    return src(opt.dist)
        .pipe(open(site))
}

errorFunction = (err) => { if (err) throw err; }

exports.surge = series(surgeDeploy);
exports.git = series(gitter);
exports.push = series(push);


// Default gulp command - gulp
exports.default = series(
  devClean, // Clean Dist Folder
  parallel(devStyles, devScripts, devImages, devHTML), //Run All tasks in parallel
  preview, // Live Preview Build
  watchFiles // Watch for Live Changes
);

// Production command - gulp prod
exports.prod = series(
  prodClean, // Clean Build Folder
  parallel(prodStyles, prodScripts, prodImages, prodHTML), //Run All tasks in parallel
  buildFinish
);