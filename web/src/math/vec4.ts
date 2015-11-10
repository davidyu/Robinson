module gml {
  export class Vec4 {
    values: Float32Array;
    static size: number = 4;

    constructor( x, y, z, w ) {
      this.values = new Float32Array( [ x, y, z, w ] );
    }
  }
}
