#version 300 es

precision mediump float;

in vec3 vDirection;

uniform samplerCube environment;
uniform bool        proceduralSky;

out vec4 fragColor;

void main() {
    fragColor = texture( environment, vDirection );
}
