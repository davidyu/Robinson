///<reference path='prim.ts' />

class Quad extends Primitive implements Renderable {
  renderData: RenderData;
  material: Material;

  constructor( size: number = 1, position: gml.Vec4 = gml.Vec4.origin, rotation: EulerAngleGroup = null, mat: Material = new BlinnPhongMaterial() ) {
    super();
    this.transform.scale = new gml.Vec3( size, size, size );

    if ( rotation != null ) {
      let m = gml.Mat4.identity();

      let sx = Math.sin( rotation.x.toRadians() );
      let cx = Math.cos( rotation.x.toRadians() );
      let sy = Math.sin( rotation.y.toRadians() );
      let cy = Math.cos( rotation.y.toRadians() );
      let sz = Math.sin( rotation.z.toRadians() );
      let cz = Math.cos( rotation.z.toRadians() );

      m.r00 = size * cz * cy;
      m.r01 = sz * cy;
      m.r02 = -sy;

      m.r10 = cz * sy * sx - sz * cx;
      m.r11 = sz * sy * sx + cz * cx;
      m.r12 = cy * sx;

      m.r20 = cz * sy * cx + sz * sx;
      m.r21 = sz * sy * cx - cz * sx;
      m.r22 = cy * cx;

      m.m33 = 1;
      m.m30 = 0;
      m.m31 = 0;
      m.m32 = 0;
      m.tx  = 0;
      m.ty  = 0;
      m.tz  = 0;

      this.transform = m.multiply( this.transform );
    }

    this.transform.translation = position;

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
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0,
      ];

      this.renderData.vertices = new Float32Array( vertices );

      var uvs = [
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
      ];

      this.renderData.textureCoords = new Float32Array( uvs );

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
