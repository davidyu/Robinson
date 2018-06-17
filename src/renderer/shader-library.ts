// uniforms should have three sections:
// - light uniforms
// - unstructured uniforms
// attribute locations
// - attribute locations
interface ShaderUniformsV2 { [ name: string ]: WebGLUniformLocation }
interface ShaderVertexAttributes { [ name: string ]: GLint }

/***
 * A compiled program along with its uniforms and metadata about its sources
 */
class CompiledProgramData {
  program: WebGLProgram;
  uniforms: ShaderUniformsV2;
  sourceVSFilename: string;
  sourceFSFilename: string;
  constructor( vs: string, fs: string ) {
    this.sourceVSFilename = vs;
    this.sourceFSFilename = fs;
    this.program = null;
    this.uniforms = {};
  }
}

class ShaderLibrary {
  // the contents of the shader (.vert or .frag) files we load/edit at runtime
  sources  : { [ filename: string ] : string };

  // the actual compiled shader programs, and their uniforms
  programs : { [ name: string ] : CompiledProgramData };

  // the list of ongoing/unresolved shader download requests
  outgoingRequests: XMLHttpRequest[];

  // CALLBACKS

  // this is called when all shaders have been loaded
  allShadersLoaded: ( ShaderLibrary ) => void; 
  // this is called when a particular shader has been loaded
  shaderLoaded    : ( lib: ShaderLibrary, filename: string, source: string ) => void;  // ( lib, filename, source )

  constructor() {
    this.allShadersLoaded = null;
    this.shaderLoaded = null;
    this.outgoingRequests = [];
  }

  loadShader( name: string ) {
    var req = new XMLHttpRequest();

    req.addEventListener( "load", evt => { 
      this.sources[ name ] = req.responseText;
      if ( this.shaderLoaded != null ) {
        this.shaderLoaded( this, name, req.responseText );
      }

      // remove me from the outgoing request list
      this.outgoingRequests = this.outgoingRequests.filter( r => r != req );

      if ( this.outgoingRequests.length == 0 && this.allShadersLoaded != null ) {
        this.allShadersLoaded( this );
      }
    } );

    req.open( "GET", "./shaders/" + name, true );

    this.outgoingRequests.push( req );

    req.send();
  }

  compileProgram( gl: WebGLRenderingContext & WebGL2RenderingContext, vsFilename: string, fsFilename: string, programName: string, suppressErrors: boolean = false ): CompiledProgramData {
    if ( gl ) {
      var vertexShader = gl.createShader( gl.VERTEX_SHADER );
      gl.shaderSource( vertexShader, vsFilename );
      gl.compileShader( vertexShader );

      if ( !suppressErrors && !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
        console.log( "An error occurred compiling the vertex shader: " + gl.getShaderInfoLog( vertexShader ) );
        return null;
      }

      var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
      gl.shaderSource( fragmentShader, fsFilename );
      gl.compileShader( fragmentShader );

      if ( !suppressErrors && !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
        console.log( "An error occurred compiling the fragment shader: " + gl.getShaderInfoLog( fragmentShader ) );
        return null;
      }

      // Create the shader program
      var program = gl.createProgram();
      gl.attachShader( program, vertexShader );
      gl.attachShader( program, fragmentShader );

      // force aVertexPosition to be bound to 0 to avoid perf penalty
      // gl.bindAttribLocation( program, 0, "aVertexPosition" );
      gl.linkProgram( program );

      if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        console.log( "Unable to initialize the shader program: " + gl.getProgramInfoLog( program ) );
        console.log( "Problematic vertex shader:\n" + vsFilename );
        console.log( "Problematic fragment shader:\n" + fsFilename );
      }

      let out = new CompiledProgramData( vsFilename, fsFilename );
      out.program = program;

      return out;
    }
    return null;
  }
};
