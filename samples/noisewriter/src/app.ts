var scene: Scene;

interface NoiseAppParams {
  vp : HTMLCanvasElement;
}

class NoiseApp {
  renderer: Renderer;
  camera: Camera;
  dirty: boolean;

  // material
  noiseMat: NoiseMaterial;

  // ui
  dragging: boolean;
  dragStart: gml.Vec2;
  lastMousePos: gml.Vec2;

  constructor( params: NoiseAppParams ) {
    this.renderer = new Renderer( params.vp );
    this.renderer.shaderLibrary.loadShader( "noise.frag" );

    this.renderer.shaderLibrary.allShadersLoaded.push( ( gl, lib ) => {
      let shader = lib.compileProgram( gl, "screenspacequad.vert", "noise.frag", "noisewriter" );
      if ( shader != null ) {
        shader.presetup = ( gl, shader ) => {
          shader.attributes[ "aVertexPosition" ] = gl.getAttribLocation( shader.program, "aVertexPosition" );
          shader.attributes[ "aVertexTexCoord" ] = gl.getAttribLocation( shader.program, "aVertexTexCoord" );

          shader.uniforms[ "uNoiseLayer" ] = gl.getUniformLocation( shader.program, "uNoiseLayer" );
        }

        shader.presetup( gl, shader );

        shader.setup = ( gl, attributes, uniforms ) => {
          gl.disableVertexAttribArray( 0 );
          gl.disableVertexAttribArray( 1 );
          gl.disableVertexAttribArray( 2 );
          gl.enableVertexAttribArray( attributes.aVertexPosition );
          gl.enableVertexAttribArray( attributes.aVertexTexCoord );
        };
      }
    } );

    let pos    = new gml.Vec4( 0, 0, 1000, 1 )
    let aim    = new gml.Vec4( 0, 0, -1, 0 );
    let up     = gml.Vec4.up;
    let right  = gml.Vec4.right;
    this.camera = new Camera( pos, aim, up, right );
    this.renderer.setCamera( this.camera );
    this.dirty = true;
    this.dragStart = new gml.Vec2( 0, 0 );
    this.lastMousePos = new gml.Vec2( 0, 0 );
    this.noiseMat = new NoiseMaterial();

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

    app = new NoiseApp( params );
    scene = new Scene( null, null, false, false );
    Scene.setActiveScene( scene );

    // noise test ss quad
    scene.addRenderable( new Quad( 1
                                 , gml.Vec4.origin
                                 , { x: gml.fromDegrees( 0 ), y: gml.fromDegrees( 0 ), z: gml.fromDegrees( 0 ) }
                                 , app.noiseMat ) );

    window.requestAnimationFrame( updateAndDraw );
  }
}
