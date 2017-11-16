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
  // sources
  faces: HTMLImageElement[];
  facesLoaded: number;

  // resulting texture
  cubeMapTexture: WebGLTexture;

  constructor( gl: WebGLTexture );
  constructor( px: string, nx: string, py: string, ny: string, pz: string, nz: string, finishedLoading: () => void );

  constructor( ...args: any[] ) {
    if ( args.length == 1 ) {
      this.cubeMapTexture = args[0];
      // we're generating a cube map from a shader, at constructor time
      // This should just take in a cubeMapTexture
    } else if ( args.length == 7 ) {
      // we're generating a cube map from an array of 6 images
      let px: string = args[0];
      let nx: string = args[1];
      let py: string = args[2];
      let ny: string = args[3];
      let pz: string = args[4];
      let nz: string = args[5];
      let finishedLoading: () => void = args[6];

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
    }
  }

  generateCubeMapFromShader( gl: WebGLRenderingContext ) {
  }

  generateCubeMapFromSources( gl: WebGLRenderingContext ) {
    this.cubeMapTexture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_CUBE_MAP, this.cubeMapTexture );

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
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
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

  // maps
  environmentMap : CubeMap;
  irradianceMap  : CubeMap;

  constructor( environmentMap: CubeMap, irradianceMap: CubeMap ) {
    this.renderables = [];
    this.lights = [];
    this.environmentMap = environmentMap;
    this.irradianceMap = irradianceMap;
  }

  public addRenderable( renderable: Renderable ) {
    this.renderables.push( renderable );
  }

  public addLight( light: Light ) {
    this.lights.push( light );
  }

  static setActiveScene( scene: Scene ) {
    this.activeScene = scene;
  }
  
  static getActiveScene(): Scene {
    return this.activeScene;
  }
}
