var shaderRepo: ShaderRepository = null; // global for debugging
var scene: Scene;

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

    let options: NodeListOf<HTMLSelectElement> = document.getElementsByTagName( "select" );
    let frameLimiterOption: HTMLSelectElement = null;

    for ( let i = 0; i < options.length; i++ ) {
      if ( options[i].id == 'frame-limiter' ) frameLimiterOption = options[i];
    }

    frameLimiterOption.onchange = changeFrameLimit;

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
}

var frameLimit: number = 2;

function changeFrameLimit( e ) {
  switch ( e.target.value ) {
    case "adaptive":
      frameLimit = -1;
      break;
    case "60":
      frameLimit = 60;
      break;
    case "120":
      frameLimit = 120;
      break;
    case "144":
      frameLimit = 144;
      break;
    case "custom":
      frameLimit = 240; // Haahaa
      break;
  }
}

var app: SkyApp = null;
var lastFrame: number = null;

function updateAndDraw( t: number ) {
  let dt = ( t - lastFrame ) / 1000.0;

  if ( frameLimit != -1 && dt < 1.0 / frameLimit ) {
    window.requestAnimationFrame( updateAndDraw );
    return;
  }

  lastFrame = t;

  scene.time += dt;

  if ( app.dirty ) {
    // rebuild camera
    let baseAim = new gml.Vec4( 0, 0, -1, 0 );

    let rotY = gml.Mat4.rotateY( app.yaw );
    let rotRight = rotY.transform( gml.Vec4.right );

    let rotX = gml.Mat4.rotate( rotRight, app.pitch );
    let rotAim = rotX.transform( rotY.transform( baseAim ) ).normalized;
    let rotUp = rotRight.cross( rotAim );

    let rotPos = app.orbitCenter.add( rotAim.negate().multiply( app.orbitDistance ) );

    app.camera = new Camera( rotPos, rotAim, rotUp, rotRight );
    app.renderer.setCamera( app.camera );
    app.renderer.update();
    app.dirty = false;
  }

  // this is way too slow
  app.renderer.dirty = true;
  app.renderer.render();

  window.requestAnimationFrame( updateAndDraw );
}

function StartSky() {
  if ( app == null ) {
    var params : SkyAppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
      orbitCenter: new gml.Vec4( 0, 5, 0, 1 ),
      orbitDistance: 0.001
    };

    shaderRepo = new ShaderRepository( ( repo ) => { 
      app = new SkyApp( params, repo );

      let size = 128; // dimensions, in pixels, of our 3D texture
      let gl = app.renderer.context;

      let noise = new Noise();

      scene = new Scene( null, null, true, true, noise.perlin3Texture( gl, 128 ) );
      Scene.setActiveScene( scene );

      // ocean
      scene.addRenderable( new InfinitePlane( 12
                                       , 4
                                       , new gml.Vec4( 0, 0, 0, 1 )
                                       , { x: gml.fromDegrees( 0 ), y: gml.fromDegrees( 0 ), z: gml.fromDegrees( 0 ) }
                                       , { u: 7, v: 7 }
                                       , new WaterMaterial( new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                          , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                          , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                          , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                          , 1.53 ) ) );

      lastFrame = performance.now();

      window.requestAnimationFrame( updateAndDraw );

      // screenspace ocean
      /*
      scene.addRenderable( new Quad( 1
                                       , new gml.Vec4( 0, 30, 0, 1 )
                                       , null
                                       , new WaterMaterial( new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                          , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                          , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                          , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                                          , 1.53
                                                          , true ) ) );
       */
    } );
  }
}
