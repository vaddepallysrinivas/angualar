'use strict';

//webroot

var gulp = require('gulp'),
     argv = require('yargs').argv,
     browserify = require('browserify'),
     buffer = require('vinyl-buffer'),
     source = require('vinyl-source-stream'),
     gulpif = require('gulp-if'),
     uglify = require('gulp-uglify'),
     timeZone=new Date().getTime(),
     clean = require('gulp-clean'),
     exorcist   = require('exorcist'),
     fs = require('fs'),
     concat = require('gulp-concat'),
     jshintStylish = require('jshint-stylish'),
     jshint = require('gulp-jshint'),
     path = require('path'),
     templateCache = require('gulp-angular-templatecache'),
     sass = require('gulp-sass'),
     rename = require('gulp-rename'),
     inject = require('gulp-inject'),
     browserSync = require('browser-sync').create(),
     streamSeries = require('stream-series');

var uniqueTimeStamp = new Date().getDate();


var devPath='./dist-dev/';
var prodPath='./dist-prod/';

var  localConfig = {
    distPath:devPath,
    entryPoint:'./src/app.js',
    libName:'libs.min.js',                 
    bundleName:'bundle.min.js',
    bundleMap:'bundle.js.map',
    vendorName:'vendor.min.js',
    cssName:'main.css',
    templateName:'templates.js'
};


function changeEnv()
{

    if(argv.prod) {
        localConfig = {
            distPath:prodPath,
            entryPoint:'./src/app.js',
            libName:'libs.min'+uniqueTimeStamp+'.js',                 
            bundleName:'bundle'+uniqueTimeStamp+'.js',
            bundleMap:'bundle.js'+uniqueTimeStamp+'.map',
            vendorName:'vendor.'+uniqueTimeStamp+'.js',
            cssName:'main'+uniqueTimeStamp+'.css',
            templateName:'templates.'+uniqueTimeStamp+'.js'
        };
    }
}


/**
 * Cleans dist folder based on dev and prod
 */
gulp.task('clean:prod', function () {
    return require('del')([
        'dist-prod/*.js',
        'dist-prod/*.*.map',
        'dist-prod/main*.css'
    ]);
});

/**
 * Cleans dist folder for dev
 */
gulp.task('clean:dev', function () {
    return require('del')([
        'dist-dev/*'
    ]);
});
    



gulp.task('write:toIndex:prod', function () {
    var targetFile = './index.html';
    var destPath = './';
    var prefixPath = null;
    var target = gulp.src(targetFile);
    //var sources = gulp.src(['./dist/*.js', './assets/styles/*.css'], {read: false});
    var cssSources = gulp.src(['./assets/styles/*.css', './dist/*.css'], {read: false});
    var vendorStream = gulp.src(['./dist-prod/vendor*.js'], {read: false});
    var libStream = gulp.src(['./dist-prod/lib*.js'], {read: false});
    var bundleStream = gulp.src(['./dist-prod/bundle*.js'], {read: false});
    var templateStream = gulp.src(['./dist-prod/template*.js'], {read:false});
    return target.pipe(inject(streamSeries(cssSources, libStream, vendorStream, bundleStream, templateStream), {addPrefix: prefixPath}))
        .pipe(gulp.dest(destPath));
});

/**
 * Write all the script files and necessary css files into sep.jsp or index.html based on dev/prod
 */
gulp.task('write:toIndex:dev', function () {
    var targetFile = './index.html';
    var destPath = './';
    var prefixPath = null;
    var target = gulp.src(targetFile);
    //var sources = gulp.src(['./dist/*.js', './assets/styles/*.css'], {read: false});
    var cssSources = gulp.src(['./assets/styles/*.css', '!./assets/styles/main.*.css', './dist-dev/*.css'], {read: false});
    var vendorStream = gulp.src(['./dist-dev/vendor*.js'], {read: false});
    var libStream = gulp.src(['./dist-dev/lib*.js'], {read: false});
    var bundleStream = gulp.src(['./dist-dev/bundle*.js'], {read: false});
    var templateStream = gulp.src(['./dist-dev/template*.js'], {read:false});
    return target.pipe(inject(streamSeries(cssSources, libStream, vendorStream, bundleStream, templateStream), {addPrefix: prefixPath}))
        .pipe(gulp.dest(destPath));
});




gulp.task('lint', function() {
    return gulp.src(['./src/**/*.js', './src/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(jshintStylish))
        .pipe(gulpif(argv.dev, jshint.reporter('default')))
        .pipe(gulpif(argv.prod, jshint.reporter('fail')));
});


gulp.task('compile:scss', function() {
    changeEnv();
    var name=localConfig.cssName;
    var distPath=localConfig.distPath;

    gulp.src('./assets/styles/scss/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(rename(name))
        .pipe(gulp.dest(distPath));
});



gulp.task('cache:template', function () {
    changeEnv();
    var name=localConfig.templateName;
    var distPath=localConfig.distPath;


    return gulp.src('src/**/*.html')
    .pipe(templateCache(name, {
        module: 'lms',
        root: '/app/',
        standAlone: false
    }
    ))
    .pipe(gulp.dest(localConfig.distPath));
});


gulp.task('bundle:libs', function() {
    changeEnv();
    var name=localConfig.libName;
    var distPath=localConfig.distPath;

    var libs = [
        'angular', 
        'angular-animate',
        'angular-touch',
        'angular-animate',
        'angular-sanitize',
        'angular-ui-router',
        'angular-ui-bootstrap',
        'jquery',
        'angular-ui-grid'
    ];
    const b = browserify();
    libs.forEach(lib => {
        b.require(lib);
});
return b.bundle()
.pipe(source(name))
.pipe(buffer())
.pipe(gulpif(argv.prod, uglify()))
.pipe(gulp.dest(distPath));
});

/**
 * 3rd party vendor script files like jquery, spin, chartjs etc.. will be bundled into one script file
 */
gulp.task('bundle:vendor', function(){
    changeEnv();
    var name=localConfig.vendorName;
    var distPath=localConfig.distPath;

    return gulp.src(['./vendor/*.js'])
        .pipe(gulpif(argv.prod, uglify()))
        .pipe(concat(name))
        .pipe(gulp.dest(distPath));
});



gulp.task('bundle:app', function() {
    changeEnv();
    var distPath=localConfig.distPath;
    var bundleName = distPath+localConfig.bundleName;
    var bundleMap = distPath+localConfig.bundleMap;
    
    
    return browserify({ 
        debug: true,
        bundleExternal: false 
    })
    .require(require.resolve('./src/app.js'), { entry: true })
    .bundle()
    .pipe(exorcist(bundleMap))
    //.pipe(gulpif(argv.prod, uglify()))distPath
    .pipe(fs.createWriteStream(bundleName), 'utf8');
});


    
gulp.task('browser-sync', function() {     
    browserSync.init({
        server: {
            baseDir: './', //serves the project from here
            browser: ['google chrome', 'firefox', 'iexplorer'] 
        }
    });

   
});


//for production
gulp.task('build', ['bundle:libs', 'bundle:vendor', 'lint', 'compile:scss', 'bundle:app']);

gulp.task('dev', ['browser-sync'], function(){
    gulp.watch('./src/**/*.*', ['bundle:app', 'lint']).on('change', browserSync.reload);
    gulp.watch('./assets/**/*.*', ['compile:scss']).on('change', browserSync.reload);
    gulp.watch('./vendor/*.js', ['bundle:vendor']).on('change', browserSync.reload);
    gulp.watch('./gulpfile.js', ['bundle:libs']).on('change', browserSync.reload);
    gulp.watch('./index.html').on('change', browserSync.reload);
    gulp.watch('./dist-dev/*').on('change', browserSync.reload);
});

/**
 * Task to run application in prod environment
 */
gulp.task('prod', ['build', 'cache:template']);