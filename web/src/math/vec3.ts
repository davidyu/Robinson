module gml {
  export class Vec3 extends Vector {
    constructor( v: number[] );
    constructor( v: Float32Array );
    constructor( x: number, y: number, z: number );

    constructor( ...args: any[] ) {
      if ( args.length == 4 ) {
        super( 3, args[0], args[1], args[2] );
      } else if ( args.length == 1 ) {
        super( 3, args[0] );
      }
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
