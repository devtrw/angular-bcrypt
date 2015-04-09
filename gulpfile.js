//@formatter:off
//noinspection JSHint
var del              = require('del');
var gulp             = require('gulp');
var gAngularFilesort = require('gulp-angular-filesort');
var gConcat          = require('gulp-concat');
var gFilter          = require('gulp-filter');
var gInject          = require('gulp-inject');
var gJshint          = require('gulp-jshint');
var gKarma           = require('gulp-karma');
var gNgAnnotate      = require('gulp-ng-annotate');
var gPlumber         = require('gulp-plumber');
var gRev             = require('gulp-rev');
var gUglify          = require('gulp-uglify');
var gWatch           = require('gulp-watch');
var lazypipe         = require('lazypipe');
var jshintStylish    = require('jshint-stylish');
var mainBowerFiles   = require('main-bower-files');
var Q                = require('q');
var Streamqueue      = require('streamqueue');
//@formatter:on

var APP_NAME = 'dtrw.bcrypt';

/**
 * A lazy pipe for constructing the application js file stream
 */
var srcJsAppDevLzPipe = lazypipe()
  .pipe(gulp.src, ['./src/**/*.js', '!./src/**/*_test.js'])
  .pipe(gPlumber)
  .pipe(gAngularFilesort);
var srcJsAppDistLzPipe = lazypipe()
  .pipe(gulp.src, ['!./dist/dtrw.bcrypt.js', './dist/*.js']);

/**
 * A lazy pipe for the vendor js file stream
 */
var srcVendorFilesLzPipe = lazypipe()
  .pipe(gulp.src, mainBowerFiles());

/**
 * Returns a file stream for the test files
 */
function srcTestFilesStream() {
  return new Streamqueue({objectMode: true})
    .queue(gulp.src('./bower_components/angular/angular.js'))
    .queue(srcVendorFilesLzPipe().pipe(gFilter('**/*.js')))
    .queue(gulp.src('./bower_components/angular-mocks/angular-mocks.js'))
    .queue(srcJsAppDistLzPipe())
    .queue(gulp.src('./src/**/*_test.js', {read: false}))
    .done();
}

function jsonFilePathTransform(filePath, file, i, length) {
  //return '\'' + filePath + '\'' + (i + 1 < length ? ',' : '');
  return '"' + filePath + '"' + (i + 1 < length ? ',' : '');
}

/**
 * @param {*}      files   The file stream containing the files used for testing
 *
 * @return {Q.promise}
 */
function updateKarmaConfig(files) {
  var deferred = Q.defer();

  gulp.src('./karma.conf.js')
    .pipe(gInject(files, {
        addRootSlash: false,
        starttag:     'files: [',
        endtag:       ']',
        transform:    jsonFilePathTransform
      }
    ))
    .pipe(gulp.dest('./'))
    .on('end', deferred.resolve)
    .on('error', deferred.reject);

  return deferred.promise;
}

function updateBowerMainConfig(files) {
  var deferred = Q.defer();

  gulp.src('./bower.json')
    .pipe(gInject(files, {
        addRootSlash: false,
        starttag:     '"main": [',
        endtag:       ']',
        transform:    jsonFilePathTransform
      }
    ))
    .pipe(gulp.dest('./'))
    .on('end', deferred.resolve)
    .on('error', deferred.reject);

  return deferred.promise;
}

/**
 * @param {String|Array<String>} fileGlob - The file path[s] to remove
 *
 * @return {Q.promise}
 */
function clean(fileGlob) {
  var deferred = Q.defer();

  del(fileGlob, function (err) {
    if (err) {
      return deferred.reject(err);
    }
    deferred.resolve();
  });

  return deferred.promise;
}

function compileAppJs() {
  var deferred = Q.defer();

  srcJsAppDevLzPipe()
    .pipe(gConcat(APP_NAME + '.js'))
    .pipe(gNgAnnotate())
    .pipe(gUglify())
    .pipe(gulp.dest('./dist'))
    .pipe(gRev())
    .pipe(gulp.dest('./dist'))
    .on('end', deferred.resolve)
    .on('error', deferred.reject);

  return deferred.promise;
}

gulp.task('default', function () {

  gWatch(
    {
      name: 'App JS',
      emit: 'all',
      glob: ['./src/**/*.js', '!./src/**/*_test.js']
    },
    function (events, done) {
      clean('./dist/*.js')
        .then(compileAppJs)
        .then(function () { return updateKarmaConfig(srcTestFilesStream()); })
        .then(function () { return updateBowerMainConfig(srcJsAppDistLzPipe()); })
        .then(function () {
          done();
        });
    }
  );

});

gulp.task('test', function () {
  return srcTestFilesStream()
    .pipe(gKarma({
      action:     'run',
      configFile: 'karma.conf.js'
    }))
    .on('error', function (err) {
      throw err;
    });
});

gulp.task('lint', function () {
  return gulp.src('./src/**/*.js')
    .pipe(gJshint('./.jshintrc'))
    .pipe(gJshint.reporter(jshintStylish))
    .pipe(gJshint.reporter('fail'));
});
