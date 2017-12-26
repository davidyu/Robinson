precision mediump float;

uniform vec4 cPosition_World;
uniform float uTime;

varying vec4 vPosition;
varying vec4 vPosition_World;

uniform highp mat4 uVMatrix;
uniform highp mat3 uInverseViewMatrix;
uniform highp mat3 uNormalMVMatrix;    // inverse model view matrix

uniform samplerCube environment;
uniform float environmentMipMaps;

const   vec3  sun_light_dir = normalize( vec3( 0.0, 1.0, 0.4 ) );  // radius of sun sphere
const   vec3  sea_base_color  = vec3( 0.1,0.19,0.22 );
const   vec3  sea_water_color = vec3( 0.8,0.9,0.6 );

const float sea_speed = 2.0;
const float sea_choppiness = 4.0;
const float sea_frequency = 0.1;
const float sea_amplitude = 0.6;
const float sea_scale = 0.6;

float diffuse( vec3 normal, vec3 light, float p ) {
    return pow( dot( normal, light ) * 0.4 + 0.6, p );
}

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

float octave( vec2 uv, float choppiness )
{
    uv += noise( uv );
    vec2 wave  = 1.0 - abs( sin( uv ) );
    vec2 wave2 = abs( cos( uv ) );
    wave = mix( wave, wave2, wave ); // ????????????????????
    return pow( 1.0 - pow( wave.x * wave.y, 0.65 ), choppiness );
}

float height_detailed( vec2 p )
{
    float freq = sea_frequency;
    float amp  = sea_amplitude;
    float choppiness = sea_choppiness;

    const mat2 octave_matrix = mat2( 1.6, 1.2, -1.2, 1.6 );
    float d, height = 0.0;
    for ( int i = 0; i < 6; i++ ) {
        d = octave( ( p + uTime * sea_speed ) * freq, choppiness ), 
        d += octave( ( p - uTime * sea_speed ) * freq, choppiness ), 
        height += d * amp;
        p *= octave_matrix;
        freq *= 1.9;
        amp *= 0.22;
        choppiness = mix( choppiness, 1.0, 0.2 );
    }

    return height;
}

vec3 get_normal( vec2 p, float epsilon )
{
    vec3 n;
    float original = -height_detailed( p );
    n.x = -height_detailed( vec2( p.x + epsilon, p.y ) ) - original;
    n.z = -height_detailed( vec2( p.x, p.y + epsilon ) ) - original;
    n.y = epsilon;
    return normalize( n );
}

float get_specular( vec3 n, vec3 l, vec3 e, float s ) {
    float nrm = ( s + 8.0 ) / ( 3.1415926 * 8.0 );
    return pow( max ( dot( reflect( e, n ), l ), 0.0 ), s ) * nrm;
}

float foam( vec3 pos )
{
    float freq = sea_frequency;
    float amp  = sea_amplitude;
    float choppiness = sea_choppiness;

    vec2 p = pos.xz * sea_scale;
    const mat2 octave_matrix = mat2( 1.6, 1.2, -1.2, 1.6 );
    float d, height = 0.0;
    
    float amp_sum = 0.0;
    for ( int i = 0; i < 5; i++ ) {
        d = octave( ( p + uTime * sea_speed ) * freq, choppiness ), 
        d += octave( ( p - uTime * sea_speed ) * freq, choppiness ), 
        height += d * amp;
        p *= octave_matrix;
        freq *= 1.9;
        amp_sum += amp;
        amp *= 0.33;
        choppiness = mix( choppiness, 1.0, 0.2 );
    }
        
    amp_sum += amp;
    float f = max( 0.0, height - 0.5 * amp_sum ) / ( amp_sum );
    
    for ( int i = 0; i < 5; i++ ) {
        f -= noise( p * float( i ) * 10.0) * 0.04;
    }
    
    // SUPER SLOW FBM
    // TOO MANY LOOPS
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    p = pos.xz + uTime * sea_scale * sea_speed * 0.1;
    for (int i = 0; i < 5; ++i) {
        v += a * noise( p );
        p = rot * p * 2.0 + shift;
        a *= 0.5;
    }
    
    f = f * ( ( v * v + 1.0 ) / 2.0 );

    return pow( f, 5.0 );
}

void main( void ) {
    float dist = length( cPosition_World - vPosition_World );
    vec3 view = normalize( -( vPosition.xyz / vPosition.w ) );

    vec3 normal = normalize( uNormalMVMatrix * get_normal( vPosition_World.xz * sea_scale, dist * 0.001 ) );

    vec3 reflected = uInverseViewMatrix * ( -reflect( view, normal ) );
    vec4 ibl_specular = engamma( textureCube( environment, reflected ) * 0.9 );
    
    vec3 lightdir = normalize( uVMatrix * vec4( sun_light_dir, 0 ) ).xyz;

    vec4 refracted = engamma( vec4( sea_base_color + diffuse( normal, lightdir, 80.0 ) * sea_water_color * 0.12, 1.0 ) ); 

    float fresnel = 1.0 - max(dot(-normal,-view),0.0);
    fresnel = pow(fresnel,3.0);
    
    vec4 color = mix( refracted, ibl_specular, fresnel );

    float atten = max( 1.0 - dot( dist, dist ) * 0.0000015, 0.0 );

    color += engamma( vec4( sea_water_color * ( height_detailed( vPosition_World.xz * sea_scale ) ) * 0.05 * atten, 1.0 ) );

    color += engamma( vec4( get_specular( normal, lightdir, -view, 100.0 ) ) * 0.35 );
    
    // actual foam
    color = mix( color, vec4( 1.0, 1.0, 1.0, 1.0 ), 0.6 * foam( vPosition_World.xyz ) );

    gl_FragColor = degamma( color );
}
