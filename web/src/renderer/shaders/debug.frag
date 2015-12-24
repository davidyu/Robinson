precision mediump float;

// fs in/vs out
varying mediump vec4 vPosition;
varying mediump vec3 vNormal_World;    // normal vector in world space

struct Light {
    vec4 position;
    vec4 color;
    bool enabled;
};

uniform Light lights[10];

void main( void ) {
    // color based on normal
    gl_FragColor = vec4( ( normalize( vNormal_World ) * 0.5 + vec3( 0.5, 0.5, 0.5 ) ), 1 );
}
