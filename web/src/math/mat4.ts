module gml {
  export class Mat4 extends Matrix {
    constructor( r00, r01, r02, tx, r10, r11, r12, ty, r20, r21, r22, tz, m30, m31, m32, m33 ) {
      super( 4, 4, r00, r01, r02, tx, r10, r11, r12, ty, r20, r21, r22, tz, m30, m31, m32, m33 );
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
      return new ( Function.prototype.bind.apply( Vec4, row ) );
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
      return new ( Function.prototype.bind.apply( Vec4, column ) );
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

    public static identity(): Mat4 {
      return new Mat4( 1, 0, 0, 0
                     , 0, 1, 0, 0
                     , 0, 0, 1, 0
                     , 0, 0, 0, 1 );
    }
  }

  export function makeMat4FromRows( r1, r2, r3, r4 ) {
    return new Mat4( r1.x, r1.y, r1.z, r1.w
                   , r2.x, r2.y, r2.z, r2.w
                   , r3.x, r3.y, r3.z, r3.w
                   , r4.x, r4.y, r4.z, r4.w );
  }

  export function makePerspective( fov: Angle, aspectRatio: number, near: number, far: number ): Mat4 {
    let t = near * Math.tan( fov.toRadians() );
    let r = t * aspectRatio;
    let l = -r;
    let b = -t;
    let n = near;
    let f = far;

    return new Mat4( ( n * 2 ) / ( r - l ) , 0                     , 0                          , 0
                   , 0                     , ( n * 2 ) / ( t - b ) , 0                          , 0
                   , ( r + l ) / ( r - l ) , ( t + b ) / ( t - b ) , -( f + n ) / ( f - n )     , -1
                   , 0                     , 0                     , -( f * n * 2 ) / ( f - n ) , 0 );
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
