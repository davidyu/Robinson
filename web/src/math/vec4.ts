/// <reference path='vec.ts'/>

module gml {
  export class Vec4 extends Vector {
    constructor( x, y, z, w ) {
      super( 4, x, y, z, w );
    }

    public get x(): number {
      return this.get( 0 );
    }

    public get y(): number {
      return this.get( 1 );
    }

    public get z(): number {
      return this.get( 2 );
    }

    public get w(): number {
      return this.get( 3 );
    }
  }
}
