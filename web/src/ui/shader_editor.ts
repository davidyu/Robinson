class ShaderEditor {
  // the shader editor should, at a function call, install the editor somewhere (preferably on the lower half of the screen, resizable)
  // it should populate with the vertex shader on the left and the fragment shader on the right
  // it should highlight (ideally) problematic lines after compilation has failed

  renderer: Renderer;
  vertexEditorField  : HTMLTextAreaElement;
  fragmentEditorField: HTMLTextAreaElement;

  constructor( renderer: Renderer ) {
    this.renderer = renderer;
    this.vertexEditorField = document.createElement( "textarea" );
    this.fragmentEditorField = document.createElement( "textarea" );
  }

  install() {
    let container = document.getElementById( "editor-container" );

    this.vertexEditorField.value = this.renderer.repo.files[ SHADERTYPE.WATER_VERT ].source;
    this.fragmentEditorField.value = this.renderer.repo.files[ SHADERTYPE.WATER_FRAG ].source;

    container.appendChild( this.vertexEditorField );
    container.appendChild( this.fragmentEditorField );
  }
}
