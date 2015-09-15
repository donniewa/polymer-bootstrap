var gulp      = require('gulp');
var del       = require('del');
var plumber   = require('gulp-plumber');
var rename    = require('gulp-rename');
var traceur   = require('gulp-traceur');
var ts        = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');

var PATHS = {
    src: {
      ts: 'src/**/*.ts',
      js: 'src/**/*.js',
      html: 'src/**/*.html'
    }
};

transformToString = function(filePath, file) {
  return file.contents.toString('utf8');
}

gulp.task('template', function () {
    var template      = require('gulp-template');
    var sass          = require('gulp-sass');
    var inject        = require('gulp-inject');
    var packageJson   = require('./package.json');

    var componentDir  = __dirname + '/src/'

    var tsResult      = gulp.src(componentDir + 'script.ts').pipe(ts(tsProject));
    var styles        = gulp.src(componentDir + 'styles.scss').pipe(sass());
    var html          = gulp.src(componentDir + 'template.html');

    return gulp.src(componentDir + 'component.html')
        .pipe(template({
          author : packageJson.author,
          name : packageJson.name
        }))
        .pipe(inject(styles, {
          removeTags: true,
          starttag: '<!-- inject:css -->',
          transform: transformToString
        }))
        .pipe(inject(tsResult, {
          removeTags: true,
          starttag: '<!-- inject:js -->',
          transform: transformToString
        }))
        .pipe(inject(html, {
          removeTags: true,
          starttag: '<!-- inject:html -->',
          transform: transformToString
        }))
        .pipe(rename(packageJson.name + '.html'))
        .pipe(gulp.dest('./'))
});

gulp.task('play', ['default'], function () {
    var polyserve   = require('polyserve');
    var port        = 9000;

    gulp.watch(PATHS.src.html, ['template']);
    gulp.watch(PATHS.src.js, ['template']);
    gulp.watch(PATHS.src.ts, ['template']);

    polyserve.startServer(port, './bower_components');
});

gulp.task('default', [ 'template' ]);