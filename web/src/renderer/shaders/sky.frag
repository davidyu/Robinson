#version 300 es

precision mediump float;
precision mediump sampler3D;

uniform vec4 cPosition_World;
uniform float uTime;
uniform sampler3D uPerlinNoise;

in vec3 vDirection;

const   vec3  sun_light_dir = normalize( vec3( 0.0, 1.0, 0.4 ) );
const   float sun_flare_size = 0.5;

const   float sky_saturation = 0.7;       // how blue should the sky be (if we look straight up)
const   float sky_horizon_offset = -0.3;  // between -1 and 1, moves horizon down if negative, moves horizon up if positive 

const   float cloudiness = 0.5;
const   float cloud_speed = 3.0;
const   float cloud_scale = 0.0015;

const   vec3  cloud_base_color = vec3( 0.3, 0.4, 0.5 );
const   vec3  cloud_top_color  = vec3( 1.0 );

out vec4 fragColor;

#define PI 3.14159
// Permutation polynomial (ring size 289 = 17*17)
// This is the lattice period defined in the original noise implementation, generally a square
#define NOISE_PERIOD 289.0
#define NOISE_1_DIV_PERIOD ( 1.0 / NOISE_PERIOD )
// not sure what the requirements of this number is
#define NOISE_SCALE 34.0

// Simplex noise implementation source:
// https://github.com/ashima/webgl-noise
vec3 mod_noise( vec3 x ) {
    return x - floor( x * NOISE_1_DIV_PERIOD ) * NOISE_PERIOD;
}

vec3 permute( vec3 x ) {
    return mod_noise( ( NOISE_SCALE * x + 1.0 ) * x );
}

vec4 mod_noise( vec4 x ) {
    return x - floor( x * NOISE_1_DIV_PERIOD ) * NOISE_PERIOD;
}

vec4 permute( vec4 x ) {
     return mod_noise( ( NOISE_SCALE * x + 1.0 ) * x );
}

vec4 taylorInvSqrt( vec4 r )
{
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
{
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod_noise(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;

  // Scaled so it's roughly between -1 and 1
  float density = 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  return ( density + 1.0 ) * 0.5; // transform to [ 0, 1 ]
}

// Worley noise implementation source:
// https://github.com/Erkaman/glsl-worley
// modified a touch; we only care about F1, so just return that in our 3D worley impl
vec3 dist( vec3 x, vec3 y, vec3 z ) {
    return ( x * x + y * y + z * z );
}

float worley(vec3 x) {
    #define CLOUD_SIZE 64
    return texture( uPerlinNoise, mod( x, vec3( CLOUD_SIZE ) ) / vec3( CLOUD_SIZE ) ).g;
}

float pnoise( vec3 x ) {
    #define CLOUD_SIZE 64
    return texture( uPerlinNoise, mod( x, vec3( CLOUD_SIZE ) ) / vec3( CLOUD_SIZE ) ).r;
}

float sample_cloud( vec3 x ) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3( 100 );
    const int NUM_OCTAVES = 4;
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += mix( 0.2, 0.4, cloudiness ) * a * pnoise( x );
        // modulate with Worley noise to produce billowy shapes
        v += mix( 0.2, 0.4, cloudiness ) * a * worley( x * 0.2 );
        x = x * 2.3 + shift;
        a *= 0.5;
	}

    // smoothstep parameter carefully tuned to look cloudlike
    return smoothstep( 0.15, 0.55, v );
}

vec3 sun( vec3 v ) {
    float sun_body = clamp( dot( v, sun_light_dir ), 0.0, 1.0 );
    return vec3( 1.6, 1.4, 1.0 ) * 0.47 * pow( sun_body, 350.0 )
         + vec3( 0.8, 0.9, 1.0 ) * 0.40 * pow( sun_body, ( 1.0 - sun_flare_size ) * 100.0 );
}

/*
 * Henyey-Greenstein phase function for scattering
 *
 * q: the cosine (dot product) between incident (light to cloud pos) and scattered (cloud to eye pos) ray
 *
 */ 
float hg( float q )
{
    float g = 0.5;
    float t1 = 1.0 / ( 4.0 * PI );
    float gsq = g * g;
    float num = 1.0 - gsq;
    float denom = pow( ( 1.0 + gsq - 2.0 * g * q ), 1.5 );

    return t1 * ( num / denom );
}

vec4 clouds( vec3 v )
{
    vec3 ofs = vec3( uTime * cloud_speed * 30.0, uTime * cloud_speed * 20.0, uTime * cloud_speed * 40.0 );
    vec4 acc = vec4( 0, 0, 0, 0 ); // this is the final color value we return

    // early exit if we're beneath a certain threshold
    // this doesn't seem to save any frames, though
    if ( dot( vec3( 0.0, 1.0, 0.0 ), v ) < 0.0 ) return acc;

    const int samples = 32;
    for ( int i = 0; i < samples; i++ ) {
        float d = ( float( i ) * 12.0 + 200.0 - cPosition_World.y ) / v.y;
        vec3 cloudPos = cloud_scale * ( cPosition_World.xyz + d * v + ofs );
        float cloud_sample = cloudiness * sample_cloud( cloudPos );

        vec3 cloud_color = mix( vec3( 1.0, 1.0, 1.0 ), cloud_base_color, cloud_sample );

        /*
         * Pseudo-physically-based light scattering
         * Beer's law: Energy = e^(-density)
         * Powdered sugar scattering approximation: Energy = 1.0 - e^-(2.0 * density)
         */

        float density = cloud_sample * 20.0; // density is fudged
        float T = 1.3 * exp( -density ) * ( 1.0 - exp( -2.0 * density ) ) * hg( dot( v, sun_light_dir ) );
        vec3 light_term = vec3( 1.0 ) * T;

        float alpha = ( 1.0 - acc.a ) * cloud_sample;
        acc += vec4( ( cloud_color + light_term ) * alpha, alpha );
    }

    acc.rgb /= acc.a + 0.0001;

    return acc;
}

void main() {
    // get the eye lookat vector
    vec3 eye = normalize( vDirection );

    // we only care about the range of values from sky_horizon_offset to 1.0
    float sky_h = clamp( eye.y, sky_horizon_offset, 1.0 );

    // transform from [sky_horizon_offset, 1.0] to [0, 1.0]
    sky_h = ( sky_h - sky_horizon_offset ) / ( 1.0 - sky_horizon_offset );

    // our blueness depends on how high up we are and how saturated the sky is
    // blueness should be between 0 and 1.0
    float blueness = min( sky_h * sky_saturation, 1.0 );

    // produce the sky color
    vec3 sky = vec3( pow( 1.0 - blueness, 2.0 )         // less red as we move up, quadratic
                   , 1.0 - blueness                     // less green as we move up, linear
                   , 0.6 + ( 1.0 - blueness ) * 0.4 );  // blue depends on how far up we are

    sky += sun( eye );
    vec4 cl = clouds( eye );

    float t = pow( 1.0 - 0.7 * vDirection.y, 15.0 ); // what is t?
    sky = mix( sky, cl.rgb, cl.a * ( 1.0 - t ) );

    fragColor = vec4( sky.r, sky.g, sky.b, 1.0 );
}
