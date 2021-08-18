/*
 * Copyright 2017-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Karma configuration

const istanbul = require('browserify-istanbul');

const win10 = ["Windows", "10"];
const macOS = ["OSX", "Sierra"];

const chromeLatest = ["chrome", "latest"];
const firefoxLatest = ["firefox", "latest"];
const firefoxEST = ["firefox", "45"];
const ie11 = ["ie", "11"];
const edge = ["edge", "latest"];
const safari10 = ["Safari", "10"];

function bsLauncher([os, os_version], [browser, browser_version]) {
  return {
    base: 'BrowserStack',
    browser,
    browser_version,
    os,
    os_version
  };
}


module.exports = function (config) {
  const TMP_REPORTS_COVERAGE = "tmp/reports/coverage";
  const TMP_COMPILED_TS_PATTERN = "tmp/compiled/**/*.js";

  config.set({

    browserStack: {
      /// username: 'marcostahl2', set by BROWSER_STACK_USERNAME
      //  accessKey: '*', set by BROWSER_STACK_ACCESS_KEY
      build: 'sidebar-startpage-' + (process.env.BUILD_NUMBER || 'local'),
      name: 'sidebar-startpage',
      project: 'Sidebar Start Page',
      retryLimit: 6,
    },

    // https://oligofren.wordpress.com/2014/05/27/running-karma-tests-on-browserstack/
    browserDisconnectTimeout: 10000, // default 2000
    browserDisconnectTolerance: 1, // default 0
    browserNoActivityTimeout: 4 * 60 * 1000, //default 10000
    captureTimeout: 4 * 60 * 1000, //default 60000

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1, // 1 is better for browserstack

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['browserify', 'mocha'],


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
        ignore: ['**/node_modules/**', '**/test/**'],
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
      bs_ie11_win: bsLauncher(win10, ie11),
      bs_edge_win: bsLauncher(win10, edge),
      bs_chrome_win: bsLauncher(win10, chromeLatest),
      bs_firefox_win: bsLauncher(win10, firefoxLatest),
      bs_firefox_est_win: bsLauncher(win10, firefoxEST),
      bs_safari_macos: bsLauncher(macOS, safari10),
      HeadlessChromeWithoutSecurity: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      }
    },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS', 'bs_ie11_win', 'bs_edge_win','bs_chrome_win','bs_firefox_win','bs_firefox_est_win',
      'bs_safari_macos'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  })
}
