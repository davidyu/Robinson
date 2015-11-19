module gml {
  export class Mat4 extends Matrix {

    constructor( args: Float32Array );
    constructor( args: number[] );
    constructor( r00, r01, r02, tx, r10, r11, r12, ty, r20, r21, r22, tz, m30, m31, m32, m33 );

    constructor( ...args: any[] ) {
      super( 4, 4, args );
    }

    public get r00(): number {
      return this.get( 0, 0 );
    }

    public get r01(): number {
      return this.get( 0, 1 );
    }

    public get r02(): number {
      return this.get( 0, 2 );
    }

    public set r00( v: number ) {
      this.set( 0, 0, v );
    }

    public set r01( v: number ) {
      this.set( 0, 1, v );
    }

    public set r02( v: number ) {
      this.set( 0, 2, v );
    }

    public get tx(): number {
      return this.get( 0, 3 );
    }

    public get ty(): number {
      return this.get( 1, 3 );
    }
    
    public get tz(): number {
      return this.get( 2, 3 );
    }

    public set tx( v: number ) {
      this.set( 0, 3, v );
    }

    public set ty( v: number ) {
      this.set( 1, 3, v ) ;
    }

    public set tz( v: number ) {
      this.set( 2, 3, v ) ;
    }

    public get w(): number {
      return this.get( 3, 3 );
    }

    public set w( v: number ) {
      this.set( 3, 3, v );
    }

    public row( r ): Vec4 {
      var row = [];
      for ( var i = 0; i < 4; i++ ) {
        row.push( this.get( r, i ) );
      }
      return new Vec4( row );
    }

    public setRow( r, v: Vec4 ) {
      for ( var i = 0; i < 4; i++ ) {
        this.set( r, i, v[i] );
      }
    }

    public column( c ): Vec4 {
      var column = [];
      for ( var i = 0; i < 4; i++ ) {
        column.push( this.get( i, c ) );
      }
      return new Vec4( column );
    }

    public setColumn( c, v: Vec4 ) {
      for ( var i = 0; i < 4; i++ ) {
        this.set( i, c, v[i] );
      }
    }

    public get translation(): Vec4 {
      return this.column( 3 );
    }

    public set translation( t: Vec4 ) {
      this.setColumn( 3, t );
    }

    public get scale(): Vec3 {
      return new Vec3( this.get( 0, 0 ), this.get( 1, 1 ), this.get( 2, 2 ) );
    }

    public set scale( s: Vec3 ) {
      this.set( 0, 0, s.x );
      this.set( 1, 1, s.y );
      this.set( 2, 2, s.z );
    }

    public mul( rhs: Mat4 ): Mat4 {
      var m = super.mul( rhs );
      return new Mat4( m.Float32Array );
    }

    public invert(): Mat4 {
      return null;
    }

    public transpose(): Mat4 {
      return null;
    }

    public get mat3(): Mat3 {
      return null;
    }

    public static identity(): Mat4 {
      return new Mat4( 1, 0, 0, 0
                     , 0, 1, 0, 0
                     , 0, 0, 1, 0
                     , 0, 0, 0, 1 );
    }
  }

  export function makeMat4FromRows( r1, r2, r3, r4 ) {
    return new Mat4( r1.x, r2.x, r3.x, r4.x
                   , r1.y, r2.y, r3.y, r4.y
                   , r1.z, r2.z, r3.z, r4.z
                   , r1.w, r2.w, r3.w, r4.w );
  }

  export function makePerspective( fov: Angle, aspectRatio: number, near: number, far: number ): Mat4 {
    let t = near * Math.tan( fov.toRadians() );
    let r = t * aspectRatio;
    let l = -r;
    let b = -t;
    let n = near;
    let f = far;

    return new Mat4( ( n * 2 ) / ( r - l ) , 0                     , ( r + l ) / ( r - l )      , 0
                   , 0                     , ( n * 2 ) / ( t - b ) , ( t + b ) / ( t - b )      , 0
                   , 0                     , 0                     , -( f + n ) / ( f - n )     , -( f * n * 2 ) / ( f - n )
                   , 0                     , 0                     , -1                         , 0 );
  }

  export function makeLookAt( pos: Vec4, aim: Vec4 /* target */, up: Vec4, right: Vec4 ): Mat4 {
    let x = right.normalized;
    let y = up.normalized;
    let z = aim.sub( pos ).normalized;

    var lookAt = makeMat4FromRows( x, y, z, new Vec4( 0, 0, 0, 1 ) );
    lookAt.tx = pos.x;
    lookAt.ty = pos.y;
    lookAt.tz = pos.z;

    return lookAt;
  }
}
