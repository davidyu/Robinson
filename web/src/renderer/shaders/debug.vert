#version 300 es

in mediump vec4 aVertexColor;
in highp vec3 aVertexPosition;
in highp vec3 aVertexNormal;

uniform highp mat4 uMVMatrix;          // model view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat3 uNormalWorldMatrix; // inverse model matrix

out mediump vec3 vNormal_World;    // normal in world space

void main(void) {
    vNormal_World = uNormalWorldMatrix * aVertexNormal;
    gl_Position = uPMatrix * uMVMatrix * vec4( aVertexPosition, 1.0 );
}
