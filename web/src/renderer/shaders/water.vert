attribute highp vec3 aVertexPosition;
attribute highp vec3 aVertexNormal;

uniform highp mat4 uMVMatrix;          // model view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;
uniform highp mat3 uNormalMVMatrix;    // inverse model view matrix

uniform mediump float uTime;

varying mediump vec3 vDirection;
varying mediump vec4 vPosition;
varying mediump vec3 vNormal;

const float sea_choppiness = 4.0;
const float sea_frequency = 0.16;
const float sea_amplitude = 0.6;

// based on Shadertoy "Seascape" entry by TDM

// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners porcentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float octave( vec2 uv, float choppiness )
{
    uv += noise( uv );
    vec2 wave  = 1.0 - abs( sin( uv ) );
    vec2 wave2 = abs( cos( uv ) );
    wave = mix( wave, wave2, wave ); // ????????????????????
    return pow( 1.0 - pow( wave.x * wave.y, 0.65 ), choppiness );
}

float height( vec2 p )
{
    float freq = sea_frequency;
    float amp  = sea_amplitude;
    float choppiness = sea_choppiness;

    p.x *= 0.75;

    const mat2 octave_matrix = mat2( 1.6, 1.2, -1.2, 1.6 );
    float d, height = 0.0;
    for ( int i = 0; i < 3; i++ ) {
        d = octave( ( p + uTime ) * freq, choppiness ), 
        d += octave( ( p - uTime ) * freq, choppiness ), 
        height += d * amp;
        p *= octave_matrix;
        freq *= 1.9;
        amp *= 0.22;
        choppiness = mix( choppiness, 1.0, 0.2 );
    }

    return height;
}

void main() {
    vPosition = vec4( aVertexPosition, 1.0 );

    vPosition = uMVMatrix * vPosition;
    // apply heightmap
    vPosition.y += height( vPosition.xz );

    vNormal = uNormalMVMatrix * aVertexNormal;

    // reproduce the eye/camera aim, per vertex, which is automatically interpolated to be per-pixel when we're in the fragment shader
    vDirection = uInverseViewMatrix * ( uInverseProjectionMatrix * vec4( aVertexPosition, 1.0 ) ).xyz;

    gl_Position = uPMatrix * vPosition;
}
