var shaderRepo: ShaderRepository = null; // global for debugging

interface SkyAppParams {
  vp : HTMLCanvasElement;
  orbitCenter: gml.Vec4;
  orbitDistance: number;
}

class SkyApp {
  constructor( params: SkyAppParams, shaderRepo: ShaderRepository ) {
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
    testScene.addRenderable( new Sphere( 1, gml.Vec4.origin, new BlinnPhongMaterial( new gml.Vec4( 0.1, 0.1, 0.1, 1 ), new gml.Vec4( 0.5, 0.5, 0.5, 1 ), new gml.Vec4( 0.5, 0.5, 0.5, 1 ), new gml.Vec4( 0, 0, 0, 1 ), 20.0 ) ) );

    testScene.addLight( new PointLight( new gml.Vec4( 9.0, 0, 0, 1.0 ), new gml.Vec4( 1.0, 1.0, 1.0, 1.0 ), 10 ) );
    testScene.addLight( new PointLight( new gml.Vec4( 3.0, 3.0, 0, 1.0 ), new gml.Vec4( 1.0, 0.0, 0.0, 1.0 ), 10 ) );
    testScene.addLight( new PointLight( new gml.Vec4( 0, 9.0, 0, 1.0 ), new gml.Vec4( 0.0, 1.0, 0.0, 1.0 ), 10 ) );
    testScene.addLight( new PointLight( new gml.Vec4( 0, 0, 9.0, 1.0 ), new gml.Vec4( 0.0, 0.0, 1.0, 1.0 ), 10 ) );
  }
}
