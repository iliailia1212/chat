'use strict';
console.log('start');


var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rename = require('gulp-rename'),
    rimraf = require('rimraf'),
	express = require('express'),
	app = express(),
	ECT = require('ect');

console.log('cfg');
var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/',
        templates: 'build/templates/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/*.*',
        style: 'src/style/*.*',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        templates: 'src/templates/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        templates: 'src/templates/*.*'
    },
    clean: './build'
};

console.log('task');
gulp.task('webserver', function () {
	var ectRenderer = ECT({ watch: true, root: '/var/www/build', ext : '.ect' });
	app.set('view engine', 'ect');
	app.engine('ect', ectRenderer.render);

	app.get('/', function (req, res){
		res.render('/var/www/build/index');
	});
	 app.get(/^(.+)$/, function(req, res){ 
		res.sendFile( __dirname+'/build/'+ req.params[0]); 
	 });

	app.listen(3000);
	console.log('Listening on port 3000');
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    gulp.src(path.src.html) 
        .pipe(rename(function (path) {
            path.extname = '.ect';
        }))
        .pipe(gulp.dest(path.build.html));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js) 
        .pipe(sourcemaps.init()) 
        .pipe(uglify()) 
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js));
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) 
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['src/style/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) 
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('templates:build', function() {
    gulp.src(path.src.templates)
        .pipe(gulp.dest(path.build.templates))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'templates:build',
    'image:build'
]);

console.log('watch');
gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
    watch([path.watch.templates], function(event, cb) {
        gulp.start('templates:build');
    });
});

console.log('all');
gulp.task('default', ['build', 'webserver', 'watch']);