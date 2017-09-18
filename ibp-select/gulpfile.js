const gulp = require('gulp');
const gulpif = require('gulp-if');
const filter = require('gulp-filter');
const pugInheritance = require('yellfy-pug-inheritance');
const pug = require('gulp-pug');
const less = require('gulp-less');
const browserSync = require('browser-sync');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

var pathdir = 'mod/static/battery-selection/';

let pugInheritanceCache = {};

gulp.task('watch', () => {
  global.watch = true;

  gulp.watch(['mod/site/front-src/**/*.pug'], gulp.series('templates', 'reload'))
    .on('all', (event, filepath) => {
      global.changedTempalteFile = filepath.replace(/\\/g, '/');
    });

  gulp.watch(['mod/site/front-src/**/*.less'], gulp.series('less'));
});

function pugFilter(file, inheritance) {
  const filepath = `mod/site/front-src/${file.relative}`; 
  if (inheritance.checkDependency(filepath, global.changedTempalteFile)) {
    console.log(`Compiling: ${filepath}`);
    return true;
  }
  return false;
}

gulp.task('templates', () => {
  return new Promise((resolve, reject) => {
    const changedFile = global.changedTempalteFile;
    const options = {
      changedFile,
      treeCache: pugInheritanceCache
    };

    pugInheritance.updateTree('mod/site/front-src/', options).then((inheritance) => {
      // Save cache for secondary compilations
      pugInheritanceCache = inheritance.tree;

      return gulp.src('mod/site/front-src/*.pug')
        .pipe(gulpif(global.watch, filter((file) => pugFilter(file, inheritance))))
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest('front-public/'))
        .on('end', resolve)
        .on('error', reject)
    });
  });
});

gulp.task('b2b_files', function (){
  return gulp.src('mod/site/front-src/common/b2b_files/**')
    .pipe(gulp.dest('front-public/b2b_files'))
});

gulp.task('single-page_files', function (){
  return gulp.src('mod/site/front-src/common/single-page_files/**')
    .pipe(gulp.dest('front-public/single-page_files'))
});

gulp.task('less', function (){
  return gulp.src('mod/site/front-src/common/main.less')
    .pipe(less())
    // .pipe(concat('style.css'))
    .pipe(gulp.dest('front-public/'+ pathdir +'css'))
    // .pipe(browserSync.reload({stream: true}))
});

 gulp.task('js', function (){
   return gulp.src('mod/site/front-src/common/scripts/**/*.js')
     .pipe(gulp.dest('front-public/'+ pathdir +'js'))
 });

//gulp.task('js', function() {
//  return gulp.src(['mod/site/front-src/**/*.js', '!mod/site/front-src/common/libs/**/*.js'])
//    .pipe(sourcemaps.init())
//      .pipe(concat('script.js'))
//    .pipe(sourcemaps.write())
//    .pipe(gulp.dest('front-public/static/js'));
//});


gulp.task('libs', function (){
  return gulp.src('mod/site/front-src/common/libs/**')
    .pipe(gulp.dest('front-public/'+ pathdir +'libs'))
});

gulp.task('fonts', function (){
  return gulp.src('mod/site/front-src/common/fonts/**/*')
    .pipe(gulp.dest('front-public/'+ pathdir +'fonts'))
});

gulp.task('svg', function (){
  return gulp.src('mod/site/front-src/common/svg/**/*.svg')
    .pipe(gulp.dest('front-public/'+ pathdir +'svg'))
});

gulp.task('img', function (){
  return gulp.src('mod/site/front-src/*/img/*.+(png|jpg|gif|svg)')
    .pipe(rename(function (path) {
      console.log(path.dirname.split("\\")[0])
      path.dirname = '';//path.dirname.split("\\")[0].split("/")[0]; //изменяем путь директории, разбиваем по слешу, для отбрасывания лишyего img 
        return path;
    }))
    .pipe(gulp.dest('front-public/'+ pathdir +'img'))
});

gulp.task('browserSync', function(){
  browserSync({
    server: {
      baseDir: 'front-public/'
    },
    notify: false
  });
});

gulp.task('reload', function(done){
  browserSync.reload();
  done();
});

gulp.task('server', gulp.parallel('browserSync', 'watch', 'less'), function(){
  gulp.watch(['mod/site/front-src/**/*.less'], gulp.series('less'));

  gulp.watch(['mod/site/front-src/**/*.pug'], gulp.series('templates', 'reload'))
    .on('all', (event, filepath) => {
      global.changedTempalteFile = filepath.replace(/\\/g, '/');
    })
});

gulp.task('build', gulp.parallel('templates','b2b_files', 'single-page_files', 'less','fonts', 'js', 'libs', 'img', 'svg'));