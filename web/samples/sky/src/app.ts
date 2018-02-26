interface SkyAppParams {
  vp : HTMLCanvasElement;
  orbitCenter: gml.Vec4;
  orbitDistance: number;
}

class SkyApp {
  editor: ShaderEditor;
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

  FPSContainer: HTMLDivElement;

  constructor( params: SkyAppParams, shaderRepo: ShaderRepository ) {
    this.renderer = new Renderer( params.vp, shaderRepo );
    this.editor = new ShaderEditor( this.renderer );
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

    let cloudinessSlider = <HTMLInputElement> document.getElementById( "cloud-slider" );
    let cloudSpeedSlider = <HTMLInputElement> document.getElementById( "wind-slider" );

    cloudinessSlider.oninput = changeCloudiness;
    cloudSpeedSlider.oninput = changeCloudSpeed;
    cloudSpeedSlider.onchange = changeFinished;

    let wireframeCheckbox = <HTMLInputElement> document.getElementById( "water-wireframe" );
    wireframeCheckbox.onchange = changeWireframe;

    let showFPSCheckbox = <HTMLInputElement> document.getElementById( "debug-fps" );
    showFPSCheckbox.onchange = changeShowFPS;

    this.FPSContainer = <HTMLDivElement> document.getElementById( "fps-indicator" );

    document.body.onmouseup = changeFinished;

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

        let newPitch = this.pitch.add( gml.fromRadians( -deltaY * PAN_PIXEL_TO_RADIAN ) ).reduceToOneTurn()

        let deg = newPitch.toDegrees();
        if ( deg > 90 && deg < 270 ) {
          if ( Math.abs( 90 - deg ) < 90 ) {
            newPitch = gml.fromDegrees( 90 );
          } else {
            newPitch = gml.fromDegrees( 270 );
          }
        }

        this.pitch = newPitch;

        this.dirty = true;
        ev.preventDefault();
        return false;
      }
    }, false );
  }
}

var frameLimit: number = -1;
var stoptime: boolean = false;

function changeCloudiness( e ) {
  scene.cloudiness = e.target.value / 100;
}

function changeCloudSpeed( e ) {
  stoptime = true;
  scene.cloudSpeed = e.target.value / 30; // 1 to 3.33ish
}

function changeFinished( e ) {
  stoptime = false;
}

function changeWireframe( e ) {
  watermat.wireframe = e.target.checked;
}

function changeShowFPS( e ) {
  if ( e.target.checked ) {
    app.FPSContainer.style.visibility = "visible";
  } else {
    app.FPSContainer.style.visibility = "hidden";
  }
}

function changeFrameLimit( e ) {
  switch ( e.target.value ) {
    case "adaptive":
      frameLimit = -1;
      break;
    case "30":
      frameLimit = 30;
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
var scene: Scene = null;
var lastFrame: number = null;
var finishedDownloadingTexture = false;
var watermat: WaterMaterial;

function updateAndDraw( t: number ) {
  let dt = ( t - lastFrame ) / 1000.0;

  if ( frameLimit != -1 && dt < 1.0 / frameLimit ) {
    window.requestAnimationFrame( updateAndDraw );
    return;
  }

  lastFrame = t;

  if ( !stoptime ) {
    scene.time += dt;
  }

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
  if ( finishedDownloadingTexture ) {
    app.renderer.dirty = true;
    app.renderer.render();
  }

  app.FPSContainer.innerHTML = "FPS: " + Math.round( 1.0 / dt );

  window.requestAnimationFrame( updateAndDraw );
}

function StartSky() {
  if ( app == null ) {
    var params : SkyAppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
      orbitCenter: new gml.Vec4( 0, 5, 0, 1 ),
      orbitDistance: 0.001
    };

    let shaderRepo = new ShaderRepository( ( repo ) => { 
      app = new SkyApp( params, repo );

      let gl = app.renderer.context;

      app.editor.install();

      let noise = new Noise();

      scene = new Scene( null, null, true, true, [ noise.perlin3Texture( gl, 128 ), noise.textureFromOfflinePackedData( gl, "worley.blob", 64, ( texture ) => {
        finishedDownloadingTexture = true;
        scene.noiseVolumes[1] = texture;
      } ) ] );

      Scene.setActiveScene( scene );

      watermat = new WaterMaterial( new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                  , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                  , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                  , new gml.Vec4( 1.0, 1.0, 1.0, 1 )
                                  , 1.53 );

      // ocean
      scene.addRenderable( new InfinitePlane( 12
                                       , 4
                                       , new gml.Vec4( 0, 0, 0, 1 )
                                       , { x: gml.fromDegrees( 0 ), y: gml.fromDegrees( 0 ), z: gml.fromDegrees( 0 ) }
                                       , { u: 6, v: 6 }
                                       , watermat ) );

      lastFrame = performance.now();

      let cloudinessSlider = <HTMLInputElement> document.getElementById( "cloud-slider" );
      let cloudSpeedSlider = <HTMLInputElement> document.getElementById( "wind-slider" );

      cloudinessSlider.value = ( scene.cloudiness * 100 ).toString();
      cloudSpeedSlider.value = ( scene.cloudSpeed * 30 ).toString();

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
                                                          , true ) ) ); */
    } );
  }
}
