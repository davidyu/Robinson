module gml {
  /* public-facing matrix (constructor sugar)
    
     usage:
      new Matrix(3,3)(...);
      new Matrix(4,4)(...);
      new Matrix(100,6)(...);
  */
  export class Mat {
    constructor( r, c ) {
      return ( ...values: number[] ) => { return new Matrix( r, c, values ); }
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
      if ( args.length == 1 ) {
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

    public row( r ): Vector {
      var row = [];
      for ( var i = 0; i < this.cols; i++ ) {
        row.push( this.get( r, i ) );
      }
      return new Vector( this.cols, row );
    }

    public column( c ): Vector {
      var column = [];
      for ( var i = 0; i < this.rows; i++ ) {
        column.push( this.get( i, c ) );
      }
      return new Vector( this.rows, column );
    }

    public get trace(): number {
      if ( this.rows != this.cols ) {
        console.warn( "matrix not square, cannot compute trace!" );
        return 0;
      }

      var tr = 0;
      for ( let i = 0; i < this.rows; i++ ) {
        tr += this.get( i, i );
      }
      return tr;
    }

    public lu(): { l: Matrix, u: Matrix } {
      if ( this.rows != this.cols ) {
        console.warn( "matrix not square, cannot perform LU decomposition!" );
        return { l: Matrix.identity( this.rows ), u: Matrix.identity( this.rows ) };
      }

      let l = Matrix.identity( this.rows );
      let u = new Matrix( this.rows, this.cols, this.values );

      for ( let i = 1; i < this.rows; i++ ) {
        let l_i = Matrix.identity( this.rows );
        let l_i_inv = Matrix.identity( this.rows );
        // when multiplied with u, l_i eliminates elements below the main diagonal in the n-th column of matrix u
        // l_i_inv is the inverse to l_i, and is very easy to construct if we already have l_i
        for ( let n = i; n < this.cols; n++ ) {
          let l_i_n = -u.get( i, n ) / u.get( n, n );
          l_i.set( i, n, l_i_n );
          l_i_inv.set( i, n, -l_i_n );
        }

        l = l_i_inv.mul( l );
        u = l_i.mul( u );
      }

      return { l: l, u: u };
    }

    public get determinant(): number {
      if ( this.rows != this.cols ) {
        console.warn( "matrix not square, cannot perform LU decomposition!" );
        return 0;
      }

      let { l, u } = this.lu();
      var det = 1;
      for ( let i = 0; i < this.rows; i++ ) {
        det *= u.get( i, i );
      }
      return det;
    }

    public set( r, c, v ) {
      this.values[ c * this.rows + r ] = v;
    }

    public mul( rhs: Matrix ): Matrix {
      return Matrix.matmul( this, rhs );
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

          out[ j * lhs.cols + i ] = sum;
        }
      }

      return new Matrix( lhs.cols, rhs.rows, out );
    }

    public static identity( size ): Matrix {
      var v = [];
      for ( let i = 0; i < size; i++ ) {
        for ( let j = 0; j < size; j++ ) {
          if ( i == j ) v.push( 1 );
          else          v.push( 0 );
        }
      }

      return new Matrix( size, size, v );
    }

    public toString() {
      var str = "{";

      for ( var i = 0; i < this.rows; i++ ) {
        str += "{";
        for ( var j = 0; j < this.cols; j++ ) {
          str += this.get( i, j ) + ",";
        }
        str = str.slice( 0, -1 );
        str += "},"
      }

      str = str.slice( 0, -1 );

      str += "}";
      return str;
    }
  }
}
