enum SHADERTYPE {
  SIMPLE_VERTEX,
  LAMBERT_FRAGMENT,
  BLINN_PHONG_FRAGMENT,
  DEBUG_VERTEX,
  DEBUG_FRAGMENT,
  OREN_NAYAR_FRAGMENT,
  COOK_TORRANCE_FRAGMENT,
  COOK_TORRANCE_FRAGMENT_NO_EXT,
  UTILS,
  SKYBOX_VERTEX,
  SKYBOX_FRAG,
  SKY_FRAG,
  CUBE_SH_FRAG,
  PASSTHROUGH_VERT,
  WATER_VERT,
  SS_QUAD_VERT,
  WATER_FRAG,
  WATER_SS_FRAG,
  NOISE_WRITER_FRAG,
  VOLUME_VIEWER_FRAG,
};

enum SHADER_PROGRAM {
  DEBUG,
  LAMBERT,
  OREN_NAYAR,
  BLINN_PHONG,
  COOK_TORRANCE,
  SKYBOX,
  SKY,
  WATER,
  WATER_SS,
  CUBE_SH,
  NOISE_WRITER,
  VOLUME_VIEWER,
};

enum PASS {
  SHADOW,
  STANDARD_FORWARD,
};

enum IRRADIANCE_PASS {
  SH_COMPUTE,
  IRRADIANCE_COMPUTE,
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
      if ( !isNaN( <any> t ) ) {
        this.files[ t ] = new ShaderFile();
      }
    }
    this.loadShaders();
  }

  loadShaders() {
    this.asyncLoadShader( "basic.vert"                , SHADERTYPE.SIMPLE_VERTEX                 , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "debug.vert"                , SHADERTYPE.DEBUG_VERTEX                  , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "lambert.frag"              , SHADERTYPE.LAMBERT_FRAGMENT              , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "blinn-phong.frag"          , SHADERTYPE.BLINN_PHONG_FRAGMENT          , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "debug.frag"                , SHADERTYPE.DEBUG_FRAGMENT                , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "oren-nayar.frag"           , SHADERTYPE.OREN_NAYAR_FRAGMENT           , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "cook-torrance.frag"        , SHADERTYPE.COOK_TORRANCE_FRAGMENT        , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "cook-torrance-legacy.frag" , SHADERTYPE.COOK_TORRANCE_FRAGMENT_NO_EXT , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "utils.frag"                , SHADERTYPE.UTILS                         , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "skybox.vert"               , SHADERTYPE.SKYBOX_VERTEX                 , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "skybox.frag"               , SHADERTYPE.SKYBOX_FRAG                   , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "sky.frag"                  , SHADERTYPE.SKY_FRAG                      , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "cube-sh.frag"              , SHADERTYPE.CUBE_SH_FRAG                  , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "passthrough.vert"          , SHADERTYPE.PASSTHROUGH_VERT              , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "water.vert"                , SHADERTYPE.WATER_VERT                    , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "water.frag"                , SHADERTYPE.WATER_FRAG                    , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "screenspacequad.vert"      , SHADERTYPE.SS_QUAD_VERT                  , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "water_screenspace.frag"    , SHADERTYPE.WATER_SS_FRAG                 , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "noise_writer.frag"         , SHADERTYPE.NOISE_WRITER_FRAG             , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "volume_viewer.frag"        , SHADERTYPE.VOLUME_VIEWER_FRAG            , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
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
      if ( !isNaN( <any> v ) ) {
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
  colorMap: WebGLUniformLocation;
}

class ShaderLightProperties {
  position: WebGLUniformLocation;
  color: WebGLUniformLocation;
  enabled: WebGLUniformLocation;
  radius: WebGLUniformLocation;
}

class ShaderUniforms {
  aVertexPosition: number;
  aVertexNormal: number;
  aVertexTexCoord: number;
  uModelView: WebGLUniformLocation;
  uView: WebGLUniformLocation;
  uModelToWorld: WebGLUniformLocation;
  uPerspective: WebGLUniformLocation;
  uNormalModelView: WebGLUniformLocation;
  uNormalWorld: WebGLUniformLocation;
  uInverseProjection: WebGLUniformLocation;
  uInverseView: WebGLUniformLocation;
  uCameraPos: WebGLUniformLocation;
  uEnvMap: WebGLUniformLocation;
  uVolume: WebGLUniformLocation;
  uProcSky: WebGLUniformLocation;
  uIrradianceMap: WebGLUniformLocation;
  uEnvironmentMipMaps: WebGLUniformLocation;
  uTime: WebGLUniformLocation;
  uCloudiness: WebGLUniformLocation;
  uCloudSpeed: WebGLUniformLocation;
  uMaterial: ShaderMaterialProperties;
  uLights: ShaderLightProperties[];
  uNoiseLayer: WebGLUniformLocation;
  uPerlinNoise: WebGLUniformLocation;
  uWorleyNoise: WebGLUniformLocation;

  constructor() {}
}

class ShaderProgramData {
  program: WebGLProgram;
  uniforms: ShaderUniforms;
  vert: string;
  frag: string;
  constructor( vert: string, frag: string ) {
    this.vert = vert;
    this.frag = frag;
    this.program = null;
    this.uniforms = new ShaderUniforms();
  }
}

class Renderer {
  viewportW: number;
  viewportH: number;

  elementIndexExtension;

  shaderLODExtension; // TODO deleteme

  camera: Camera;
  context: WebGLRenderingContext & WebGL2RenderingContext;

  // shader programs
  // the currently enabled program
  currentProgram: SHADER_PROGRAM;

  // shadow frame buffer
  depthTextureExtension;
  shadowDepthTexture: WebGLTexture;
  shadowFramebuffer: WebGLFramebuffer;

  // procedural environment map generation
  environmentMapFramebuffer: WebGLFramebuffer;
  environmentMapSize: number;

  // irradiance map generation
  envMapSHTexture: WebGLTexture;
  envMapSHFrameBuffer: WebGLFramebuffer;

  programData: ShaderProgramData[];

  dirty: boolean; // UNUSED

  repo: ShaderRepository;

  constructor( viewportElement: HTMLCanvasElement, sr: ShaderRepository, backgroundColor: gml.Vec4 = new gml.Vec4( 0, 0, 0, 1 ) ) {
    this.repo = sr;

    var gl = viewportElement.getContext( "webgl2" ) as any;

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
    gl.enable( gl.BLEND );                                       // Enable blending
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );

    this.context = gl;
    var success = true;
    if ( !this.context ) {
      alert( "Unable to initialize WebGL. Your browser may not support it" );
      success = false;
    }

    this.shaderLODExtension = gl.getExtension( "EXT_shader_texture_lod" );
    this.elementIndexExtension = gl.getExtension( "OES_element_index_uint" );

    this.programData = [];

    // compile phong program
    let phongProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source
                                                , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.BLINN_PHONG_FRAGMENT ].source );
    if ( phongProgram == null ) {
      alert( "Phong shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.BLINN_PHONG ] = new ShaderProgramData( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.BLINN_PHONG_FRAGMENT ].source );
    this.programData[ SHADER_PROGRAM.BLINN_PHONG ].program = phongProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.BLINN_PHONG );

    let lambertProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source
                                                  , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.LAMBERT_FRAGMENT ].source );
    if ( lambertProgram == null ) {
      alert( "Lambert shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.LAMBERT ] = new ShaderProgramData( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.LAMBERT_FRAGMENT ].source );
    this.programData[ SHADER_PROGRAM.LAMBERT ].program = lambertProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.LAMBERT );

    let debugProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.DEBUG_VERTEX ].source
                                                , sr.files[ SHADERTYPE.DEBUG_FRAGMENT ].source );
    if ( debugProgram == null ) {
      alert( "Debug shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.DEBUG ] = new ShaderProgramData( sr.files[ SHADERTYPE.DEBUG_VERTEX ].source, sr.files[ SHADERTYPE.DEBUG_FRAGMENT ].source );
    this.programData[ SHADER_PROGRAM.DEBUG ].program = debugProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.DEBUG );

    let orenNayarProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source
                                                    , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.OREN_NAYAR_FRAGMENT ].source );
    if ( orenNayarProgram == null ) {
      alert( "Oren-Nayar shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.OREN_NAYAR ] = new ShaderProgramData( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.OREN_NAYAR_FRAGMENT ].source );
    this.programData[ SHADER_PROGRAM.OREN_NAYAR ].program = orenNayarProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.OREN_NAYAR );

    let cookTorranceProgram = null;
    if ( this.shaderLODExtension != null ) {
      cookTorranceProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source
                                                     , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.COOK_TORRANCE_FRAGMENT ].source );
    } else {
      cookTorranceProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source
                                                     , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.COOK_TORRANCE_FRAGMENT_NO_EXT ].source );
    }
    if ( cookTorranceProgram == null ) {
      alert( "Cook-Torrance shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.COOK_TORRANCE ] = new ShaderProgramData( sr.files[ SHADERTYPE.SIMPLE_VERTEX ].source, sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.COOK_TORRANCE_FRAGMENT_NO_EXT ].source );
    this.programData[ SHADER_PROGRAM.COOK_TORRANCE ].program = cookTorranceProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.COOK_TORRANCE );

    let skyboxProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SKYBOX_VERTEX ].source
                                                 , sr.files[ SHADERTYPE.SKYBOX_FRAG ].source );
    if ( skyboxProgram == null ) {
      alert( "Skybox shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.SKYBOX ] = new ShaderProgramData( sr.files[ SHADERTYPE.SKYBOX_VERTEX ].source, sr.files[ SHADERTYPE.SKYBOX_FRAG ].source );
    this.programData[ SHADER_PROGRAM.SKYBOX ].program = skyboxProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.SKYBOX );

    let skyProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SKYBOX_VERTEX ].source
                                              , sr.files[ SHADERTYPE.SKY_FRAG ].source );
    if ( skyProgram == null ) {
      alert( "Sky shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.SKY ] = new ShaderProgramData( sr.files[ SHADERTYPE.SKYBOX_VERTEX ].source, sr.files[ SHADERTYPE.SKY_FRAG ].source );
    this.programData[ SHADER_PROGRAM.SKY ].program = skyProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.SKY );

    let waterProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.WATER_VERT ].source
                                                , sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.WATER_FRAG ].source );
    if ( waterProgram == null ) {
      alert( "Water shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.WATER ] = new ShaderProgramData( sr.files[ SHADERTYPE.WATER_VERT ].source, sr.files[ SHADERTYPE.UTILS ].source + sr.files[ SHADERTYPE.WATER_FRAG ].source );
    this.programData[ SHADER_PROGRAM.WATER ].program = waterProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.WATER );

    let waterSSProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source
                                                  , sr.files[ SHADERTYPE.WATER_SS_FRAG ].source );

    if ( waterSSProgram == null ) {
      alert( "Screenspace water compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.WATER_SS ] = new ShaderProgramData( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source, sr.files[ SHADERTYPE.WATER_SS_FRAG ].source );
    this.programData[ SHADER_PROGRAM.WATER_SS ].program = waterSSProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.WATER_SS );

    let noiseWriterProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source
                                                      , sr.files[ SHADERTYPE.NOISE_WRITER_FRAG ].source );

    if ( noiseWriterProgram == null ) {
      alert( "Noise writer compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.NOISE_WRITER ] = new ShaderProgramData( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source, sr.files[ SHADERTYPE.NOISE_WRITER_FRAG ].source );
    this.programData[ SHADER_PROGRAM.NOISE_WRITER ].program = noiseWriterProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.NOISE_WRITER );

    let volumeViewerProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source
                                                       , sr.files[ SHADERTYPE.VOLUME_VIEWER_FRAG ].source );

    if ( volumeViewerProgram == null ) {
      alert( "Volume viewer compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.VOLUME_VIEWER ] = new ShaderProgramData( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source, sr.files[ SHADERTYPE.VOLUME_VIEWER_FRAG ].source );
    this.programData[ SHADER_PROGRAM.VOLUME_VIEWER ].program = volumeViewerProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.VOLUME_VIEWER );

    let cubeMapSHProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.PASSTHROUGH_VERT ].source
                                                    , sr.files[ SHADERTYPE.CUBE_SH_FRAG ].source );

    if ( cubeMapSHProgram == null ) {
      alert( "Cube map shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.CUBE_SH ] = new ShaderProgramData( sr.files[ SHADERTYPE.PASSTHROUGH_VERT ].source, sr.files[ SHADERTYPE.CUBE_SH_FRAG ].source );
    this.programData[ SHADER_PROGRAM.CUBE_SH ].program = cubeMapSHProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.CUBE_SH );

    {
      /*
      this.envMapSHTexture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_2D, this.envMapSHTexture );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
      gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, 8, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );

      let sb = gl.createRenderbuffer();
      gl.bindRenderbuffer( gl.RENDERBUFFER, sb );
      gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 8, 1 );

      this.envMapSHFrameBuffer = gl.createFramebuffer();
      gl.bindFramebuffer( gl.FRAMEBUFFER, this.envMapSHFrameBuffer );
      gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.envMapSHTexture, 0 );
      gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, sb );
      */
    }
  }

  cacheLitShaderProgramLocations( sp: SHADER_PROGRAM ) {
    var gl = this.context;

    let program = this.programData[ sp ].program;
    let uniforms = this.programData[ sp ].uniforms;

    uniforms.aVertexPosition = gl.getAttribLocation( program, "aVertexPosition" );
    gl.enableVertexAttribArray( uniforms.aVertexPosition );

    uniforms.aVertexNormal = gl.getAttribLocation( program, "aVertexNormal" );
    if ( uniforms.aVertexNormal >= 0 ) {
      gl.enableVertexAttribArray( uniforms.aVertexNormal );
    }

    uniforms.aVertexTexCoord = gl.getAttribLocation( program, "aVertexTexCoord" );
    if ( uniforms.aVertexTexCoord >= 0 ) {
      gl.enableVertexAttribArray( uniforms.aVertexTexCoord );
    }

    uniforms.uModelView = gl.getUniformLocation( program, "uMVMatrix" );
    uniforms.uView = gl.getUniformLocation( program, "uVMatrix" );
    uniforms.uModelToWorld = gl.getUniformLocation( program, "uMMatrix" );
    uniforms.uPerspective = gl.getUniformLocation( program, "uPMatrix" );
    uniforms.uNormalModelView = gl.getUniformLocation( program, "uNormalMVMatrix" );
    uniforms.uNormalWorld = gl.getUniformLocation( program, "uNormalWorldMatrix" );
    uniforms.uInverseProjection = gl.getUniformLocation( program, "uInverseProjectionMatrix" );
    uniforms.uInverseView = gl.getUniformLocation( program, "uInverseViewMatrix" );
    uniforms.uCameraPos = gl.getUniformLocation( program, "cPosition_World" );
    uniforms.uEnvMap = gl.getUniformLocation( program, "environment" );
    uniforms.uVolume = gl.getUniformLocation( program, "volume" );
    uniforms.uProcSky = gl.getUniformLocation( program, "proceduralSky" );
    uniforms.uIrradianceMap = gl.getUniformLocation( program, "irradiance" );
    uniforms.uEnvironmentMipMaps = gl.getUniformLocation( program, "environmentMipMaps" );
    uniforms.uTime = gl.getUniformLocation( program, "uTime" );
    uniforms.uCloudiness = gl.getUniformLocation( program, "uCloudiness" );
    uniforms.uCloudSpeed = gl.getUniformLocation( program, "uCloudSpeed" );
    uniforms.uNoiseLayer = gl.getUniformLocation( program, "uNoiseLayer" );
    uniforms.uPerlinNoise = gl.getUniformLocation( program, "uPerlinNoise" );
    uniforms.uWorleyNoise = gl.getUniformLocation( program, "uWorleyNoise" );

    uniforms.uMaterial = new ShaderMaterialProperties();
    uniforms.uMaterial.ambient = gl.getUniformLocation( program, "mat.ambient" );
    uniforms.uMaterial.diffuse = gl.getUniformLocation( program, "mat.diffuse" );
    uniforms.uMaterial.specular = gl.getUniformLocation( program, "mat.specular" );
    uniforms.uMaterial.emissive = gl.getUniformLocation( program, "mat.emissive" );
    uniforms.uMaterial.shininess = gl.getUniformLocation( program, "mat.shininess" );
    uniforms.uMaterial.roughness = gl.getUniformLocation( program, "mat.roughness" );
    uniforms.uMaterial.fresnel = gl.getUniformLocation( program, "mat.fresnel" );
    uniforms.uMaterial.colorMap = gl.getUniformLocation( program, "mat.colormap" );

    uniforms.uLights = [];
    for ( var i = 0; i < 10; i++ ) {
      uniforms.uLights[i] = new ShaderLightProperties();
      uniforms.uLights[i].position = gl.getUniformLocation( program, "lights[" + i + "].position" );
      uniforms.uLights[i].color = gl.getUniformLocation( program, "lights[" + i + "].color" );
      uniforms.uLights[i].enabled = gl.getUniformLocation( program, "lights[" + i + "].enabled" );
      uniforms.uLights[i].radius = gl.getUniformLocation( program, "lights[" + i + "].radius" );
    }
  }

  compileShaderProgram( vs: string, fs: string, suppressErrors: boolean = false ): WebGLProgram {
    var gl = this.context;
    if ( gl ) {
      var vertexShader = gl.createShader( gl.VERTEX_SHADER );
      gl.shaderSource( vertexShader, vs );
      gl.compileShader( vertexShader );

      if ( !suppressErrors && !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
        console.log( "An error occurred compiling the vertex shader: " + gl.getShaderInfoLog( vertexShader ) );
        return null;
      }

      var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
      gl.shaderSource( fragmentShader, fs );
      gl.compileShader( fragmentShader );

      if ( !suppressErrors && !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
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
        console.log( "Unable to initialize the shader program: " + gl.getProgramInfoLog( program ) );
        console.log( "Problematic vertex shader:\n" + vs );
        console.log( "Problematic fragment shader:\n" + fs );
      }

      return program;
    }
    return null;
  }

  update() { 
    let gl = this.context;
    let scene = Scene.getActiveScene();
    if ( scene ) {
      scene.renderables.forEach( p => {
        if ( p.renderData.dirty ) {
          p.rebuildRenderData( gl );
        }
      } );
    }
  }

  renderSceneEnvironment( gl: WebGL2RenderingContext, scene: Scene, mvStack: gml.Mat4[], viewportW, viewportH, perspective: gml.Mat4 = null ) {
    if ( perspective == null ) {
      perspective = gml.makePerspective( gml.fromDegrees( 45 ), viewportW / viewportH, 0.1, 100.0 );
    }

    if ( scene.environmentMap != null ) {
      this.useProgram( gl, SHADER_PROGRAM.SKYBOX );
    } else {
      this.useProgram( gl, SHADER_PROGRAM.SKY );
    }

    let shaderVariables = this.programData[ this.currentProgram ].uniforms;

    let fullscreen = new Quad();
    fullscreen.rebuildRenderData( gl );

    let inverseProjectionMatrix = perspective.invert();
    gl.uniformMatrix4fv( shaderVariables.uInverseProjection, false, inverseProjectionMatrix.m );

    let inverseViewMatrix = mvStack[ mvStack.length - 1 ].invert().mat3;
    gl.uniformMatrix3fv( shaderVariables.uInverseView, false, inverseViewMatrix.m );

    if ( this.camera != null ) {
      gl.uniform4fv( shaderVariables.uCameraPos, this.camera.matrix.translation.negate().v );
    }

    gl.uniform1f( shaderVariables.uTime, scene.time );

    gl.bindBuffer( gl.ARRAY_BUFFER, fullscreen.renderData.vertexBuffer );
    gl.vertexAttribPointer( shaderVariables.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, fullscreen.renderData.indexBuffer );

    if ( this.currentProgram == SHADER_PROGRAM.SKYBOX ) {
      gl.uniform1i( shaderVariables.uEnvMap, 0 );
      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.environmentMap.cubeMapTexture );
    }

    gl.drawElements( gl.TRIANGLES, fullscreen.renderData.indices.length, gl.UNSIGNED_INT, 0 );
  }

  renderScene( gl: WebGL2RenderingContext, scene: Scene, mvStack: gml.Mat4[], pass: PASS ) {
    let perspective = gml.makePerspective( gml.fromDegrees( 45 ), 640.0/480.0, 0.1, 1000.0 );

    scene.renderables.forEach( ( p, i ) => {
      if ( p.material instanceof BlinnPhongMaterial ) {
        this.useProgram( gl, SHADER_PROGRAM.BLINN_PHONG );

        let blinnphong = <BlinnPhongMaterial> p.material;
        let shaderVariables = this.programData[ SHADER_PROGRAM.BLINN_PHONG ].uniforms;

        gl.uniform4fv( shaderVariables.uMaterial.diffuse, blinnphong.diffuse.v );
        gl.uniform4fv( shaderVariables.uMaterial.ambient, blinnphong.ambient.v );
        gl.uniform4fv( shaderVariables.uMaterial.specular, blinnphong.specular.v );
        gl.uniform4fv( shaderVariables.uMaterial.emissive, blinnphong.emissive.v );
        gl.uniform1f ( shaderVariables.uMaterial.shininess, blinnphong.shininess );
      } else if ( p.material instanceof DebugMaterial ) {
        this.useProgram( gl, SHADER_PROGRAM.DEBUG );
      } else if ( p.material instanceof OrenNayarMaterial ) {
        this.useProgram( gl, SHADER_PROGRAM.OREN_NAYAR );

        let orennayar = <OrenNayarMaterial> p.material;
        let shaderVariables = this.programData[ SHADER_PROGRAM.OREN_NAYAR ].uniforms;

        gl.uniform4fv( shaderVariables.uMaterial.diffuse, orennayar.diffuse.v );
        gl.uniform1f ( shaderVariables.uMaterial.roughness, orennayar.roughness );
      } else if ( p.material instanceof LambertMaterial ) {
        this.useProgram( gl, SHADER_PROGRAM.LAMBERT );

        let lambert = <LambertMaterial> p.material;
        let shaderVariables = this.programData[ SHADER_PROGRAM.LAMBERT ].uniforms;
        gl.uniform4fv( shaderVariables.uMaterial.diffuse, lambert.diffuse.v );
      } else if ( p.material instanceof CookTorranceMaterial ) {
        this.useProgram( gl, SHADER_PROGRAM.COOK_TORRANCE );

        let cooktorrance = <CookTorranceMaterial> p.material;
        let shaderVariables = this.programData[ SHADER_PROGRAM.COOK_TORRANCE ].uniforms;
        gl.uniform4fv( shaderVariables.uMaterial.diffuse, cooktorrance.diffuse.v );
        gl.uniform4fv( shaderVariables.uMaterial.specular, cooktorrance.specular.v );
        gl.uniform1f ( shaderVariables.uMaterial.roughness, cooktorrance.roughness );
        gl.uniform1f ( shaderVariables.uMaterial.fresnel, cooktorrance.fresnel );
      } else if ( p.material instanceof WaterMaterial ) {
        if ( ( <WaterMaterial>p.material ).screenspace ) {
          this.useProgram( gl, SHADER_PROGRAM.WATER_SS );
          let shaderVariables = this.programData[ this.currentProgram ].uniforms
          gl.uniform1f( shaderVariables.uTime, scene.time );
          let inverseProjectionMatrix = perspective.invert();
          gl.uniformMatrix4fv( shaderVariables.uInverseProjection, false, inverseProjectionMatrix.m );
        } else {
          this.useProgram( gl, SHADER_PROGRAM.WATER );
          let shaderVariables = this.programData[ this.currentProgram ].uniforms
          gl.uniform1f( shaderVariables.uTime, scene.time );
        }
      } else if ( p.material instanceof NoiseMaterial ) {
        this.useProgram( gl, SHADER_PROGRAM.NOISE_WRITER );
        let shaderVariables = this.programData[ this.currentProgram ].uniforms
        gl.uniform1f( shaderVariables.uNoiseLayer, ( <NoiseMaterial> p.material ).layer );
      } else if ( p.material instanceof VolumeMaterial ) {
        let mat = p.material as VolumeMaterial;
        this.useProgram( gl, SHADER_PROGRAM.VOLUME_VIEWER );
        let shaderVariables = this.programData[ this.currentProgram ].uniforms
        gl.uniform1f( shaderVariables.uNoiseLayer, mat.layer );

        if ( mat.volumeTexture != null ) {
          gl.uniform1i( shaderVariables.uVolume, 0 );
          gl.activeTexture( gl.TEXTURE0 );
          gl.bindTexture( gl.TEXTURE_3D, mat.volumeTexture );
        }
      }

      let shaderVariables = this.programData[ this.currentProgram ].uniforms;
      scene.lights.forEach( ( l, i ) => {
        let lightpos = mvStack[ mvStack.length - 1 ].transform( l.position );
        gl.uniform4fv( shaderVariables.uLights[i].position, lightpos.v );
        gl.uniform4fv( shaderVariables.uLights[i].color, l.color.v );
        gl.uniform1i( shaderVariables.uLights[i].enabled, l.enabled ? 1 : 0 );
        gl.uniform1f( shaderVariables.uLights[i].radius, l.radius );
      } );

      gl.uniformMatrix4fv( shaderVariables.uPerspective, false, perspective.m );

      if ( this.camera != null ) {
        gl.uniform4fv( shaderVariables.uCameraPos, this.camera.matrix.translation.v );
      }

      let primitiveModelView = mvStack[ mvStack.length - 1 ].multiply( p.transform );
      gl.uniformMatrix4fv( shaderVariables.uModelView, false, primitiveModelView.m );
      gl.uniformMatrix4fv( shaderVariables.uModelToWorld, false, p.transform.m );
      gl.uniformMatrix4fv( shaderVariables.uView, false, mvStack[ mvStack.length - 1 ].m );

      // the normal matrix is defined as the upper 3x3 block of transpose( inverse( model-view ) )
      let normalMVMatrix = primitiveModelView.invert().transpose().mat3;
      gl.uniformMatrix3fv( shaderVariables.uNormalModelView, false, normalMVMatrix.m );

      let normalWorldMatrix = p.transform.invert().transpose().mat3;
      gl.uniformMatrix3fv( shaderVariables.uNormalWorld, false, normalWorldMatrix.m );

      let inverseViewMatrix = mvStack[ mvStack.length - 1 ].invert().mat3;
      gl.uniformMatrix3fv( shaderVariables.uInverseView, false, inverseViewMatrix.m );

      gl.bindBuffer( gl.ARRAY_BUFFER, p.renderData.vertexBuffer );
      gl.vertexAttribPointer( shaderVariables.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

      if ( shaderVariables.aVertexTexCoord >= 0 ) {
        gl.bindBuffer( gl.ARRAY_BUFFER, p.renderData.vertexTexCoordBuffer );
        gl.vertexAttribPointer( shaderVariables.aVertexTexCoord, 2, gl.FLOAT, false, 0, 0);
      }

      gl.bindBuffer( gl.ARRAY_BUFFER, p.renderData.vertexNormalBuffer );
      if ( shaderVariables.aVertexNormal >= 0 ) {
        gl.vertexAttribPointer( shaderVariables.aVertexNormal, 3, gl.FLOAT, false, 0, 0 );
      }

      gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, p.renderData.indexBuffer );

      if ( scene.environmentMap != null ) {
        gl.uniform1i( shaderVariables.uEnvMap, 0 ); // tells shader to refer to texture slot 1 for the uEnvMap uniform
        gl.activeTexture( gl.TEXTURE0 );
        gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.environmentMap.cubeMapTexture );
      }

      if ( scene.irradianceMap != null ) {
        gl.uniform1i( shaderVariables.uIrradianceMap, 1 ); // tells shader to look at texture slot 1 for the uEnvMap uniform
        gl.activeTexture( gl.TEXTURE1 );
        gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.irradianceMap.cubeMapTexture );
      }

      gl.drawElements( gl.TRIANGLES, p.renderData.indices.length, gl.UNSIGNED_INT, 0 );
    } );
  }

  useProgram( gl: WebGL2RenderingContext, program: SHADER_PROGRAM ) {
    gl.useProgram( this.programData[ program ].program );

    let shaderVariables = this.programData[ program ].uniforms;

    gl.disableVertexAttribArray( 0 );
    gl.disableVertexAttribArray( 1 );
    gl.disableVertexAttribArray( 2 );

    if ( shaderVariables.aVertexPosition >= 0 ) {
      gl.enableVertexAttribArray( shaderVariables.aVertexPosition );
    }

    if ( shaderVariables.aVertexNormal >= 0 ) {
      gl.enableVertexAttribArray( shaderVariables.aVertexNormal );
    }

    if ( shaderVariables.aVertexTexCoord >= 0 ) {
      gl.enableVertexAttribArray( shaderVariables.aVertexTexCoord );
    }

    this.currentProgram = program;
  }

  renderIrradianceFromScene( gl: WebGL2RenderingContext, scene: Scene, pass: IRRADIANCE_PASS ) {
    this.useProgram( gl, SHADER_PROGRAM.CUBE_SH );

    let fullscreen = new Quad();
    fullscreen.rebuildRenderData( gl );

    let shaderVariables = this.programData[ this.currentProgram ].uniforms;

    gl.uniformMatrix4fv( shaderVariables.uModelView, false, gml.Mat4.identity().m );
    gl.uniformMatrix3fv( shaderVariables.uNormalModelView, false, gml.Mat3.identity().m );
    gl.uniformMatrix4fv( shaderVariables.uPerspective, false, gml.Mat4.identity().m );
    
    gl.bindBuffer( gl.ARRAY_BUFFER, fullscreen.renderData.vertexBuffer );

    gl.bindBuffer( gl.ARRAY_BUFFER, fullscreen.renderData.vertexTexCoordBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, fullscreen.renderData.textureCoords, gl.STATIC_DRAW );
    gl.vertexAttribPointer( shaderVariables.aVertexTexCoord, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, fullscreen.renderData.indexBuffer );

    if ( scene.environmentMap != null ) {
      gl.uniform1i( shaderVariables.uEnvMap, 0 ); // tells GL to look at texture slot 0
      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.environmentMap.cubeMapTexture );
    }

    gl.drawElements( gl.TRIANGLES, fullscreen.renderData.indices.length, gl.UNSIGNED_SHORT, 0 );
  }

  renderFullScreenTexture( gl: WebGL2RenderingContext, texture: WebGLTexture ) {
    // this.useProgram( gl, SHADER_PROGRAM.UNLIT );

    let fullscreen = new Quad();
    fullscreen.rebuildRenderData( gl );

    let shaderVariables = this.programData[ this.currentProgram ].uniforms;

    gl.bindBuffer( gl.ARRAY_BUFFER, fullscreen.renderData.vertexBuffer );
    gl.vertexAttribPointer( shaderVariables.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, fullscreen.renderData.vertexTexCoordBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, fullscreen.renderData.textureCoords, gl.STATIC_DRAW );
    gl.vertexAttribPointer( shaderVariables.aVertexTexCoord, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, fullscreen.renderData.indexBuffer );

    gl.uniform1i( shaderVariables.uMaterial.colorMap, 0 );
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );

    gl.drawElements( gl.TRIANGLES, fullscreen.renderData.indices.length, gl.UNSIGNED_SHORT, 0 );
  }

  renderIrradiance() {
    var gl = this.context;
    if ( gl ) {
      var scene = Scene.getActiveScene();
      if ( scene ) {
        // SET UP ENVIRONMENT MAP
        let cubeMapTexture = null;
        if ( scene.environmentMap != null && scene.environmentMap.loaded && scene.environmentMap.cubeMapTexture == null ) {
          scene.environmentMap.generateCubeMapFromSources( gl );
        }

        //
        // COMPUTE SH COEFFICIENTS
        gl.bindFramebuffer( gl.FRAMEBUFFER, this.envMapSHFrameBuffer );
        gl.viewport( 0, 0, 8, 1 );
        gl.clear( gl.COLOR_BUFFER_BIT );
        this.renderIrradianceFromScene( gl, scene, IRRADIANCE_PASS.SH_COMPUTE );

        //
        // (DEBUG) SHOW SH IN SCENE
        gl.bindFramebuffer( gl.FRAMEBUFFER, null );
        gl.viewport( 0, 0, this.viewportW, this.viewportH );
        gl.clear( gl.COLOR_BUFFER_BIT );
        this.renderFullScreenTexture( gl, this.envMapSHTexture );
      }
    }
  }

  render() {
    var gl = this.context;
    if ( gl ) {
      //
      // DRAW
      var scene = Scene.getActiveScene();
      if ( scene ) {
        //
        // SET UP ENVIRONMENT MAP
        let cubeMapTexture = null;
        if ( scene.environmentMap != null && scene.environmentMap.loaded && scene.environmentMap.cubeMapTexture == null ) {
        }

        // 
        // GENERATE ENVIRONMENT MAP, IF NECESSARY
        if ( scene.hasEnvironment && scene.dynamicEnvironment ) {
          if ( scene.dynamicEnvironment ) {
            // render using specified shader
            // TODO: actually pass in shader into scene
            scene.generateEnvironmentMapFromShader( this, gl, this.programData[ SHADER_PROGRAM.SKY ].program, this.programData[ SHADER_PROGRAM.SKY ].uniforms );
          } else if ( scene.environmentMap.loaded && scene.environmentMap.cubeMapTexture == null ) {
            // generate static cube map from face images - we only do this once
            scene.environmentMap.generateCubeMapFromSources( gl );
          }
        }

        //
        // SET UP IRRADIANCE MAP
        // TODO implement
        let irradianceTexture = null;
        if ( scene.irradianceMap != null && scene.irradianceMap.loaded && scene.irradianceMap.cubeMapTexture == null ) {
          scene.irradianceMap.generateCubeMapFromSources( gl );
        }

        var mvStack: gml.Mat4[] = [];
        if ( this.camera != null ) {
          mvStack.push( this.camera.matrix );
        } else {
          mvStack.push( gml.Mat4.identity() );
        }

        // 
        // RENDER TO SCREEN
        gl.bindFramebuffer( gl.FRAMEBUFFER, null );
        gl.viewport( 0, 0, this.viewportW, this.viewportH );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // draw environment map
        if ( scene.hasEnvironment ) {
          this.renderSceneEnvironment( gl, scene, mvStack, this.viewportW, this.viewportH );
        }

        // draw scene
        gl.clear( gl.DEPTH_BUFFER_BIT );
        this.renderScene( gl, scene, mvStack, PASS.STANDARD_FORWARD );
      }
    }
  }

  setCamera( camera: Camera ) {
    this.camera = camera;
  }
};
