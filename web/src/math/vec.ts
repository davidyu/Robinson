module gml {
  // internal vector implementation; hidden
  class Vector {
    values: Float32Array;
    size: number;

    constructor( size, ...array: number[] ) {
      this.size = size;
      this.values = new Float32Array( array );
      if ( this.values.length != this.size ) {
        console.warn( "input array " + array + " is not " + this.size + " elements long!" );
      }
    }
  }

  /* public-facing vector (constructor sugar)
    
     usage:
      new Vec(3)(x,y,z,...);
      new Vec(4)(a,b,c,d,...);
      new Vec(100)(x1,x2,...,x100);
  */

  export class Vec {
    constructor( size ) {
      return ( ...array: number[] ) => { return Vector.apply( Vector, array.unshift( size ) ); }
    }
  }
}
