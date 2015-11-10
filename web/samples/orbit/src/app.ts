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

var editor: Ed = null;

function StartEd() {
  if ( editor == null ) {

    pcam = new Camera( new TSM.vec3( [ 3, 5, 9 ] ), new TSM.vec3( [ -3, -5, -9 ] ), new TSM.vec3( [ 0, 1, 0 ] ), new TSM.vec3( [ 1, 0, 0 ] ) );

    var params : AppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
    };

    shaderRepo = new ShaderRepository( ( repo ) => { editor = new OrbitApp( params, repo ); } );

    var testScene = new Scene()
    Scene.setActiveScene( testScene );
    // testScene.addRenderable( new Cube( 1 ) );
    testScene.addRenderable( new Quad( 1, new DebugMaterial() ) );
    testScene.addLight( new PointLight( new TSM.vec4( [ 9.0, 0, 0, 1.0 ] ), new TSM.vec4( [ 1.0, 0, 0, 1.0 ] ) ) );
  }
}
