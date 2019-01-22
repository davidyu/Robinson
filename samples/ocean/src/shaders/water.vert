#version 300 es

in highp vec3 aVertexPosition;
in highp vec2 aMeshCoord;
in highp vec3 aVertexNormal;

uniform highp mat4 uMMatrix; // model matrix
uniform highp mat4 uVMatrix; // view matrix
uniform highp mat4 uPMatrix; // projection matrix
uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;
uniform highp mat3 uNormalMVMatrix;

uniform mediump float uTime;
uniform mediump vec4 cPosition_World;
uniform mediump float uCloudSpeed;

out mediump vec3  vDirection;
out mediump vec4  vPosition;
out mediump vec4  vPosition_World;
out mediump float vAmp;
out mediump vec2  vQuadCoord;

flat out float sea_speed;
flat out float sea_choppiness;
flat out float sea_frequency;
flat out float sea_amplitude;
flat out float sea_scale;

// based on Shadertoy "Seascape" entry by TDM
// hash, waveheight, octave, height, all more or less unchanged from "Seascape" demo
// here's a great ShaderToy entry that documents each of these functions:
// https://www.shadertoy.com/view/llsXD2

// hash function, produces a pseudorandom number from 0 to 1 given a vec2
// see http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
float hash( vec2 p ) {
    float h = dot(p,vec2(127.1,311.7));	
    return fract(sin(h)*83758.5453123);
}

// smoothly interpolate between pseudorandom numbers based on p
// to produce smooth wave-like heightfields
float waveheight( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );	

    // see http://www.wolframalpha.com/input/?i=plot+x*x*%283.0-2.0*x%29+from+x%3D0+to+1
    vec2 u = f*f*(3.0-2.0*f);

    // interpolate between psuedorandom points
    return -1.0+2.0*mix( 
                mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), 
                        u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), 
                        u.x), 
                u.y);
}

// @return: float in [0, 1]
float octave( vec2 uv, float choppiness )
{
    uv += waveheight( uv );
    vec2 wave  = 1.0 - abs( sin( uv ) ); // 0.0 to 1.0
    vec2 wave2 = abs( cos( uv ) );       // 0.0 to 1.0
    wave = mix( wave, wave2, wave );     // 0.0 to 1.0
    return pow( 1.0 - pow( wave.x * wave.y, 0.65 ), choppiness );
}

// @return: float in [0, 2 * amp * iters]
float height( vec2 p )
{
    float freq = sea_frequency;
    float amp  = sea_amplitude;
    float choppiness = sea_choppiness;

    const mat2 octave_matrix = mat2( 1.6, 1.2, -1.2, 1.6 );
    float d, height = 0.0;
    const int ITER = 3; // coarser iterations for wave height
    for ( int i = 0; i < ITER; i++ ) {
        d  = octave( ( p + uTime * sea_speed ) * freq, choppiness ), 
        d += octave( ( p - uTime * sea_speed ) * freq, choppiness ), 
        height += d * amp;
        p *= octave_matrix;
        freq *= 1.9;
        amp *= 0.22;
        choppiness = mix( choppiness, 1.0, 0.2 );
    }

    return height;
}

void main() {
    float calmness = uCloudSpeed / 3.334; // bootstrap on cloud speed; it is normalized between 1 and 3.333 repeating
    sea_speed = 2.0;
    sea_choppiness = mix( 3.0, 4.0, calmness );
    sea_frequency = mix( 0.09, 0.11, calmness );
    sea_amplitude = mix( 0.3, 0.6, calmness );
    sea_scale = 0.6;

    vPosition = vec4( aVertexPosition, 1.0 );

    // transform from local to world
    vPosition = uMMatrix * vPosition;

    // apply water noise height offset
    float h = height( vPosition.xz * sea_scale );
    vPosition.y = 2.5 * h;

    // cache world position
    vPosition_World = vPosition;

    // then world to eye
    vPosition = uVMatrix * vPosition;

    vQuadCoord = aMeshCoord;

    gl_Position = uPMatrix * vPosition;
}
