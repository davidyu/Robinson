///<reference path='prim.ts' />
class Sphere extends Primitive implements Renderable {
  material: Material;
  renderData: RenderData;

  constructor( size: number = 1, mat: Material = new BlinnPhongMaterial() ) {
    super();
    this.transform.scale = new gml.Vec3( size, size, size );
    this.material = mat;
    this.renderData = new RenderData();
    // trigger a rebuild when the renderer updates
    this.renderData.dirty = true;
  }

  public rebuildRenderData() {
  }
}
