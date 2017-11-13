enum CUBEMAPTYPE {
  POS_X,
  NEG_X,
  POS_Y,
  NEG_Y,
  POS_Z,
  NEG_Z,
};

class CubeMap {
  faces: HTMLImageElement[];
  facesLoaded: number;
  cubeMapTexture: WebGLTexture;

  constructor( px: string, nx: string, py: string, ny: string, pz: string, nz: string, finishedLoading: () => void = null ) {
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
