/**
 * Created by lehadnk on 10/02/2017.
 */
var gulp = require('gulp');
var minify = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var copy = require('gulp-copy');

gulp.task('build', function() {
    gulp.src(['src/ImageUploadForm.css'])
        .pipe(minify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/'))
        .pipe(copy('docs/assets/'));

    gulp.src(['src/ImageUploadForm.js'])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/'))
        .pipe(copy('docs/assets/'));

    gulp.src(['src/renderers/*.js', '!src/renderers/_RendererTemplate.js'])
        .pipe(uglify())
        .pipe(rename({ prefix: 'ImageUploadForm', 'suffix': '.min' }))
        .pipe(gulp.dest('build/'))
        .pipe(copy('docs/assets/'));
});