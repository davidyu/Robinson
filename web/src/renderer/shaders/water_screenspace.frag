#version 300 es

// "ground-truth" TDM seascape shader with minimal changes
// testing to see if valid heightmap tracing makes a difference

precision mediump float;

uniform vec4 cPosition_World;
uniform float uTime;
uniform highp mat4 uVMatrix;

uniform samplerCube environment;
uniform float environmentMipMaps;

const   vec3  sun_light_dir = normalize( vec3( 0.0, 1.0, 0.4 ) );  // radius of sun sphere
const   vec3  sea_base_color  = vec3(0.1,0.19,0.22);
const   vec3  sea_water_color = vec3(0.15,0.9,0.8);

const float sea_speed = 2.0;
const float sea_choppiness = 4.0;
const float sea_frequency = 0.16;
const float sea_amplitude = 0.6;
const float sea_scale = 1.0;

in vec3 vDirection;

out vec4 fragColor;

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

float height( vec3 pp )
{
    float freq = sea_frequency;
    float amp  = sea_amplitude;
    float choppiness = sea_choppiness;

    vec2 p = pp.xz;
    p.x *= 0.75;

    const mat2 octave_matrix = mat2( 1.6, 1.2, -1.2, 1.6 );
    float d, height = 0.0;
    for ( int i = 0; i < 3; i++ ) {
        d = octave( ( p + uTime * sea_speed ) * freq, choppiness ), 
        d += octave( ( p - uTime * sea_speed ) * freq, choppiness ), 
        height += d * amp;
        p *= octave_matrix;
        freq *= 1.9;
        amp *= 0.22;
        choppiness = mix( choppiness, 1.0, 0.2 );
    }

    return pp.y - height;
}

float height_detailed( vec3 pp )
{
    float freq = sea_frequency;
    float amp  = sea_amplitude;
    float choppiness = sea_choppiness;

    vec2 p = pp.xz;
    p.x *= 0.75;

    const mat2 octave_matrix = mat2( 1.6, 1.2, -1.2, 1.6 );
    float d, height = 0.0;
    for ( int i = 0; i < 5; i++ ) {
        d = octave( ( p + uTime * sea_speed ) * freq, choppiness ), 
        d += octave( ( p - uTime * sea_speed ) * freq, choppiness ), 
        height += d * amp;
        p *= octave_matrix;
        freq *= 1.9;
        amp *= 0.22;
        choppiness = mix( choppiness, 1.0, 0.2 );
    }

    return pp.y - height;
}

vec3 get_normal( vec3 p, float epsilon )
{
    vec3 n;
    float original = height_detailed( p );
    n.x = height_detailed( vec3( p.x + epsilon, p.y, p.z ) ) - original;
    n.z = height_detailed( vec3( p.x, p.y, p.z + epsilon ) ) - original;
    n.y = epsilon;
    return normalize( n );
}

float get_specular( vec3 n, vec3 l, vec3 e, float s ) {
    float nrm = ( s + 8.0 ) / ( 3.1415926 * 8.0 );
    return pow( max ( dot( reflect( e, n ), l ), 0.0 ), s ) * nrm;
}

// raymarching function from TDM's seascape shader
float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {  
    float tm = 0.0;
    float tx = 1000.0;

    float hx = height( ori + dir * tx );
    
    if ( hx > 0.0 ) return tx;   

    float hm = height( ori + dir * tm );
   
    float tmid = 0.0;
    for ( int i = 0; i < 8; i++ ) {
        tmid = mix( tm,tx, hm / ( hm-hx) );
        p = ori + dir * tmid; 
                  
    	float hmid = height( p );

        if(hmid < 0.0) {
            tx = tmid;
            hx = hmid;
        } else {
            // Haven't hit surface yet, easy case, just march forward
            tm = tmid;
            hm = hmid;
        }
    }

    return tmid;
}

float foam_detail( vec2 p )
{
    // use the same noise layering technique we've been using
    // except modify parameters slightly to add detail to foam
    // technique inspired by "Buoy" by TekF on ShaderToy
    // source: https://www.shadertoy.com/view/XdsGDB 
    p *= exp2( 2.5 );
    p.y -= uTime * 0.5;
    p.x += uTime * 0.1;
    
    float d = 0.0;
    float freq = sea_frequency * 1.7;
    float amp  = sea_amplitude * 0.25;
    float choppiness = sea_choppiness;
    float height = 0.0;
    
    const mat2 octave_matrix = mat2( 1.6, 1.2, -1.2, 1.6 );
    for ( int i = 0; i < 5; i++ ) {
        // warp input domain
        p = p.xy + p.yx * vec2( -1,1 ) / sqrt( 2.0 );
        d  = octave( ( p + uTime * sea_speed ) * freq, choppiness ), 
        d += octave( ( p - uTime * sea_speed ) * freq, choppiness ), 
        height += d * amp;
        p *= octave_matrix;
        freq *= 2.9;
        amp *= 0.22;
        choppiness = mix( choppiness, 1.0, 0.2 );
    }

    return height;
}

float foam( vec2 pos, float detailed_height )
{
    // foaminess is modulated by height
    float base_foaminess = detailed_height;

    float detail = foam_detail( pos );
   
    // poke some holes in foam to simulate appearance of bubbles
    // first term is large bubbles (to reduce noticeable artifacting at close range, we reduce large bubble alpha)
    // second term is tiny bubbles (no noticeable artifacting unless at a particular distance, but that's a sampling artifact)
    float fizziness = clamp( abs( noise( pos * 25.0 ) ) * 0.04 + abs( noise( pos * 380.0 ) ) * 0.2, 0.0, 1.0 );

    // the smoothstep is actually quite important in producing the end result. We purposefully (artistically :) pick
    // a range in the produced noise that looks reasonably passable as foam
    // modulate fizziness by wave height (so we don't see too much foam bubbles on the edge)
    float foam = smoothstep( 0.9, 2.1, base_foaminess + detail ) - smoothstep( 0.5, 1.6, base_foaminess ) * fizziness;
    
    // eliminate negative values
    return max( foam, 0.0 );
}

void main( void ) {
    vec3 view = normalize( vDirection );
    vec3 ori = cPosition_World.xyz;
    ori.y = 3.0;

    vec3 p;
    heightMapTracing( ori, view * sea_scale, p );

    vec3 dist = p - ori;

    vec3 normal = get_normal( p * sea_scale, dot( dist,dist ) * 0.00007 );

    vec3 reflected = ( reflect( view, normal ) );
    vec4 ibl_specular = texture( environment, reflected );
    
    vec3 lightdir = normalize( uVMatrix * vec4( sun_light_dir, 0 ) ).xyz;

    vec4 refracted = vec4( sea_base_color + diffuse( normal, lightdir, 80.0 ) * sea_water_color * 0.12, 1.0 ); 

    float fresnel = 1.0 - max(dot(normal,-view),0.0);
    fresnel = pow(fresnel,3.0) * 0.65;
    
    vec4 color = mix( refracted, ibl_specular, fresnel );

    float atten = max( 1.0 - dot( dist, dist ) * 0.001, 0.0 );

    color += vec4( sea_water_color * ( height_detailed( p * sea_scale ) ) * 0.18 * atten * sea_scale, 1.0 );
    
    color += vec4( get_specular( normal, lightdir, view, 60.0 ) );

    color = mix( color, vec4( 1.0, 1.0, 1.0, 1.0 ), foam( p.xz * sea_scale, p.y ) );

    fragColor = mix( vec4( 0.0, 0.0, 0.0, 0.0 ) // transparent - draw what's behind us (environment)
                      , color // ocean color
    	              , pow( smoothstep( 0.0, -0.05, view.y ), 0.3 ) );
}
