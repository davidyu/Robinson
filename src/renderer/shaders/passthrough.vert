#version 300 es

in highp vec3 aVertexPosition;
in mediump vec2 aVertexTexCoord;

uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;

out mediump vec4 vPosition;
out mediump vec2 vTexCoord;

void main() {
    vPosition = vec4( aVertexPosition, 1.0 );
    vTexCoord = aVertexTexCoord;
    gl_Position = vec4( aVertexPosition, 1.0 );
}
