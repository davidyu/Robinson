///<reference path='prim.ts' />

// like a regular plane but with a large shell around the center subdivided plane
class InfinitePlane extends Primitive implements Renderable {
  renderData: RenderData;
  material: Material;
  subdivs: Subdivisions;
  planesize: number;
  layers: number;

  constructor( size: number = 1, layers: number = 3, position: gml.Vec4 = gml.Vec4.origin, rotation: EulerAngleGroup = null, subdivisions: Subdivisions = { u: 0, v: 0 }, mat: Material = new BlinnPhongMaterial() ) {
    super();
    this.subdivs = subdivisions;
    this.transform = gml.Mat4.identity();
    this.planesize = 10000; // Not quite infinite :) but very large.
    this.layers = layers;

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

  private pushVertices( xs: number[], ys: number[], vertices: number[] ) {
    for ( let i = 0; i < ys.length; i++ ) {
      for ( let j = 0; j < xs.length; j++ ) {
        vertices.push( xs[j] );
        vertices.push( 0 );
        vertices.push( ys[i] );
      }
    }
  }

  private pushUVs( us: number[], vs: number[], uvs: number[] ) {
    for ( let i = 0; i < vs.length; i++ ) {
      for ( let j = 0; j < us.length; j++ ) {
        uvs.push( us[j] );
        uvs.push( vs[i] );
      }
    }
  }

  // pushes indices for a subdivided quad
  private pushIndices( offset: number, cols: number, rows: number, planeVertexIndices: number[] ) {
    for ( let i = 0; i < rows - 1; i++ ) { // iterate over rows
      for ( let j = 0; j < cols - 1; j++ ) { // iterate over cols
        // *-*
        //  \|
        //   *
        planeVertexIndices.push( offset + i * cols + j );             // top left
        planeVertexIndices.push( offset + i * cols + j + 1 );         // top right
        planeVertexIndices.push( offset + ( i + 1 ) * cols + j + 1 ); // bottom right
        // *
        // |\
        // *-*
        planeVertexIndices.push( offset + i * cols * 1 + j );         // top left
        planeVertexIndices.push( offset + ( i + 1 ) * cols + j + 1 ); // bottom right
        planeVertexIndices.push( offset + ( i + 1 ) * cols + j );     // bottom left
      }
    }
  }

  // this should only be called by the renderer module
  public rebuildRenderData( gl: WebGLRenderingContext ) {
    if ( this.renderData.dirty ) {
      this.renderData.dirty = false;

      let vertices = [];
      let uvs = [];
      let planeVertexIndices = [];

      let centerSize = 2;
      // center quad
      {
        let xs = this.subdivide( -centerSize / 2,  centerSize / 2, this.subdivs.u );
        let ys = this.subdivide(  centerSize / 2, -centerSize / 2, this.subdivs.v );
        let us = this.subdivide(  0,  1, this.subdivs.u );
        let vs = this.subdivide(  0,  1, this.subdivs.v );

        this.pushVertices( xs, ys, vertices );
        this.pushUVs( us, vs, uvs );
        this.pushIndices( 0, xs.length, ys.length, planeVertexIndices );
      }

      let inner_tl = new gml.Vec2( -1,  1 );
      let inner_br = new gml.Vec2(  1, -1 );

      // shells
      //
      // reference layout:
      // +---+---+---+---+
      // | 0 | 1 | 2 | 3 |
      // +---+-------+---+
      // | 11|       | 4 |
      // +---|       |---+
      // | 10|       | 5 |
      // +---+-------+---+
      // | 9 | 8 | 7 | 6 |
      // +---+---+---+---+

      let lastSize = centerSize;
      for ( let layer = 0; layer < this.layers; layer++ ) {
        let size = lastSize / 2;
        let outer_tl = inner_tl.add( -size,  size );
        let outer_br = inner_br.add(  size, -size );

        // shell 0
        {
          let xs = this.subdivide( outer_tl.x, inner_tl.x, 5 );
          let ys = this.subdivide( outer_tl.y, inner_tl.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 1
        {
          let xs = this.subdivide( inner_tl.x, inner_tl.x + size, 5 );
          let ys = this.subdivide( outer_tl.y, inner_tl.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 2
        {
          let xs = this.subdivide( inner_tl.x + size, inner_tl.x + 2 * size, 5 );
          let ys = this.subdivide( outer_tl.y, inner_tl.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 3
        {
          let xs = this.subdivide( inner_tl.x + 2 * size, outer_br.x, 5 );
          let ys = this.subdivide( outer_tl.y, inner_tl.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 4
        {
          let xs = this.subdivide( outer_br.x - size, outer_br.x, 5 );
          let ys = this.subdivide( inner_tl.y, inner_tl.y - size, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 5
        {
          let xs = this.subdivide( outer_br.x - size, outer_br.x, 5 );
          let ys = this.subdivide( inner_tl.y - size, inner_br.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 5
        {
          let xs = this.subdivide( outer_br.x - size, outer_br.x, 5 );
          let ys = this.subdivide( inner_br.y, outer_br.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 7
        {
          let xs = this.subdivide( inner_tl.x + size, inner_tl.x + 2 * size, 5 );
          let ys = this.subdivide( inner_br.y, outer_br.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 8
        {
          let xs = this.subdivide( inner_tl.x, inner_tl.x + size, 5 );
          let ys = this.subdivide( inner_br.y, outer_br.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 9
        {
          let xs = this.subdivide( outer_tl.x, inner_tl.x, 5 );
          let ys = this.subdivide( inner_br.y, outer_br.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 10
        {
          let xs = this.subdivide( outer_tl.x, inner_tl.x, 5 );
          let ys = this.subdivide( inner_tl.y - size, inner_br.y, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        // shell 11
        {
          let xs = this.subdivide( outer_tl.x, inner_tl.x, 5 );
          let ys = this.subdivide( inner_tl.y, inner_tl.y - size, 5 );
          let us = this.subdivide(  0,  1, 5 );
          let vs = this.subdivide(  0,  1, 5 );

          let offset = vertices.length / 3;

          this.pushVertices( xs, ys, vertices );
          this.pushUVs( us, vs, uvs );
          this.pushIndices( offset, xs.length, ys.length, planeVertexIndices );
        }

        lastSize *= 2;

        inner_tl = outer_tl;
        inner_br = outer_br;
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
      this.renderData.indices = new Uint32Array( planeVertexIndices );

      this.renderData.rebuildBufferObjects( gl );
    }
  }
}
