var gulp            = require('gulp');
var flatten         = require('gulp-flatten');
var gulpFilter      = require('gulp-filter')
var browserSync     = require('browser-sync');
var sass            = require('gulp-sass');
var prefix          = require('gulp-autoprefixer');
var cp              = require('child_process');
var deploy          = require("gulp-gh-pages");
var mainBowerFiles  = require('main-bower-files');
var install         = require("gulp-install");
var uglify          = require("gulp-uglify");


gulp.task('install', function() {
  gulp.src(['./bower.json', './package.json'])
    .pipe(install());    // notify when done
});

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

  var jsFilter = gulpFilter('*.js')
  var cssFilter = gulpFilter('*.css')
  var fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf'])
  var mapFilter = gulpFilter(['*.map'])

  return gulp.src(mainBowerFiles())

  // grab vendor js files from bower_components, minify and push in /_site
  .pipe(jsFilter)
  .pipe(uglify())
  .pipe(gulp.dest('assets/javascripts/'))
  .pipe(jsFilter.restore())

  // grab vendor css files from bower_components, minify and push in /_site
  .pipe(cssFilter)
  .pipe(gulp.dest('assets/stylesheets/'))
  .pipe(cssFilter.restore())

  // grab vendor font files from bower_components and push in /_site
  .pipe(fontFilter)
  .pipe(flatten())
  .pipe(gulp.dest('assets/fonts/'))

  // grab vendor map files from bower_components and push in /_site
  .pipe(mapFilter)
  .pipe(gulp.dest('assets/stylesheets/'))
  .pipe(mapFilter.restore());

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
 * Compile files from assets/stylesheets into both _site/css (for live injecting) and site (for future jekyll builds)
 */
 gulp.task('sass', function () {
  return gulp.src('assets/stylesheets/main.scss')
  .pipe(sass({
    includePaths: ['scss'],
    sourcemap: true,
    onError: browserSync.notify
  }))
  .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
  .pipe(gulp.dest('_site/css'))
  .pipe(browserSync.reload({stream:true}))
  // do we really need this?
  .pipe(gulp.dest('css'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
 gulp.task('watch', function () {
  gulp.watch('assets/javascripts/*.js');
  gulp.watch('assets/stylesheets/*.scss', ['sass']);
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
