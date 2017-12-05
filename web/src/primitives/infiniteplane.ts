///<reference path='prim.ts' />

// like a regular plane but with a large shell around the center subdivided plane
class InfinitePlane extends Primitive implements Renderable {
  renderData: RenderData;
  material: Material;
  subdivs: Subdivisions;
  planesize: number;

  constructor( size: number = 1, position: gml.Vec4 = gml.Vec4.origin, rotation: EulerAngleGroup = null, subdivisions: Subdivisions = { u: 0, v: 0 }, mat: Material = new BlinnPhongMaterial() ) {
    super();
    this.subdivs = subdivisions;
    this.transform = gml.Mat4.identity();
    let planesize = 1000000; // Not quite infinite :) but very large.
    let shells = 1;          // Each tile is 64x64 verts. Each shell after the center is 2x the size of the previous shell

    if ( rotation != null ) {
      let m = gml.Mat4.identity();

      let sx = Math.sin( rotation.x.toRadians() );
      let cx = Math.cos( rotation.x.toRadians() );
      let sy = Math.sin( rotation.y.toRadians() );
      let cy = Math.cos( rotation.y.toRadians() );
      let sz = Math.sin( rotation.z.toRadians() );
      let cz = Math.cos( rotation.z.toRadians() );

      m.r00 = cz * cy;
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

    {
      let m = gml.Mat4.identity();
      m.scale = new gml.Vec3( size, size, size );
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

      let vertices = [];
      {
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
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }
      }

      // now push shells (8 shells in total)
      // top left
      {
        let xs = [ -this.planesize / this.transform.scale.x, 1 ]; // left to right
        let ys = [  this.planesize / this.transform.scale.y, 1 ]; // top to bottom

        // uvs are incorrect but whatever
        let us = [  0,  1 ]; // left to right
        let vs = [  0,  1 ]; // top to bottom

        // 64 vertices per shell, subdivide 6 times
        for ( let iter = 0; iter < 6; iter++ ) {
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
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
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

      // flat plane; normals are all the same
      for ( let i = 0; i < vertices.length / 3; i++ ) {
        vertexNormals.push( 0.0 );
        vertexNormals.push( 1.0 );
        vertexNormals.push( 0.0 );
      }

      this.renderData.normals = new Float32Array( vertexNormals );

      let planeVertexIndices = [];

      // push two triangles (1 quad) each iteration
      for ( let i = 0; i < vs.length - 1; i++ ) { // iterate over rows
        for ( let j = 0; j < us.length - 1; j++ ) { // iterate over cols
          // *-*
          //  \|
          //   *
          planeVertexIndices.push( i * us.length + j );     // top left
          planeVertexIndices.push( i * us.length + j + 1 ); // top right
          planeVertexIndices.push( ( i + 1 ) * us.length + j + 1 ); // bottom right
          // *
          // |\
          // *-*
          planeVertexIndices.push( i * us.length * 1 + j );             // top left
          planeVertexIndices.push( ( i + 1 ) * us.length + j + 1 ); // bottom right
          planeVertexIndices.push( ( i + 1 ) * us.length + j );     // bottom left
        }
      }

      console.log( planeVertexIndices );

      this.renderData.indices = new Uint16Array( planeVertexIndices );
    }
  }
}

