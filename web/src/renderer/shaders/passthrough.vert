attribute highp vec3 aVertexPosition;
attribute mediump vec2 aVertexTexCoord;

uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;

varying mediump vec4 vPosition;
varying mediump vec2 vTexCoord;

void main() {
    vPosition = vec4( aVertexPosition, 1.0 );
    vTexCoord = aVertexTexCoord;
    gl_Position = vec4( aVertexPosition, 1.0 );
}
