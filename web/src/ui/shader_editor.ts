class ShaderEditor {
  // the shader editor should, at a function call, install the editor somewhere (preferably on the lower half of the screen, resizable)
  // it should populate with the vertex shader on the left and the fragment shader on the right
  // it should highlight (ideally) problematic lines after compilation has failed

  renderer: Renderer;
  vertexEditorField  : HTMLTextAreaElement;
  fragmentEditorField: HTMLTextAreaElement;
  shaderList: HTMLUListElement;
  shaderEditor: HTMLDivElement;

  constructor( renderer: Renderer ) {
    this.renderer = renderer;
    this.vertexEditorField = document.createElement( "textarea" );
    this.vertexEditorField.setAttribute( "style", "width:49%; height:100%; margin:0; padding:0;" );
    this.fragmentEditorField = document.createElement( "textarea" );
    this.fragmentEditorField.setAttribute( "style", "width:49%; height:100%; margin:0; padding:0;" );
    this.shaderList = document.createElement( "ul" );
    this.shaderList.setAttribute( "style", "width:150px; listt-style-type:none; float:left; padding-left:0" );
    this.shaderEditor = document.createElement( "div" );
    this.shaderEditor.setAttribute( "style", "float:left; flex-grow:1;" );
  }

  install() {
    let container = document.getElementById( "editor-container" );

    this.vertexEditorField.value = this.renderer.programData[ 0 ].vert;
    this.fragmentEditorField.value = this.renderer.programData[ 0 ].frag;

    for ( var programName in SHADER_PROGRAM ) {
      if ( isNaN( <any> programName ) ) {
        let li = document.createElement( "li" );
        li.innerText = programName;
        this.shaderList.appendChild( li );
        let index = SHADER_PROGRAM[ programName ];
        li.onclick = () => {
          this.vertexEditorField.value = this.renderer.programData[ index ].vert;
          this.fragmentEditorField.value = this.renderer.programData[ index ].frag;
        }
      }
    }

    container.appendChild( this.shaderList );
    container.appendChild( this.shaderEditor );
    this.shaderEditor.appendChild( this.vertexEditorField );
    this.shaderEditor.appendChild( this.fragmentEditorField );
  }
}
