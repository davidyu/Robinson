module gml {
  export class Mat4 {
    values: Float32Array;
    static rows: number = 3;
    static cols: number = 3;
    constructor( r00, r01, r02, tx, r10, r11, r12, ty, r20, r21, r22, tz, m30, m31, m32, m33 ) {
      this.values = new Float32Array( [ r00, r01, r02, tx, r10, r11, r12, ty, r20, r21, r22, tz, m30, m31, m32, m33 ] );
    }
  }
}
