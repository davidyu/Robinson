/// <reference path='vec.ts'/>

module gml {
  export class Vec4 extends Vector {
    constructor( v: number[] );
    constructor( v: Float32Array );
    constructor( x: number, y: number, z: number, w: number );

    constructor( ...args: any[] ) {
      if ( args.length == 4 ) {
        super( 4, args[0], args[1], args[2], args[3] );
      } else if ( args.length == 1 ) {
        super( 4, args[0] );
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

    public get w(): number {
      return this.get( 3 );
    }
  }
}
