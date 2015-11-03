var ns = require( 'node-static' )
var ss = new ns.Server( "." );

var fileserver = require( 'http' ).createServer( function( req, res ) {
  req.addListener( 'end', function() {
    ss.serve( req, res );
  } ).resume();
} );

fileserver.listen( 3617 );
