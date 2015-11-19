///<reference path='prim.ts' />
class Quad extends Primitive implements Renderable {
  renderData: RenderData;
  material: Material;

  constructor( size: number = 1, mat: Material = new BlinnPhongMaterial() ) {
    super();
    this.transform.scale = new gml.Vec3( size, size, size );
    this.renderData = new RenderData();
    this.material = mat;
    // trigger a rebuild when the renderer updates
    this.renderData.dirty = true;
  }

  // this should only be called by the renderer module
  public rebuildRenderData() {
    if ( this.renderData.dirty ) {
      this.renderData.dirty = false;
      var vertices = [
        // Front face
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
      ];

      this.renderData.vertices = new Float32Array( vertices );

      var vertexNormals = [
        // Front
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
      ];

      this.renderData.normals = new Float32Array( vertexNormals );

      var quadVertexIndices = [
        0,  1,  2,      0,  2,  3,    // front
      ];

      this.renderData.indices = new Uint16Array( quadVertexIndices );
    }
  }
}
