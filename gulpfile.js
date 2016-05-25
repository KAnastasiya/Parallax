'use strict';

let gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  pngquant = require('imagemin-pngquant'),
  browserSync = require('browser-sync'),
  del = require('del');

// HTML
gulp.task('pug', () => {
  return gulp.src('src/pug/*.pug')
  .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
  .pipe(plugins.pug())
  .pipe(gulp.dest('src'));
});

gulp.task('html', ['pug'], () => {
  gulp.src('src/*.html')
  .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
  .pipe(plugins.htmlhint.reporter('htmlhint-stylish'))
  .pipe(plugins.htmlhint.failReporter({ suppress: true }));
});

// Styles
gulp.task('scss', () => {
  return gulp.src('src/scss/styles.scss')
  .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
  .pipe(plugins.sourcemaps.init())
  .pipe(plugins.sass())
  .pipe(plugins.autoprefixer(['last 3 versions', '> 1%'], { cascade: true }))
  .pipe(plugins.sourcemaps.write())
  .pipe(gulp.dest('src/css'))
  .pipe(browserSync.reload({stream: true}));
});

gulp.task('css', ['scss'], () => {
  return gulp.src('src/css/styles.css')
    // .pipe(plugins.uncss({ html: ['src/index.html'] }))
    .pipe(plugins.csslint())
    .pipe(plugins.csslint.reporter())
    .pipe(plugins.cssnano())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest('src/css'));
});

// Scripts
gulp.task('scripts', () => {
  return gulp.src('src/js/es2015/*.js')
  .pipe(plugins.plumber({ errorHandler: plugins.notify.onError() }))
  .pipe(plugins.babel({ presets: ['es2015'] }))
  .pipe(plugins.concat('common.js'))
  .pipe(plugins.eslint({ rulePaths: ['/'] }))
  .pipe(plugins.eslint.format())
  .pipe(plugins.eslint.failAfterError())
  .pipe(plugins.uglifyjs())
  .pipe(plugins.rename({suffix: '.min'}))
  .pipe(gulp.dest('src/js'));
});

// gulp.task('jsdoc', ['scripts'], (cb) => {
//   gulp.src(['README.md', 'src/js/common.min.js'], {read: false})
//     .pipe(plugins.jsdoc3(cb));
// });

// Utils
gulp.task('browserSync', () => {
  browserSync({
    server: { baseDir: 'src' },
    notify: false
  });
});

gulp.task('img', () => {
  return gulp.src('src/img/*')
  .pipe(plugins.cache(plugins.imagemin({
    interlaced: true,
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    une: [pngquant()]
  })))
  .pipe(gulp.dest('dist/img'));
});

gulp.task('clean', () => {
  return del.sync('dist');
});

gulp.task('clear', () => {
  return plugins.cache.clearAll();
});

// Watch
gulp.task('watch', ['css', 'html', 'scripts', 'browserSync'], () => {
  gulp.watch('src/pug/*.pug', ['html', 'css', browserSync.reload]);
  gulp.watch('src/scss/*.scss', ['css', browserSync.reload]);
  gulp.watch('src/js/**/*.js', ['scripts', browserSync.reload]);
});

// Build
gulp.task('build', ['clean', 'html', 'css', 'scripts', 'img'], () => {
  let buildFonts = gulp.src('src/fonts/*')
  .pipe(gulp.dest('dist/fonts'));

  let buildHtml = gulp.src('src/*.html')
  .pipe(gulp.dest('dist'));

  let buildCss = gulp.src('src/css/styles.min.css')
  .pipe(gulp.dest('dist/css'));

  let buildScripts = gulp.src('src/js/*.js')
  .pipe(plugins.removelogs())
  .pipe(gulp.dest('dist/js'));
});
