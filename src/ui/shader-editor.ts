var verbose_editor_logging = false;

class ShaderEditor {
  // the shader editor should, at a function call, install the editor somewhere (preferably on the lower half of the screen, resizable)
  // it should populate with the vertex shader on the left and the fragment shader on the right
  // it should highlight (ideally) problematic lines after compilation has failed

  renderer: Renderer;
  vertexEditorField  : HTMLDivElement;
  fragmentEditorField: HTMLDivElement;
  shaderList: HTMLUListElement;
  shaderEditor: HTMLDivElement;
  selectedShader: HTMLLIElement;
  selectedShaderName: string;
  vertexShaderEditor;
  fragmentShaderEditor;

  vertexEditSessions  : AceAjax.IEditSession[];
  fragmentEditSessions: AceAjax.IEditSession[];

  constructor( renderer: Renderer ) {
    this.renderer = renderer;

    // shader list selector
    this.shaderList = document.createElement( "ul" );
    this.shaderList.setAttribute( "class", "shader-list" );
    this.selectedShader = null;

    // vert/frag shader textbox
    this.vertexEditorField = document.createElement( "div" );
    this.vertexEditorField.setAttribute( "class", "shader-text" );
    this.fragmentEditorField = document.createElement( "div" );
    this.fragmentEditorField.setAttribute( "class", "shader-text" );
    this.shaderEditor = document.createElement( "div" );
    this.shaderEditor.setAttribute( "class", "shader-text-con" );
    this.shaderEditor.appendChild( this.vertexEditorField );
    this.shaderEditor.appendChild( this.fragmentEditorField );

    this.vertexShaderEditor = ace.edit( this.vertexEditorField );
    this.vertexShaderEditor.setTheme("ace/theme/solarized_light");
    this.vertexShaderEditor.session.setMode( "ace/mode/glsl" );
    this.vertexShaderEditor.$blockScrolling = Infinity;

    this.fragmentShaderEditor = ace.edit( this.fragmentEditorField );
    this.fragmentShaderEditor.setTheme("ace/theme/solarized_light");
    this.fragmentShaderEditor.session.setMode( "ace/mode/glsl" );
    this.fragmentShaderEditor.$blockScrolling = Infinity;

    // create stylesheet dynamically
    // this should probably just be put in a CSS file somewhere so it's overrideable
    // but for now, since we really don't care about customizability of the editor, just
    // put it all here for portability and ease of building
    let stylesheet: CSSStyleSheet = document.styleSheets[0] as CSSStyleSheet;

    if ( stylesheet == null ) {
      let style = document.createElement( "style" );
      style.type = "text/css";

      document.getElementsByTagName( "head" )[0].appendChild( style );
      stylesheet = document.styleSheets[0] as CSSStyleSheet;
    }

    stylesheet.insertRule( "html, body       { height: 100%; margin: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; }" );
    stylesheet.insertRule( ".shader-list     { float:left; list-style-type:none; margin:0; padding-left:0; width: 200px; }" );
    stylesheet.insertRule( ".shader-entry    { border-bottom: 1px #ccc solid; font-size: 70%; padding-left: 10%; padding-top: 3%; padding-bottom: 3%; cursor: default; }" );
    stylesheet.insertRule( ".selected        { background-color: #0079e8; color: #fff }" );
    stylesheet.insertRule( ".shader-text     { border-left: 1px #ccc solid; width: 50%; height: 100%; margin: 0; padding: 0; }" );
    stylesheet.insertRule( ".shader-text-con { float: left; flex-grow: 1; display: flex; }" );
  }

  rebuildSelectedShader( session: AceAjax.IEditSession ) {
    console.assert( session == this.vertexShaderEditor.session || session == this.fragmentShaderEditor.session );

    let gl = this.renderer.context;
    if ( gl ) {
      let vertexShader = gl.createShader( gl.VERTEX_SHADER );
      gl.shaderSource( vertexShader, this.vertexShaderEditor.getValue() );
      gl.compileShader( vertexShader );

      if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
        let errors = gl.getShaderInfoLog( vertexShader ).split( "\n" );
        let annotations = [];
        for ( let i = 0; i < errors.length; i++ ) {
          let error = errors[i];
          let results = /\w+: [0-9]+:([0-9]+): (.*)$/g.exec( error ); // group 1: line number, group 2: error message
          if ( results == null ) continue;
          // see https://regexr.com/3k19s
          annotations.push( { row: parseInt( results[1] ) - 1, column: 0, text: results[2], type: "error" } );
        }

        this.vertexShaderEditor.session.clearAnnotations();
        this.vertexShaderEditor.session.setAnnotations( annotations );

        if ( verbose_editor_logging ) {
          console.log( errors );
        }
        return;
      } else {
        // all good.
        this.vertexShaderEditor.session.clearAnnotations();
      }

      let fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
      gl.shaderSource( fragmentShader, this.fragmentShaderEditor.getValue() );
      gl.compileShader( fragmentShader );

      if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
        let errors = gl.getShaderInfoLog( fragmentShader ).split( "\n" );
        let annotations = [];
        for ( let i = 0; i < errors.length; i++ ) {
          let error = errors[i];
          let results = /\w+: [0-9]+:([0-9]+): (.*)$/g.exec( error ); // group 1: line number, group 2: error message
          if ( results == null ) continue;
          // see https://regexr.com/3k19s
          annotations.push( { row: parseInt( results[1] ) - 1, column: 0, text: results[2], type: "error" } );
        }

        this.fragmentShaderEditor.session.clearAnnotations();
        this.fragmentShaderEditor.session.setAnnotations( annotations );

        if ( verbose_editor_logging ) {
          console.log( errors );
        }
        return;
      } else {
        // all good.
        this.fragmentShaderEditor.session.clearAnnotations();
      }

      var program = gl.createProgram();
      gl.attachShader( program, vertexShader );
      gl.attachShader( program, fragmentShader );

      // force aVertexPosition to be bound to 0 to avoid perf penalty
      // gl.bindAttribLocation( program, 0, "aVertexPosition" );
      gl.linkProgram( program );

      if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
        console.log( "Unable to initialize the shader program: " + gl.getProgramInfoLog( program ) );
        return;
      }

      this.renderer.shaderLibrary.programs[ this.selectedShaderName ].program = program;
      this.renderer.shaderLibrary.programs[ this.selectedShaderName ].presetup( gl, this.renderer.shaderLibrary.programs[ this.selectedShaderName ] );
    } else {
      console.log( "no renderer context! This is bad." );
    }
  }

  install() {
    let container = document.getElementById( "shader-editor" );

    this.selectedShaderName = Object.keys( this.renderer.shaderLibrary.programs )[ 0 ];

    if ( this.renderer.context == null ) return;

    let defaultProgram = this.renderer.shaderLibrary.programs[ this.selectedShaderName ];

    this.vertexShaderEditor.setValue( this.renderer.shaderLibrary.sources[ defaultProgram.sourceVSFilename ], -1 );
    this.fragmentShaderEditor.setValue( this.renderer.shaderLibrary.sources[ defaultProgram.sourceFSFilename ], -1 ); 

    this.vertexEditSessions = [];
    this.fragmentEditSessions = [];

    let sources = this.renderer.shaderLibrary.sources;
    for ( let programName in this.renderer.shaderLibrary.programs ) {
      let program = this.renderer.shaderLibrary.programs[ programName ];
      let vertexSession = ace.createEditSession( sources[ program.sourceVSFilename ], <any> "ace/mode/glsl" );
      vertexSession.on( "change", ( e ) => {
        // console.log( "changed " + program.sourceVSFilename );
        this.rebuildSelectedShader( vertexSession );
      } );
      this.vertexEditSessions.push( vertexSession );
      let fragSession = ace.createEditSession( sources[ program.sourceFSFilename ], <any> "ace/mode/glsl" );
      fragSession.on( "change", ( e ) => {
        // console.log( "changed " + program.sourceFSFilename );
        this.rebuildSelectedShader( fragSession );
      } );
      this.fragmentEditSessions.push( fragSession );

      let li = document.createElement( "li" );
      li.innerText = this.prettifyEnum( programName );
      li.setAttribute( "class", "shader-entry" );
      this.shaderList.appendChild( li );
      li.onclick = () => {
        if ( this.selectedShader != li ) {
          this.selectedShaderName = programName;
          this.vertexShaderEditor.setSession( vertexSession );
          this.fragmentShaderEditor.setSession( fragSession );
          this.selectedShader.setAttribute( "class", "shader-entry" ); // deselect
          this.selectedShader = li;
          li.setAttribute( "class", "selected shader-entry" );
        }
      }
    }

    this.selectedShader = <HTMLLIElement> this.shaderList.firstElementChild;
    this.selectedShader.setAttribute( "class", "selected shader-entry" );

    container.appendChild( this.shaderList );
    container.appendChild( this.shaderEditor );
  }

  prettifyEnum( input: string ): string {
    let output = input.replace( /_/g, " " );
    output = output.toLowerCase();
    output = output.replace( /\b\w/g, l => l.toUpperCase() );
    return output;
  }
}
