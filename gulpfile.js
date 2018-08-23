var gulp = require("gulp"),
  gutil = require("gulp-util"),
  coffee = require("gulp-coffee"),
  compass = require("gulp-compass"),
  browserify = require("gulp-browserify"),
  connect = require("gulp-connect"),
  concat = require("gulp-concat"),
  minifycss = require("gulp-minify-css"),
  gulpif = require("gulp-if"),
  uglify = require("gulp-uglify");

var env,
  coffeeSources,
  jsSources,
  sassSources,
  htmlSources,
  jsonSources,
  outputDir,
  sassStyle;

env = process.env.NODE_ENV || "development";

if (env === "development") {
  outputDir = "builds/development/";
  sassStyle = "expanded";
} else {
  outputDir = "builds/production/";
  sassStyle = "compressed";
}

coffeeSources = ["components/coffee/tagline.coffee"];
jsSources = [
  "components/script/rclick.js",
  "components/script/pixgrid.js",
  "components/script/tagline.js",
  "components/script/template.js"
];
sassSources = ["components/sass/style.scss"];
htmlSources = [outputDir + "*.html"];
jsonSources = [outputDir + "js/*.json"];

gulp.task("coffee", function() {
  gulp
    .src(coffeeSources)
    .pipe(coffee({ bare: true }).on("error", gutil.log))
    .pipe(gulp.dest("components/script"));
});

gulp.task("js", function() {
  gulp
    .src(jsSources)
    .pipe(concat("script.js"))
    .pipe(browserify())
    .pipe(gulp.dest(outputDir + "js"))
    .pipe(connect.reload());
});

gulp.task("compass", function() {
  gulp
    .src(sassSources)
    .pipe(
      compass({
        sass: "components/sass",
        sourcemap: true,
        style: sassStyle
      }).on("error", gutil.log)
    )
    .pipe(gulpif(env === "production", minifycss()))
    .pipe(gulp.dest(outputDir + "css"))
    .pipe(connect.reload());
});

gulp.task("watch", function() {
  gulp.watch(coffeeSources, ["coffee"]);
  gulp.watch(jsSources, ["js"]);
  gulp.watch("components/sass/*.scss", ["compass"]);
  gulp.watch(htmlSources, ["html"]);
  gulp.watch(jsonSources, ["json"]);
});

gulp.task("connect", function() {
  connect.server({
    root: outputDir,
    livereload: true
  });
});

gulp.task("html", function() {
  gulp.src(htmlSources).pipe(connect.reload());
});

gulp.task("json", function() {
  gulp.src(jsonSources).pipe(connect.reload());
});

gulp.task("default", [
  "html",
  "json",
  "coffee",
  "js",
  "compass",
  "watch",
  "connect"
]);
