// uniforms should have three sections:
// - light uniforms
// - unstructured uniforms
// attribute locations
// - attribute locations
interface ShaderUniformsV2 { [ name: string ]: WebGLUniformLocation }
interface ShaderVertexAttributes { [ name: string ]: GLint }
interface LightUniform { [ name: string ]: WebGLUniformLocation }

/***
 * A compiled program along with its uniforms and metadata about its sources
 */
class CompiledProgramData {
  program: WebGLProgram;
  uniforms: ShaderUniformsV2;
  attributes: ShaderVertexAttributes;
  lightUniforms: LightUniform[];
  sourceVSFilename: string;
  sourceFSFilename: string;
  presetup: ( gl: WebGLRenderingContext & WebGL2RenderingContext, shader: CompiledProgramData ) => void;
  setup: ( gl: WebGLRenderingContext & WebGL2RenderingContext, attributes: ShaderVertexAttributes, uniforms: ShaderUniformsV2 ) => void;
  constructor( vs: string, fs: string ) {
    this.sourceVSFilename = vs;
    this.sourceFSFilename = fs;
    this.program = null;
    this.uniforms = {};
    this.attributes = {};
    this.lightUniforms = [];
    this.setup = null;
    this.presetup = null;
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

  doneLoading() {
    return this.outgoingRequests.length == 0;
  }

  constructor() {
    this.allShadersLoaded = null;
    this.shaderLoaded = null;
    this.outgoingRequests = [];
    this.sources = {};
    this.programs = {};
  }

  loadShader( filename: string ) {
    var req = new XMLHttpRequest();

    req.addEventListener( "load", evt => {
      if ( this.shaderLoaded != null ) {
        this.shaderLoaded( this, filename, req.responseText );
      }
      this.sources[ filename ] = req.responseText;

      // remove me from the outgoing request list
      this.outgoingRequests = this.outgoingRequests.filter( r => r != req );

      if ( this.outgoingRequests.length == 0 && this.allShadersLoaded != null ) {
        this.allShadersLoaded( this );
      }
    } );

    req.open( "GET", "./shaders/" + filename, true );

    this.outgoingRequests.push( req );

    req.send();
  }

  compileProgram( gl: WebGLRenderingContext & WebGL2RenderingContext, vsFilename: string, fsFilename: string, programName: string, suppressErrors: boolean = false ): CompiledProgramData {
    if ( gl ) {
      let vertexShader = gl.createShader( gl.VERTEX_SHADER );
      let vertexShaderSource = this.sources[ vsFilename ];
      let fragmentShaderSource = this.sources[ fsFilename ];

      console.assert( vertexShaderSource != null, vsFilename );
      console.assert( fragmentShaderSource != null, fsFilename );

      gl.shaderSource( vertexShader, vertexShaderSource );
      gl.compileShader( vertexShader );

      if ( !suppressErrors && !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
        console.log( "An error occurred compiling the vertex shader: " + vsFilename + "\n" + gl.getShaderInfoLog( vertexShader ) );
        return null;
      }

      var fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
      gl.shaderSource( fragmentShader, fragmentShaderSource );
      gl.compileShader( fragmentShader );

      if ( !suppressErrors && !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
        console.log( "An error occurred compiling the fragment shader: " + fsFilename + "\n" + gl.getShaderInfoLog( fragmentShader ) );
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

      this.programs[ programName ] = out;

      return out;
    }
    return null;
  }
};
