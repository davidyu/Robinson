precision mediump float;

struct Material {
    sampler2D colormap;
};

uniform Material mat;

varying vec4 vPosition; // unused
varying vec2 vTexCoord;

void main( void ) {
    gl_FragColor = texture2D( mat.colormap, vTexCoord );
}
