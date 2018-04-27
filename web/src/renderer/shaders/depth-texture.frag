#version 300 es

precision mediump float;

in mediump vec2 vTexCoord;

uniform sampler2D screen_depth;

uniform highp mat4 uVMatrix;

const float zNear = 0.1;
const float zFar  = 1000.0;

out vec4 fragColor;

float linearize(float depth)
{
    return (2.0 * zNear) / (zFar + zNear - depth * (zFar - zNear));
}

void main()
{
    float depth = linearize( texture( screen_depth, vTexCoord ).x );
    fragColor = vec4( depth, depth, depth, 1.0 );
}
