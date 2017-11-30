attribute highp vec3 aVertexPosition;
attribute highp vec3 aVertexNormal;

uniform highp mat4 uMVMatrix;          // model view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;
uniform highp mat3 uNormalMVMatrix;    // inverse model view matrix

varying mediump vec3 vDirection;
varying mediump vec4 vPosition;
varying mediump vec3 vNormal;

void main() {
    vPosition = uMVMatrix * vec4( aVertexPosition, 1.0 );
    vNormal = uNormalMVMatrix * aVertexNormal;

    // reproduce the eye/camera aim, per vertex, which is automatically interpolated to be per-pixel when we're in the fragment shader
    vDirection = uInverseViewMatrix * ( uInverseProjectionMatrix * vec4( aVertexPosition, 1.0 ) ).xyz;

    gl_Position = uPMatrix * vPosition;
}
