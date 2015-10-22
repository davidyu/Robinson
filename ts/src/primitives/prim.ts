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
  transform: TSM.mat4;

  constructor() { this.transform = TSM.mat4.identity.copy(); }

  translate( dist: TSM.vec3 ) {
    this.transform = this.transform.translate( dist );
  }
}

interface Renderable {
  transform: TSM.mat4;
  material: Material;
  renderData: RenderData;

  // methods
  rebuildRenderData();
}
