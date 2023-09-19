import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import {stacksvg} from 'gulp-stacksvg';
import svgo from 'gulp-svgmin';
import {deleteAsync} from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML

export const html = () => {
  return gulp.src(['source/*.html', '!source/'])
    .pipe(htmlmin({collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

// Scripts

export const script = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'));
}

//Images

export const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'));
}

export const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/img'));
}

// WebP

export const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/img'))
}

// SVG

export const svg = () =>
  gulp.src(['source/img/*.svg', '!source/img/icons/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));

export const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(stacksvg({ output: 'sprite.svg' }))
    .pipe(gulp.dest('build/img'));
}


// Copy

export const copy = (done) => {
  gulp.src([
  'source/fonts/**/*.{woff2,woff}',
  'source/*.ico',
  'source/manifest.webmanifest'
  ], {
  base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
  }

// Clean

export const clean = () => {
  return deleteAsync('build');
  };

// Server

export const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

export const reload = (done) => {
  browser.reload();
  done();
  }

// Watcher

export const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(script));
  gulp.watch('source/*.html').on('change', browser.reload);
}

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    sprite,
    createWebp
  ),
);

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    script,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
