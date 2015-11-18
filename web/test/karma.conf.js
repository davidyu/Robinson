// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'unit/*.js'
    ],

    autoWatch: true,
    browsers: [ 'PhantomJS' ]
  });
};
