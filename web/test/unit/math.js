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
  it( "tests vector accessors", function() {
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
