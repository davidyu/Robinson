enum SHADERTYPE {
  SIMPLE_VERTEX,
  LIT_FRAGMENT,
  UNLIT_FRAGMENT,
  DEBUG_FRAGMENT,
}

class ShaderFile {
  source: string;
  loaded: boolean;

  constructor( source: string = "", loaded: boolean = false ) {
    this.source = source;
    this.loaded = loaded;
  }
}

class ShaderRepository {
  files: ShaderFile[];
  loadDoneCallback: ( ShaderRepository ) => void;

  constructor( loadDoneCallback:( ShaderRepository ) => void ) {
    this.loadDoneCallback = loadDoneCallback;
    this.files = [];
    for ( var t in SHADERTYPE ) {
      if ( !isNaN( t ) ) {
        this.files[ t ] = new ShaderFile();
      }
    }
    this.loadShaders();
  }

  loadShaders() {
    this.asyncLoadShader( "basic.vert" , SHADERTYPE.SIMPLE_VERTEX  , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "unlit.frag" , SHADERTYPE.UNLIT_FRAGMENT , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "lit.frag"   , SHADERTYPE.LIT_FRAGMENT   , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "debug.frag" , SHADERTYPE.DEBUG_FRAGMENT , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
  }

  asyncLoadShader( name: string, stype: SHADERTYPE, loaded: ( stype: SHADERTYPE, contents: string ) => void ) {
    var req = new XMLHttpRequest();
    req.addEventListener( "load", evt => { loaded( stype, req.responseText ); } );
    req.open( "GET", "./shaders/" + name, true );
    req.send();
  }

  shaderLoaded( stype: SHADERTYPE, contents: string  ) {
    this.files[ stype ].source = contents;
    this.files[ stype ].loaded = true;

    if ( this.requiredShadersLoaded() ) {
      if ( this.loadDoneCallback != null ) {
        this.loadDoneCallback( this );
      }
      this.loadDoneCallback = null;
    }
  }

  requiredShadersLoaded(): boolean {
    var loaded = true;
    for ( let t in SHADERTYPE ) {
      if ( parseInt( t, 10 ) >= 0 ) {
        loaded = loaded && this.files[ t ].loaded;
      }
    }
    return loaded;
  }

  allShadersLoaded(): boolean {
    var allLoaded = true;
    for ( var v in SHADERTYPE ) {
      if ( !isNaN( v ) ) {
        allLoaded = allLoaded && this.files[ v ].loaded;
      }
    }
    return allLoaded;
  }
}


class ShaderSource {
  vs: string;
  fs: string;
  constructor( vs: string, fs: string ) {
    this.vs = vs;
    this.fs = fs;
  }
}

class ShaderMaterialProperties {
  ambient: WebGLUniformLocation;
  diffuse: WebGLUniformLocation;
  specular: WebGLUniformLocation;
  emissive: WebGLUniformLocation;
  shininess: WebGLUniformLocation;
}

class ShaderLightProperties {
  position: WebGLUniformLocation;
  color: WebGLUniformLocation;
  enabled: WebGLUniformLocation;
}

class Renderer {
  camera: Camera;
  context: WebGLRenderingContext;
  vertexBuffer: WebGLBuffer;
  vertexColorBuffer: WebGLBuffer;
  vertexNormalBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;

  // shader programs
  phongProgram: WebGLProgram;
  debugProgram: WebGLProgram;

  aVertexPosition: number;
  aVertexColor: number;
  aVertexNormal: number;
  uModelView: WebGLUniformLocation;
  uPerspective: WebGLUniformLocation;
  uNormal: WebGLUniformLocation;

  uMaterial: ShaderMaterialProperties;
  uLights: ShaderLightProperties[];

  dirty: boolean;

  constructor( viewportElement: HTMLCanvasElement, sr: ShaderRepository ) {
    var gl = <WebGLRenderingContext>( viewportElement.getContext( "webgl" ) || viewportElement.getContext( "experimental-webgl" ) );

    gl.viewport( 0, 0, viewportElement.width, viewportElement.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );                         // Set clear color to black, fully opaque
    gl.clearDepth( 1.0 );                                        // Clear everything
    gl.enable( gl.DEPTH_TEST );                                  // Enable depth testing
    gl.depthFunc( gl.LEQUAL );                                   // Near things obscure far things

    this.context = gl;
    var success = true;
    if ( !this.context ) {
      alert( "Unable to initialize WebGL. Your browser may not support it" );
      success = false;
    }

    // compile phong program
    this.phongProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.LIT_FRAGMENT ].source );
    if ( this.phongProgram == null ) {
      alert( "Phong shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.debugProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.DEBUG_FRAGMENT ].source );
    if ( this.debugProgram == null ) {
      alert( "Debug shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.dirty = true;
  }

  cacheLitShaderProgramLocations( program: WebGLProgram ) {
    var gl = this.context;
    this.vertexBuffer = gl.createBuffer();
    this.vertexNormalBuffer = gl.createBuffer();
    this.vertexColorBuffer = gl.createBuffer();
    this.indexBuffer = gl.createBuffer();

    this.aVertexPosition = gl.getAttribLocation( program, "aVertexPosition" );
    gl.enableVertexAttribArray( this.aVertexPosition );

    this.aVertexNormal = gl.getAttribLocation( program, "aVertexNormal" );
    gl.enableVertexAttribArray( this.aVertexNormal );

    if ( false ) {
      this.aVertexColor = gl.getAttribLocation( program, "aVertexColor" );
      gl.enableVertexAttribArray( this.aVertexColor );
    }

    this.uModelView = gl.getUniformLocation( program, "uMVMatrix" );
    this.uPerspective = gl.getUniformLocation( program, "uPMatrix" );
    this.uNormal = gl.getUniformLocation( program, "uNormalMatrix" );

    this.uMaterial = new ShaderMaterialProperties();
    this.uMaterial.ambient = gl.getUniformLocation( program, "mat.ambient" );
    this.uMaterial.diffuse = gl.getUniformLocation( program, "mat.diffuse" );
    this.uMaterial.specular = gl.getUniformLocation( program, "mat.specular" );
    this.uMaterial.emissive = gl.getUniformLocation( program, "mat.emissive" );
    this.uMaterial.shininess = gl.getUniformLocation( program, "mat.shininess" );

    this.uLights = [];
    for ( var i = 0; i < 10; i++ ) {
      this.uLights[i] = new ShaderLightProperties();
      this.uLights[i].position = gl.getUniformLocation( program, "lights[" + i + "].position" );
      this.uLights[i].color = gl.getUniformLocation( program, "lights[" + i + "].color" );
      this.uLights[i].enabled = gl.getUniformLocation( program, "lights[" + i + "].enabled" );
    }
  }

  compileShaderProgram( vs: string, fs: string ): WebGLProgram {
    var gl = this.context;
    if ( gl ) {
      var vertexShader = gl.createShader( gl.VERTEX_SHADER );
      gl.shaderSource( vertexShader, vs );
      gl.compileShader( vertexShader );

      if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
        console.log( "An error occurred compiling the vertex shader: " + gl.getShaderInfoLog( vertexShader ) );
        return null;
      }

      var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
      gl.shaderSource( fragmentShader, fs );
      gl.compileShader( fragmentShader );

      if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
        console.log( "An error occurred compiling the fragment shader: " + gl.getShaderInfoLog( fragmentShader ) );
        return null;
      }

      // Create the shader program
      var program = gl.createProgram();
      gl.attachShader( program, vertexShader );
      gl.attachShader( program, fragmentShader );
      // force aVertexPosition to be bound to 0 to avoid perf penalty
      gl.bindAttribLocation( program, 0, "aVertexPosition" );
      gl.linkProgram( program );

      if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        console.log( "Unable to initialize the shader program." + gl.getProgramInfoLog( program ) );
      }

      return program;
    }
    return null;
  }

  update() {
    var scene = Scene.getActiveScene();
    if ( scene ) {
      scene.renderables.forEach( p => {
        if ( p.renderData.dirty ) {
          p.rebuildRenderData();
          this.dirty = true;
        }
      } );
    }
  }

  render() {
    var gl = this.context;
    if ( gl ) {
      if ( this.dirty ) {

        //
        // CLEAR
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        //
        // DRAW
        var scene = Scene.getActiveScene();
        if ( scene ) {

          // set up constant uniforms/matrix stacks/etc
          let perspective = gml.makePerspective( gml.fromDegrees( 45 ), 640.0/480.0, 0.1, 100.0 );

          var mvStack = [];
          if ( this.camera != null ) {
            mvStack.push( this.camera.matrix );
          } else {
            mvStack.push( gml.Mat4.identity() );
          }

          scene.renderables.forEach( ( p, i ) => {
            if ( p.material instanceof BlinnPhongMaterial ) {
              gl.useProgram( this.phongProgram );
              this.cacheLitShaderProgramLocations( this.phongProgram );
            } else if ( p.material instanceof DebugMaterial ) {
              gl.useProgram( this.debugProgram );
              this.cacheLitShaderProgramLocations( this.debugProgram );
            }

            scene.lights.forEach( ( l, i ) => {
              gl.uniform4fv( this.uLights[i].position, l.position.v );
              gl.uniform4fv( this.uLights[i].color, l.color.v );
              gl.uniform1i( this.uLights[i].enabled, l.enabled ? 1 : 0 );
            } );

            gl.uniformMatrix4fv( this.uPerspective, false, perspective.Float32Array );

            let primitiveModelView = p.transform.mul( mvStack[ mvStack.length - 1 ] );
            gl.uniformMatrix4fv( this.uModelView, false, primitiveModelView.Float32Array );

            // the normal matrix is defined as the upper 3x3 block of transpose( inverse( model-view ) )
            let primitiveNormalMatrix = primitiveModelView.invert().transpose().mat3;
            gl.uniformMatrix3fv( this.uNormal, false, primitiveNormalMatrix.Float32Array );

            gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
            gl.bufferData( gl.ARRAY_BUFFER, p.renderData.vertices, gl.STATIC_DRAW );
            gl.vertexAttribPointer( this.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, p.renderData.indices, gl.STATIC_DRAW );
            if ( !p.renderData.isTextureMapped ) {
              gl.uniform4fv( this.uMaterial.diffuse, [ 1, 1, 1, 1 ] );
            }

            gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexNormalBuffer );
            gl.bufferData( gl.ARRAY_BUFFER, p.renderData.normals, gl.STATIC_DRAW );
            gl.vertexAttribPointer( this.aVertexNormal, 3, gl.FLOAT, false, 0, 0 );

            gl.drawElements( gl.TRIANGLES, p.renderData.indices.length, gl.UNSIGNED_SHORT, 0 );
          } );
        }

        this.dirty = false;
      }
    }
  }

  setCamera( camera: Camera ) {
    this.camera = camera;
  }
}
