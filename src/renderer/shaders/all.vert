#version 300 es

in mediump vec4 aVertexColor;
in highp vec3 aVertexPosition;
in highp vec3 aVertexNormal;

uniform highp mat4 uMMatrix;           // model matrix -> trasnforms to world space
uniform highp mat4 uMVMatrix;          // model view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat3 uNormalMVMatrix;    // inverse model view matrix
uniform highp mat3 uNormalWorldMatrix; // inverse model matrix

// vs out - unless otherwise specified, all coords are in eye/camera space
out mediump vec4 vColor;
out mediump vec4 vPosition;
out mediump vec4 vPosition_World; // position in world space
out mediump vec3 vNormal;
out mediump vec3 vNormal_World;   // normal in world space

void main(void) {
    vPosition = uMVMatrix * vec4( aVertexPosition, 1.0 );
    vPosition_World = uMMatrix * vec4( aVertexPosition, 1.0 );
    vColor = aVertexColor;
    vNormal = uNormalMVMatrix * aVertexNormal;
    vNormal_World = uNormalWorldMatrix * aVertexNormal;

    gl_Position = uPMatrix * vPosition;
}
