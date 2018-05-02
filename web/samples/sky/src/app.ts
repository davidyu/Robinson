interface SkyAppParams {
  vp : HTMLCanvasElement;
  orbitCenter: gml.Vec4;
  orbitDistance: number;
}

class SkyApp {
  editor: ShaderEditor;
  dbg: Debugger;
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
    this.dbg = new Debugger( this.renderer );
    this.orbitCenter = params.orbitCenter;
    this.orbitDistance = params.orbitDistance;
    this.yaw = gml.fromDegrees( 140 );
    this.pitch = gml.fromDegrees( 0 );
    this.renderer.setCamera( this.camera );
    this.dirty = true;
    this.dragStart = new gml.Vec2( 0, 0 );
    this.lastMousePos = new gml.Vec2( 0, 0 );

    {
      let baseAim = new gml.Vec4( 0, 0, -1, 0 );
      let rotY = gml.Mat4.rotateY( this.yaw );
      let rotRight = rotY.transform( gml.Vec4.right );

      let rotX = gml.Mat4.rotate( rotRight, this.pitch );
      let rotAim = rotX.transform( rotY.transform( baseAim ) ).normalized;
      let rotUp = rotRight.cross( rotAim );

      let rotPos = this.orbitCenter.add( rotAim.negate().multiply( this.orbitDistance ) );

      this.camera = new Camera( rotPos, rotAim, rotUp, rotRight );
    }

    let options: NodeListOf<HTMLSelectElement> = document.getElementsByTagName( "select" );
    let frameLimiterOption: HTMLSelectElement = null;

    for ( let i = 0; i < options.length; i++ ) {
      if ( options[i].id == 'frame-limiter' ) frameLimiterOption = options[i];
    }

    frameLimiterOption.onchange = changeFrameLimit;

    let cloudinessSlider = <HTMLInputElement> document.getElementById( "cloud-slider" );
    let cloudSpeedSlider = <HTMLInputElement> document.getElementById( "wind-slider" );
    let focalDistanceSlider = <HTMLInputElement> document.getElementById( "focal-distance" );

    cloudinessSlider.oninput = changeCloudiness;
    cloudSpeedSlider.oninput = changeCloudSpeed;
    cloudSpeedSlider.onchange = changeFinished;
    focalDistanceSlider.oninput = changeFocalDistance;

    let wireframeCheckbox = <HTMLInputElement> document.getElementById( "water-wireframe" );
    wireframeCheckbox.onchange = changeWireframe;

    let showFPSCheckbox = <HTMLInputElement> document.getElementById( "debug-fps" );
    showFPSCheckbox.onchange = changeShowFPS;

    this.FPSContainer = <HTMLDivElement> document.getElementById( "fps-indicator" );

    let playbackButton = <HTMLDivElement> document.getElementById( "toggle-playback" );
    playbackButton.onclick = togglePlayback;

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
var lastAdjusted: string = ""; // need this

function changeCloudiness( e ) {
  scene.cloudiness = e.target.value / 100;
}

function changeCloudSpeed( e ) {
  lastAdjusted = "cloudspeed";
  stoptime = true;
  scene.cloudSpeed = e.target.value / 30; // 1 to 3.33ish
}

function changeFocalDistance( e ) {
  lastAdjusted = "focaldist";
  let f = e.target.value / 100;
  // fudge for our app: transform from 0 to 1 to 0 to 0.3
  app.camera.focalDistance = 0.3 * f;
}

function changeFinished( e ) {
  if ( lastAdjusted == "cloudspeed" ) {
    stoptime = false;
  }
  lastAdjusted = "";
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

function togglePlayback( e ) {
  stoptime = !stoptime;
  if ( stoptime ) {
    e.target.value = '\u25B6';
  } else {
    e.target.value = '\u275A\u275A';
  }
}

function changeFrameLimit( e ) {
  switch ( e.target.value ) {
    case "adaptive":
      frameLimit = -1;
      break;
    case "15":
      frameLimit = 15;
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
var noise: Noise = null;
var lastFrame: number = null;
var texturesDownloaded: number = 0;
var finishedDownloadingTexture = false;
var worley_data = null;
var sparse_data = null;
var perlin_data = null;
var watermat: WaterMaterial;

function updateAndDraw( t: number ) {
  // request another refresh
  requestAnimationFrame( updateAndDraw );

  let dtInMillis = t - lastFrame;
  let dt = dtInMillis / 1000.0;

  let interval = 1000.0 / frameLimit;

  if ( frameLimit != -1 && dtInMillis < interval ) {
    return;
  }

  lastFrame = t;

  if ( frameLimit != -1 ) {
    lastFrame -= ( dtInMillis % interval );
  }

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
  }

  if ( ( !stoptime || app.dirty ) && finishedDownloadingTexture ) {
    app.renderer.render();
  }

  app.dirty = false;

  app.FPSContainer.innerHTML = "FPS: " + Math.round( 1.0 / dt );
}

 // download the two textures we care about, then build them, then inject into scene
function composeNoiseTextures( gl ) {
  let texture = noise.composeFromPackedData( gl, { r: { data: perlin_data, size: 128 }, g: { data: worley_data, size: 64 }, b: { data: sparse_data, size: 64 } } );
  scene.noiseVolume = texture;
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
      app.dbg.install();

      noise = new Noise();

      // download two blob files
      var worley_req = new XMLHttpRequest();
      worley_req.addEventListener( "load", evt => {
        texturesDownloaded++;
        finishedDownloadingTexture = texturesDownloaded == 2;
        worley_data = new Uint8Array( worley_req.response );
        if ( finishedDownloadingTexture ) {
          composeNoiseTextures( gl );
        }
      } );
      worley_req.open( "GET", "worley.blob", true );
      worley_req.responseType = "arraybuffer";
      worley_req.send();

      var sparse_req = new XMLHttpRequest();
      sparse_req.addEventListener( "load", evt => {
        sparse_data = new Uint8Array( sparse_req.response );
        texturesDownloaded++;
        finishedDownloadingTexture = texturesDownloaded == 2;
        if ( finishedDownloadingTexture ) {
          composeNoiseTextures( gl );
        }
      } );
      sparse_req.open( "GET", "sparse_worley.blob", true );
      sparse_req.responseType = "arraybuffer";
      sparse_req.send();

      perlin_data = noise.perlin3TextureDataPacked( 128 );

      let emptyTexture = gl.createTexture();
      gl.bindTexture( gl.TEXTURE_3D, emptyTexture );

      // no mips, 1x1x1...
      gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0 );
      gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 0 );
      gl.texImage3D   ( gl.TEXTURE_3D, 0, gl.RGB, 1, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array( [ 0, 0, 0 ] ) );
      gl.bindTexture  ( gl.TEXTURE_3D, null );

      scene = new Scene( null, null, true, true, emptyTexture );

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
      let focalDistanceSlider = <HTMLInputElement> document.getElementById( "focal-distance" );

      cloudinessSlider.value = ( scene.cloudiness * 100 ).toString();
      cloudSpeedSlider.value = ( scene.cloudSpeed * 30 ).toString();
      focalDistanceSlider.value = ( app.camera.focalDistance * 1000 ).toString();

      updateAndDraw( performance.now() );

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
