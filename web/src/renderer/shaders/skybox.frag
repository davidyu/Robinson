precision mediump float;

varying vec3 vDirection;

uniform samplerCube environment;

vec3 flipX( vec3 v ) {
    return vec3( -v.x, v.y, v.z );
}

void main() {
    gl_FragColor = textureCube( environment, vDirection );
}
