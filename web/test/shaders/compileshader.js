var compiler = require( 'webgl-compile-shader' );
var fs = require( 'fs' );
var getContext = require('get-canvas-context')
 
var gl = getContext('webgl' );
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
  new ProgramSource( 'screenspacequad.vert' , 'water_screenspace.frag' ),
  new ProgramSource( 'screenspacequad.vert' , 'noise_writer.frag' ),
  new ProgramSource( 'screenspacequad.vert' , 'volume_viewer.frag' ),
  new ProgramSource( 'passthrough.vert' , 'cube-sh.frag' ),
];

var logs = sources.map( function( source ) {
  process.stdout.write( "Compiling program ... " + source.vs + " + " + source.fs + "\n" );
  var vertexSource = fs.readFileSync( source.vs, 'utf8' );

  var utils = fs.readFileSync( "utils.frag", 'utf8' );
  var fragmentSource = utils + fs.readFileSync( source.fs, 'utf8' );

  return compiler( {
    gl: gl,
    vertex: vertexSource,
    fragment: fragmentSource,
    verbose: true,
  } );
} );

process.stdout.write( ( "Success!" ).green + "\n" );
