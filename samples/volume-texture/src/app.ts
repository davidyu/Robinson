var shaderRepo: ShaderRepository = null; // global for debugging
var scene: Scene;

interface NoiseAppParams {
  vp : HTMLCanvasElement;
}

class NoiseApp {
  renderer: Renderer;
  camera: Camera;
  dirty: boolean;

  // material
  noiseMat: VolumeMaterial;

  // ui
  dragging: boolean;
  dragStart: gml.Vec2;
  lastMousePos: gml.Vec2;

  textureDataDownloadElement: HTMLAnchorElement;

  constructor( params: NoiseAppParams, shaderRepo: ShaderRepository ) {
    this.renderer = new Renderer( params.vp, shaderRepo );
    let pos    = new gml.Vec4( 0, 0, 1000, 1 )
    let aim    = new gml.Vec4( 0, 0, -1, 0 );
    let up     = gml.Vec4.up;
    let right  = gml.Vec4.right;
    this.camera = new Camera( pos, aim, up, right );
    this.renderer.setCamera( this.camera );
    this.dirty = true;
    this.dragStart = new gml.Vec2( 0, 0 );
    this.lastMousePos = new gml.Vec2( 0, 0 );

    this.textureDataDownloadElement = <HTMLAnchorElement> document.getElementById( "download-texture" );

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
        this.dirty = true;
        ev.preventDefault();
        this.noiseMat.layer = ( this.lastMousePos.x % 512.0 ) / 512.0;
        return false;
      }
    }, false );

    let size = 128; // dimensions, in pixels, of our 3D texture
    let gl = this.renderer.context;

    let noise = new Noise();

    let data = noise.worley3TextureDataPacked( 128 );
    // let data = noise.perlin3TextureDataPacked( 128 );
    this.noiseMat = new VolumeMaterial( noise.textureFromPackedData( gl, data, 128 ) );
    this.textureDataDownloadElement.href = window.URL.createObjectURL( new Blob( [ data ], { type: 'application/octet-stream' } ) );
    this.textureDataDownloadElement.download = "noise.blob";

    let loadTextureElement = document.getElementById( "load-texture" );
    loadTextureElement.onchange = ( e ) => {
      let file = ( <any> e.target ).files[0];
      if ( !file.name.match( '.*blob' ) ) {
        return;
      }

      let reader = new FileReader();
      reader.addEventListener( "loadend", () => {
        let buf = <ArrayBuffer> reader.result;
        let texture = noise.textureFromPackedData( gl, new Uint8Array( buf ), 128 );
        this.noiseMat.volumeTexture = texture;
        console.log( buf.byteLength );
      } );
      console.log( file );
      reader.readAsArrayBuffer( file );
    }
  }

  public fixedUpdate( delta: number ) {
    scene.time += 1.0/30.0;

    this.renderer.update();
    this.renderer.render();
  }
}

var app: NoiseApp = null;
var lastFrame: number = null;

function updateAndDraw( t: number ) {
  let dt = ( t - lastFrame ) / 1000.0;
  lastFrame = t;

  scene.time += dt;
  app.renderer.update();
  app.renderer.render();

  window.requestAnimationFrame( updateAndDraw );
}

function StartNoiseWriter() {
  if ( app == null ) {
    var params : NoiseAppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
    };

    shaderRepo = new ShaderRepository( ( repo ) => {
      app = new NoiseApp( params, repo );
      scene = new Scene( null, null, false, false, null );
      Scene.setActiveScene( scene );

      // noise test ss quad
      scene.addRenderable( new Quad( 1
                                   , gml.Vec4.origin
                                   , { x: gml.fromDegrees( 0 ), y: gml.fromDegrees( 0 ), z: gml.fromDegrees( 0 ) }
                                   , app.noiseMat ) );

      window.requestAnimationFrame( updateAndDraw );
    } );
  }
}
