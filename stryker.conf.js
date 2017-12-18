module.exports = function (config) {
  config.set({
    files: ['!**/*.*', 'src/**/*.ts', 'test/**/*.ts', 'tmp/generated/translations.ts', '!src/main.ts',
      {pattern: 'test/browser-tests/dummy-sidebar/**/*', included: false, mutated: false, transpiled: false},
    ],
    mutate: ['!**/*.*', 'src/**/*.ts', '!tmp/generated/translations.ts', '!src/main.ts'],
    testRunner: "karma",
    mutator: "typescript",
    transpilers: ["typescript"],
    reporter: ["html", "baseline", "clear-text", "progress"],
    htmlReporter: {
      baseDir: 'tmp/reports/mutation/html'
    },
    coverageAnalysis: "off",
    karmaConfigFile: "test/browser-tests/karma.conf.js",
    karmaConfig: {
      browserify: {
        debug: true,
      },
      reporters: ['progress'],
      // browsers: ['ChromeHeadless'],
      // browsers: ['Chrome'],
      browsers: ['PhantomJS'],
      //browserNoActivityTimeout: 100000,
    },
    tsconfigFile: "tsconfig.json",
    // logLevel: 'all'
  });
};
