///<reference path='prim.ts' />

//
// sphere.ts
// UV sphere (most basic sphere mesh)

class Sphere extends Primitive implements Renderable {
  material: Material;
  renderData: RenderData;

  constructor( size: number = 1, mat: Material = new BlinnPhongMaterial() ) {
    super();
    this.transform.scale = new gml.Vec3( size, size, size );
    this.material = mat;
    this.renderData = new RenderData();
    // trigger a rebuild when the renderer updates
    this.renderData.dirty = true;
  }

  public rebuildRenderData() {
    let vertices = [];
    let indices = [];
    const parallels = 10;
    const meridians = 20;
    if ( this.renderData.dirty ) {
      for ( let j = 0; j <= parallels; j++ ) {
        let parallel = Math.PI * j / parallels;
        for ( let i = 0; i <= meridians; i++) {
          let meridian = 2 * Math.PI * i / meridians;
          let x = Math.sin( meridian ) * Math.cos( parallel );
          let y = Math.sin( meridian ) * Math.sin( parallel );
          let z = Math.cos( meridian );
          vertices.push( x );
          vertices.push( y );
          vertices.push( z );
        }
      }

      for ( let j = 0; j < parallels; j++ ) {
        for ( let i = 0; i <= meridians; i++) {
          let nextj = ( j + 1 ) % ( parallels + 1 );
          let nexti = ( i + 1 ) % ( meridians + 1 );
          indices.push( j * ( meridians + 1 ) + i );
          indices.push( j * ( meridians + 1 ) + nexti );
          indices.push( nextj * ( meridians + 1 ) + nexti );

          indices.push( j * ( meridians + 1 ) + i );
          indices.push( nextj * ( meridians + 1 ) + nexti );
          indices.push( nextj * ( meridians + 1 ) + i );
        }
      }

      this.renderData.vertices = new Float32Array( vertices );
      this.renderData.normals = new Float32Array( vertices ); // for a sphere located at 0,0,0, the normals are exactly the same as the vertices
      this.renderData.indices = new Uint16Array( indices );

      this.renderData.dirty = false;
    }
  }
}
