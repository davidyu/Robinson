module gml {
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

  // internal vector implementation; exported because Vec2, Vec3, Vec4 needs access
  export class Vector {
    private values: Float32Array;
    size: number;

    constructor( size, ...array: number[] ) {
      this.size = size;
      this.values = new Float32Array( array );
      if ( this.values.length != this.size ) {
        console.warn( "input array " + array + " is not " + this.size + " elements long!" );
      }
    }

    public get Float32Array(): Float32Array {
      return this.values;
    }

    public get( index: number ): number {
      return this.values[index];
    }

    public sub( rhs: Vector ): Vector {
      if ( this.size != rhs.size ) {
        console.warn( "rhs not " + this.size + " elements long!" );
        return null;
      }

      var diff = [];
      for ( var i = 0; i < this.size; i++ ) {
        diff.push( this.values[i] - rhs.get( i ) );
      }
      return new Vector( diff.unshift( this.size ) );
    }

  }
}
