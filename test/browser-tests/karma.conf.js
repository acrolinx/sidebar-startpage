// Karma configuration
const istanbul = require('browserify-istanbul');

module.exports = function(config) {
  const TMP_REPORTS_COVERAGE = "tmp/reports/coverage";
  const TMP_COMPILED_TS = "tmp/compiled/test/browser-tests/src/index.js";
  const TMP_COMPILED_TS_PATTERN = "tmp/compiled/**/*.js";

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify','mocha'],


    // list of files / patterns to load in the browser
    files: [
      TMP_COMPILED_TS_PATTERN
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      [TMP_COMPILED_TS_PATTERN]: ['browserify']
    },

    browserify: {
      debug: true,
      transform: [istanbul({
        ignore: ['**/node_modules/**', '**/test/**', '**/websdk/**'],
      })]
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'junit'],

    coverageReporter: {
      dir: TMP_REPORTS_COVERAGE,
      reporters: [
        {type: 'html'},
        {type: 'json'},
        {type: 'cobertura'},
      ]
    },

    // the default configuration
    junitReporter: {
      outputDir: 'tmp/reports/junit',
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  })
}
