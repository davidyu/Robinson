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
    this.planesize = 10000; // Not quite infinite :) but very large.
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

  subdivide( min: number, max: number, times: number ): number[] {
    let subdivided = [ min, max ];
    for ( let iter = 0; iter < times; iter++ ) {
      let intermediate = [];
      for ( let i = 0; i < subdivided.length - 1; i++ ) {
        intermediate.push( subdivided[i] );
        intermediate.push( ( subdivided[i] + subdivided[i+1] ) / 2 );
      }
      intermediate.push( subdivided[subdivided.length-1] );
      subdivided = intermediate;
    }

    return subdivided;
  }

  // this should only be called by the renderer module
  public rebuildRenderData() {
    if ( this.renderData.dirty ) {
      this.renderData.dirty = false;

      let vertices = [];
      let uvs = [];
      let planeVertexIndices = [];
      {
        let xs = this.subdivide( -1,  1, this.subdivs.u );
        let ys = this.subdivide(  1, -1, this.subdivs.v );
        let us = this.subdivide(  0,  1, this.subdivs.u );
        let vs = this.subdivide(  0,  1, this.subdivs.v );

        // combine xys into vertex position array
        // going left to right, top to bottom (row major flat array)
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }

        for ( let i = 0; i < vs.length; i++ ) {
          for ( let j = 0; j < us.length; j++ ) {
            uvs.push( us[j] );
            uvs.push( vs[i] );
          }
        }
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
      }

      // now push shells (8 shells in total)
      // top left
      {
        let xs = this.subdivide( -this.planesize / this.transform.scale.x, -1, 6 );
        let ys = this.subdivide(  this.planesize / this.transform.scale.y,  1, 6 );
        let us = this.subdivide(  0,  1, 6 );
        let vs = this.subdivide(  0,  1, 6 );

        // combine xys into vertex position array
        // going left to right, top to bottom (row major flat array)
        let offset = vertices.length / 3;
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }
        for ( let i = 0; i < vs.length; i++ ) {
          for ( let j = 0; j < us.length; j++ ) {
            uvs.push( us[j] );
            uvs.push( vs[i] );
          }
        }
        // push two triangles (1 quad) each iteration
        for ( let i = 0; i < vs.length - 1; i++ ) { // iterate over rows
          for ( let j = 0; j < us.length - 1; j++ ) { // iterate over cols
            // *-*
            //  \|
            //   *
            planeVertexIndices.push( offset + i * us.length + j );     // top left
            planeVertexIndices.push( offset + i * us.length + j + 1 ); // top right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            // *
            // |\
            // *-*
            planeVertexIndices.push( offset + i * us.length * 1 + j );             // top left
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j );     // bottom left
          }
        }
      }
      
      // top mid
      {
        let xs = this.subdivide( -1,  1, 6 );
        let ys = this.subdivide(  this.planesize / this.transform.scale.y,  1, 6 );
        let us = this.subdivide(  0,  1, 6 );
        let vs = this.subdivide(  0,  1, 6 );

        // combine xys into vertex position array
        // going left to right, top to bottom (row major flat array)
        let offset = vertices.length / 3;
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }
        for ( let i = 0; i < vs.length; i++ ) {
          for ( let j = 0; j < us.length; j++ ) {
            uvs.push( us[j] );
            uvs.push( vs[i] );
          }
        }
        // push two triangles (1 quad) each iteration
        for ( let i = 0; i < vs.length - 1; i++ ) { // iterate over rows
          for ( let j = 0; j < us.length - 1; j++ ) { // iterate over cols
            // *-*
            //  \|
            //   *
            planeVertexIndices.push( offset + i * us.length + j );     // top left
            planeVertexIndices.push( offset + i * us.length + j + 1 ); // top right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            // *
            // |\
            // *-*
            planeVertexIndices.push( offset + i * us.length * 1 + j );             // top left
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j );     // bottom left
          }
        }
      }

      // top right
      {
        let xs = this.subdivide(  1,  this.planesize / this.transform.scale.x, 6 );
        let ys = this.subdivide(  this.planesize / this.transform.scale.y,  1, 6 );
        let us = this.subdivide(  0,  1, 6 );
        let vs = this.subdivide(  0,  1, 6 );

        // combine xys into vertex position array
        // going left to right, top to bottom (row major flat array)
        let offset = vertices.length / 3;
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }
        for ( let i = 0; i < vs.length; i++ ) {
          for ( let j = 0; j < us.length; j++ ) {
            uvs.push( us[j] );
            uvs.push( vs[i] );
          }
        }
        // push two triangles (1 quad) each iteration
        for ( let i = 0; i < vs.length - 1; i++ ) { // iterate over rows
          for ( let j = 0; j < us.length - 1; j++ ) { // iterate over cols
            // *-*
            //  \|
            //   *
            planeVertexIndices.push( offset + i * us.length + j );     // top left
            planeVertexIndices.push( offset + i * us.length + j + 1 ); // top right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            // *
            // |\
            // *-*
            planeVertexIndices.push( offset + i * us.length * 1 + j );             // top left
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j );     // bottom left
          }
        }
      }

      // bottom left
      {
        let xs = this.subdivide( -this.planesize / this.transform.scale.x, -1, 6 );
        let ys = this.subdivide( -1, -this.planesize / this.transform.scale.y, 6 );
        let us = this.subdivide(  0,  1, 6 );
        let vs = this.subdivide(  0,  1, 6 );

        // combine xys into vertex position array
        // going left to right, top to bottom (row major flat array)
        let offset = vertices.length / 3;
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }
        for ( let i = 0; i < vs.length; i++ ) {
          for ( let j = 0; j < us.length; j++ ) {
            uvs.push( us[j] );
            uvs.push( vs[i] );
          }
        }
        // push two triangles (1 quad) each iteration
        for ( let i = 0; i < vs.length - 1; i++ ) { // iterate over rows
          for ( let j = 0; j < us.length - 1; j++ ) { // iterate over cols
            // *-*
            //  \|
            //   *
            planeVertexIndices.push( offset + i * us.length + j );     // top left
            planeVertexIndices.push( offset + i * us.length + j + 1 ); // top right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            // *
            // |\
            // *-*
            planeVertexIndices.push( offset + i * us.length * 1 + j );             // top left
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j );     // bottom left
          }
        }
      }

      // bot mid
      {
        let xs = this.subdivide( -1,  1, 6 );
        let ys = this.subdivide( -1, -this.planesize / this.transform.scale.y, 6 );
        let us = this.subdivide(  0,  1, 6 );
        let vs = this.subdivide(  0,  1, 6 );

        // combine xys into vertex position array
        // going left to right, top to bottom (row major flat array)
        let offset = vertices.length / 3;
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }
        for ( let i = 0; i < vs.length; i++ ) {
          for ( let j = 0; j < us.length; j++ ) {
            uvs.push( us[j] );
            uvs.push( vs[i] );
          }
        }
        // push two triangles (1 quad) each iteration
        for ( let i = 0; i < vs.length - 1; i++ ) { // iterate over rows
          for ( let j = 0; j < us.length - 1; j++ ) { // iterate over cols
            // *-*
            //  \|
            //   *
            planeVertexIndices.push( offset + i * us.length + j );     // top left
            planeVertexIndices.push( offset + i * us.length + j + 1 ); // top right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            // *
            // |\
            // *-*
            planeVertexIndices.push( offset + i * us.length * 1 + j );             // top left
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j );     // bottom left
          }
        }
      }

      // bot right
      {
        let xs = this.subdivide(  1, this.planesize / this.transform.scale.x, 6 );
        let ys = this.subdivide( -1, -this.planesize / this.transform.scale.y, 6 );
        let us = this.subdivide(  0,  1, 6 );
        let vs = this.subdivide(  0,  1, 6 );

        // combine xys into vertex position array
        // going left to right, top to bottom (row major flat array)
        let offset = vertices.length / 3;
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }
        for ( let i = 0; i < vs.length; i++ ) {
          for ( let j = 0; j < us.length; j++ ) {
            uvs.push( us[j] );
            uvs.push( vs[i] );
          }
        }
        // push two triangles (1 quad) each iteration
        for ( let i = 0; i < vs.length - 1; i++ ) { // iterate over rows
          for ( let j = 0; j < us.length - 1; j++ ) { // iterate over cols
            // *-*
            //  \|
            //   *
            planeVertexIndices.push( offset + i * us.length + j );     // top left
            planeVertexIndices.push( offset + i * us.length + j + 1 ); // top right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            // *
            // |\
            // *-*
            planeVertexIndices.push( offset + i * us.length * 1 + j );             // top left
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j );     // bottom left
          }
        }
      }

      // mid left
      {
        let xs = this.subdivide( -this.planesize / this.transform.scale.x, -1, 6 );
        let ys = this.subdivide(  1, -1, 6 );
        let us = this.subdivide(  0,  1, 6 );
        let vs = this.subdivide(  0,  1, 6 );

        // combine xys into vertex position array
        // going left to right, top to bottom (row major flat array)
        let offset = vertices.length / 3;
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }
        for ( let i = 0; i < vs.length; i++ ) {
          for ( let j = 0; j < us.length; j++ ) {
            uvs.push( us[j] );
            uvs.push( vs[i] );
          }
        }
        // push two triangles (1 quad) each iteration
        for ( let i = 0; i < vs.length - 1; i++ ) { // iterate over rows
          for ( let j = 0; j < us.length - 1; j++ ) { // iterate over cols
            // *-*
            //  \|
            //   *
            planeVertexIndices.push( offset + i * us.length + j );     // top left
            planeVertexIndices.push( offset + i * us.length + j + 1 ); // top right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            // *
            // |\
            // *-*
            planeVertexIndices.push( offset + i * us.length * 1 + j );             // top left
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j );     // bottom left
          }
        }
      }

      // mid right
      {
        let xs = this.subdivide(  1, this.planesize / this.transform.scale.x, 6 );
        let ys = this.subdivide(  1, -1, 6 );
        let us = this.subdivide(  0,  1, 6 );
        let vs = this.subdivide(  0,  1, 6 );

        // combine xys into vertex position array
        // going left to right, top to bottom (row major flat array)
        let offset = vertices.length / 3;
        for ( let i = 0; i < ys.length; i++ ) {
          for ( let j = 0; j < xs.length; j++ ) {
            vertices.push( xs[j] );
            vertices.push( 0 );
            vertices.push( ys[i] );
          }
        }
        for ( let i = 0; i < vs.length; i++ ) {
          for ( let j = 0; j < us.length; j++ ) {
            uvs.push( us[j] );
            uvs.push( vs[i] );
          }
        }
        // push two triangles (1 quad) each iteration
        for ( let i = 0; i < vs.length - 1; i++ ) { // iterate over rows
          for ( let j = 0; j < us.length - 1; j++ ) { // iterate over cols
            // *-*
            //  \|
            //   *
            planeVertexIndices.push( offset + i * us.length + j );     // top left
            planeVertexIndices.push( offset + i * us.length + j + 1 ); // top right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            // *
            // |\
            // *-*
            planeVertexIndices.push( offset + i * us.length * 1 + j );             // top left
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j + 1 ); // bottom right
            planeVertexIndices.push( offset + ( i + 1 ) * us.length + j );     // bottom left
          }
        }
      }

      this.renderData.vertices = new Float32Array( vertices );
      this.renderData.textureCoords = new Float32Array( uvs );

      let vertexNormals = [];

      // flat plane; normals are all the same
      for ( let i = 0; i < vertices.length / 3; i++ ) {
        vertexNormals.push( 0.0 );
        vertexNormals.push( 1.0 );
        vertexNormals.push( 0.0 );
      }

      this.renderData.normals = new Float32Array( vertexNormals );

      console.log( planeVertexIndices );

      this.renderData.indices = new Uint32Array( planeVertexIndices );
    }
  }
}
