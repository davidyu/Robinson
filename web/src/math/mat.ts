module gml {
  /* public-facing matrix (constructor sugar)
    
     usage:
      new Matrix(3,3)(...);
      new Matrix(4,4)(...);
      new Matrix(100,6)(...);
  */
  export class Mat {
    constructor( r, c ) {
      return ( ...values: number[] ) => { return Matrix.apply( Matrix, values.unshift( r, c ) ); }
    }
  }
  
  // internal matrix implementation; exported because Mat3, Mat4 needs access
  // note that matrices are stored in column major order to conform to WebGL
  export class Matrix {
    values: Float32Array;
    rows: number;
    cols: number;

    constructor( rows, cols, ...values: number[] ) {
      this.rows = rows;
      this.cols = cols;
      this.values = new Float32Array( values );
      if ( this.values.length != this.rows * this.cols ) {
        console.warn( "input values " + values + " is not " + this.rows * this.cols + " elements long!" );
      }
    }

    public get Float32Array(): Float32Array {
      return this.values;
    }

    public get( r, c ): number {
      return this.values[ c * this.rows + r ];
    }

    public set( r, c, v ) {
      this.values[ c * this.rows + r ] = v;
    }
  }
}
