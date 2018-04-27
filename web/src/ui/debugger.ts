class Debugger {
  renderer: Renderer;

  allOptions: HTMLDivElement;
  depthBufferOption: HTMLDivElement;

  constructor( renderer: Renderer ) {
    this.renderer = renderer;

    this.allOptions = document.createElement( "div" );
    this.allOptions.setAttribute( "class", "options-container" );

    this.depthBufferOption = document.createElement( "div" );
    this.depthBufferOption.setAttribute( "class", "option" );

    let depthBufferLabel = document.createElement( "label" );
    depthBufferLabel.innerText = "Depth Buffer";

    this.depthBufferOption.appendChild( depthBufferLabel );

    let depthBufferCheckbox = document.createElement( "input" );
    depthBufferCheckbox.setAttribute( "id", "visualize-depth-buffer" );
    depthBufferCheckbox.setAttribute( "type", "checkbox" );

    depthBufferCheckbox.onchange = ( e ) => { this.depthBufferCheckboxChanged( e ); };

    this.depthBufferOption.appendChild( depthBufferCheckbox );

    this.allOptions.appendChild( this.depthBufferOption );
  }

  depthBufferCheckboxChanged( e ) {
    this.renderer.visualizeDepthBuffer = e.target.checked;
  }

  install() {
    let container = document.getElementById( "debugger" );

    container.appendChild( this.allOptions );
  }
}
