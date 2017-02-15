/**
 * Created by lehadnk on 10/02/2017.
 */
var gulp = require('gulp');
var minify = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('build', function() {
    gulp.src(['ImageUploadForm.css'])
        .pipe(minify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/'));

    gulp.src(['ImageUploadForm.js'])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/'));
});