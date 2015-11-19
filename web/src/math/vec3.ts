module gml {
  export class Vec3 extends Vector {
    constructor( x, y, z ) {
      super( 3, x, y, z );
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
  }
}
