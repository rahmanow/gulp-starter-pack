# Gulp Starter Kit

Gulp Starter Kit 

Added: 
- Tailwind CSS ( Updated with [TailwindCSS JIT](https://github.com/tailwindlabs/tailwindcss-jit) )
- A repo for easier development with predefined gulp tasks.


## Usage

1. Install Dev Depedencies
```sh
npm install // or yarn install
```
2. To start development and server for live preview
```sh
gulp
```
3. To generate minifed files for production server
```sh
gulp prod
```
4. To deploy surge.sh
```sh
gulp deploy
```
5. To use 3in1 git (add, commit, push)
```sh
gulp gitter
```


# Configuration


To change the path of files and destination/build folder, edit options in **config.js** file
```sh
{
  config: {
      ...
      tailwindjs: "./tailwind.config.js",
      port: 9050 // browser preview port
  },
  
  deploy: {
    gitURL: 'https://github.com/rahmanow/gulp-starter-pack.git',
    gitBranch: 'master',
    gitCommitMessage: '-Auto commit by Gulp',
    surgeUrl: 'example-url.surge.sh'
  },
  
  paths: {
     root: "./",
     src: {
        base: "./src",
        css: "./src/scss",
        js: "./src/js",
        img: "./src/img"
     },
     dist: {
         base: "./dist",
         css: "./dist/css",
         js: "./dist/js",
         img: "./dist/img"
     },
     build: {
         base: "./build",
         css: "./build/css",
         js: "./build/js",
         img: "./build/img"
     }
  }
  ...
}
```
