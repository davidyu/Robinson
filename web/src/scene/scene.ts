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

  constructor( px: string, nx: string, py: string, ny: string, pz: string, nz: string ) {
    this.faces = [];
    this.facesLoaded = 0;

    for ( var t in CUBEMAPTYPE ) {
      if ( !isNaN( t ) ) {
        this.faces[ t ] = new Image();
      }
    }

    this.asyncLoadFace( px, CUBEMAPTYPE.POS_X );
    this.asyncLoadFace( nx, CUBEMAPTYPE.NEG_X );
    this.asyncLoadFace( py, CUBEMAPTYPE.POS_Y );
    this.asyncLoadFace( ny, CUBEMAPTYPE.NEG_Y );
    this.asyncLoadFace( pz, CUBEMAPTYPE.POS_Z );
    this.asyncLoadFace( nz, CUBEMAPTYPE.NEG_Z );
  }

  asyncLoadFace( url: string, ctype: CUBEMAPTYPE ) {
    this.faces[ ctype ].src = url;
    this.faces[ ctype ].onload = () => { this.faceLoaded( ctype ); };
  }

  faceLoaded( ctype: CUBEMAPTYPE ) {
    this.facesLoaded++;
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

  environment: CubeMap;

  constructor( environment: CubeMap ) {
    this.renderables = [];
    this.lights = [];
    this.environment = environment;
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
