module.exports = {
	port: 9050,

	root: './',
	src: './src',
	dist: './dist',
	build: './build',

	scss: './src/scss/*.scss',
	js: './src/js/*.js',
	jsLibs: './src/js/libs/**/*',
	img: './src/img/**/*',
	html: './src/**/*.html',

	tailwind: './src/scss/tailwindcss/*.scss',
	tailConfig: './src/scss/tailwindcss/tailwind.config.js',

	git: {
		url: 'https://github.com/rahmanow/gulp-starter-pack.git',
		branch: 'master',
		m: '-Auto commit by Gulp',
		args: '-m',
	},
	surgeUrl: ''
}