module gml {
  export class Mat4 {
    constructor( r00, r01, tx, r10, r11, ty, m20, m21, m22 ) {
      super( 3, r00, r01, tx, r10, r11, ty, m20, m21, m22 );
    }
  }
}
