attribute highp vec3 aVertexPosition;

uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;

varying mediump vec3 vDirection;

void main() {
    // assuming a full-screen quad, the model matrix is the identity,
    // so the inverse view matrix is fine for our purposes.
    vDirection = uInverseViewMatrix * ( uInverseProjectionMatrix * vec4( aVertexPosition, 1.0 ) ).xyz;

    // assume the quad verts provided cover full-screen; no processing necessary.
    gl_Position = vec4( aVertexPosition, 1.0 );
}
