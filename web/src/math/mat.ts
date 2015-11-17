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

    public row( r ): Vector {
      var row = [];
      for ( var i = 0; i < this.cols; i++ ) {
        row.push( this.get( r, i ) );
      }
      return Vector.apply( Vector, row.unshift( this.cols ) );
    }

    public column( c ): Vector {
      var column = [];
      for ( var i = 0; i < this.rows; i++ ) {
        column.push( this.get( i, c ) );
      }
      return Vector.apply( Vector, column.unshift( this.rows ) );
    }

    public matmul( lhs: Matrix, rhs: Matrix ): Matrix {
      var out = [];

      if ( lhs.rows != rhs.cols ) {
        console.warn( "lhs and rhs incompatible for matrix multiplication!" );
        return null;
      }

      for ( let i = 0; i < lhs.cols; i++ ) {
        for ( let j = 0; j < rhs.rows; j++ ) {
          var sum = 0;
          for ( let k = 0; k < lhs.rows; k++ ) {
            sum += lhs.get( i, k ) * rhs.get( k, j );
          }
          out.push( sum );
        }
      }

      return Matrix.apply( out.unshift( lhs.cols, rhs.rows ) );
    }

    public static identity( size ) {
      var v = [];
      for ( let i = 0; i < size; i++ ) {
        for ( let j = 0; j < size; j++ ) {
          if ( i == j ) v.push( 1 );
          else          v.push( 0 );
        }
      }

      return Matrix.apply( v.unshift( size, size ) );
    }
  }
}
