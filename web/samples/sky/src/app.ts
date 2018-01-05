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

  noiseMat: NoiseMaterial;
  noiseTexture: WebGLTexture;

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

    let noise = new Noise();

    let size = 128; // dimensions, in pixels, of our 3D texture
    let v = new gml.Vec3( 0, 0, 0 );
    let p3 = [];
    for ( let x = 0; x < size; x++ ) {
      for ( let y = 0; y < size; y++ ) {
        for ( let z = 0; z < size; z++ ) {
          p3.push( noise.perlin3( x, y, z ) );
        }
      }
    }

    console.log( p3 );

    /*
    // render 3D noise texture at runtime
    this.noiseMat = new NoiseMaterial();

    let quad = new Quad( 1
                       , gml.Vec4.origin
                       , { x: gml.fromDegrees( 0 ), y: gml.fromDegrees( 0 ), z: gml.fromDegrees( 0 ) }
                       , this.noiseMat );

    let gl = this.renderer.context;
    quad.rebuildRenderData( gl );

    let renderTargetFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer( gl.FRAMEBUFFER, renderTargetFramebuffer );

    let depthBuffer = gl.createRenderbuffer();   // renderbuffer for depth buffer in framebuffer
    gl.bindRenderbuffer( gl.RENDERBUFFER, depthBuffer ); // so we can create storage for the depthBuffer
    gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size );
    gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer );

    // noiseTexture is our 3D render target
    this.noiseTexture = gl.createTexture();

    gl.bindTexture( gl.TEXTURE_3D, this.noiseTexture );

    for ( let iLayer = 0; iLayer < size; iLayer++ ) {
      gl.texImage3D( gl.TEXTURE_3D, 0, gl.RGB, size, size, iLayer, 0, gl.RGB, gl.UNSIGNED_BYTE, null );
    }

    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    // these are the default values for wrap so we don't need to explicitly call them
    // gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    // gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT );

    gl.bindTexture( gl.TEXTURE_3D, null );

    this.renderer.useProgram( gl, SHADER_PROGRAM.NOISE_WRITER );

    for ( let iLayer = 0; iLayer < size; iLayer++ ) {
      gl.framebufferTextureLayer( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this.noiseTexture, 0, iLayer );

      let shaderVariables = this.renderer.programData[ SHADER_PROGRAM.NOISE_WRITER ].uniforms;

      gl.uniform1f( shaderVariables.uNoiseLayer, iLayer / size );

      gl.bindBuffer( gl.ARRAY_BUFFER, quad.renderData.vertexBuffer );
      gl.vertexAttribPointer( shaderVariables.aVertexPosition, 3, gl.FLOAT, false, 0, 0 );

      gl.bindBuffer( gl.ARRAY_BUFFER, quad.renderData.vertexTexCoordBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, quad.renderData.textureCoords, gl.STATIC_DRAW );
      gl.vertexAttribPointer( shaderVariables.aVertexTexCoord, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, quad.renderData.indexBuffer );

      gl.uniform1i( shaderVariables.uMaterial.colorMap, 0 );

      gl.drawElements( gl.TRIANGLES, quad.renderData.indices.length, gl.UNSIGNED_SHORT, 0 );
    }
    */
  }
}

var app: SkyApp = null;
var lastFrame: number = null;

function updateAndDraw( t: number ) {
  let dt = ( t - lastFrame ) / 1000.0;
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
      scene = new Scene( null, null, true, true );
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
