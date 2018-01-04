attribute highp vec3 aVertexPosition;
attribute mediump vec2 aVertexTexCoord;

uniform highp mat4   uInverseProjectionMatrix;
uniform highp mat3   uInverseViewMatrix;

varying mediump vec3 vDirection;
varying mediump vec3 vPosition;
varying mediump vec2 vTexCoord;

void main() {
    // reproduce the camera aim, per vertex, which is automatically interpolated to be per-pixel when we're in the fragment shader
    vDirection = uInverseViewMatrix * ( uInverseProjectionMatrix * vec4( aVertexPosition, 1.0 ) ).xyz;

    // assume the quad verts provided cover full-screen; no processing necessary.
    vPosition = aVertexPosition;
    vTexCoord = aVertexTexCoord;

    gl_Position = vec4( aVertexPosition, 1.0 );
}
