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
  POST_PROCESS_FRAG,
  DEPTH_TEXTURE_FRAG
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
  WATER_SCREENSPACE,
  CUBE_SH,
  NOISE_WRITER,
  VOLUME_VIEWER,
  POST_PROCESS,
  RENDER_DEPTH_TEXTURE,
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
    this.asyncLoadShader( "post-process.frag"         , SHADERTYPE.POST_PROCESS_FRAG             , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } );
    this.asyncLoadShader( "depth-texture.frag"        , SHADERTYPE.DEPTH_TEXTURE_FRAG            , ( stype , contents ) => { this.shaderLoaded( stype , contents ); } ); 
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
  aMeshCoord: number;
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
  uWireframe: WebGLUniformLocation;
  uProcSky: WebGLUniformLocation;
  uIrradianceMap: WebGLUniformLocation;
  uTime: WebGLUniformLocation;
  uCloudiness: WebGLUniformLocation;
  uCloudSpeed: WebGLUniformLocation;
  uMaterial: ShaderMaterialProperties;
  uLights: ShaderLightProperties[];
  uNoiseLayer: WebGLUniformLocation;
  uCombinedNoiseVolume: WebGLUniformLocation;
  uColor: WebGLUniformLocation;
  uDepth: WebGLUniformLocation;
  uFocus: WebGLUniformLocation;

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
  repoV2: ShaderLibrary;

  enableTracing: boolean; // for debugging

  viewportW: number;
  viewportH: number;

  elementIndexExtension;
  shaderLODExtension;

  camera: Camera;
  context: WebGLRenderingContext & WebGL2RenderingContext;

  // TODO move me into debug module
  visualizeDepthBuffer: boolean;

  // shader programs
  // the currently enabled program
  currentProgram: SHADER_PROGRAM; // TODO remove me
  currentShader: CompiledProgramData;

  // procedural environment map generation
  environmentMapFramebuffer: WebGLFramebuffer;
  environmentMapSize: number;

  // irradiance map generation
  envMapSHTexture: WebGLTexture;
  envMapSHFrameBuffer: WebGLFramebuffer;

  postProcessColorTexture: WebGLTexture;
  postProcessDepthTexture: WebGLTexture;
  postProcessFramebuffer: WebGLFramebuffer;

  programData: ShaderProgramData[];

  repo: ShaderRepository;

  fullscreenQuad: Quad;

  constructor( viewportElement: HTMLCanvasElement, sr: ShaderRepository, backgroundColor: gml.Vec4 = new gml.Vec4( 0, 0, 0, 1 ) ) {
    this.repo = sr;
    this.repoV2 = new ShaderLibrary();

    var gl = viewportElement.getContext( "webgl2", { antialias: true } ) as any;

    if ( !gl ) return;

    this.repoV2.allShadersLoaded = ( lib: ShaderLibrary ): void => {
      // augment source files TODO preprocessor directives
      lib.sources[ "blinn-phong.frag" ] = lib.sources[ "utils.frag" ] + lib.sources[ "blinn-phong.frag" ];
      lib.sources[ "lambert.frag" ] = lib.sources[ "utils.frag" ] + lib.sources[ "lambert.frag" ];
      lib.sources[ "oren-nayar.frag" ] = lib.sources[ "utils.frag" ] + lib.sources[ "oren-nayar.frag" ];
      lib.sources[ "cook-torrance.frag" ] = lib.sources[ "utils.frag" ] + lib.sources[ "cook-torrance.frag" ];
      lib.sources[ "cook-torrance-legacy.frag" ] = lib.sources[ "utils.frag" ] + lib.sources[ "cook-torrance-legacy.frag" ];
      lib.sources[ "water.frag" ] = lib.sources[ "utils.frag" ] + lib.sources[ "water.frag" ];
      lib.sources[ "water-screenspace.frag" ] = lib.sources[ "utils.frag" ] + lib.sources[ "water-screenspace.frag" ];

      // compile and cache things
      let shader = null;

      shader = lib.compileProgram( gl, "debug.vert", "debug.frag", "debug" );
      if ( shader != null ) {
        shader.attributes[ "aVertexColor" ] = gl.getAttribLocation( shader.program, "aVertexColor" );
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexNormal" ] = gl.getAttribLocation( shader.program, "aVertexNormal" );
        shader.uniforms[ "uMVMatrix" ] = gl.getUniformLocation( shader.program, "uMVMatrix" );
        shader.uniforms[ "uPMatrix" ] = gl.getUniformLocation( shader.program, "uPMatrix" );
        shader.uniforms[ "uNormalWorldMatrix" ] = gl.getUniformLocation( shader.program, "uNormalWorldMatrix" );
        shader.setup = ( gl, attributes, uniforms ) => {
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexNormal );
          gl.disableVertexAttribArray( 2 );
        };
      }
      shader = lib.compileProgram( gl, "basic.vert", "blinn-phong.frag", "blinn-phong" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexNormal" ] = gl.getAttribLocation( shader.program, "aVertexNormal" );

        shader.uniforms[ "uMMatrix" ] = gl.getUniformLocation( shader.program, "uMMatrix" );
        shader.uniforms[ "uMVMatrix" ] = gl.getUniformLocation( shader.program, "uMVMatrix" );
        shader.uniforms[ "uPMatrix" ] = gl.getUniformLocation( shader.program, "uPMatrix" );
        shader.uniforms[ "uNormalMVMatrix" ] = gl.getUniformLocation( shader.program, "uNormalMVMatrix" );
        shader.uniforms[ "uNormalWorldMatrix" ] = gl.getUniformLocation( shader.program, "uNormalWorldMatrix" );
        shader.uniforms[ "uInverseViewMatrix" ] = gl.getUniformLocation( shader.program, "uInverseViewMatrix" );
        shader.uniforms[ "environment" ] = gl.getUniformLocation( shader.program, "environment" )
        shader.uniforms[ "irradiance" ] = gl.getUniformLocation( shader.program, "irradiance" )

        for ( var i = 0; i < 10; i++ ) {
          let lightUniform = {};
          lightUniform["position"] = gl.getUniformLocation( shader.program, "lights[" + i + "].position" );
          lightUniform["color"] = gl.getUniformLocation( shader.program, "lights[" + i + "].color" );
          lightUniform["enabled"] = gl.getUniformLocation( shader.program, "lights[" + i + "].enabled" );
          lightUniform["radius"] = gl.getUniformLocation( shader.program, "lights[" + i + "].radius" );
          shader.lightUniforms.push( lightUniform );
        }

        shader.uniforms[ "ambient" ] = gl.getUniformLocation( shader.program, "mat.ambient" );
        shader.uniforms[ "diffuse" ] = gl.getUniformLocation( shader.program, "mat.diffuse" );
        shader.uniforms[ "specular" ] = gl.getUniformLocation( shader.program, "mat.specular" );
        shader.uniforms[ "emissive" ] = gl.getUniformLocation( shader.program, "mat.emissive" );
        shader.uniforms[ "shininess" ] = gl.getUniformLocation( shader.program, "mat.shininess" );

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexNormal );
        };
      }
      shader = lib.compileProgram( gl, "basic.vert", "lambert.frag", "lambert" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexNormal" ] = gl.getAttribLocation( shader.program, "aVertexNormal" );

        shader.uniforms[ "uMMatrix" ] = gl.getUniformLocation( shader.program, "uMMatrix" );
        shader.uniforms[ "uMVMatrix" ] = gl.getUniformLocation( shader.program, "uMVMatrix" );
        shader.uniforms[ "uPMatrix" ] = gl.getUniformLocation( shader.program, "uPMatrix" );
        shader.uniforms[ "uNormalMVMatrix" ] = gl.getUniformLocation( shader.program, "uNormalMVMatrix" );
        shader.uniforms[ "uNormalWorldMatrix" ] = gl.getUniformLocation( shader.program, "uNormalWorldMatrix" );
        shader.uniforms[ "uInverseViewMatrix" ] = gl.getUniformLocation( shader.program, "uInverseViewMatrix" );
        shader.uniforms[ "environment" ] = gl.getUniformLocation( shader.program, "environment" )
        shader.uniforms[ "irradiance" ] = gl.getUniformLocation( shader.program, "irradiance" )

        for ( var i = 0; i < 10; i++ ) {
          let lightUniform = {};
          lightUniform["position"] = gl.getUniformLocation( shader.program, "lights[" + i + "].position" );
          lightUniform["color"] = gl.getUniformLocation( shader.program, "lights[" + i + "].color" );
          lightUniform["enabled"] = gl.getUniformLocation( shader.program, "lights[" + i + "].enabled" );
          lightUniform["radius"] = gl.getUniformLocation( shader.program, "lights[" + i + "].radius" );
          shader.lightUniforms.push( lightUniform );
        }

        shader.uniforms[ "diffuse" ] = gl.getUniformLocation( shader.program, "mat.diffuse" );

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexNormal );
        };
      }
      shader = lib.compileProgram( gl, "basic.vert", "oren-nayar.frag", "oren-nayar" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexNormal" ] = gl.getAttribLocation( shader.program, "aVertexNormal" );

        shader.uniforms[ "uMMatrix" ] = gl.getUniformLocation( shader.program, "uMMatrix" );
        shader.uniforms[ "uMVMatrix" ] = gl.getUniformLocation( shader.program, "uMVMatrix" );
        shader.uniforms[ "uPMatrix" ] = gl.getUniformLocation( shader.program, "uPMatrix" );
        shader.uniforms[ "uNormalMVMatrix" ] = gl.getUniformLocation( shader.program, "uNormalMVMatrix" );
        shader.uniforms[ "uNormalWorldMatrix" ] = gl.getUniformLocation( shader.program, "uNormalWorldMatrix" );
        shader.uniforms[ "uInverseViewMatrix" ] = gl.getUniformLocation( shader.program, "uInverseViewMatrix" );
        shader.uniforms[ "environment" ] = gl.getUniformLocation( shader.program, "environment" )
        shader.uniforms[ "irradiance" ] = gl.getUniformLocation( shader.program, "irradiance" )

        for ( var i = 0; i < 10; i++ ) {
          let lightUniform = {};
          lightUniform["position"] = gl.getUniformLocation( shader.program, "lights[" + i + "].position" );
          lightUniform["color"] = gl.getUniformLocation( shader.program, "lights[" + i + "].color" );
          lightUniform["enabled"] = gl.getUniformLocation( shader.program, "lights[" + i + "].enabled" );
          lightUniform["radius"] = gl.getUniformLocation( shader.program, "lights[" + i + "].radius" );
          shader.lightUniforms.push( lightUniform );
        }

        shader.uniforms[ "diffuse" ] = gl.getUniformLocation( shader.program, "mat.diffuse" );
        shader.uniforms[ "roughness" ] = gl.getUniformLocation( shader.program, "mat.roughness" );

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexNormal );
        };
      }
      if ( this.shaderLODExtension != null ) {
        shader = lib.compileProgram( gl, "basic.vert", "cook-torrance.frag", "cook-torrance" );
      } else {
        shader = lib.compileProgram( gl, "basic.vert", "cook-torrance-legacy.frag", "cook-torrance" );
      }
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexNormal" ] = gl.getAttribLocation( shader.program, "aVertexNormal" );

        shader.uniforms[ "uMMatrix" ] = gl.getUniformLocation( shader.program, "uMMatrix" );
        shader.uniforms[ "uMVMatrix" ] = gl.getUniformLocation( shader.program, "uMVMatrix" );
        shader.uniforms[ "uPMatrix" ] = gl.getUniformLocation( shader.program, "uPMatrix" );
        shader.uniforms[ "uNormalMVMatrix" ] = gl.getUniformLocation( shader.program, "uNormalMVMatrix" );
        shader.uniforms[ "uNormalWorldMatrix" ] = gl.getUniformLocation( shader.program, "uNormalWorldMatrix" );
        shader.uniforms[ "uInverseViewMatrix" ] = gl.getUniformLocation( shader.program, "uInverseViewMatrix" );
        shader.uniforms[ "environment" ] = gl.getUniformLocation( shader.program, "environment" )
        shader.uniforms[ "irradiance" ] = gl.getUniformLocation( shader.program, "irradiance" )

        for ( var i = 0; i < 10; i++ ) {
          let lightUniform = {};
          lightUniform["position"] = gl.getUniformLocation( shader.program, "lights[" + i + "].position" );
          lightUniform["color"] = gl.getUniformLocation( shader.program, "lights[" + i + "].color" );
          lightUniform["enabled"] = gl.getUniformLocation( shader.program, "lights[" + i + "].enabled" );
          lightUniform["radius"] = gl.getUniformLocation( shader.program, "lights[" + i + "].radius" );
          shader.lightUniforms.push( lightUniform );
        }

        shader.uniforms[ "diffuse" ] = gl.getUniformLocation( shader.program, "mat.diffuse" );
        shader.uniforms[ "specular" ] = gl.getUniformLocation( shader.program, "mat.specular" );
        shader.uniforms[ "roughness" ] = gl.getUniformLocation( shader.program, "mat.roughness" );
        shader.uniforms[ "fresnel" ] = gl.getUniformLocation( shader.program, "mat.fresnel" );

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexNormal );
        };
      }
      shader = lib.compileProgram( gl, "skybox.vert", "skybox.frag", "skybox" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.uniforms[ "environment" ] = gl.getUniformLocation( shader.program, "environment" )
        shader.uniforms[ "uInverseProjectionMatrix" ] = gl.getUniformLocation( shader.program, "uInverseProjectionMatrix" );
        shader.uniforms[ "uInverseViewMatrix" ] = gl.getUniformLocation( shader.program, "uInverseViewMatrix" );
        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
        };
      }

      shader = lib.compileProgram( gl, "skybox.vert", "sky.frag", "sky" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.uniforms[ "uInverseProjectionMatrix" ] = gl.getUniformLocation( shader.program, "uInverseProjectionMatrix" );
        shader.uniforms[ "uInverseViewMatrix" ] = gl.getUniformLocation( shader.program, "uInverseViewMatrix" );
        shader.uniforms[ "uTime" ] = gl.getUniformLocation( shader.program, "uTime" )
        shader.uniforms[ "uCombinedNoiseVolume" ] = gl.getUniformLocation( shader.program, "uCombinedNoiseVolume" )
        shader.uniforms[ "uCloudiness" ] = gl.getUniformLocation( shader.program, "uCloudiness" )
        shader.uniforms[ "uCloudSpeed" ] = gl.getUniformLocation( shader.program, "uCloudSpeed" )
        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
        };
      }

      shader = lib.compileProgram( gl, "water.vert", "water.frag", "water" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexNormal" ] = gl.getAttribLocation( shader.program, "aVertexNormal" );
        shader.attributes[ "aMeshCoord" ] = gl.getAttribLocation( shader.program, "aMeshCoord" );

        shader.uniforms[ "uMMatrix" ] = gl.getUniformLocation( shader.program, "uMMatrix" );
        shader.uniforms[ "uVMatrix" ] = gl.getUniformLocation( shader.program, "uVMatrix" );
        shader.uniforms[ "uPMatrix" ] = gl.getUniformLocation( shader.program, "uPMatrix" );
        shader.uniforms[ "uInverseProjectionMatrix" ] = gl.getUniformLocation( shader.program, "uInverseProjectionMatrix" );
        shader.uniforms[ "uInverseViewMatrix" ] = gl.getUniformLocation( shader.program, "uInverseViewMatrix" );
        shader.uniforms[ "uNormalMVMatrix" ] = gl.getUniformLocation( shader.program, "uNormalMVMatrix" );
        shader.uniforms[ "uTime" ] = gl.getUniformLocation( shader.program, "uTime" );
        shader.uniforms[ "cPosition_World" ] = gl.getUniformLocation( shader.program, "cPosition_World" );
        shader.uniforms[ "uCloudSpeed" ] = gl.getUniformLocation( shader.program, "uCloudSpeed" );
        shader.uniforms[ "uCloudiness" ] = gl.getUniformLocation( shader.program, "uCloudiness" );
        shader.uniforms[ "uDrawWireframe" ] = gl.getUniformLocation( shader.program, "uDrawWireframe" );
        shader.uniforms[ "environment" ] = gl.getUniformLocation( shader.program, "environment" )

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aMeshCoord );
        };
      }
      shader = lib.compileProgram( gl, "screenspacequad.vert", "water_screenspace.frag", "water-screenspace" );
      shader = lib.compileProgram( gl, "screenspacequad.vert", "noise_writer.frag", "noisewriter" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexTexCoord" ] = gl.getAttribLocation( shader.program, "aVertexTexCoord" );

        shader.uniforms[ "uNoiseLayer" ] = gl.getUniformLocation( shader.program, "uNoiseLayer" );

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexTexCoord );
        };
      }
      shader = lib.compileProgram( gl, "screenspacequad.vert", "volume_viewer.frag", "volume-viewer" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexTexCoord" ] = gl.getAttribLocation( shader.program, "aVertexTexCoord" );

        shader.uniforms[ "uNoiseLayer" ] = gl.getUniformLocation( shader.program, "uNoiseLayer" );
        shader.uniforms[ "volume" ] = gl.getUniformLocation( shader.program, "volume" );

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexTexCoord );
        };
      }
      shader = lib.compileProgram( gl, "screenspacequad.vert", "depth-texture.frag", "render-depthtexture" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexTexCoord" ] = gl.getAttribLocation( shader.program, "aVertexTexCoord" );

        shader.uniforms[ "screen_depth" ] = gl.getUniformLocation( shader.program, "screen_depth" );
        shader.uniforms[ "uVMatrix" ] = gl.getUniformLocation( shader.program, "uVMatrix" );

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexTexCoord );
        };
      }

      shader = lib.compileProgram( gl, "screenspacequad.vert", "post-process.frag", "post-process" );
      if ( shader != null ) {
        shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
        shader.attributes[ "aVertexTexCoord" ] = gl.getAttribLocation( shader.program, "aVertexTexCoord" );

        shader.uniforms[ "screen_depth" ] = gl.getUniformLocation( shader.program, "screen_depth" );
        shader.uniforms[ "screen_color" ] = gl.getUniformLocation( shader.program, "screen_color" );

        shader.uniforms[ "uInverseProjectionMatrix" ] = gl.getUniformLocation( shader.program, "uInverseProjectionMatrix" );
        shader.uniforms[ "uInverseViewMatrix" ] = gl.getUniformLocation( shader.program, "uInverseViewMatrix" );
        shader.uniforms[ "uVMatrix" ] = gl.getUniformLocation( shader.program, "uVMatrix" );
        shader.uniforms[ "focus" ] = gl.getUniformLocation( shader.program, "focus" );

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexTexCoord );
        };
      }

      shader = lib.compileProgram( gl, "passthrough.vert", "cube-sh.frag", "cube-spherical-harmonics" );
    }

    this.repoV2.loadShader( "basic.vert" );
    this.repoV2.loadShader( "debug.vert" );
    this.repoV2.loadShader( "passthrough.vert" );
    this.repoV2.loadShader( "lambert.frag" );
    this.repoV2.loadShader( "blinn-phong.frag" );
    this.repoV2.loadShader( "debug.frag" );
    this.repoV2.loadShader( "oren-nayar.frag" );
    this.repoV2.loadShader( "cook-torrance.frag" );
    this.repoV2.loadShader( "cook-torrance-legacy.frag" );
    this.repoV2.loadShader( "utils.frag" );
    this.repoV2.loadShader( "skybox.vert" );
    this.repoV2.loadShader( "skybox.frag" );
    this.repoV2.loadShader( "sky.frag" );
    this.repoV2.loadShader( "cube-sh.frag" );
    this.repoV2.loadShader( "water.vert" );
    this.repoV2.loadShader( "water.frag" );
    this.repoV2.loadShader( "screenspacequad.vert" );
    this.repoV2.loadShader( "water_screenspace.frag" );
    this.repoV2.loadShader( "noise_writer.frag" );
    this.repoV2.loadShader( "volume_viewer.frag" );
    this.repoV2.loadShader( "post-process.frag" );
    this.repoV2.loadShader( "depth-texture.frag" ); 


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

    this.programData[ SHADER_PROGRAM.WATER_SCREENSPACE ] = new ShaderProgramData( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source, sr.files[ SHADERTYPE.WATER_SS_FRAG ].source );
    this.programData[ SHADER_PROGRAM.WATER_SCREENSPACE ].program = waterSSProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.WATER_SCREENSPACE );

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

    let postProcessProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source
                                                      , sr.files[ SHADERTYPE.POST_PROCESS_FRAG ].source );

    if ( postProcessProgram == null ) {
      alert( "post process compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.POST_PROCESS ] = new ShaderProgramData( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source, sr.files[ SHADERTYPE.POST_PROCESS_FRAG ].source );
    this.programData[ SHADER_PROGRAM.POST_PROCESS ].program = postProcessProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.POST_PROCESS );

    let depthTextureProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source
                                                       , sr.files[ SHADERTYPE.DEPTH_TEXTURE_FRAG ].source );

    if ( depthTextureProgram == null ) {
      alert( "depth texture compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.RENDER_DEPTH_TEXTURE ] = new ShaderProgramData( sr.files[ SHADERTYPE.SS_QUAD_VERT ].source, sr.files[ SHADERTYPE.DEPTH_TEXTURE_FRAG ].source );
    this.programData[ SHADER_PROGRAM.RENDER_DEPTH_TEXTURE ].program = depthTextureProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.RENDER_DEPTH_TEXTURE );

    let cubeMapSHProgram = this.compileShaderProgram( sr.files[ SHADERTYPE.PASSTHROUGH_VERT ].source
                                                    , sr.files[ SHADERTYPE.CUBE_SH_FRAG ].source );

    if ( cubeMapSHProgram == null ) {
      alert( "Cube map shader compilation failed. Please check the log for details." );
      success = false;
    }

    this.programData[ SHADER_PROGRAM.CUBE_SH ] = new ShaderProgramData( sr.files[ SHADERTYPE.PASSTHROUGH_VERT ].source, sr.files[ SHADERTYPE.CUBE_SH_FRAG ].source );
    this.programData[ SHADER_PROGRAM.CUBE_SH ].program = cubeMapSHProgram;
    this.cacheLitShaderProgramLocations( SHADER_PROGRAM.CUBE_SH );

    this.visualizeDepthBuffer = false;

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

    this.fullscreenQuad = new Quad();
    this.fullscreenQuad.rebuildRenderData( gl );

    this.postProcessColorTexture = gl.createTexture();
    this.postProcessDepthTexture = gl.createTexture();
    this.postProcessFramebuffer = gl.createFramebuffer();
  }

  cacheLitShaderProgramLocations( sp: SHADER_PROGRAM ) {
    var gl = this.context;

    let program = this.programData[ sp ].program;
    let uniforms = this.programData[ sp ].uniforms;

    uniforms.aVertexPosition = gl.getAttribLocation( program, "aVertexPosition" );
    gl.enableVertexAttribArray( uniforms.aVertexPosition );

    uniforms.aMeshCoord = gl.getAttribLocation( program, "aMeshCoord" );
    if ( uniforms.aMeshCoord >= 0 ) {
      gl.enableVertexAttribArray( uniforms.aMeshCoord );
    }

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
    uniforms.uWireframe = gl.getUniformLocation( program, "uDrawWireframe" );
    uniforms.uProcSky = gl.getUniformLocation( program, "proceduralSky" );
    uniforms.uIrradianceMap = gl.getUniformLocation( program, "irradiance" );
    uniforms.uTime = gl.getUniformLocation( program, "uTime" );
    uniforms.uCloudiness = gl.getUniformLocation( program, "uCloudiness" );
    uniforms.uCloudSpeed = gl.getUniformLocation( program, "uCloudSpeed" );
    uniforms.uNoiseLayer = gl.getUniformLocation( program, "uNoiseLayer" );
    uniforms.uCombinedNoiseVolume = gl.getUniformLocation( program, "uCombinedNoiseVolume" );
    uniforms.uColor = gl.getUniformLocation( program, "screen_color" );
    uniforms.uDepth = gl.getUniformLocation( program, "screen_depth" );
    uniforms.uFocus = gl.getUniformLocation( program, "focus" );

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

  renderSceneSkybox( gl: WebGL2RenderingContext, scene: Scene, mvStack: gml.Mat4[], viewportW, viewportH, perspective: gml.Mat4 = null ) {
    if ( perspective == null ) {
      perspective = gml.makePerspective( gml.fromDegrees( 45 ), viewportW / viewportH, 0.1, 1000.0 );
    }

    let shader = null;
    if ( scene.environmentMap != null ) {
      shader = this.repoV2.programs.skybox;
      gl.useProgram( shader.program );
      shader.setup( gl, shader.attributes, shader.uniforms );
    } else {
      shader = this.repoV2.programs.sky;
      gl.useProgram( shader.program ); // this shader program automatically moves our quad near the far clip plane, so we don't need to transform it ourselves here
      shader.setup( gl, shader.attributes, shader.uniforms );
    }

    let inverseProjectionMatrix = perspective.invert();
    gl.uniformMatrix4fv( shader.uniforms.uInverseProjectionMatrix, false, inverseProjectionMatrix.m );

    let inverseViewMatrix = mvStack[ mvStack.length - 1 ].invert().mat3;
    gl.uniformMatrix3fv( shader.uniforms.uInverseViewMatrix, false, inverseViewMatrix.m );

    if ( this.camera != null ) {
      gl.uniform4fv( shader.uniforms.cPosition_World, this.camera.matrix.translation.negate().v );
    }

    gl.uniform1f( shader.uniforms.uTime, scene.time );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.fullscreenQuad.renderData.vertexBuffer );
    gl.vertexAttribPointer( shader.attributes.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.fullscreenQuad.renderData.indexBuffer );

    if ( scene.environmentMap != null ) {
      let shader = this.repoV2.programs.skybox;
      gl.uniform1i( shader.uniforms.environment, 0 );
      gl.activeTexture( gl.TEXTURE0 );
      gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.environmentMap.cubeMapTexture );
    }

    gl.drawElements( gl.TRIANGLES, this.fullscreenQuad.renderData.indices.length, gl.UNSIGNED_INT, 0 );
  }

  renderDepthBuffer( gl: WebGL2RenderingContext, depth, mvStack: gml.Mat4[] ) {
    let shader = this.repoV2.programs[ "render-depthtexture" ];
    gl.useProgram( shader.program );

    let shaderVariables = this.programData[ this.currentProgram ].uniforms;

    gl.bindBuffer( gl.ARRAY_BUFFER, this.fullscreenQuad.renderData.vertexBuffer );
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.fullscreenQuad.renderData.indexBuffer );
    gl.vertexAttribPointer( shader.attributes.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.fullscreenQuad.renderData.vertexTexCoordBuffer );
    gl.vertexAttribPointer( shader.attributes.aVertexTexCoord, 2, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv( shader.uniforms.uVMatrix, false, mvStack[ mvStack.length - 1 ].m );

    gl.uniform1i( shader.uniforms.screen_depth, 1 );
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, depth );

    gl.drawElements( gl.TRIANGLES, this.fullscreenQuad.renderData.indices.length, gl.UNSIGNED_INT, 0 );
  }

  renderPostProcessedImage( gl: WebGL2RenderingContext, color, depth, mvStack: gml.Mat4[] ) {
    let shader = this.repoV2.programs[ "post-process" ];
    gl.useProgram( shader.program );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.fullscreenQuad.renderData.vertexBuffer );
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.fullscreenQuad.renderData.indexBuffer );
    gl.vertexAttribPointer( shader.attributes.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.fullscreenQuad.renderData.vertexTexCoordBuffer );
    gl.vertexAttribPointer( shader.attributes.aVertexTexCoord, 2, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv( shader.uniforms.uVMatrix, false, mvStack[ mvStack.length - 1 ].m );

    gl.uniform1i( shader.uniforms.screen_color, 0 );
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, color );

    gl.uniform1i( shader.uniforms.screen_depth, 1 );
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, depth );

    if ( this.camera != null ) {
      gl.uniform1f( shader.uniforms.focus, this.camera.focalDistance );
    }

    gl.drawElements( gl.TRIANGLES, this.fullscreenQuad.renderData.indices.length, gl.UNSIGNED_INT, 0 );
  }

  renderScene( gl: WebGL2RenderingContext, scene: Scene, mvStack: gml.Mat4[], pass: PASS ) {
    let perspective = gml.makePerspective( gml.fromDegrees( 45 ), this.viewportW / this.viewportH, 0.1, 1000.0 );

    scene.renderables.forEach( ( p, i ) => {
      if ( p.material instanceof BlinnPhongMaterial ) {
        let blinnphong = <BlinnPhongMaterial> p.material;
        let shader = this.repoV2.programs[ "blinn-phong" ];
        gl.useProgram( shader.program );
        shader.setup( gl, shader.attributes, shader.uniforms );
        
        gl.uniform4fv( shader.uniforms[ "diffuse" ], blinnphong.diffuse.v );
        gl.uniform4fv( shader.uniforms[ "ambient" ], blinnphong.ambient.v );
        gl.uniform4fv( shader.uniforms[ "specular" ], blinnphong.specular.v );
        gl.uniform4fv( shader.uniforms[ "emissive" ], blinnphong.emissive.v );
        gl.uniform1f( shader.uniforms[ "shininess" ], blinnphong.shininess );

        this.currentShader = shader;
      } else if ( p.material instanceof DebugMaterial ) {
        let shader = this.repoV2.programs[ "debug" ];
        gl.useProgram( shader.program );
        shader.setup( gl, shader.attributes, shader.uniforms );
        this.currentShader = shader;
      } else if ( p.material instanceof OrenNayarMaterial ) {
        let orennayar = <OrenNayarMaterial> p.material;
        let shader = this.repoV2.programs[ "oren-nayar" ];
        gl.useProgram( shader.program );
        shader.setup( gl, shader.attributes, shader.uniforms );
        
        gl.uniform4fv( shader.uniforms[ "diffuse" ], orennayar.diffuse.v );
        gl.uniform1f ( shader.uniforms[ "roughness" ], orennayar.roughness );

        this.currentShader = shader;
      } else if ( p.material instanceof LambertMaterial ) {
        let lambert = <LambertMaterial> p.material;
        let shader = this.repoV2.programs[ "lambert" ];
        gl.useProgram( shader.program );
        shader.setup( gl, shader.attributes, shader.uniforms );
        
        gl.uniform4fv( shader.uniforms[ "diffuse" ], lambert.diffuse.v );

        this.currentShader = shader;
      } else if ( p.material instanceof CookTorranceMaterial ) {
        let cooktorrance = <CookTorranceMaterial> p.material;
        let shader = this.repoV2.programs[ "cook-torrance" ];
        gl.useProgram( shader.program );
        shader.setup( gl, shader.attributes, shader.uniforms );
        
        gl.uniform4fv( shader.uniforms[ "diffuse" ], cooktorrance.diffuse.v );
        gl.uniform4fv( shader.uniforms[ "specular" ], cooktorrance.specular.v );
        gl.uniform1f ( shader.uniforms[ "roughness" ], cooktorrance.roughness );
        gl.uniform1f ( shader.uniforms[ "fresnel" ], cooktorrance.fresnel );

        this.currentShader = shader;
      } else if ( p.material instanceof WaterMaterial ) {
        let shader = this.repoV2.programs[ "water" ];
        gl.useProgram( shader.program );
        shader.setup( gl, shader.attributes, shader.uniforms );
        
        gl.uniform1f( shader.uniforms[ "uTime" ], scene.time );
        gl.uniform1f( shader.uniforms[ "uCloudiness" ], scene.cloudiness );
        gl.uniform1f( shader.uniforms[ "uCloudSpeed" ], scene.cloudSpeed );
        gl.uniform1i( shader.uniforms[ "uWireframe" ], ( <WaterMaterial>p.material ).wireframe ? 1 : 0 ); 

        this.currentShader = shader;
      } else if ( p.material instanceof NoiseMaterial ) {
        let shader = this.repoV2.programs[ "noisewriter" ];
        gl.useProgram( shader.program );
        shader.setup( gl, shader.attributes, shader.uniforms );
        
        gl.uniform1f( shader.uniforms[ "uNoiseLayer" ], ( <NoiseMaterial> p.material ).layer );
        this.currentShader = shader;
      } else if ( p.material instanceof VolumeMaterial ) {
        let shader = this.repoV2.programs[ "volume-viewer" ];
        gl.useProgram( shader.program );
        shader.setup( gl, shader.attributes, shader.uniforms );
        
        let mat = p.material as VolumeMaterial;
        gl.uniform1f( shader.uniforms[ "uNoiseLayer" ], mat.layer );

        if ( mat.volumeTexture != null ) {
          gl.uniform1i( shader.uniforms[ "volume" ], 0 );
          gl.activeTexture( gl.TEXTURE0 );
          gl.bindTexture( gl.TEXTURE_3D, mat.volumeTexture );
        }
      }

      let shader = this.currentShader;
      let shaderVariables = this.currentProgram != null ? this.programData[ this.currentProgram ].uniforms : null;
      scene.lights.forEach( ( l, i ) => {
        if ( shader == null || shader.lightUniforms.length <= i ) return;

        let lightpos = mvStack[ mvStack.length - 1 ].transform( l.position );

        gl.uniform4fv( shader.lightUniforms[ "position" ], lightpos.v );
        gl.uniform4fv( shader.lightUniforms[ "color" ], l.color.v );
        gl.uniform1f( shader.lightUniforms[ "enabled" ], l.enabled ? 1 : 0 );
        gl.uniform1f( shader.lightUniforms[ "radius" ], l.radius );
      } );

      if ( shader != null ) {
        gl.uniformMatrix4fv( shader.uniforms[ "uPMatrix" ], false, perspective.m );
      }

      if ( this.camera != null ) {
        if ( shader != null ) {
          gl.uniform4fv( shader.uniforms[ "cPosition_World" ], this.camera.matrix.translation.v );
        }
      }

      let primitiveModelView = mvStack[ mvStack.length - 1 ].multiply( p.transform );

      if ( shader != null && shader.uniforms != null ) {
        gl.uniformMatrix4fv( shader.uniforms[ "uMVMatrix" ], false, primitiveModelView.m );
        gl.uniformMatrix4fv( shader.uniforms[ "uMMatrix" ], false, p.transform.m );
        gl.uniformMatrix4fv( shader.uniforms[ "uVMatrix" ], false, mvStack[ mvStack.length - 1 ].m );
      }

      // the normal matrix is defined as the upper 3x3 block of transpose( inverse( model-view ) )
      let normalMVMatrix = primitiveModelView.invert().transpose().mat3;

      let normalWorldMatrix = p.transform.invert().transpose().mat3;

      if ( shader != null && shader.uniforms != null ) {
        gl.uniformMatrix3fv( shader.uniforms[ "uNormalMVMatrix" ], false, normalMVMatrix.m );
        gl.uniformMatrix3fv( shader.uniforms[ "uNormalWorldMatrix" ], false, normalWorldMatrix.m );
      }

      let inverseViewMatrix = mvStack[ mvStack.length - 1 ].invert().mat3;
      if ( shader != null ) {
        gl.uniformMatrix3fv( shader.uniforms[ "uInverseViewMatrix" ], false, inverseViewMatrix.m );
      }

      gl.bindBuffer( gl.ARRAY_BUFFER, p.renderData.vertexBuffer );

      if ( shader != null ) {
        gl.vertexAttribPointer( shader.attributes[ "aVertexPosition" ], 3, gl.FLOAT, false, 0, 0 );
      }

      if ( p.renderData.meshCoordsBuffer != null ) {
        gl.bindBuffer( gl.ARRAY_BUFFER, p.renderData.meshCoordsBuffer );
        if ( shader != null ) {
          gl.vertexAttribPointer( shader.attributes[ "aMeshCoord" ], 2, gl.FLOAT, false, 0, 0 );
        }
      }

      gl.bindBuffer( gl.ARRAY_BUFFER, p.renderData.vertexTexCoordBuffer );
      if ( shader != null ) {
        gl.vertexAttribPointer( shader.attributes[ "aVertexTexCoord" ], 2, gl.FLOAT, false, 0, 0);
      }

      gl.bindBuffer( gl.ARRAY_BUFFER, p.renderData.vertexNormalBuffer );
      if ( shader != null && shader.attributes[ "aVertexNormal" ] > 0 ) {
        gl.vertexAttribPointer( shader.attributes[ "aVertexNormal" ], 3, gl.FLOAT, false, 0, 0 );
      }

      if ( scene.environmentMap != null ) {
        if ( shader != null ) {
          gl.uniform1i( shader.uniforms[ "environment" ], 0 );
          gl.activeTexture( gl.TEXTURE0 );
          gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.environmentMap.cubeMapTexture );
        }
      }

      if ( scene.irradianceMap != null ) {
        if ( shader != null ) {
          gl.uniform1i( shader.uniforms[ "irradiance" ], 1 ); // tells shader to look at texture slot 1 for the uEnvMap uniform
          gl.activeTexture( gl.TEXTURE1 );
          gl.bindTexture( gl.TEXTURE_CUBE_MAP, scene.irradianceMap.cubeMapTexture );
        }
      }

      gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, p.renderData.indexBuffer );
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

    if ( shaderVariables.aMeshCoord >= 0 ) {
      gl.enableVertexAttribArray( shaderVariables.aMeshCoord );
    }

    this.currentProgram = program;
    this.currentShader = null;
  }

  renderIrradianceFromScene( gl: WebGL2RenderingContext, scene: Scene, pass: IRRADIANCE_PASS ) {
    // TODO
  }

  renderFullScreenTexture( gl: WebGL2RenderingContext, texture: WebGLTexture ) {
    // this.useProgram( gl, SHADER_PROGRAM.UNLIT );

    let shaderVariables = this.programData[ this.currentProgram ].uniforms;

    gl.bindBuffer( gl.ARRAY_BUFFER, this.fullscreenQuad.renderData.vertexBuffer );
    gl.vertexAttribPointer( shaderVariables.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.fullscreenQuad.renderData.vertexTexCoordBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, this.fullscreenQuad.renderData.textureCoords, gl.STATIC_DRAW );
    gl.vertexAttribPointer( shaderVariables.aVertexTexCoord, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.fullscreenQuad.renderData.indexBuffer );

    gl.uniform1i( shaderVariables.uMaterial.colorMap, 0 );
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );

    gl.drawElements( gl.TRIANGLES, this.fullscreenQuad.renderData.indices.length, gl.UNSIGNED_SHORT, 0 );
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
    if ( !this.repoV2.doneLoading() ) return;
    if ( gl ) {
      //
      // DRAW
      var scene = Scene.getActiveScene();
      if ( scene ) {
        // 
        // GENERATE ENVIRONMENT MAP, IF NECESSARY
        if ( scene.hasEnvironment ) {
          if ( this.enableTracing ) console.time( "environment map" );
          if ( scene.dynamicEnvironment ) {
            // render using specified shader
            // TODO: actually pass in shader into scene
            let shader = this.repoV2.programs[ "sky" ];
            scene.generateEnvironmentMapFromShader( this, gl, shader, shader.attributes, shader.uniforms );
          } else if ( scene.environmentMap.loaded && scene.environmentMap.cubeMapTexture == null ) {
            // generate static cube map from face images - we only do this once
            scene.environmentMap.generateCubeMapFromSources( gl );
          }
          if ( this.enableTracing ) console.timeEnd( "environment map" );
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
          // THIS MIGHT BE WRONG...maybe we're not negating the z???
          mvStack.push( this.camera.matrix );
        } else {
          mvStack.push( gml.Mat4.identity() );
        }

        //
        // RENDER TO POST-PROCESS FRAMEBUFFER
        //

        gl.bindTexture( gl.TEXTURE_2D, this.postProcessColorTexture );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.viewportW, this.viewportH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindTexture( gl.TEXTURE_2D, this.postProcessDepthTexture );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT16, this.viewportW, this.viewportH, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null );

        gl.bindFramebuffer( gl.FRAMEBUFFER, this.postProcessFramebuffer );
        gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.postProcessColorTexture, 0 );
        gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.postProcessDepthTexture, 0 );

        gl.viewport( 0, 0, this.viewportW, this.viewportH );
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // draw environment map
        if ( scene.hasEnvironment ) {
          if ( this.enableTracing ) console.time( "environment" );
          this.renderSceneSkybox( gl, scene, mvStack, this.viewportW, this.viewportH );
          if ( this.enableTracing ) console.timeEnd( "environment" );
        }

        // draw scene
        if ( this.enableTracing ) console.time( "render scene" );
        this.renderScene( gl, scene, mvStack, PASS.STANDARD_FORWARD );
        if ( this.enableTracing ) console.timeEnd( "render scene" );

        // 
        // RENDER POST-PROCESSED IMAGE TO SCREEN

        gl.bindFramebuffer( gl.FRAMEBUFFER, null );
        gl.viewport( 0, 0, this.viewportW, this.viewportH );

        // for debugging, coppy depth texture...
        if ( this.visualizeDepthBuffer ) {
          if ( this.enableTracing ) console.time( "render depth buffer" );
          this.renderDepthBuffer( gl, this.postProcessDepthTexture, mvStack );
          if ( this.enableTracing ) console.timeEnd( "render depth buffer" );
        } else {
          if ( this.enableTracing ) console.time( "post processing" );
          this.renderPostProcessedImage( gl, this.postProcessColorTexture, this.postProcessDepthTexture, mvStack );
          if ( this.enableTracing ) console.timeEnd( "post processing" );
        }
      }
    }
  }

  setCamera( camera: Camera ) {
    this.camera = camera;
  }
};
