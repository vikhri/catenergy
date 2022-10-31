
import gulp from 'gulp';
import plumber from "gulp-plumber";
import sourcemap from "gulp-sourcemaps";
import sass from 'gulp-dart-sass';
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import csso from "postcss-csso";
import rename from "gulp-rename";
import htmlmin from "gulp-htmlmin";
import terser from "gulp-terser";
import squoosh from "gulp-libsquoosh";
import webp from "gulp-webp";
import svgstore from "gulp-svgstore";
import del from "del";
import sync from "browser-sync";

// Styles

export const styles = () => {
    return gulp.src("source/sass/style.scss", { sourcemaps: true })
      .pipe(plumber())
      .pipe(sass())
      .pipe(postcss([
        autoprefixer(),
        csso()
      ]))
      .pipe(rename("style.min.css"))
      .pipe(gulp.dest("build/css" , { sourcemaps: '.' }))
      .pipe(sync.stream());
  }
  
  let exports = {};
  exports.styles = styles;
  


// HTML

const html = () => {
    return gulp.src("source/*.html")
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest("build"));
  }
  

// Scripts

export const scripts = () => {
    return gulp.src("source/js/script.js")
      .pipe(terser())
      .pipe(rename("script.min.js"))
      .pipe(gulp.dest("build/js"))
      .pipe(sync.stream());
  }
  exports.scripts = scripts;


// Images

const optimizeImages = () => {
    return gulp.src("source/img/**/*.{png,jpg,svg}")
      .pipe(squoosh())
      .pipe(gulp.dest("build/img"))
  }
  
  exports.images = optimizeImages;
  
  const copyImages = () => {
    return gulp.src("source/img/**/*.{png,jpg,svg}")
      .pipe(gulp.dest("build/img"))
  }
  
  exports.images = copyImages;


// WebP

const createWebp = () => {
    return gulp.src("source/img/**/*.{jpg,png}")
      .pipe(webp({quality: 90}))
      .pipe(gulp.dest("build/img"))
  }
  
  exports.createWebp = createWebp;
  
// Sprite

const sprite = () => {
    return gulp.src("source/img/icons/*.svg")
      .pipe(svgstore({
        inlineSvg: true
      }))
      .pipe(rename("sprite.svg"))
      .pipe(gulp.dest("build/img"));
  }
  
  exports.sprite = sprite;

// Copy

const copy = (done) => {
    gulp.src([
      "source/fonts/*.{woff2,woff}",
      "source/*.ico",
      "source/img/**/*.svg",
      "!source/img/icons/*.svg",
    ], {
      base: "source"
    })
      .pipe(gulp.dest("build"))
    done();
  }
  
  exports.copy = copy;


// Clean

const clean = () => {
    return del("build");
  };


// Server

export const server = (done) => {
    sync.init({
      server: {
        baseDir: "build"
      },
      cors: true,
      notify: false,
      ui: false,
    });
    done();
  }
  
  exports.server = server;

// Reload

export const reload = (done) => {
    sync.reload();
    done();
  }

  exports.reload = reload;

  // Watcher

export const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html', gulp.series(html, reload));
 // gulp.watch('source/*.html').on('change', sync.reload);
//   gulp.watch("source/js/script.js", gulp.series(scripts));
}



// Build

export const build = gulp.series(
    clean,
    copy,
    optimizeImages,
    gulp.parallel(
      styles,
      html,
      scripts,
      sprite,
      createWebp
    ),
  );
  
  exports.build = build;

  // Default


export default gulp.series(
    clean,
    copy,
    copyImages,
    gulp.parallel(
      styles,
      html,
      scripts,
      sprite,
      createWebp
    ),
    gulp.series(
      server,
      watcher
    ));

   