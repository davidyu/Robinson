class Camera {
  // note: this matrix is stored in a column major layout, because we are targeting WebGL.
  // TSM.mat4.lookAt() creates the matrix in the layout we expect, so use that.
  public matrix: TSM.mat4;

  constructor( position: TSM.vec3, aim: TSM.vec3, up: TSM.vec3, right: TSM.vec3 ) {
    this.matrix = TSM.mat4.lookAt( position, TSM.vec3.sum( position, aim ), up );
  }

  public get pos(): TSM.vec3 {
    return new TSM.vec3( this.matrix.row( 3 ) );
  }

  public set pos( val: TSM.vec3 ) {
    this.matrix = TSM.mat4.lookAt( val, TSM.vec3.sum( val, this.aim ), this.up );
  }

  public get aim(): TSM.vec3 {
    return new TSM.vec3( this.matrix.row( 2 ) );
  }

  public get up(): TSM.vec3 {
    return new TSM.vec3( this.matrix.row( 1 ) );
  }

  public get right(): TSM.vec3 {
    return new TSM.vec3( this.matrix.row( 0 ) );
  }
}
