var shaderRepo: ShaderRepository = null; // global for debugging
var environmentMap: CubeMap = null;
var irradianceMap: CubeMap = null;

interface AppParams {
  vp : HTMLCanvasElement;
  orbitCenter: gml.Vec4;
  orbitDistance: number;
}

class ShowcaseApp {
  renderer: Renderer;
  camera: Camera;

  // camera building parameters
  orbitCenter: gml.Vec4;;
  orbitDistance: number;
  yaw: gml.Angle;
  pitch: gml.Angle;

  dirty: boolean;

  constructor( params: AppParams, shaderRepo: ShaderRepository ) {
    this.renderer = new Renderer( params.vp, shaderRepo, new gml.Vec4( 0.8, 0.8, 0.8, 1 ) );
    this.orbitCenter = params.orbitCenter;
    this.orbitDistance = params.orbitDistance;
    this.yaw = gml.fromDegrees( 180 );
    this.pitch = gml.fromDegrees( 0 );
    this.renderer.setCamera( this.camera );
    this.dirty = true;

    // camera parameters - save camera distance from target
    // construct location along viewing sphere

    setInterval( () => { this.fixedUpdate() }, 1000/30 );

    const WHEEL_PIXEL_TO_RADIAN = 1/30;
    params.vp.addEventListener( 'wheel', e => {
      e.preventDefault();
      // reconstruct camera matrix from dx and dy
      this.yaw = this.yaw.add( gml.fromRadians( e.deltaX * WHEEL_PIXEL_TO_RADIAN ).negate() ).reduceToOneTurn();
      this.pitch = this.pitch.add( gml.fromRadians( e.deltaY * WHEEL_PIXEL_TO_RADIAN ) ).reduceToOneTurn();
      this.dirty = true;
    } );


    var hammer = new Hammer( params.vp, { preventDefault: true } );
    hammer.get('pan').set( { direction: Hammer.DIRECTION_ALL } );

    const PAN_PIXEL_TO_RADIAN = 1/10;
    hammer.on( "panmove", e => {
      this.yaw = this.yaw.add( gml.fromRadians( e.velocityX * PAN_PIXEL_TO_RADIAN ).negate() ).reduceToOneTurn();
      this.pitch = this.pitch.add( gml.fromRadians( e.velocityY * PAN_PIXEL_TO_RADIAN ) ).reduceToOneTurn();
      this.dirty = true;
    } );
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

var app: ShowcaseApp = null;

function StartApp() {
  if ( app == null ) {
    var params : AppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
      orbitCenter: new gml.Vec4( 0, 0, 0, 1 ),
      orbitDistance: 10
    };

    shaderRepo = new ShaderRepository( ( repo ) => { app = new ShowcaseApp( params, repo ); } );

    environmentMap = new CubeMap( "./posx.jpg"
                                , "./negx.jpg"
                                , "./posy.jpg"
                                , "./negy.jpg"
                                , "./posz.jpg"
                                , "./negz.jpg"
                                , () => { app.dirty = true; } );

    irradianceMap = new CubeMap( "./irradiance_posx.jpg"
                               , "./irradiance_negx.jpg"
                               , "./irradiance_posy.jpg"
                               , "./irradiance_negy.jpg"
                               , "./irradiance_posz.jpg"
                               , "./irradiance_negz.jpg"
                               , () => { app.dirty = true; } );

    var testScene = new Scene( environmentMap, irradianceMap );
    Scene.setActiveScene( testScene );

    // sphere 1, Lambert
    testScene.addRenderable( new Sphere( 1, new gml.Vec4( 4, 0, 0, 1 ), new LambertMaterial( new gml.Vec4( 0.5, 0.5, 0.5, 1 ) ) ) );

    // sphere 1, Oren-Nayar with some roughness
    testScene.addRenderable( new Sphere( 1, new gml.Vec4( 1.33333, 0, 0, 1 ), new OrenNayarMaterial( new gml.Vec4( 0.5, 0.5, 0.5, 1 ), 0.4 ) ) );

    // sphere 2, good old Blinn-Phong
    testScene.addRenderable( new Sphere( 1
                                       , new gml.Vec4( -1.33333, 0, 0, 1 )
                                       , new BlinnPhongMaterial( new gml.Vec4( 0, 0, 0, 1 )
                                                               , new gml.Vec4( 0.5, 0.5, 0.5, 1 )
                                                               , new gml.Vec4( 0.5, 0.5, 0.5, 1 )
                                                               , new gml.Vec4( 0, 0, 0, 1 )
                                                               , 50 ) ) );
    // sphere 2, Cook-Torrance
    testScene.addRenderable( new Sphere( 1
                                       , new gml.Vec4( -4, 0, 0, 1 )
                                       , new CookTorranceMaterial( new gml.Vec4( 0.5, 0.5, 0.5, 1 )
                                                                 , new gml.Vec4( 0.5, 0.5, 0.5, 1 )
                                                                 , 0.2
                                                                 , 1.53 ) ) );

    testScene.addLight( new PointLight( new gml.Vec4( -12, 5, -10, 1 ), new gml.Vec4( 1.0, 1.0, 0.8, 1.0 ), 100 ) );
  }
}
