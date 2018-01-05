#version 300 es

precision mediump float;

// fs in/vs out
in mediump vec4 vPosition;
in mediump vec3 vNormal_World;    // normal vector in world space

struct Light {
    vec4 position;
    vec4 color;
    bool enabled;
};

uniform Light lights[10];

out vec4 fragColor;

void main( void ) {
    // color based on normal
    fragColor = vec4( ( normalize( vNormal_World ) * 0.5 + vec3( 0.5, 0.5, 0.5 ) ), 1 );
}
