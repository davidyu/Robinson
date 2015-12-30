enum SHADERTYPE {
  SIMPLE_VERTEX,
  LAMBERT_FRAGMENT,
  BLINN_PHONG_FRAGMENT,
  UNLIT_FRAGMENT,
  DEBUG_VERTEX,
  DEBUG_FRAGMENT,
  OREN_NAYAR_FRAGMENT,
  COOK_TORRANCE_FRAGMENT,
  UTILS,
  SKYBOX_VERTEX,
  SKYBOX_FRAG,
};

enum PASS {
  SHADOW,
  STANDARD_FORWARD,
};

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
    this.asyncLoadShader( "utils.frag"         , SHADERTYPE.UTILS                  , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "skybox.vert"        , SHADERTYPE.SKYBOX_VERTEX          , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "skybox.frag"        , SHADERTYPE.SKYBOX_FRAG            , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
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
  viewportW: number;
  viewportH: number;

  shaderLODExtension;

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
  shadowmapProgram: WebGLProgram;
  skyboxProgram: WebGLProgram;

  // the currently enabled program
  currentProgram: WebGLProgram;

  // shadow frame buffer
  depthTextureExtension;
  shadowDepthTexture: WebGLTexture;
  shadowFramebuffer: WebGLFramebuffer;
  shadowmapSize: number;

  aVertexPosition: number;
  aVertexNormal: number;
  uModelView: WebGLUniformLocation;
  uModelToWorld: WebGLUniformLocation;
  uPerspective: WebGLUniformLocation;
  uNormalModelView: WebGLUniformLocation;
  uNormalWorld: WebGLUniformLocation;
  uInverseProjection: WebGLUniformLocation;
  uInverseView: WebGLUniformLocation;
  uCameraPos: WebGLUniformLocation;
  uEnvMap: WebGLUniformLocation;
  uIrradianceMap: WebGLUniformLocation;

  uMaterial: ShaderMaterialProperties;
  uLights: ShaderLightProperties[];

  dirty: boolean;

  constructor( viewportElement: HTMLCanvasElement, sr: ShaderRepository, backgroundColor: gml.Vec4 = new gml.Vec4( 0, 0, 0, 1 ) ) {
    var gl = <WebGLRenderingContext>( viewportElement.getContext( "experimental-webgl" ) );

    gl.viewport( 0, 0, viewportElement.width, viewportElement.height );
    
    this.viewportW = viewportElement.width;
    this.viewportH = viewportElement.height;

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
    this.phongProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source
                                                 , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.BLINN_PHONG_FRAGMENT ].source );
    if ( this.phongProgram == null ) {
      alert( "Phong shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.lambertProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source
                                                   , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.LAMBERT_FRAGMENT ].source );
    if ( this.lambertProgram == null ) {
      alert( "Lambert shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.debugProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.DEBUG_VERTEX ].source
                                                 , sr.files[ SHADERTYPE.DEBUG_FRAGMENT ].source );
    if ( this.debugProgram == null ) {
      alert( "Debug shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.orenNayarProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source
                                                     , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.OREN_NAYAR_FRAGMENT ].source );
    if ( this.orenNayarProgram == null ) {
      alert( "Oren-Nayar shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.cookTorranceProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source
                                                        , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.COOK_TORRANCE_FRAGMENT ].source );
    if ( this.cookTorranceProgram == null ) {
      alert( "Cook-Torrance shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.skyboxProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SKYBOX_VERTEX ].source
                                                  , sr.files[ SHADERTYPE.SKYBOX_FRAG ].source );
    if ( this.skyboxProgram == null ) {
      alert( "Skybox shader compilation failed. Please check the log for details." );
      success = false;
    }

    // initialize shadowmap textures
    {
      this.depthTextureExtension = gl.getExtension( "WEBGL_depth_texture" );

      let size = 64;

      this.shadowFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer( gl.FRAMEBUFFER, this.shadowFramebuffer );

      let shadowColorTexture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, shadowColorTexture );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );

      this.shadowDepthTexture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, this.shadowDepthTexture );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null );

      this.shadowFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer( gl.FRAMEBUFFER, this.shadowFramebuffer );
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowColorTexture, 0 );
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.shadowDepthTexture, 0 );

      this.shadowmapSize = size;
    }

    this.shaderLODExtension = gl.getExtension( "EXT_shader_texture_lod" );

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
    if ( this.aVertexNormal >= 0 ) {
      gl.enableVertexAttribArray( this.aVertexNormal );
    }

    this.uModelView = gl.getUniformLocation( program, "uMVMatrix" );
    this.uModelToWorld = gl.getUniformLocation( program, "uMMatrix" );
    this.uPerspective = gl.getUniformLocation( program, "uPMatrix" );
    this.uNormalModelView = gl.getUniformLocation( program, "uNormalMVMatrix" );
    this.uNormalWorld = gl.getUniformLocation( program, "uNormalWorldMatrix" );
    this.uInverseProjection = gl.getUniformLocation( program, "uInverseProjectionMatrix" );
    this.uInverseView = gl.getUniformLocation( program, "uInverseViewMatrix" );
    this.uCameraPos = gl.getUniformLocation( program, "cPosition_World" );
    this.uEnvMap = gl.getUniformLocation( program, "environment" );
    this.uIrradianceMap = gl.getUniformLocation( program, "irradiance" );

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
      this.uLights[i].radius = gl.getUniformLocation( program, "lights[" + i + "].radius" );
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

  renderSceneEnvironment( gl: WebGLRenderingContext, scene: Scene, mvStack: gml.Mat4[] ) {
    // TODO unhardcode me
    let perspective = gml.makePerspective( gml.fromDegrees( 45 ), 640.0/480.0, 0.1, 100.0 );
    gl.useProgram( this.skyboxProgram );

    this.cacheLitShaderProgramLocations( this.skyboxProgram );
    this.currentProgram = this.skyboxProgram;

    let fullscreen = new Quad();
    fullscreen.rebuildRenderData();

    let inverseProjectionMatrix = perspective.invert();
    gl.uniformMatrix4fv( this.uInverseProjection, false, inverseProjectionMatrix.m );

    let inverseViewMatrix = mvStack[ mvStack.length - 1 ].invert().mat3;
    gl.uniformMatrix3fv( this.uInverseView, false, inverseViewMatrix.m );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, fullscreen.renderData.vertices, gl.STATIC_DRAW );
    gl.vertexAttribPointer( this.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, fullscreen.renderData.indices, gl.STATIC_DRAW );

    gl.uniform1i( this.uEnvMap, 0 );
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.environment.cubeMapTexture );

    gl.drawElements( gl.TRIANGLES, fullscreen.renderData.indices.length, gl.UNSIGNED_SHORT, 0 );
  }

  renderScene( gl: WebGLRenderingContext, scene: Scene, mvStack: gml.Mat4[], pass: PASS ) {

    let perspective = gml.makePerspective( gml.fromDegrees( 45 ), 640.0/480.0, 0.1, 100.0 );

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

      if ( this.camera != null ) {
        gl.uniform4fv( this.uCameraPos, this.camera.matrix.translation.v );
      }

      let primitiveModelView = mvStack[ mvStack.length - 1 ].multiply( p.transform );
      gl.uniformMatrix4fv( this.uModelView, false, primitiveModelView.m );
      gl.uniformMatrix4fv( this.uModelToWorld, false, p.transform.m );

      // the normal matrix is defined as the upper 3x3 block of transpose( inverse( model-view ) )
      let normalMVMatrix = primitiveModelView.invert().transpose().mat3;
      gl.uniformMatrix3fv( this.uNormalModelView, false, normalMVMatrix.m );

      let normalWorldMatrix = p.transform.invert().transpose().mat3;
      gl.uniformMatrix3fv( this.uNormalWorld, false, normalWorldMatrix.m );

      let inverseViewMatrix = mvStack[ mvStack.length - 1 ].invert().mat3;
      gl.uniformMatrix3fv( this.uInverseView, false, inverseViewMatrix.m );

      gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, p.renderData.vertices, gl.STATIC_DRAW );
      gl.vertexAttribPointer( this.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
      gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, p.renderData.indices, gl.STATIC_DRAW );
      gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexNormalBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, p.renderData.normals, gl.STATIC_DRAW );

      gl.vertexAttribPointer( this.aVertexNormal, 3, gl.FLOAT, false, 0, 0 );

      gl.uniform1i( this.uEnvMap, 0 );
      gl.uniform1i( this.uIrradianceMap, 1 );

      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.environment.cubeMapTexture );

      gl.activeTexture( gl.TEXTURE1 );
      gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.irradiance.cubeMapTexture );

      gl.drawElements( gl.TRIANGLES, p.renderData.indices.length, gl.UNSIGNED_SHORT, 0 );
    } );
  }

  bindCubeMapFace( gl: WebGLRenderingContext, face: number, image: HTMLImageElement ) {
    gl.texImage2D( face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  render() {
    var gl = this.context;
    if ( gl ) {
      if ( this.dirty ) {

        //
        // DRAW
        var scene = Scene.getActiveScene();
        if ( scene ) {

          //
          // SET UP ENVIRONMENT MAP
          let cubeMapTexture = null;
          if ( scene.environment != null && scene.environment.loaded && scene.environment.cubeMapTexture == null ) {
            let cubeMapTexture = gl.createTexture();
            gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubeMapTexture );

            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, scene.environment.faces[ CUBEMAPTYPE.POS_X ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, scene.environment.faces[ CUBEMAPTYPE.NEG_X ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, scene.environment.faces[ CUBEMAPTYPE.POS_Y ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, scene.environment.faces[ CUBEMAPTYPE.NEG_Y ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, scene.environment.faces[ CUBEMAPTYPE.POS_Z ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, scene.environment.faces[ CUBEMAPTYPE.NEG_Z ] );

            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

            scene.environment.cubeMapTexture = cubeMapTexture;
          }

          //
          // SET UP IRRADIANCE MAP
          let irradianceTexture = null;
          if ( scene.irradiance != null && scene.irradiance.loaded && scene.irradiance.cubeMapTexture == null ) {
            let cubeMapTexture = gl.createTexture();
            gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubeMapTexture );

            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, scene.irradiance.faces[ CUBEMAPTYPE.POS_X ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, scene.irradiance.faces[ CUBEMAPTYPE.NEG_X ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, scene.irradiance.faces[ CUBEMAPTYPE.POS_Y ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, scene.irradiance.faces[ CUBEMAPTYPE.NEG_Y ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, scene.irradiance.faces[ CUBEMAPTYPE.POS_Z ] );
            this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, scene.irradiance.faces[ CUBEMAPTYPE.NEG_Z ] );

            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

            scene.irradiance.cubeMapTexture = cubeMapTexture;
          }

          var mvStack: gml.Mat4[] = [];
          if ( this.camera != null ) {
            mvStack.push( this.camera.matrix );
          } else {
            mvStack.push( gml.Mat4.identity() );
          }

          // for each renderable, set up shader and shader parameters
          // lights, and buffers. For now, only render a single shadow map.

          //
          // RENDER TO SHADOW TEXTURE
          gl.bindFramebuffer( gl.FRAMEBUFFER, this.shadowFramebuffer );
          gl.viewport( 0, 0, this.shadowmapSize, this.shadowmapSize );
          gl.colorMask( false, false, false, false ); // shadow map; no need to touch colors
          gl.clear( gl.DEPTH_BUFFER_BIT );
          this.renderScene( gl, scene, mvStack, PASS.SHADOW );

          // 
          // RENDER TO SCREEN
          gl.bindFramebuffer( gl.FRAMEBUFFER, null );
          gl.viewport( 0, 0, this.viewportW, this.viewportH );
          gl.colorMask( true, true, true, true );
          gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

          // draw environment map
          this.renderSceneEnvironment( gl, scene, mvStack );

          // draw scene
          gl.clear( gl.DEPTH_BUFFER_BIT );
          this.renderScene( gl, scene, mvStack, PASS.STANDARD_FORWARD );
        }

        this.dirty = false;
      }
    }
  }

  setCamera( camera: Camera ) {
    this.camera = camera;
    this.dirty = true;
  }
};;
