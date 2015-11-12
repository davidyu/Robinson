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
  }

  export function makePerspective( fov: Angle, aspectRatio: number, near: number, far: number ) {
    let t = near * Math.tan( fov.toRadians() );
    let r = t * aspectRatio;
    let l = -r;
    let b = -t;
    let n = near;
    let f = far;

    return new Mat4( ( n * 2 ) / ( r - l ) , 0                                   , 0                          , 0
                   , 0                     , ( n * 2 ) / ( top - bottom )        , 0                          , 0
                   , ( r + l ) / ( r - l ) , ( top + bottom ) / ( top - bottom ) , -( f + n ) / ( f - n )     , -1
                   , 0                     , 0                                   , -( f * n * 2 ) / ( f - n ) , 0 );
  }
}
