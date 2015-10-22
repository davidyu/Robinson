class Scene {
  public renderables: Renderable[];
  public lights: Light[];
  private static activeScene;

  constructor() {
    this.renderables = [];
    this.lights = [];
  }

  public addRenderable( renderable: Renderable ) {
    this.renderables.push( renderable );
  }

  public addLight( light: Light ) {
    this.lights.push( light );
  }

  static setActiveScene( scene: Scene ) {
    this.activeScene = scene;
  }
  
  static getActiveScene(): Scene {
    return this.activeScene;
  }
}
