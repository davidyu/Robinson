class Debugger {
  renderer: Renderer;

  allOptions: HTMLDivElement;
  depthBufferOption: HTMLDivElement;

  constructor( renderer: Renderer ) {
    this.renderer = renderer;

    this.allOptions = document.createElement( "div" );
    this.allOptions.setAttribute( "class", "debugger-options-container" );

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

    // create stylesheet dynamically
    // this should probably just be put in a CSS file somewhere so it's overrideable
    // but for now, since we really don't care about customizability of the debugger, just
    // put it all here for portability and ease of building
    let stylesheet: CSSStyleSheet = document.styleSheets[0] as CSSStyleSheet;

    if ( stylesheet == null ) {
      let style = document.createElement( "style" );
      style.type = "text/css";

      document.getElementsByTagName( "head" )[0].appendChild( style );
      stylesheet = document.styleSheets[0] as CSSStyleSheet;
    }

    stylesheet.insertRule( ".debugger-options-container { padding: 20px; }" );
    stylesheet.insertRule( ".debugger-options-container label { font-size: 12px; display: inline-block; width: 120px }" );
  }

  depthBufferCheckboxChanged( e ) {
    this.renderer.visualizeDepthBuffer = e.target.checked;
  }

  install() {
    let container = document.getElementById( "debugger" );

    container.appendChild( this.allOptions );
  }
}
