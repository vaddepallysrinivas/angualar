<!-- Copy Task -->
# Useful gulp tasks
gulp.task('copy', ['bundle:libs', 'browserify','scss'], function() {
     gulp.src(['./src/**/*.html','./src/**/*.css'])
         .pipe(gulp.dest('./dist'))
       .pipe(browserSync.stream())
 });