module gml {

  export class Mat3 extends Matrix {
    /*

      an expanded homogenous transformation matrix looks like this (assuming cw of theta):

      sx * cos(theta), sx * sin(theta), tx
     -sy * sin(theta), sy * cos(theta), ty
      0              , 0              ,  1

      now assuming ccw rotation of theta (which is idiomatic in game/graphics programming, and is what Mat3 follows):

      sx * cos(theta),-sx * sin(theta), tx
      sy * sin(theta), sy * cos(theta), ty
      0              , 0              ,  1

      from this, given a mat3:

      a b tx
      c d ty
      0 0 1

      we can derive:

      sx = sqrt( a*a + b*b )
      sy = sqrt( c*c + d*d )

      theta = atan( b/a ) or atan( -c/d ) with some caveats

    */

    constructor( args: Float32Array );
    constructor( args: number[] );
    constructor( r00, r01, tx, r10, r11, ty, m20, m21, m22 );

    constructor( ...args: any[] ) {
      super( 3, 3, args );
    }

    public get tx(): number {
      return this.get( 0, 2 );
    }

    public get ty(): number {
      return this.get( 1, 2 );
    }

    public set tx( v: number ) {
      this.set( 0, 2, v );
    }

    public set ty( v: number ) {
      this.set( 1, 2, v ) ;
    }

    public get w(): number {
      return this.get( 2, 2 );
    }

    public set w( v: number ) {
      this.set( 2, 2, v );
    }

    // slow public rotation accessor
    public get rotation(): Angle {
      var a = this.get( 0, 0 ); // cos term
      var b = this.get( 0, 1 ); // sin term

      // when 90 < rot <= 270, atan returns  rot-180 (atan returns results in the [ -90, 90 ] range), so correct it
      if ( a < 0 ) {
        return fromRadians( Math.atan( b / a ) + Math.PI );
      } else {
        return fromRadians( Math.atan( b / a ) );
      }
    }

    // internal accessor
    public get rot_raw(): number {
      var a = this.get( 0, 0 ); // cos term
      var b = this.get( 0, 1 ); // sin term

      if ( a < 0 ) {
        return Math.atan( b / a ) + Math.PI;
      } else {
        return Math.atan( b / a );
      }
    }

    public set rotation( v: Angle ) {
      var rad = v.toRadians();
      var sx = this.sx;
      var sy = this.sy;
      this.set( 0, 0, sx * Math.cos( rad ) );
      this.set( 0, 1, -sx * Math.sin( rad ) );
      this.set( 1, 0, sy * Math.sin( rad ) );
      this.set( 1, 1, sy * Math.cos( rad ) );
    }

    public get sx() {
      var a = this.get( 0, 0 );
      var b = this.get( 0, 1 );
      return Math.sqrt( a*a + b*b );
    }

    public get sy() {
      var c = this.get( 1, 0 );
      var d = this.get( 1, 1 );
      return Math.sqrt( c*c + d*d );
    }

    public set sx( v: number ) {
      var rad = this.rot_raw;
      this.set( 0, 0, v * Math.cos( rad ) );
      this.set( 0, 1, -v * Math.sin( rad ) );
    }

    public set sy( v: number ) {
      var rad = this.rot_raw;
      this.set( 1, 0, v * Math.sin( rad ) );
      this.set( 1, 1, v * Math.cos( rad ) );
    }

    public row( r ): Vec3 {
      var row = [];
      for ( var i = 0; i < 3; i++ ) {
        row.push( this.get( r, i ) );
      }
      return Vec3.apply( Vec3, row );
    }

    public column( c ): Vec3 {
      var column = [];
      for ( var i = 0; i < 3; i++ ) {
        column.push( this.get( i, c ) );
      }
      return Vec3.apply( Vec3, column );
    }

    public static identity(): Mat3 {
      return new Mat3( 1, 0, 0
                     , 0, 1, 0
                     , 0, 0, 1 );
    }
  }
}
