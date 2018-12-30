module.exports = function( config ) {
  config.set( {
    frameworks: ['mocha'],
    files: [
      { pattern: 'compileshader.js', included: true },
      { pattern: '*.vert', served: true, included: false },
      { pattern: '*.frag', served: true, included: false }
    ],
    browsers: [ 'ChromeHeadless' ],
    singleRun: true
  } );
};
