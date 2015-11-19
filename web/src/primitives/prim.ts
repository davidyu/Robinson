//
// prim.ts
// user editable primitive base interface

class RenderData {
  dirty: boolean;
  vertices: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint16Array;
  isTextureMapped: boolean;

  constructor() {
    this.dirty = true;
    this.vertices = new Float32Array( [] );
    this.normals = new Float32Array( [] );
    this.colors = new Float32Array( [] );
    this.indices = new Uint16Array( [] );
    this.isTextureMapped = false;
  }
}

class Primitive {
  // properties
  transform: gml.Mat4;

  constructor() { this.transform = gml.Mat4.identity(); }

  translate( dist: gml.Vec4 ) {
    this.transform.translation = dist;
  }
}

interface Renderable {
  transform: gml.Mat4;
  material: Material;
  renderData: RenderData;

  // methods
  rebuildRenderData();
}
