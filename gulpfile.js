/**
 * Created by lehadnk on 10/02/2017.
 */
var gulp = require('gulp');
var minify = require('gulp-minify');
var rename = require('gulp-rename');

gulp.task('build', function() {
    return gulp.src(['ImageUploadForm.js', 'ImageUploadForm.css'])
        .pipe(minify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/'));
});