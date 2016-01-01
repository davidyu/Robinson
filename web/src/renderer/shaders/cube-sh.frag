precision mediump float;

varying mediump vec4 vPosition;        // vertex position in view space, no need to convert
uniform samplerCube environment;

void main( void ) {
    gl_FragColor = vec4( 1, 0, 0, 1 );

    if ( vPosition.x >= 0.0 ) {
        gl_FragColor = vec4( 1, 0, 0, 1 );
    } else if ( vPosition.x == 1.0 / 8.0 ) {
        gl_FragColor = vec4( 0, 1, 0, 1 );
    } else if ( vPosition.x == 2.0 / 8.0 ) {
        gl_FragColor = vec4( 0, 0, 1, 1 );
    }
}
