class Camera {
  // note: this matrix is stored in a column major layout, because we are targeting WebGL.
  public matrix: gml.Mat4;

  constructor( position: gml.Vec4, aim: gml.Vec4, up: gml.Vec4, right: gml.Vec4 ) {
    this.matrix = gml.makeLookAt( position, aim, up, right );
  }

  public get pos(): gml.Vec4 {
    return this.matrix.row( 3 );
  }

  public set pos( val: gml.Vec4 ) {
    this.matrix.setColumn( 3, val );
  }

  public get aim(): gml.Vec4 {
    return this.matrix.row( 2 );
  }

  public get up(): gml.Vec4 {
    return this.matrix.row( 1 );
  }

  public get right(): gml.Vec4 {
    return this.matrix.row( 0 );
  }
}
