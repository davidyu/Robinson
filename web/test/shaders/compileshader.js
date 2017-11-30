var compiler = require( 'webgl-compile-shader' );
var gl = require( 'gl' )( 1024, 768 );
var fs = require( 'fs' );
var colors = require( 'colors' );

function ProgramSource( vs, fs ) {
  this.vs = vs;
  this.fs = fs;
}

var sources = [
  new ProgramSource( 'basic.vert' , 'lambert.frag' ),
  new ProgramSource( 'basic.vert' , 'blinn-phong.frag' ),
  new ProgramSource( 'basic.vert' , 'oren-nayar.frag' ),
  new ProgramSource( 'basic.vert' , 'cook-torrance.frag' ),
  new ProgramSource( 'debug.vert' , 'debug.frag' ),
  new ProgramSource( 'skybox.vert', 'skybox.frag' ),
  new ProgramSource( 'skybox.vert', 'sky.frag' ),
  new ProgramSource( 'water.vert' , 'water.frag' ),
  new ProgramSource( 'passthrough.vert' , 'cube-sh.frag' ),
  new ProgramSource( 'passthrough.vert' , 'unlit.frag' )
];

var logs = sources.map( function( source ) {
  process.stdout.write( "Compiling program ... " + source.vs + " + " + source.fs + "\n" );
  var vertexSource = fs.readFileSync( source.vs, 'utf8' );

  var utils = fs.readFileSync( "utils.frag", 'utf8' );
  var fragmentSource = utils + fs.readFileSync( source.fs, 'utf8' );

  return compiler( {
    vertex: vertexSource,
    fragment: fragmentSource,
    gl: gl,
    verbose: true,
  } );
} );

process.stdout.write( ( "Success!" ).green + "\n" );
