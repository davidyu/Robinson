// simple structure that stores the names of the shaders
// and loads them
function ProgramSource( vs, fs, shouldAppendUtils ) {
  this.vs_name = vs;
  this.fs_name = fs;
  this.shouldAppendUtils = shouldAppendUtils;
  this.vs = null;
  this.fs = null;

  this.loadShaders = function( done ) {
    var source = this; // closure

    // load vertex shader
    var vs_req = new XMLHttpRequest();
    vs_req.addEventListener( "load", function( evt ) {
      if ( source.vs == null ) {
        done( false );
      }
      source.vs = vs_req.responseText;
      if ( source.vs != null && source.fs != null ) {
        done();
      }
    } );
    vs_req.open( "GET", '/base/shaders/' + this.vs_name, true );
    vs_req.send();

    // load fragment shader
    var fs_req = new XMLHttpRequest();
    fs_req.addEventListener( "load", function( evt ) {
      if ( fs_req.responseText == null ) {
        done( false );
      }
      source.fs = fs_req.responseText;
      if ( source.vs != null && source.fs != null ) {
        done();
      }
    } );
    fs_req.open( "GET", '/base/shaders/' + this.fs_name, true );
    fs_req.send();
  };
}

var sources = [
  new ProgramSource( 'basic.vert'           , 'lambert.frag'          , true  ) ,
  new ProgramSource( 'basic.vert'           , 'blinn-phong.frag'      , true  ) ,
  new ProgramSource( 'basic.vert'           , 'oren-nayar.frag'       , true  ) ,
  new ProgramSource( 'basic.vert'           , 'cook-torrance.frag'    , true  ) ,
  new ProgramSource( 'debug.vert'           , 'debug.frag'            , false ) ,
  new ProgramSource( 'skybox.vert'          , 'skybox.frag'           , false ) ,
  new ProgramSource( 'skybox.vert'          , 'sky.frag'              , false ) ,
  new ProgramSource( 'water.vert'           , 'water.frag'            , true  ) ,
  new ProgramSource( 'screenspacequad.vert' , 'water_screenspace.frag', false ) ,
  new ProgramSource( 'screenspacequad.vert' , 'noise.frag'            , false ) ,
  new ProgramSource( 'screenspacequad.vert' , 'volume_viewer.frag'    , false ) ,
  new ProgramSource( 'screenspacequad.vert' , 'post-process.frag'     , false ) ,
  new ProgramSource( 'screenspacequad.vert' , 'depth-texture.frag'    , false ) ,
];

var utils_inc = null;

// handy little function from webgl-compile-shader
// source: https://github.com/mattdesl/webgl-compile-shader/
// License: 
/*
 * The MIT License (MIT)
 * Copyright (c) 2014 Matt DesLauriers
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
function addLineNumbers( string ) {
    var lines = string.split( '\n' );
    for ( var i = 0; i < lines.length; i ++ ) {
        lines[ i ] = ( i + 1 ) + ': ' + lines[ i ];
    }
    return lines.join( '\n' );
}

describe( "shader", function() {
  describe( "existence test", function() {
    sources.forEach( function( s ) {
      it( s.vs_name + " and " + s.fs_name + " should load", function( done ) {
        s.loadShaders( done );
      } );
    } );
    it ( 'utils.inc should load', function( done ) {
      var req = new XMLHttpRequest();
      req.addEventListener( "load", function( evt ) {
        if ( req.status != 200 ) {
          done( false );
        }
        utils_inc = req.responseText;
        if ( utils_inc != null ) {
          done();
        }
      } );
      req.open( "GET", '/base/shaders/utils.inc', true );
      req.send();
    } );
  } );

  describe( "compile test", function() {
    var gl = null;

    before( function() {
      var canvas = document.createElement('canvas');
      gl = canvas.getContext( "webgl2" );
    } );

    sources.forEach( function( s ) {
      it( s.vs_name + " and " + s.fs_name + " should compile", function() {
        var vertexShader = gl.createShader( gl.VERTEX_SHADER );
        gl.shaderSource( vertexShader, s.vs );
        gl.compileShader( vertexShader );

        if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
          throw new Error( "An error occurred compiling " + s.vs_name + ": " + gl.getShaderInfoLog( vertexShader ) );
        }

        var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );

        if ( s.shouldAppendUtils ) {
          gl.shaderSource( fragmentShader, s.fs + utils_inc );
        } else {
          gl.shaderSource( fragmentShader, s.fs );
        }

        gl.compileShader( fragmentShader );

        if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
          throw new Error( "An error occurred compiling " + s.fs_name + ": " + gl.getShaderInfoLog( fragmentShader ) );
        }

        // Create the shader program
        var program = gl.createProgram();
        gl.attachShader( program, vertexShader );
        gl.attachShader( program, fragmentShader );

        gl.linkProgram( program );

        if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
          console.log( "Problematic vertex shader: " + s.vs_name + "\n" );
          console.log( "Problematic fragment shader: " + s.fs_name + "\n" );
          throw new Error( "Unable to link the shader program: " + gl.getProgramInfoLog( program ) );
        }
      } );
    } );
  } );
} );
