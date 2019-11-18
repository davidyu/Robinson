module.exports = function( config ) {
  config.set( {
    frameworks: ['mocha'],
    files: [
      { pattern: 'compileshader.js', included: true },
      { pattern: './shaders/*.vert', served: true, included: false },
      { pattern: './shaders/*.frag', served: true, included: false },
      { pattern: './shaders/*.inc', served: true, included: false },
    ],
    browsers: [ 'ChromeHeadless' ],
    singleRun: true
  } );
};
