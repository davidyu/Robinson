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
    // color based on normal
    gl_FragColor = vec4( ( normalize( vNormal ) * 0.5 + vec3( 0.5, 0.5, 0.5 ) ), 1 );
}
