#version 300 es

in highp vec3 aVertexPosition;
in highp vec2 aMeshCoord;
in highp vec3 aVertexNormal;

uniform highp mat4 uMMatrix;           // model matrix
uniform highp mat4 uVMatrix;           // view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat4 uInverseProjectionMatrix;
uniform highp mat3 uInverseViewMatrix;
uniform highp mat3 uNormalMVMatrix;    // inverse model view matrix

uniform mediump float uTime;
uniform mediump vec4 cPosition_World;

out mediump vec3  vDirection;
out mediump vec4  vPosition;
out mediump vec4  vPosition_World;
out mediump float vAmp;
out mediump vec2  vQuadCoord;

// these are constants for all intents and purposes
flat out float sea_speed;
flat out float sea_choppiness;
flat out float sea_frequency;
flat out float sea_amplitude;
flat out float sea_scale;

// based on Shadertoy "Seascape" entry by TDM

// bteitler: A 2D hash function for use in noise generation that returns range [0 .. 1].  You could
// use any hash function of choice, just needs to deterministic and return
// between 0 and 1, and also behave randomly.  Googling "GLSL hash function" returns almost exactly 
// this function: http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
// Performance is a real consideration of hash functions since ray-marching is already so heavy.
float hash( vec2 p ) {
    float h = dot(p,vec2(127.1,311.7));	
    return fract(sin(h)*83758.5453123);
}

// bteitler: A 2D psuedo-random wave / terrain function.  This is actually a poor name in my opinion,
// since its the "hash" function that is really the noise, and this function is smoothly interpolating
// between noisy points to create a continuous surface.
float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );	

    // bteitler: This is equivalent to the "smoothstep" interpolation function.
    // This is a smooth wave function with input between 0 and 1
    // (since it is taking the fractional part of <p>) and gives an output
    // between 0 and 1 that behaves and looks like a wave.  This is far from obvious, but we can graph it to see
    // Wolfram link: http://www.wolframalpha.com/input/?i=plot+x*x*%283.0-2.0*x%29+from+x%3D0+to+1
    // This is used to interpolate between random points.  Any smooth wave function that ramps up from 0 and
    // and hit 1.0 over the domain 0 to 1 would work.  For instance, sin(f * PI / 2.0) gives similar visuals.
    // This function is nice however because it does not require an expensive sine calculation.
    vec2 u = f*f*(3.0-2.0*f);

    // bteitler: This very confusing looking mish-mash is simply pulling deterministic random values (between 0 and 1)
    // for 4 corners of the grid square that <p> is inside, and doing 2D interpolation using the <u> function
    // (remember it looks like a nice wave!) 
    // The grid square has points defined at integer boundaries.  For example, if <p> is (4.3, 2.1), we will 
    // evaluate at points (4, 2), (5, 2), (4, 3), (5, 3), and then interpolate x using u(.3) and y using u(.1).
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
    uv += noise( uv );
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
    sea_speed = 2.0;
    sea_choppiness = 4.0;
    sea_frequency = 0.1;
    sea_amplitude = 0.6;
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
