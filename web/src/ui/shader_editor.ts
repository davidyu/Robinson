class ShaderEditor {
  // the shader editor should, at a function call, install the editor somewhere (preferably on the lower half of the screen, resizable)
  // it should populate with the vertex shader on the left and the fragment shader on the right
  // it should highlight (ideally) problematic lines after compilation has failed

  renderer: Renderer;
  vertexEditorField  : HTMLTextAreaElement;
  fragmentEditorField: HTMLTextAreaElement;
  shaderList: HTMLUListElement;

  constructor( renderer: Renderer ) {
    this.renderer = renderer;
    this.vertexEditorField = document.createElement( "textarea" );
    this.fragmentEditorField = document.createElement( "textarea" );
    this.shaderList = document.createElement( "ul" );
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
    container.appendChild( this.vertexEditorField );
    container.appendChild( this.fragmentEditorField );
  }
}
