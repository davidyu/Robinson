precision mediump float;

uniform sampler2D uColor;
varying vec2 vTexCoord;

void main( void ) {
    gl_FragColor = texture2D( uColor, vTexCoord );
}
