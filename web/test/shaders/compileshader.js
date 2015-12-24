var compiler = require( 'webgl-compile-shader' );
var gl = require( 'gl' )( 1024, 768 );
var fs = require( 'fs' );
var colors = require( 'colors' );

function ProgramSource( vs, fs ) {
  this.vs = vs;
  this.fs = fs;
}

var sources = [
  new ProgramSource( 'basic.vert', 'unlit.frag' ),
  new ProgramSource( 'basic.vert', 'lit.frag' ),
  new ProgramSource( 'debug.vert', 'debug.frag' )
];

var logs = sources.map( function( source ) {
  process.stdout.write( "Compiling program ... " + source.vs + " + " + source.fs + "\n" );
  var vertexSource = fs.readFileSync( source.vs, 'utf8' );
  var fragmentSource = fs.readFileSync( source.fs, 'utf8' );

  return compiler( {
    vertex: vertexSource,
    fragment: fragmentSource,
    gl: gl,
    verbose: true,
  } );
} );

process.stdout.write( ( "Success!" ).green + "\n" );
