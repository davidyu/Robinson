varying vec3 vDirection;

uniform samplerCube environment;

void main() {
    gl_FragColor = textureCube( environment, vDirection );
}
