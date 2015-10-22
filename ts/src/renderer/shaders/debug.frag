precision mediump float;

// fs in/vs out
varying mediump vec4 vPosition;  // vertex position in view space, no need to convert
varying mediump vec3 vNormal;    // normal vector in model space, need to convert here

struct Light {
    vec4 position;
    vec4 color;
    bool enabled;
};

uniform Light lights[10];

void main( void ) {
    // visualize light properties
    if ( gl_FragCoord.y == 0.5 ) {
        if ( gl_FragCoord.x < 10.0 ) {
            gl_FragColor = vec4( 1, 0, 0, 1 );
            return;
        }
    }

    if ( vNormal.z > 0.0 )
        gl_FragColor = vec4( 1, 1, 0, 1 );
    else if ( vNormal.z == 0.0 )
        gl_FragColor = vec4( 0, 0, 1, 1 );
    else
        gl_FragColor = vec4( 1, 0, 0, 1 );
}
