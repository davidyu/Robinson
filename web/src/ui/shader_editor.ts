class ShaderEditor {
  // the shader editor should, at a function call, install the editor somewhere (preferably on the lower half of the screen, resizable)
  // it should populate with the vertex shader on the left and the fragment shader on the right
  // it should highlight (ideally) problematic lines after compilation has failed

  renderer: Renderer;
  vertexEditorField  : HTMLTextAreaElement;
  fragmentEditorField: HTMLTextAreaElement;
  shaderList: HTMLUListElement;
  shaderEditor: HTMLDivElement;
  selectedShader: HTMLLIElement;

  constructor( renderer: Renderer ) {
    this.renderer = renderer;

    // shader list selector
    this.shaderList = document.createElement( "ul" );
    this.shaderList.setAttribute( "class", "shader-list" );
    this.selectedShader = null;

    // vert/frag shader textbox
    this.vertexEditorField = document.createElement( "textarea" );
    this.vertexEditorField.setAttribute( "class", "shader-text" );
    this.fragmentEditorField = document.createElement( "textarea" );
    this.fragmentEditorField.setAttribute( "class", "shader-text" );
    this.shaderEditor = document.createElement( "div" );
    this.shaderEditor.setAttribute( "class", "shader-text-con" );
    this.shaderEditor.appendChild( this.vertexEditorField );
    this.shaderEditor.appendChild( this.fragmentEditorField );

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

    stylesheet.insertRule( "body             { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; }" );
    stylesheet.insertRule( ".shader-list     { border: 1px #ccc solid; border-bottom:0; float:left; list-style-type:none; margin:0; padding-left:0; width: 200px; }" );
    stylesheet.insertRule( ".shader-entry    { border-bottom: 1px #ccc solid; font-size: 70%; padding-left: 12%; padding-top: 5%; padding-bottom: 5%; cursor: default; }" );
    stylesheet.insertRule( ".selected        { background-color: #0079e8; color: #fff }" );
    stylesheet.insertRule( ".shader-text     { border: 1px #ccc solid; border-left: 0; width: 50%; height: 100%; margin: 0; padding: 0; }" );
    stylesheet.insertRule( ".shader-text-con { float:left; flex-grow:1; white-space:nowrap; }" );
  }

  install() {
    let container = document.getElementById( "editor-container" );

    this.vertexEditorField.value = this.renderer.programData[ 0 ].vert;
    this.fragmentEditorField.value = this.renderer.programData[ 0 ].frag;

    for ( var programName in SHADER_PROGRAM ) {
      if ( isNaN( <any> programName ) ) {
        let index = SHADER_PROGRAM[ programName ];
        let li = document.createElement( "li" );
        li.innerText = this.prettifyEnum( programName );
        li.setAttribute( "class", "shader-entry" );
        this.shaderList.appendChild( li );
        li.onclick = () => {
          if ( this.selectedShader != li ) {
            this.vertexEditorField.value = this.renderer.programData[ index ].vert;
            this.fragmentEditorField.value = this.renderer.programData[ index ].frag;
            this.selectedShader.setAttribute( "class", "shader-entry" ); // deselect
            this.selectedShader = li;
            li.setAttribute( "class", "selected shader-entry" );
          }
        }
      }
    }

    this.selectedShader = <HTMLLIElement> this.shaderList.firstElementChild;
    this.selectedShader.setAttribute( "class", "selected shader-entry" );

    container.appendChild( this.shaderList );
    container.appendChild( this.shaderEditor );
  }

  prettifyEnum( input: string ): string {
    let output = input.replace( "_", " " );
    output = output.toLowerCase();
    output = output.replace( /\b\w/g, l => l.toUpperCase() );
    return output;
  }
}
