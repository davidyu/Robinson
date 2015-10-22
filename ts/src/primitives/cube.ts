class Cube extends Primitive implements Renderable {
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

  // this should only be called by the renderer module
  public rebuildRenderData() {
    if ( this.renderData.dirty ) {
      this.renderData.dirty = false;
      // TODO share vertices between faces??
      var vertices = [
        // Front face
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Back face
        -1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,

        // Top face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,

        // Bottom face
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,

        // Right face
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,

        // Left face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0
      ];

      this.renderData.vertices = new Float32Array( vertices );

      if ( !this.material.isTextureMapped ) {
      }

      var vertexNormals = [
        // Front
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // Back
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // Top
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // Bottom
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // Right
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // Left
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
      ];

      this.renderData.normals = new Float32Array( vertexNormals );

      var cubeVertexIndices = [
        0,  2,  1,      0,  3,  2,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23    // left
      ];

      this.renderData.indices = new Uint16Array( cubeVertexIndices );
    }
  }
}
