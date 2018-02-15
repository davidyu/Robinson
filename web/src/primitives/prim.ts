//
// prim.ts
// user editable primitive base interface

class RenderData {
  dirty: boolean;
  vertices: Float32Array;
  textureCoords: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  meshCoords: Float32Array;
  indices: Uint32Array;
  isTextureMapped: boolean;

  // cached webgl buffer objects
  vertexBuffer: WebGLBuffer;
  vertexNormalBuffer: WebGLBuffer;
  vertexTexCoordBuffer: WebGLBuffer;
  meshCoordsBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;

  constructor() {
    this.dirty = true;
    this.vertices = new Float32Array( 0 );
    this.normals = new Float32Array( 0 );
    this.meshCoords = new Float32Array( 0 );
    this.colors = new Float32Array( 0 );
    this.indices = new Uint32Array( 0 );
    this.isTextureMapped = false;
    this.vertexBuffer = null;
    this.vertexNormalBuffer = null;
    this.vertexTexCoordBuffer = null;
    this.meshCoordsBuffer = null;
    this.indexBuffer = null;
  }

  rebuildBufferObjects( gl: WebGLRenderingContext ) {
    // build the buffer objects
    if ( this.vertexBuffer == null ) {
      this.vertexBuffer = gl.createBuffer();
    }

    if ( this.vertexNormalBuffer == null ) {
      this.vertexNormalBuffer = gl.createBuffer();
    }

    if ( this.indexBuffer == null ) {
      this.indexBuffer = gl.createBuffer();
    }

    if ( this.vertexTexCoordBuffer == null ) {
      this.vertexTexCoordBuffer = gl.createBuffer();
    }

    if ( this.meshCoordsBuffer == null ) {
      this.meshCoordsBuffer = gl.createBuffer();
    }

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW ); // allocate and fill the buffer

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexNormalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.meshCoordsBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, this.meshCoords, gl.STATIC_DRAW );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexTexCoordBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, this.textureCoords, gl.STATIC_DRAW );
  }
}

interface EulerAngleGroup {
  x: gml.Angle;
  y: gml.Angle;
  z: gml.Angle;
}

interface Subdivisions {
  u: number;
  v: number;
}

class Primitive {
  // properties
  transform: gml.Mat4;

  constructor() {
    this.transform = gml.Mat4.identity();
  }

  translate( dist: gml.Vec4 ) {
    this.transform.translation = dist;
  }
}

interface Renderable {
  transform: gml.Mat4;
  material: Material;
  renderData: RenderData;

  // methods
  rebuildRenderData( gl: WebGLRenderingContext );
}
