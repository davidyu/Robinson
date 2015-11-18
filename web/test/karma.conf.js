module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'unit/math.js',
      { pattern: 'robinson.js', included: true  }
    ],

    autoWatch: true,
    browsers: [ 'PhantomJS' ]
  });
};
