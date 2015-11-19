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

  it( "tests mat4 row and column getters", function() {
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

    var col0 = new gml.Vec4( 1, 5, 9,13 );
    var col1 = new gml.Vec4( 2, 6,10,14 );
    var col2 = new gml.Vec4( 3, 7,11,15 );
    var col3 = new gml.Vec4( 4, 8,12,16 );

    expect( a.column( 0 ) ).toEqual( col0 );
    expect( a.column( 1 ) ).toEqual( col1 );
    expect( a.column( 2 ) ).toEqual( col2 );
    expect( a.column( 3 ) ).toEqual( col3 );
  } );

  it( "tests mat4 row and column setters", function() {
    var a = gml.Mat4.identity();

    var row0 = new gml.Vec4( 1, 2, 3, 4 );
    var row1 = new gml.Vec4( 5, 6, 7, 8 );
    var row2 = new gml.Vec4( 9,10,11,12 );
    var row3 = new gml.Vec4( 13,14,15,16 );

    a.setRow( 0, row0 );
    a.setRow( 1, row1 );
    a.setRow( 2, row2 );
    a.setRow( 3, row3 );

    expect( a.row( 0 ) ).toEqual( row0 );
    expect( a.row( 1 ) ).toEqual( row1 );
    expect( a.row( 2 ) ).toEqual( row2 );
    expect( a.row( 3 ) ).toEqual( row3 );

    var col0 = new gml.Vec4( 10, 50, 90,130 );
    var col1 = new gml.Vec4( 20, 60,100,140 );
    var col2 = new gml.Vec4( 30, 70,110,150 );
    var col3 = new gml.Vec4( 40, 80,120,160 );

    a.setColumn( 0, col0 );
    a.setColumn( 1, col1 );
    a.setColumn( 2, col2 );
    a.setColumn( 3, col3 );

    expect( a.column( 0 ) ).toEqual( col0 );
    expect( a.column( 1 ) ).toEqual( col1 );
    expect( a.column( 2 ) ).toEqual( col2 );
    expect( a.column( 3 ) ).toEqual( col3 );
  } );

  it( "tests mat4 matrix multiplication", function() {
    var a = gml.Mat4.identity();
    var b = new gml.Mat4( 1, 5, 9,13
                        , 2, 6,10,14
                        , 3, 7,11,15
                        , 4, 8,12,16 );

    expect( a.mul( b ) ).toEqual( b );
  } );
} );
