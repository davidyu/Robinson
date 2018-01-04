///<reference path='prim.ts' />

//
// sphere.ts
// UV sphere (most basic sphere mesh)

class Sphere extends Primitive implements Renderable {
  material: Material;
  renderData: RenderData;
  parallels: number;
  meridians: number;

  constructor( size: number = 1, position: gml.Vec4 = gml.Vec4.origin, mat: Material = new BlinnPhongMaterial(), parallels: number = 15, meridians: number = 30 ) {
    super();
    this.transform.scale = new gml.Vec3( size, size, size );
    this.transform.translation = position;
    this.material = mat;
    this.renderData = new RenderData();
    // trigger a rebuild when the renderer updates
    this.renderData.dirty = true;
    this.parallels = parallels;
    this.meridians = meridians;
  }

  public rebuildRenderData( gl: WebGLRenderingContext ) {
    let vertices = [];
    let indices = [];
    if ( this.renderData.dirty ) {
      this.renderData.dirty = false;

      for ( let j = 0; j < this.parallels; j++ ) {
        let parallel = Math.PI * j / ( this.parallels - 1 );
        for ( let i = 0; i < this.meridians; i++) {
          let meridian = 2 * Math.PI * i / ( this.meridians - 1 );
          let x = Math.sin( meridian ) * Math.cos( parallel );
          let y = Math.sin( meridian ) * Math.sin( parallel );
          let z = Math.cos( meridian );
          vertices.push( x );
          vertices.push( y );
          vertices.push( z );
        }
      }

      for ( let j = 0; j < this.parallels - 1; j++ ) {
        for ( let i = 0; i < this.meridians; i++) {
          let nextj = ( j + 1 ); // loop invariant: j + 1 < this.parallels
          let nexti = ( i + 1 ) % this.meridians;
          indices.push( j * this.meridians + i );
          indices.push( j * this.meridians + nexti );
          indices.push( nextj * this.meridians + nexti );

          indices.push( j * this.meridians + i );
          indices.push( nextj * this.meridians + nexti );
          indices.push( nextj * this.meridians + i );
        }
      }

      this.renderData.vertices = new Float32Array( vertices );
      this.renderData.normals = new Float32Array( vertices ); // for a unit sphere located at 0,0,0, the normals are exactly the same as the vertices
      this.renderData.indices = new Uint32Array( indices );

      this.renderData.rebuildBufferObjects( gl );
    }
  }
}
