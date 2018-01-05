#version 300 es

in highp vec3 aVertexPosition;

uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;

out mediump vec3 vDirection;

void main() {
    // reproduce the camera aim, per vertex, which is automatically interpolated to be per-pixel when we're in the fragment shader
    // note that this vector is in world space, not view space
    vDirection = uInverseViewMatrix * ( uInverseProjectionMatrix * vec4( aVertexPosition, 1.0 ) ).xyz;

    // assume the quad verts provided cover full-screen; no processing necessary.
    gl_Position = vec4( aVertexPosition, 1.0 );
}
