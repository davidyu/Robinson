var shaderRepo: ShaderRepository = null; // global for debugging

interface AppParams {
  vp : HTMLCanvasElement;
}

enum VIEWMODE {
  SINGLE_LARGE_VIEWPORT,
  SPLIT_SMALL_VIEWPORTS,
}

var pcam: Camera = null;

class OrbitApp {
  renderer: Renderer;
  viewMode: VIEWMODE;
  camera: Camera; // TODO map cameras to each viewport

  constructor( params: AppParams, shaderRepo: ShaderRepository ) {
    this.viewMode = VIEWMODE.SINGLE_LARGE_VIEWPORT;
    this.renderer = new Renderer( params.vp, shaderRepo );
    this.camera = pcam;
    this.renderer.setCamera( this.camera );

    setInterval( () => { this.fixedUpdate() }, 1000/30 );
  }

  buildSingleViewport() {
  }

  public fixedUpdate() {
    this.renderer.update();
    this.renderer.render();
  }
}

var app: OrbitApp = null;

function StartEd() {
  if ( app == null ) {
    pcam = new Camera( new gml.Vec4( 3, 5, 9, 0 ), new gml.Vec4( -3, -5, -9, 0 ), new gml.Vec4( 0, 1, 0, 0 ), new gml.Vec4( 1, 0, 0, 0 ) );

    var params : AppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
    };

    shaderRepo = new ShaderRepository( ( repo ) => { app = new OrbitApp( params, repo ); } );

    var testScene = new Scene()
    Scene.setActiveScene( testScene );
    // testScene.addRenderable( new Cube( 1 ) );
    testScene.addRenderable( new Quad( 1, new DebugMaterial() ) );
    testScene.addLight( new PointLight( new gml.Vec4( 9.0, 0, 0, 1.0 ), new gml.Vec4( 1.0, 0, 0, 1.0 ) ) );
  }
}
