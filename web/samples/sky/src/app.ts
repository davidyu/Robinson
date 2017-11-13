var shaderRepo: ShaderRepository = null; // global for debugging

interface SkyAppParams {
  vp : HTMLCanvasElement;
  orbitCenter: gml.Vec4;
  orbitDistance: number;
}

class SkyApp {
  renderer: Renderer;
  camera: Camera;
  dirty: boolean;

  // camera building parameters
  orbitCenter: gml.Vec4;;
  orbitDistance: number;
  yaw: gml.Angle;
  pitch: gml.Angle;

  constructor( params: SkyAppParams, shaderRepo: ShaderRepository ) {
    this.renderer = new Renderer( params.vp, shaderRepo );
    this.orbitCenter = params.orbitCenter;
    this.orbitDistance = params.orbitDistance;
    this.yaw = gml.fromDegrees( 0 );
    this.pitch = gml.fromDegrees( 0 );
    this.renderer.setCamera( this.camera );
    this.dirty = true;

    setInterval( () => { this.fixedUpdate() }, 1000/30 );
  }

  public fixedUpdate() {
    if ( this.dirty ) {
      // rebuild camera
      let baseAim = new gml.Vec4( 0, 0, -1, 0 );

      let rotY = gml.Mat4.rotateY( this.yaw );
      let rotRight = rotY.transform( gml.Vec4.right );

      let rotX = gml.Mat4.rotate( rotRight, this.pitch );
      let rotAim = rotX.transform( rotY.transform( baseAim ) ).normalized;
      let rotUp = rotRight.cross( rotAim );

      let rotPos = this.orbitCenter.add( rotAim.negate().multiply( this.orbitDistance ) );

      this.camera = new Camera( rotPos, rotAim, rotUp, rotRight );
      this.renderer.setCamera( this.camera );
      this.renderer.update();
      this.renderer.render();
      this.dirty = false;


    }
  }
}

var app: SkyApp = null;

function StartSky() {
  if ( app == null ) {
    var params : SkyAppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
      orbitCenter: new gml.Vec4( 0, 0, 0, 1 ),
      orbitDistance: 10
    };

    shaderRepo = new ShaderRepository( ( repo ) => { app = new SkyApp( params, repo ); } );

    var testScene = new Scene( null, null );
    Scene.setActiveScene( testScene );
    testScene.addRenderable( new Quad( 1, gml.Vec4.origin, new BlinnPhongMaterial( new gml.Vec4( 0.1, 0.1, 0.1, 1 ), new gml.Vec4( 0.5, 0.5, 0.5, 1 ), new gml.Vec4( 0.5, 0.5, 0.5, 1 ), new gml.Vec4( 0, 0, 0, 1 ), 20.0 ) ) );

    /*
    testScene.addLight( new PointLight( new gml.Vec4( 9.0, 0, 0, 1.0 ), new gml.Vec4( 1.0, 1.0, 1.0, 1.0 ), 10 ) );
    testScene.addLight( new PointLight( new gml.Vec4( 3.0, 3.0, 0, 1.0 ), new gml.Vec4( 1.0, 0.0, 0.0, 1.0 ), 10 ) );
    testScene.addLight( new PointLight( new gml.Vec4( 0, 9.0, 0, 1.0 ), new gml.Vec4( 0.0, 1.0, 0.0, 1.0 ), 10 ) );
    testScene.addLight( new PointLight( new gml.Vec4( 0, 0, 9.0, 1.0 ), new gml.Vec4( 0.0, 0.0, 1.0, 1.0 ), 10 ) );
     */
  }
}
