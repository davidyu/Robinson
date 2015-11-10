var shaderRepo: ShaderRepository = null; // global for debugging

interface EditorParams {
  big : HTMLCanvasElement;
  tl  : HTMLCanvasElement;
  tr  : HTMLCanvasElement;
  bl  : HTMLCanvasElement;
  br  : HTMLCanvasElement;
}

enum VIEWMODE {
  SINGLE_LARGE_VIEWPORT,
  SPLIT_SMALL_VIEWPORTS,
}

var frontcam: Camera = null;
var backcam: Camera = null;
var sidecam: Camera = null;
var topcam: Camera = null;
var pcam: Camera = null;

class Ed {
  renderer: Renderer;
  viewMode: VIEWMODE;
  camera: Camera; // TODO map cameras to each viewport

  constructor( params: EditorParams, shaderRepo: ShaderRepository ) {
    this.viewMode = VIEWMODE.SINGLE_LARGE_VIEWPORT;
    this.renderer = new Renderer( params.big, shaderRepo );
    this.camera = frontcam;
    this.renderer.setCamera( this.camera );

    setInterval( () => { this.fixedUpdate() }, 1000/30 );
  }

  buildFourViewports() {
  }

  buildSingleViewport() {
  }

  public fixedUpdate() {
    this.renderer.update();
    this.renderer.render();
  }
}

var editor: Ed = null;

function StartEd() {
  if ( editor == null ) {

    frontcam = new Camera( new TSM.vec3( [ 0, 0, 9 ] ), new TSM.vec3( [ 0, 0, -1 ] ), new TSM.vec3( [ 0, 1, 0 ] ), new TSM.vec3( [ 1, 0, 0 ] ) );
    backcam = new Camera( new TSM.vec3( [ 0, 0, -9 ] ), new TSM.vec3( [ 0, 0, 1 ] ), new TSM.vec3( [ 0, 1, 0 ] ), new TSM.vec3( [ -1, 0, 0 ] ) );
    sidecam = new Camera( new TSM.vec3( [ 9, 0, 0 ] ), new TSM.vec3( [ -1, 0, 0 ] ), new TSM.vec3( [ 0, 1, 0 ] ), new TSM.vec3( [ 0, 0, -1 ] ) );
    topcam = new Camera( new TSM.vec3( [ 0, 9, 0 ] ), new TSM.vec3( [ 0, -1, 0 ] ), new TSM.vec3( [ 0, 0, -1 ] ), new TSM.vec3( [ 1, 0, 0 ] ) );
    pcam = new Camera( new TSM.vec3( [ 3, 5, 9 ] ), new TSM.vec3( [ -3, -5, -9 ] ), new TSM.vec3( [ 0, 1, 0 ] ), new TSM.vec3( [ 1, 0, 0 ] ) );

    var params : EditorParams = {
      big : <HTMLCanvasElement> document.getElementById( "big-viewport" ),
      tl  : <HTMLCanvasElement> document.getElementById( "small-viewport-tl" ),
      tr  : <HTMLCanvasElement> document.getElementById( "small-viewport-tr" ),
      bl  : <HTMLCanvasElement> document.getElementById( "small-viewport-bl" ),
      br  : <HTMLCanvasElement> document.getElementById( "small-viewport-br" ),
    };

    shaderRepo = new ShaderRepository( ( repo ) => { editor = new Ed( params, repo ); } );

    var testScene = new Scene()
    Scene.setActiveScene( testScene );
    // testScene.addRenderable( new Cube( 1 ) );
    testScene.addRenderable( new Quad( 1, new DebugMaterial() ) );
    testScene.addLight( new PointLight( new TSM.vec4( [ 9.0, 0, 0, 1.0 ] ), new TSM.vec4( [ 1.0, 0, 0, 1.0 ] ) ) );

    Mousetrap.bind( '1', e => {
      editor.renderer.setCamera( frontcam );
      editor.renderer.dirty = true;
    } );

    Mousetrap.bind( 'alt+1', e => {
      editor.renderer.setCamera( backcam );
      editor.renderer.dirty = true;
    } );

    Mousetrap.bind( '2', e => {
      editor.renderer.setCamera( sidecam );
      editor.renderer.dirty = true;
    } );

    Mousetrap.bind( '3', e => {
      editor.renderer.setCamera( topcam );
      editor.renderer.dirty = true;
    } );

    Mousetrap.bind( 'p', e => {
      editor.renderer.setCamera( pcam );
      editor.renderer.dirty = true;
    } );
  }
}
