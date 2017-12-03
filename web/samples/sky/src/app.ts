var shaderRepo: ShaderRepository = null; // global for debugging
var skyScene: Scene;

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
  orbitCenter: gml.Vec4;
  orbitDistance: number;
  yaw: gml.Angle;
  pitch: gml.Angle;

  // ui
  dragging: boolean;
  dragStart: gml.Vec2;
  lastMousePos: gml.Vec2;

  constructor( params: SkyAppParams, shaderRepo: ShaderRepository ) {
    this.renderer = new Renderer( params.vp, shaderRepo );
    this.orbitCenter = params.orbitCenter;
    this.orbitDistance = params.orbitDistance;
    this.yaw = gml.fromDegrees( 140 );
    this.pitch = gml.fromDegrees( 0 );
    this.renderer.setCamera( this.camera );
    this.dirty = true;
    this.dragStart = new gml.Vec2( 0, 0 );
    this.lastMousePos = new gml.Vec2( 0, 0 );

    setInterval( () => { this.fixedUpdate( 1.0 / 30 ); }, 1000/30 );

    params.vp.addEventListener( 'mousedown', ev => {
      switch ( ev.button ) {
        case 0: // left
          this.dragStart.x = ev.clientX;
          this.dragStart.y = ev.clientY;
          this.lastMousePos.x = ev.clientX;
          this.lastMousePos.y = ev.clientY;
          this.dragging = true;
          break;
        case 1: // middle
          break;
        case 2: // right
          break;
      }
      ev.preventDefault();
      return false;
    }, false );

    params.vp.addEventListener( 'mouseup', ev => {
      this.dragging = false;
      ev.preventDefault();
      return false;
    }, false );

    const PAN_PIXEL_TO_RADIAN = 1/40;
    params.vp.addEventListener( 'mousemove', ev => {
      if ( this.dragging ) {
        let deltaX = ev.clientX - this.lastMousePos.x;
        let deltaY = ev.clientY - this.lastMousePos.y;
        this.lastMousePos.x = ev.clientX;
        this.lastMousePos.y = ev.clientY;

        this.yaw = this.yaw.add( gml.fromRadians( -deltaX * PAN_PIXEL_TO_RADIAN ).negate() ).reduceToOneTurn();

        this.pitch = this.pitch.add( gml.fromRadians( -deltaY * PAN_PIXEL_TO_RADIAN ) ).reduceToOneTurn();

        /*
        if ( this.pitch.toDegrees() > 40 ) {
          this.pitch = gml.fromDegrees( 40 );
        }
         */

        this.dirty = true;
        ev.preventDefault();
        return false;
      }
    }, false );
  }

  public fixedUpdate( delta: number ) {
    skyScene.time += 1.0/30.0;

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
      this.dirty = false;
    }

    // this is way too slow
    this.renderer.dirty = true;
    this.renderer.render();
  }
}

var app: SkyApp = null;

function StartSky() {
  if ( app == null ) {
    var params : SkyAppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
      orbitCenter: new gml.Vec4( 0, 40, 0, 1 ),
      orbitDistance: 10
    };

    shaderRepo = new ShaderRepository( ( repo ) => { app = new SkyApp( params, repo ); } );

    skyScene = new Scene( null, null );
    Scene.setActiveScene( skyScene );

    // ocean
    skyScene.addRenderable( new Plane( 10000
                                     , new gml.Vec4( 0, 30, 0, 1 )
                                     , { x: gml.fromDegrees( 0 ), y: gml.fromDegrees( 0 ), z: gml.fromDegrees( 0 ) }
                                     , { u: 9, v: 9 }
                                     , new WaterMaterial( new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                        , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                        , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                        , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                        , 1.53 ) ) );
  }
}
