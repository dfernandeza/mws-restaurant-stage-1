'use strict';

const DIST_DEST = './dist/';
const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglifycss = require('gulp-uglifycss');
const browserSync = require('browser-sync').create();

gulp.task('copy-html', function() {
	return gulp.src('./src/*.html')
		.pipe(gulp.dest(DIST_DEST))
    .pipe(browserSync.stream());
});

gulp.task('copy-images', function() {
	return gulp.src('./src/img/dist/*.jpg')
		.pipe(gulp.dest(DIST_DEST + 'img/'));
});

gulp.task('js-dist-helpers', function() {
  return gulp.src(['./src/js/offline.js', './src/js/dbhelper.js'])
		.pipe(sourcemaps.init())
  	.pipe(babel({
      presets: [['env', { 'modules': false }]],
      plugins: ['transform-class-properties']
    }))
    .pipe(concat('helpers-bundle.js'))
    .pipe(uglify({ toplevel: true, mangle: { reserved: ['DBHelper', 'DBHelperClass'] } }))
    .pipe(sourcemaps.write('.'))
    .pipe(browserSync.stream())
    .pipe(gulp.dest(DIST_DEST));
});

gulp.task('js-dist-home', function() {
  return gulp.src('./src/js/main.js')
		.pipe(sourcemaps.init())
    .pipe(babel({
      presets: [['env', { 'modules': false }]]
    }))
    .pipe(uglify({ toplevel: true }))
    .pipe(rename('home-bundle.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(browserSync.stream())
    .pipe(gulp.dest(DIST_DEST));
});

gulp.task('js-dist-restaurant', function() {
  return gulp.src('./src/js/restaurant_info.js')
  	.pipe(sourcemaps.init())
    .pipe(babel({
      presets: [['env', { 'modules': false }]]
    }))
    .pipe(uglify({ toplevel: true }))
    .pipe(rename('restaurant-bundle.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(DIST_DEST))
    .pipe(browserSync.stream());
});

gulp.task('js-dist', [
  'js-dist-helpers', 
  'js-dist-home', 
  'js-dist-restaurant'
]);

gulp.task('css-dist', function () {
  gulp.src('./src/css/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(uglifycss({
      'maxLineLen': 80,
      'uglyComments': true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(DIST_DEST))
    .pipe(browserSync.stream());
});

gulp.task('sw-dist', function () {
  gulp.src('./sw.js')
    .pipe(gulp.dest(DIST_DEST))
    .pipe(browserSync.stream());
});

gulp.task('dist', [
	'copy-images', 
	'copy-html', 
	'js-dist',
  'css-dist',
  'sw-dist'
]);

/* gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });
});*/

gulp.task('serve', ['dist'], function() {

    browserSync.init({
        server: './dist'
    });

    gulp.watch('src/css/*.css', ['css-dist']);
    gulp.watch('src/js/*.js', ['js-dist']);
    gulp.watch('./sw.js', ['sw-dist']);
    gulp.watch('src/*.html', ['copy-html']).on('change', browserSync.reload);
});

gulp.task('default', ['serve']);

