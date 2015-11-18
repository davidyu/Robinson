// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'math.js'
    ],

    autoWatch: true,
    browsers: [ 'PhantomJS' ]
  });
};
