/// <reference path='vec.ts'/>

module gml {
  export class Vec4 extends Vector {
    constructor( x, y, z, w ) {
      super( 4, x, y, z, w );
    }
  }
}
