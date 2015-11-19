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

    constructor( rows, cols, args: Float32Array );
    constructor( rows, cols, args: number[] );
    constructor( rows, cols, ...args: number[] );

    constructor( rows, cols, ...args: any[] ) {
      this.rows = rows;
      this.cols = cols;
      if ( args.length === 1 ) {
        if ( args[0] instanceof Float32Array ) {
          this.values = args[0];
        } else if ( args[0] instanceof Array ) {
          this.values = new Float32Array( args[0] );
        }
      } else {
        this.values = new Float32Array( args );
      }
      if ( this.values.length != this.rows * this.cols ) {
        console.warn( "input values " + args + " is not " + this.rows * this.cols + " elements long!" );
      }
    }

    private transpose_Float32Array( values: Float32Array, rows: number, cols: number ): Float32Array {
      var out = new Float32Array( rows * cols );
      for ( let i = 0; i < cols; i++ ) {
        for ( let j = 0; j < rows; j++ ) {
          out[ i * cols + j] = values[ j * cols + i ];
        }
      }
      return out;
    }

    public transpose(): Matrix {
      return new Matrix( this.cols, this.rows, this.transpose_Float32Array( this.values, this.rows, this.cols ) );
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

    public static matmul( lhs: Matrix, rhs: Matrix ): Matrix {
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

    public static identity( size ): Matrix {
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
