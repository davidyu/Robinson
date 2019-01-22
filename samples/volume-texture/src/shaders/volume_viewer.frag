#version 300 es

precision mediump float;
precision mediump sampler3D;

uniform sampler3D volume;
uniform float     uNoiseLayer;

in  vec2 vTexCoord;
out vec4 fragColor;

void main() {
    fragColor = texture( volume, vec3( vTexCoord.x, vTexCoord.y, uNoiseLayer ) );
}
