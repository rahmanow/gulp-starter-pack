module.exports = {
	deploy: {
		gitURL: 'https://github.com/rahmanow/gulp-starter-pack.git',
		gitBranch: 'master',
		gitCommitMessage: '-Auto commit by Gulp',
		gitCommitArgs: '-m',
		surgeUrl: ''
	},
	framework : {
		css : 'tailwindcss', 		// tailwindcss, bootstrap
		js: ''						// coming soon
	},
	paths: {
		root: "./",
		src: {
			base: "./src",
			scss: "./src/scss",
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
	},
	config: {
		port: 9050,
	}
}