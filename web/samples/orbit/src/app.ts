var shaderRepo: ShaderRepository = null; // global for debugging

interface AppParams {
  vp : HTMLCanvasElement;
  orbitCenter: gml.Vec4;
  orbitDistance: number;
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
  orbitCenter: gml.Vec4;;
  orbitDistance: number;
  yaw: gml.Angle;
  pitch: gml.Angle;
  hammer: HammerManager;

  constructor( params: AppParams, shaderRepo: ShaderRepository ) {
    this.viewMode = VIEWMODE.SINGLE_LARGE_VIEWPORT;
    this.renderer = new Renderer( params.vp, shaderRepo );
    this.camera = pcam;
    this.orbitCenter = params.orbitCenter;
    this.orbitDistance = params.orbitDistance;
    this.yaw = gml.fromDegrees( 0 );
    this.pitch = gml.fromDegrees( 0 );
    this.renderer.setCamera( this.camera );

    // camera parameters - save camera distance from target
    // construct location along viewing sphere

    setInterval( () => { this.fixedUpdate() }, 1000/30 );

    window.addEventListener( 'wheel', e => {
      // reconstruct camera matrix from dx and dy
      this.yaw = this.yaw.add( gml.fromDegrees( e.deltaX ) ).reduceToOneTurn();
      this.pitch = this.pitch.add( gml.fromDegrees( e.deltaY ) ).reduceToOneTurn();
    } );

    this.hammer = new Hammer( params.vp, { preventDefault: true } );
    this.hammer.get('pan').set( { direction: Hammer.DIRECTION_ALL } );
    this.hammer.on( "panmove", e => {
      this.yaw = this.yaw.add( gml.fromDegrees( e.deltaX ) ).reduceToOneTurn();
      this.pitch = this.pitch.add( gml.fromDegrees( e.deltaY ) ).reduceToOneTurn();
    } );
  }

  buildSingleViewport() {
  }

  public fixedUpdate() {
    // update camera
    // gml.Mat4.rotateY( this.yaw );
    this.renderer.update();
    this.renderer.render();
  }
}

var app: OrbitApp = null;

function StartOrbit() {
  if ( app == null ) {
    pcam = new Camera( new gml.Vec4( 0, 0, 5, 0 ), new gml.Vec4( 0, 0, -1, 0 ), new gml.Vec4( 0, 1, 0, 0 ), new gml.Vec4( 1, 0, 0, 0 ) );

    var params : AppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
      orbitCenter: new gml.Vec4( 0, 0, 0, 1 ),
      orbitDistance: 10
    };

    shaderRepo = new ShaderRepository( ( repo ) => { app = new OrbitApp( params, repo ); } );

    var testScene = new Scene()
    Scene.setActiveScene( testScene );
    testScene.addRenderable( new Quad( 1, new DebugMaterial() ) );
    testScene.addLight( new PointLight( new gml.Vec4( 9.0, 0, 0, 1.0 ), new gml.Vec4( 1.0, 0, 0, 1.0 ) ) );
  }
}
