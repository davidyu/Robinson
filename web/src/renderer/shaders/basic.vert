attribute mediump vec4 aVertexColor;
attribute highp vec3 aVertexPosition;
attribute highp vec3 aVertexNormal;

uniform highp mat4 uMVMatrix;     // model view matrix
uniform highp mat4 uPMatrix;      // projection matrix
uniform highp mat3 uNormalMatrix; // inverse model view matrix

// vs out
varying mediump vec4 vColor;
varying mediump vec4 vPosition;
varying mediump vec3 vNormal;

void main(void) {
    vPosition = uMVMatrix * vec4( aVertexPosition, 1.0 );
    vColor = aVertexColor;
    vNormal = aVertexNormal;
    gl_Position = uPMatrix * vPosition;
}
