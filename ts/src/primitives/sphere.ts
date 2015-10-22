class Sphere extends Primitive implements Renderable {
  material: Material;
  renderData: RenderData;

  constructor( size: number = 1, mat: Material = new BlinnPhongMaterial() ) {
    super();
    this.transform = this.transform.scale( new TSM.vec3( [ size, size, size ] ) );
    this.material = mat;
    this.renderData = new RenderData();
    // trigger a rebuild when the renderer updates
    this.renderData.dirty = true;
  }

  public rebuildRenderData() {
  }
}
