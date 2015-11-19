describe( "vector tests", function() {
  it( "tests vector accessors", function() {
    var a = new gml.Vector( 2, 0, 1 );
    var b = new gml.Vector( 2, 2, 3 );

    expect( a.get(0) ).toBe( 0 );
    expect( a.get(1) ).toBe( 1 );
    expect( b.get(0) ).toBe( 2 );
    expect( b.get(1) ).toBe( 3 );
  } );
} );

describe( "mat4 tests", function() {
  it( "tests mat4 getters", function() {
    var a = new gml.Mat4( 1, 5, 9,13
                        , 2, 6,10,14
                        , 3, 7,11,15
                        , 4, 8,12,16 );

    expect( a.r00 ).toBe( 1 );
    expect( a.r01 ).toBe( 2 );
    expect( a.r02 ).toBe( 3 );
    expect( a.tx  ).toBe( 4 );
    expect( a.r10 ).toBe( 5 );
    expect( a.r11 ).toBe( 6 );
    expect( a.r12 ).toBe( 7 );
    expect( a.ty  ).toBe( 8 );
    expect( a.r20 ).toBe( 9 );
    expect( a.r21 ).toBe( 10 );
    expect( a.r22 ).toBe( 11 );
    expect( a.tz  ).toBe( 12 );
    expect( a.m30 ).toBe( 13 );
    expect( a.m31 ).toBe( 14 );
    expect( a.m32 ).toBe( 15 );
    expect( a.m33 ).toBe( 16 );
  } );


  it( "tests mat4 setters", function() {
    var a = gml.Mat4.identity();

    // setter test
    a.r00 = 1;
    a.r01 = 2;
    a.r02 = 3;
    a.tx  = 4;
    a.r10 = 5;
    a.r11 = 6;
    a.r12 = 7;
    a.ty  = 8;
    a.r20 = 9;
    a.r21 = 10;
    a.r22 = 11;
    a.tz  = 12;
    a.m30 = 13;
    a.m31 = 14;
    a.m32 = 15;
    a.m33 = 16;

    expect( a.r00 ).toBe( 1 );
    expect( a.r01 ).toBe( 2 );
    expect( a.r02 ).toBe( 3 );
    expect( a.tx  ).toBe( 4 );
    expect( a.r10 ).toBe( 5 );
    expect( a.r11 ).toBe( 6 );
    expect( a.r12 ).toBe( 7 );
    expect( a.ty  ).toBe( 8 );
    expect( a.r20 ).toBe( 9 );
    expect( a.r21 ).toBe( 10 );
    expect( a.r22 ).toBe( 11 );
    expect( a.tz  ).toBe( 12 );
    expect( a.m30 ).toBe( 13 );
    expect( a.m31 ).toBe( 14 );
    expect( a.m32 ).toBe( 15 );
    expect( a.m33 ).toBe( 16 );
  } );

  it( "tests mat4 row and column accessors", function() {
    var a = new gml.Mat4( 1, 5, 9,13
                        , 2, 6,10,14
                        , 3, 7,11,15
                        , 4, 8,12,16 );

    var row0 = new gml.Vec4( 1, 2, 3, 4 );
    var row1 = new gml.Vec4( 5, 6, 7, 8 );
    var row2 = new gml.Vec4( 9,10,11,12 );
    var row3 = new gml.Vec4( 13,14,15,16 );

    expect( a.row( 0 ) ).toEqual( row0 );
    expect( a.row( 1 ) ).toEqual( row1 );
    expect( a.row( 2 ) ).toEqual( row2 );
    expect( a.row( 3 ) ).toEqual( row3 );
  } );
} );
