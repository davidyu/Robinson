#version 300 es

in highp vec3 aVertexPosition;
in highp vec3 aVertexNormal;

// vs out - unless otherwise specified, all vectors are in eye/camera space

uniform mediump vec4 cPosition_World;  // camera in world space

uniform highp mat4 uMVMatrix;          // model view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat3 uNormalMVMatrix;    // inverse transposed model view matrix

out mediump vec4 vPosition;
out mediump vec3 vNormal;

void main(void) {
    vPosition = uMVMatrix * vec4( aVertexPosition, 1.0 );
    vNormal = uNormalMVMatrix * aVertexNormal;

    gl_Position = uPMatrix * vPosition;
}
