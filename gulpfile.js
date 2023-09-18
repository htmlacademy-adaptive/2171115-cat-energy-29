import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import imagemin from 'gulp-imagemin';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import sync from 'browser-sync';


// HTML

const html = () => {
  return gulp.src('source/*.html')
  .pipe(gulp.dest('build'));
}

// Styles

export const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass({
      includePaths: ['node_modules']
    }))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

// Scripts

export const scripts = () => {
  return gulp.src('source/js/script.js')
  .pipe(gulp.dest('build/js'))
  .pipe(sync.stream());
  };

// Images

export const images = () => {
  return gulp.src("source/img/*.{png,jpg,svg}")
    .pipe(imagemin([
      svgo()
    ]))
    .pipe(squoosh({webp: {}}))
    .pipe(gulp.dest("build/img"))
}

// WebP

// const createWebp = () => {
//   return gulp.src('source/img/**/*.{png,jpg}')
//     .pipe(squoosh({
//     webp: {}
//     }))
//     .pipe(gulp.dest('build/img'))
//   }

// SVG

const svg = () =>
  gulp.src(['source/img/*.svg', '!source/img/*.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));

const sprite = () => {
  return gulp.src('source/img/*.svg')
  .pipe(squoosh({webp: {}}))
  .pipe(svgo())
  .pipe(svgstore({
    inlineSvg: true
    }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));
}

//Copy

export const copy = (done) => {
  gulp.src([
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/img/*.{jpg,png,svg}"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

// Clean

// const clean = () => {
//   return del('build');
//   };

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

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Build

export const build = gulp.series(
  gulp.parallel(
    styles,
    html,
    scripts,
    sprite,
    copy,
    images,
    // createWebp
  )
);

// Default

export default gulp.series(
  // clean,
  copy,
  images,
  gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  sprite,
  // createWebp
),
  gulp.series(
  server,
  watcher
));
