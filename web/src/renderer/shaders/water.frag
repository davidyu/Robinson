precision mediump float;

varying mediump vec4 vPosition;
varying mediump vec3 vNormal;    // normal vector in world space

const bool Debug = true;

void main( void ) {
    // for testing color based on normal
    if ( Debug ) {
        gl_FragColor = vec4( ( normalize( vNormal ) * 0.5 + vec3( 0.5, 0.5, 0.5 ) ), 1 );
    }
}
