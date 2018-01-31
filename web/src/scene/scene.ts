enum CUBEMAPTYPE {
  POS_X,
  NEG_X,
  POS_Y,
  NEG_Y,
  POS_Z,
  NEG_Z,
};

// the cube map should be responsible for constructing from source
// or being injected one via cubeMapTexture (rendered externally)
class CubeMap {
  dynamic: boolean;

  // sources
  faces: HTMLImageElement[];
  facesLoaded: number;

  // resulting texture
  cubeMapTexture: WebGLTexture;

  constructor( gl: WebGLTexture, dynamic: boolean );
  constructor( px: string, nx: string, py: string, ny: string, pz: string, nz: string, finishedLoading: () => void, dynamic: boolean );

  constructor( ...args: any[] ) {
    if ( args.length == 2 ) {
      this.cubeMapTexture = args[0];
      this.dynamic = args[1];
      // we're generating a cube map from a shader, at constructor time
      // This should just take in a cubeMapTexture
    } else if ( args.length == 8 ) {
      // we're generating a cube map from an array of 6 images
      let px: string = args[0];
      let nx: string = args[1];
      let py: string = args[2];
      let ny: string = args[3];
      let pz: string = args[4];
      let nz: string = args[5];
      let finishedLoading: () => void = args[6];
      let dynamic = args[7];

      this.faces = [];
      this.facesLoaded = 0;
      this.cubeMapTexture = null;

      for ( var t in CUBEMAPTYPE ) {
        if ( !isNaN( <any> t ) ) {
          this.faces[ t ] = new Image();
        }
      }

      this.asyncLoadFace( px, CUBEMAPTYPE.POS_X, finishedLoading );
      this.asyncLoadFace( nx, CUBEMAPTYPE.NEG_X, finishedLoading );
      this.asyncLoadFace( py, CUBEMAPTYPE.POS_Y, finishedLoading );
      this.asyncLoadFace( ny, CUBEMAPTYPE.NEG_Y, finishedLoading );
      this.asyncLoadFace( pz, CUBEMAPTYPE.POS_Z, finishedLoading );
      this.asyncLoadFace( nz, CUBEMAPTYPE.NEG_Z, finishedLoading );
      this.dynamic = dynamic;
    }
  }

  generateCubeMapFromSources( gl: WebGLRenderingContext ) {
    this.cubeMapTexture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, this.cubeMapTexture );
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

    this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_POSITIVE_X, this.faces[ CUBEMAPTYPE.POS_X ] );
    this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, this.faces[ CUBEMAPTYPE.NEG_X ] );
    this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, this.faces[ CUBEMAPTYPE.POS_Y ] );
    this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, this.faces[ CUBEMAPTYPE.NEG_Y ] );
    this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, this.faces[ CUBEMAPTYPE.POS_Z ] );
    this.bindCubeMapFace( gl, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, this.faces[ CUBEMAPTYPE.NEG_Z ] );

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, 0 );
  }

  bindCubeMapFace( gl: WebGLRenderingContext, face: number, image: HTMLImageElement ) {
    gl.texImage2D( face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );
  }

  asyncLoadFace( url: string, ctype: CUBEMAPTYPE, finishedLoading: () => void ) {
    this.faces[ ctype ].src = url;
    this.faces[ ctype ].onload = () => { this.faceLoaded( ctype, finishedLoading ); };
  }

  faceLoaded( ctype: CUBEMAPTYPE, finishedLoading: () => void ) {
    this.facesLoaded++;
    if ( this.loaded ) {
      finishedLoading();
    }
  }

  // returns true when all six faces of the cube map has been loaded
  public get loaded(): boolean {
    return this.facesLoaded == 6;
  }
}

class Scene {
  public renderables: Renderable[];
  public lights: Light[];
  private static activeScene;
  public time: number;

  // maps
  environmentMap : CubeMap;
  irradianceMap  : CubeMap;

  hasEnvironment    : boolean;
  dynamicEnvironment: boolean;

  noiseVolume: WebGLTexture;

  // cached render objects
  fullscreen: Quad;

  constructor( environmentMap: CubeMap, irradianceMap: CubeMap, hasEnvironment: boolean = false, dynamicEnvironment: boolean = false, noiseVolume: WebGLTexture = null ) {
    this.renderables = [];
    this.lights = [];
    this.environmentMap = environmentMap;
    this.irradianceMap = irradianceMap;
    this.time = 0;
    this.hasEnvironment = hasEnvironment;
    this.dynamicEnvironment = dynamicEnvironment;
    this.noiseVolume = noiseVolume;
  }

  public addRenderable( renderable: Renderable ) {
    this.renderables.push( renderable );
  }

  public addLight( light: Light ) {
    this.lights.push( light );
  }

  public generateEnvironmentMapFromShader( renderer  : Renderer
                                         , gl        : WebGLRenderingContext & WebGL2RenderingContext
                                         , shader    : WebGLProgram
                                         , variables : ShaderUniforms )
  {
    let renderTargetFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, renderTargetFramebuffer );

    let size = 256; // this is the pixel size of each side of the cube map

    // 
    // RENDER TO TEXTURE
    let depthBuffer = gl.createRenderbuffer();   // renderbuffer for depth buffer in framebuffer
    gl.bindRenderbuffer( gl.RENDERBUFFER, depthBuffer ); // so we can create storage for the depthBuffer
    gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size );
    gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer );

    // this is the texture we'll render each face of the cube map into
    // as we render each face of the cubemap into it, we'll bind it to the actual cubemap
    let cubeMapRenderTarget = null;

    if ( this.environmentMap == null || this.environmentMap.cubeMapTexture == null ) {
      cubeMapRenderTarget = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubeMapRenderTarget );
      gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
      gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
      gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
      gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
      gl.texImage2D( gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
      gl.texImage2D( gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
      gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
      gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
      gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );
    } else {
      cubeMapRenderTarget = this.environmentMap.cubeMapTexture;
    }

    let cameraPos = gml.Vec4.origin;
    
    // draw +x view
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X, cubeMapRenderTarget, 0 );
    gl.viewport( 0, 0, size, size );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    let perspective = gml.makePerspective( gml.fromDegrees( 90 ), 1, 0.1, 100.0 );

    let rightView = new gml.Mat4( 0, 0,-1, 0
                                , 0,-1, 0, 0
                                ,-1, 0, 0, 0
                                , 0, 0, 0, 1 );

    this.renderFace( renderer, gl, shader, variables, cubeMapRenderTarget, rightView, size, size, perspective, cameraPos );

    // draw -x view
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, cubeMapRenderTarget, 0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    let leftView = new gml.Mat4( 0, 0, 1, 0
                               , 0,-1, 0, 0
                               , 1, 0, 0, 0
                               , 0, 0, 0, 1 );
    this.renderFace( renderer, gl, shader, variables, cubeMapRenderTarget, leftView, size, size, perspective, cameraPos );

    // draw +y view
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, cubeMapRenderTarget, 0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    let upView = new gml.Mat4( 1, 0, 0, 0
                             , 0, 0, 1, 0
                             , 0,-1, 0, 0
                             , 0, 0, 0, 1 );
    this.renderFace( renderer, gl, shader, variables, cubeMapRenderTarget, upView, size, size, perspective, cameraPos );

    // draw -y view
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, cubeMapRenderTarget, 0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    let downView = new gml.Mat4( 1, 0, 0, 0
                               , 0, 0,-1, 0
                               , 0, 1, 0, 0
                               , 0, 0, 0, 1 );
    this.renderFace( renderer, gl, shader, variables, cubeMapRenderTarget, downView, size, size, perspective, cameraPos );

    // draw +z view
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, cubeMapRenderTarget, 0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    let frontView = new gml.Mat4( 1, 0, 0, 0
                                , 0,-1, 0, 0
                                , 0, 0,-1, 0
                                , 0, 0, 0, 1 );
    this.renderFace( renderer, gl, shader, variables, cubeMapRenderTarget, frontView, size, size, perspective, cameraPos );

    // draw -z view
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, cubeMapRenderTarget, 0 );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    let backView = new gml.Mat4(-1, 0, 0, 0
                               , 0,-1, 0, 0
                               , 0, 0, 1, 0
                               , 0, 0, 0, 1 );
    this.renderFace( renderer, gl, shader, variables, cubeMapRenderTarget, backView, size, size, perspective, cameraPos );

    gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubeMapRenderTarget );
    gl.generateMipmap( gl.TEXTURE_CUBE_MAP );

    if ( this.environmentMap == null ) {
      this.environmentMap = new CubeMap( cubeMapRenderTarget, true );
    } else {
      this.environmentMap.cubeMapTexture = cubeMapRenderTarget;
      this.environmentMap.dynamic = true;
    }

    gl.bindTexture( gl.TEXTURE_CUBE_MAP, null );
  }

  renderFace( renderer       : Renderer
            , gl             : WebGLRenderingContext & WebGL2RenderingContext
            , shader         : WebGLProgram
            , variables      : ShaderUniforms
            , cubeMapRT      : WebGLTexture
            , modelView      : gml.Mat4
            , viewportW      : number
            , viewportH      : number
            , perspective    : gml.Mat4
            , cameraPos      : gml.Vec4 )
  {
    renderer.useProgram( gl, SHADER_PROGRAM.SKY );

    if ( this.fullscreen == null ) {
      this.fullscreen = new Quad();
      this.fullscreen.rebuildRenderData( gl );
    }

    let inverseProjectionMatrix = perspective.invert();
    gl.uniformMatrix4fv( variables.uInverseProjection, false, inverseProjectionMatrix.m );

    let inverseViewMatrix = modelView.invert().mat3;
    gl.uniformMatrix3fv( variables.uInverseView, false, inverseViewMatrix.m );

    gl.uniform4fv( variables.uCameraPos, cameraPos.v );

    gl.uniform1f( variables.uTime, this.time );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.fullscreen.renderData.vertexBuffer );
    gl.vertexAttribPointer( variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.fullscreen.renderData.indexBuffer );

    gl.uniform1i( variables.uEnvMap, 0 );
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, cubeMapRT );

    if ( this.noiseVolume != null ) {
      gl.uniform1i( variables.uPerlinNoise, 1 );
      gl.activeTexture( gl.TEXTURE1 );
      gl.bindTexture( gl.TEXTURE_3D, this.noiseVolume );
    }

    gl.drawElements( gl.TRIANGLES, this.fullscreen.renderData.indices.length, gl.UNSIGNED_INT, 0 );
  }

  static setActiveScene( scene: Scene ) {
    this.activeScene = scene;
  }
  
  static getActiveScene(): Scene {
    return this.activeScene;
  }
}
