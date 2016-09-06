var gulp = require('gulp'),
    concat = require('gulp-concat'),
    inj = require('gulp-inject'),
    del = require('del'),
    rename = require('gulp-rename'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    uglifycss = require('gulp-uglifycss'),
    header = require('gulp-header'),
    es = require('event-stream');

var pkg = require('./package.json');
var banner = ['/**',
    ' * <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.repository %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

var paths = require('./paths');

gulp.task('clean', function() {
    del.sync(['./dist'], function() {
        console.log('Deleted dist');
    });
});

gulp.task('lint', function() {
    var jshint = require('gulp-jshint');
    gulp.src('app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', function() {
    var jscs = require('gulp-jscs');
    return gulp.src('src/**/*.js').pipe(jscs());
});

gulp.task('test', function (done) {
    var KarmaServer = require('karma').Server;
    return new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('dist', function () {
    return gulp.src('./src/index.html')
        .pipe(inj(streamAppJs(), {ignorePath: 'dist'}))
        .pipe(inj(streamAppCss(), {ignorePath: 'dist'}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('prep', ['clean', 'lint', 'jscs', 'test']);
gulp.task('build', ['prep', 'dist']);
gulp.task('default', ['build']);

function streamAppJs() {
    var templateCache = require('gulp-angular-templatecache'),
        angularFilesort = require('gulp-angular-filesort');
    var appJs = gulp.src(paths.js.app);
    var templates = gulp.src(['src/**/*.html', 'src/**/*.json'])
        .pipe(templateCache('templates.js', {module: 'signalpath.spinny'}));
    var allJs = es.merge(appJs, templates)
        .pipe(angularFilesort())
        .pipe(ngAnnotate({single_quotes: true}))
        .pipe(concat('js/sp-spinny.js'));

    return allJs.pipe(gulp.dest('./dist'))
            .pipe(uglify())
            .pipe(rename({extname: '.min.js'}))
            .pipe(header(banner, {pkg : pkg}))
            .pipe(gulp.dest('./dist'));
}

function streamAppCss() {
    var sass = require('gulp-sass');

    var scss = gulp.src('./sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(header(banner, {pkg : pkg}))
        .pipe(gulp.dest('./dist/css'));

    scss
        .pipe(rename({extname: '.min.css'}))
        .pipe(uglifycss({
            'max-line-len': 80
        }))
        .pipe(header(banner, {pkg : pkg}));

    return scss.pipe(gulp.dest('./dist/css'));
}