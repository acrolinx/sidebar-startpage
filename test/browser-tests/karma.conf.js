// Karma configuration
const istanbul = require('browserify-istanbul');

module.exports = function(config) {
  const TMP_REPORTS_COVERAGE = "tmp/reports/coverage";
  const TMP_COMPILED_TS_PATTERN = "tmp/compiled/**/*.js";

  config.set({

    browserStack: {
      /// username: 'marcostahl2', set by BROWSER_STACK_USERNAME
      //  accessKey: '*', set by BROWSER_STACK_ACCESS_KEY
      name: 'sidebar-startpage'
    },

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify','mocha'],


    // list of files / patterns to load in the browser
    files: [
      TMP_COMPILED_TS_PATTERN,
      {pattern: 'test/browser-tests/dummy-sidebar/**/*', included: false},
    ],


    // list of files to exclude
    exclude: [
      "tmp/compiled/src/main.js"
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
    reporters: ['progress', 'coverage', 'junit', 'dots', 'BrowserStack'],

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

    customLaunchers: {
      bs_ie11_win: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11',
        os: 'Windows',
        os_version: '10'
      },
      bs_edge_win: {
        base: 'BrowserStack',
        browser: 'edge',
        browser_version: 'latest',
        os: 'Windows',
        os_version: '10'
      },
      bs_safari_macos: {
        base: 'BrowserStack',
        browser: 'Safari',
        browser_version: '10',
        os: 'OSX',
        os_version: 'Sierra'
      }
    },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS', 'bs_ie11_win', 'bs_edge_win', 'bs_safari_macos'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
  })
}
