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
