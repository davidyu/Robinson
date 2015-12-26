enum SHADERTYPE {
  SIMPLE_VERTEX,
  LAMBERT_FRAGMENT,
  BLINN_PHONG_FRAGMENT,
  UNLIT_FRAGMENT,
  DEBUG_VERTEX,
  DEBUG_FRAGMENT,
  OREN_NAYAR_FRAGMENT,
  COOK_TORRANCE_FRAGMENT,
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
    this.asyncLoadShader( "basic.vert"         , SHADERTYPE.SIMPLE_VERTEX          , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "debug.vert"         , SHADERTYPE.DEBUG_VERTEX           , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "unlit.frag"         , SHADERTYPE.UNLIT_FRAGMENT         , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "lambert.frag"       , SHADERTYPE.LAMBERT_FRAGMENT       , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "blinn-phong.frag"   , SHADERTYPE.BLINN_PHONG_FRAGMENT   , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "debug.frag"         , SHADERTYPE.DEBUG_FRAGMENT         , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "oren-nayar.frag"    , SHADERTYPE.OREN_NAYAR_FRAGMENT    , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "cook-torrance.frag" , SHADERTYPE.COOK_TORRANCE_FRAGMENT , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
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
  roughness: WebGLUniformLocation;
  fresnel: WebGLUniformLocation;
}

class ShaderLightProperties {
  position: WebGLUniformLocation;
  color: WebGLUniformLocation;
  enabled: WebGLUniformLocation;
  radius: WebGLUniformLocation;
}

class Renderer {
  camera: Camera;
  context: WebGLRenderingContext;
  vertexBuffer: WebGLBuffer;
  vertexColorBuffer: WebGLBuffer;
  vertexNormalBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;

  // shader programs
  lambertProgram: WebGLProgram;
  phongProgram: WebGLProgram;
  debugProgram: WebGLProgram;
  orenNayarProgram: WebGLProgram;
  cookTorranceProgram: WebGLProgram;

  // the currently enabled program
  currentProgram: WebGLProgram;

  aVertexPosition: number;
  aVertexNormal: number;
  uModelView: WebGLUniformLocation;
  uModelToWorld: WebGLUniformLocation;
  uPerspective: WebGLUniformLocation;
  uNormalModelView: WebGLUniformLocation;
  uNormalWorld: WebGLUniformLocation;

  uMaterial: ShaderMaterialProperties;
  uLights: ShaderLightProperties[];

  dirty: boolean;

  constructor( viewportElement: HTMLCanvasElement, sr: ShaderRepository, backgroundColor: gml.Vec4 = new gml.Vec4( 0, 0, 0, 1 ) ) {
    var gl = <WebGLRenderingContext>( viewportElement.getContext( "webgl" ) || viewportElement.getContext( "experimental-webgl" ) );

    gl.viewport( 0, 0, viewportElement.width, viewportElement.height );

    gl.clearColor( backgroundColor.r
                 , backgroundColor.g
                 , backgroundColor.b
                 , backgroundColor.a );

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
    this.phongProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.BLINN_PHONG_FRAGMENT ].source );
    if ( this.phongProgram == null ) {
      alert( "Phong shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.lambertProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.LAMBERT_FRAGMENT ].source );
    if ( this.lambertProgram == null ) {
      alert( "Lambert shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.debugProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.DEBUG_VERTEX ].source, sr.files[ SHADERTYPE.DEBUG_FRAGMENT ].source );
    if ( this.debugProgram == null ) {
      alert( "Debug shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.orenNayarProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.OREN_NAYAR_FRAGMENT ].source );
    if ( this.orenNayarProgram == null ) {
      alert( "Oren-Nayar shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.cookTorranceProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.COOK_TORRANCE_FRAGMENT ].source );
    if ( this.cookTorranceProgram == null ) {
      alert( "Cook-Torrance shader compilation failed. Please check the log for details." );
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

    this.uModelView = gl.getUniformLocation( program, "uMVMatrix" );
    this.uModelToWorld = gl.getUniformLocation( program, "uMMatrix" );
    this.uPerspective = gl.getUniformLocation( program, "uPMatrix" );
    this.uNormalModelView = gl.getUniformLocation( program, "uNormalMVMatrix" );
    this.uNormalWorld = gl.getUniformLocation( program, "uNormalWorldMatrix" );

    this.uMaterial = new ShaderMaterialProperties();
    this.uMaterial.ambient = gl.getUniformLocation( program, "mat.ambient" );
    this.uMaterial.diffuse = gl.getUniformLocation( program, "mat.diffuse" );
    this.uMaterial.specular = gl.getUniformLocation( program, "mat.specular" );
    this.uMaterial.emissive = gl.getUniformLocation( program, "mat.emissive" );
    this.uMaterial.shininess = gl.getUniformLocation( program, "mat.shininess" );
    this.uMaterial.roughness = gl.getUniformLocation( program, "mat.roughness" );
    this.uMaterial.fresnel = gl.getUniformLocation( program, "mat.fresnel" );

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
      // gl.bindAttribLocation( program, 0, "aVertexPosition" );
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

          // for each renderable, set up shader and shader parameters
          // lights, and buffers
          scene.renderables.forEach( ( p, i ) => {
            if ( p.material instanceof BlinnPhongMaterial ) {
              if ( this.currentProgram != this.phongProgram ) {
                gl.useProgram( this.phongProgram );
                this.cacheLitShaderProgramLocations( this.phongProgram );
                this.currentProgram = this.phongProgram;
              }

              let blinnphong = <BlinnPhongMaterial> p.material;
              gl.uniform4fv( this.uMaterial.diffuse, blinnphong.diffuse.v );
              gl.uniform4fv( this.uMaterial.ambient, blinnphong.ambient.v );
              gl.uniform4fv( this.uMaterial.specular, blinnphong.specular.v );
              gl.uniform4fv( this.uMaterial.emissive, blinnphong.emissive.v );
              gl.uniform1f ( this.uMaterial.shininess, blinnphong.shininess );
            } else if ( p.material instanceof DebugMaterial ) {
              if ( this.currentProgram != this.debugProgram ) {
                gl.useProgram( this.debugProgram );
                this.cacheLitShaderProgramLocations( this.debugProgram );
                this.currentProgram = this.debugProgram;
              }
            } else if ( p.material instanceof OrenNayarMaterial ) {
              if ( this.currentProgram != this.orenNayarProgram ) {
                gl.useProgram( this.orenNayarProgram );
                this.cacheLitShaderProgramLocations( this.orenNayarProgram );
                this.currentProgram = this.orenNayarProgram;
              }

              let orennayar = <OrenNayarMaterial> p.material;
              gl.uniform4fv( this.uMaterial.diffuse, orennayar.diffuse.v );
              gl.uniform1f ( this.uMaterial.roughness, orennayar.roughness );
            } else if ( p.material instanceof LambertMaterial ) {
              if ( this.currentProgram != this.lambertProgram ) {
                gl.useProgram( this.lambertProgram );
                this.cacheLitShaderProgramLocations( this.lambertProgram );
                this.currentProgram = this.lambertProgram;
              }

              let lambert = <LambertMaterial> p.material;
              gl.uniform4fv( this.uMaterial.diffuse, lambert.diffuse.v );
            } else if ( p.material instanceof CookTorranceMaterial ) {
              if ( this.currentProgram != this.cookTorranceProgram ) {
                gl.useProgram( this.cookTorranceProgram );
                this.cacheLitShaderProgramLocations( this.cookTorranceProgram );
                this.currentProgram = this.cookTorranceProgram;
              }

              let cooktorrance = <CookTorranceMaterial> p.material;
              gl.uniform4fv( this.uMaterial.diffuse, cooktorrance.diffuse.v );
              gl.uniform4fv( this.uMaterial.specular, cooktorrance.specular.v );
              gl.uniform1f ( this.uMaterial.roughness, cooktorrance.roughness );
              gl.uniform1f ( this.uMaterial.fresnel, cooktorrance.fresnel );
            }

            scene.lights.forEach( ( l, i ) => {
              let lightpos = mvStack[ mvStack.length - 1 ].transform( l.position );
              gl.uniform4fv( this.uLights[i].position, lightpos.v );
              gl.uniform4fv( this.uLights[i].color, l.color.v );
              gl.uniform1i( this.uLights[i].enabled, l.enabled ? 1 : 0 );
              gl.uniform1f( this.uLights[i].radius, l.radius );
            } );

            gl.uniformMatrix4fv( this.uPerspective, false, perspective.m );

            let primitiveModelView = mvStack[ mvStack.length - 1 ].multiply( p.transform );
            gl.uniformMatrix4fv( this.uModelView, false, primitiveModelView.m );
            gl.uniformMatrix4fv( this.uModelToWorld, false, p.transform.m );

            // the normal matrix is defined as the upper 3x3 block of transpose( inverse( model-view ) )
            let normalMVMatrix = primitiveModelView.invert().transpose().mat3;
            gl.uniformMatrix3fv( this.uNormalModelView, false, normalMVMatrix.m );

            let normalWorldMatrix = p.transform.invert().transpose().mat3;
            gl.uniformMatrix3fv( this.uNormalWorld, false, normalWorldMatrix.m );

            gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
            gl.bufferData( gl.ARRAY_BUFFER, p.renderData.vertices, gl.STATIC_DRAW );
            gl.vertexAttribPointer( this.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

            gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
            gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, p.renderData.indices, gl.STATIC_DRAW );
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
    this.dirty = true;
  }
}
