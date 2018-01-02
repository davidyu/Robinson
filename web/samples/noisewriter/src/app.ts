var shaderRepo: ShaderRepository = null; // global for debugging
var scene: Scene;

interface NoiseAppParams {
  vp : HTMLCanvasElement;
}

class NoiseApp {
  renderer: Renderer;
  camera: Camera;
  dirty: boolean;

  // ui
  dragging: boolean;
  dragStart: gml.Vec2;
  lastMousePos: gml.Vec2;

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
        this.dirty = true;
        ev.preventDefault();
        return false;
      }
    }, false );
  }

  public fixedUpdate( delta: number ) {
    scene.time += 1.0/30.0;

    if ( this.dirty ) {
      this.renderer.update();
      this.renderer.render();
      this.dirty = false;
    }
  }
}

var app: NoiseApp = null;

function StartNoiseWriter() {
  if ( app == null ) {
    var params : NoiseAppParams = {
      vp : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
    };

    shaderRepo = new ShaderRepository( ( repo ) => { app = new NoiseApp( params, repo ); } );

    scene = new Scene( null, null );
    Scene.setActiveScene( scene );

    // ocean
    scene.addRenderable( new Quad( 1
                                 , gml.Vec4.origin
                                 , { x: gml.fromDegrees( 0 ), y: gml.fromDegrees( 0 ), z: gml.fromDegrees( 0 ) }
                                 , new NoiseMaterial() ) );
  }
}
