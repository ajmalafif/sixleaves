var gulp            = require('gulp');
var flatten         = require('gulp-flatten');
var gulpFilter      = require('gulp-filter');
var browserSync     = require('browser-sync');
var sass            = require('gulp-sass');
var prefix          = require('gulp-autoprefixer');
var cp              = require('child_process');
var deploy          = require("gulp-gh-pages");
var mainBowerFiles  = require('main-bower-files');

var options = {
  remoteUrl: "git@github.com:ajmalafif/sixleaves.git",
  branch: "gh-pages"
};

var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

console.log(mainBowerFiles());
// grab libraries files from bower_components, minify and push in /public
gulp.task('bower', function() {

  var jsFilter = gulpFilter('*.js');
    var cssFilter = gulpFilter('*.css');
    var fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);

  return gulp.src(mainBowerFiles())

  // grab vendor js files from bower_components, minify and push in /public
  .pipe(jsFilter)
  .pipe(gulp.dest('assets/javascripts/'))
  .pipe(gulp.dest('assets/javascripts/'))
  .pipe(jsFilter.restore())

  // grab vendor css files from bower_components, minify and push in /public
  .pipe(cssFilter)
  .pipe(gulp.dest('assets/stylesheets/'))
  .pipe(gulp.dest('assets/stylesheets/'))
  .pipe(cssFilter.restore())

  // grab vendor font files from bower_components and push in /public
  .pipe(fontFilter)
  .pipe(flatten())
  .pipe(gulp.dest('assets/fonts'));

});

/**
 * Build the Jekyll Site
 */
 gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
  .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
 gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
 gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
 gulp.task('sass', function () {
  return gulp.src('_scss/main.scss')
  .pipe(sass({
    includePaths: ['scss'],
    onError: browserSync.notify
  }))
  .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
  .pipe(gulp.dest('_site/css'))
  .pipe(browserSync.reload({stream:true}))
  .pipe(gulp.dest('css'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
 gulp.task('watch', function () {
  gulp.watch('_scss/*.scss', ['sass']);
  gulp.watch(['index.{html,slim}', '_layouts/*.{html,slim}', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Deploy
 */
 gulp.task("deploy", ["jekyll-build"], function () {
  return gulp.src("./_site/**/*")
  .pipe(deploy());
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
 gulp.task('default', ['browser-sync', 'watch', 'bower']);
