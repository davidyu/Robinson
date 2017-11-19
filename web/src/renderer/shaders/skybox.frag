precision mediump float;

varying vec3 vDirection;

uniform samplerCube environment;
uniform bool        proceduralSky;

void main() {
    gl_FragColor = textureCube( environment, vDirection );
}
