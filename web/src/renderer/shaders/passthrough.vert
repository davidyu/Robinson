attribute highp vec3 aVertexPosition;

uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;

varying mediump vec4 vPosition;

void main() {
    vPosition = vec4( aVertexPosition, 1.0 );
    gl_Position = vec4( aVertexPosition, 1.0 );
}
