///<reference path='prim.ts' />

interface Subdivisions {
  u: number;
  v: number;
}

// TODO make me a plane with UV subdivision count
class Plane extends Primitive implements Renderable {
  renderData: RenderData;
  material: Material;
  subdivs: Subdivisions;

  constructor( size: number = 1, position: gml.Vec4 = gml.Vec4.origin, rotation: EulerAngleGroup = null, subdivisions: Subdivisions = { u: 0, v: 0 }, mat: Material = new BlinnPhongMaterial() ) {
    super();
    this.transform.scale = new gml.Vec3( size, size, size );
    this.subdivs = subdivisions;

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

      // By default 4-vertex plane (no subdivisions) is in XY plane with z = 0
      // Create values for each axis in its own array for easier subdivision implementation
      let xs = [ -1,  1 ]; // left to right
      let ys = [  1, -1 ]; // top to bottom
      let us = [  0,  1 ]; // left to right
      let vs = [  0,  1 ]; // top to bottom

      // perform X subdivision (subdivisions along x-axis)
      for ( let iter = 0; iter < this.subdivs.u; iter++ ) {
        let subdivided = [];
        for ( let i = 0; i < xs.length - 1; i++ ) {
          subdivided.push( xs[i] );
          subdivided.push( ( xs[i] + xs[i+1] ) / 2 );
        }
        subdivided.push( xs[xs.length-1] );
        xs = subdivided;
        let subdivided_us = [];
        for ( let i = 0; i < us.length - 1; i++ ) {
          subdivided_us.push( us[i] );
          subdivided_us.push( ( us[i] + us[i+1] ) / 2 );
        }
        subdivided_us.push( us[us.length-1] );
        us = subdivided_us;
      }

      // perform Y subdivision (subdivisions along x-axis)
      for ( let iter = 0; iter < this.subdivs.v; iter++ ) {
        let subdivided = [];
        for ( let i = 0; i < ys.length - 1; i++ ) {
          subdivided.push( ys[i] );
          subdivided.push( ( ys[i] + ys[i+1] ) / 2 );
        }
        subdivided.push( ys[ys.length-1] );
        ys = subdivided;
        let subdivided_vs = [];
        for ( let i = 0; i < vs.length - 1; i++ ) {
          subdivided_vs.push( vs[i] );
          subdivided_vs.push( ( vs[i] + vs[i+1] ) / 2 );
        }
        subdivided_vs.push( vs[vs.length-1] );
        vs = subdivided_vs;
      }

      // combine xys into vertex position array
      // going left to right, top to bottom (row major flat array)
      let vertices = [];
      for ( let i = 0; i < ys.length; i++ ) {
        for ( let j = 0; j < xs.length; j++ ) {
          vertices.push( xs[j] );
          vertices.push( ys[i] );
          vertices.push( 0 );
        }
      }

      this.renderData.vertices = new Float32Array( vertices );

      let uvs = [];
      for ( let i = 0; i < vs.length; i++ ) {
        for ( let j = 0; j < us.length; j++ ) {
          uvs.push( us[j] );
          uvs.push( vs[i] );
        }
      }

      this.renderData.textureCoords = new Float32Array( uvs );

      let vertexNormals = [];

      for ( let i = 0; i < vertices.length / 3; i++ ) {
        vertexNormals.push( 0.0 );
        vertexNormals.push( 0.0 );
        vertexNormals.push( 1.0 );
      }

      this.renderData.normals = new Float32Array( vertexNormals );

      var quadVertexIndices = [
        0,  1,  2,      0,  2,  3,    // front
      ];

      this.renderData.indices = new Uint16Array( quadVertexIndices );

      // indices are fucked up
    }
  }
}
