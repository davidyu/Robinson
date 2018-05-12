#version 300 es

in highp vec3 aVertexPosition;

uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;

out mediump vec3 vDirection;

void main() {
    // reproduce the camera aim, per vertex, which is automatically interpolated to be per-pixel when we're in the fragment shader
    // note that this vector is in world space, not view space
    vDirection = uInverseViewMatrix * ( uInverseProjectionMatrix * vec4( aVertexPosition, 1.0 ) ).xyz;

    // assume the quad covers the entire screen; move the skybox quad close to the far clip plane
    gl_Position = vec4( aVertexPosition.xy, 0.9999999, 1.0 );
}
