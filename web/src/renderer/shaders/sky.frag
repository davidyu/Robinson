#version 300 es

precision mediump float;
precision mediump sampler3D;

uniform vec4 cPosition_World;
uniform float uTime;
uniform sampler3D uPerlinNoise;
uniform sampler3D uWorleyNoise;
uniform float uCloudiness;
uniform float uCloudSpeed;

in vec3 vDirection;

const   vec3  sun_light_dir = normalize( vec3( 0.0, 1.0, 0.4 ) );
const   float sun_flare_size = 0.5;

const   float sky_saturation = 0.7;       // how blue should the sky be (if we look straight up)
const   float sky_horizon_offset = -0.3;  // between -1 and 1, moves horizon down if negative, moves horizon up if positive 

const   float cloud_scale = 0.0015;

const   vec3  cloud_base_color = vec3( 0.3, 0.4, 0.5 );
const   vec3  cloud_top_color  = vec3( 1.0 );

out vec4 fragColor;

#define PI 3.14159

#define WORLEY_SAMPLE_MAX 12.0
float worley(vec3 x) {
    return texture( uWorleyNoise, fract( x / vec3( WORLEY_SAMPLE_MAX ) ) ).r;
}

#define PERLIN_SAMPLE_MAX 128
float pnoise( vec3 x ) {
    return texture( uPerlinNoise, fract( x / vec3( PERLIN_SAMPLE_MAX ) ) ).r;
}

float sample_cloud( vec3 x ) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3( 100 );
    const int NUM_OCTAVES = 4;
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += mix( 0.2, 0.4, uCloudiness ) * a * worley( x ); // macro, billow-y shapes
        v += mix( 0.2, 0.4, uCloudiness ) * a * pnoise( x ); // add wispiness
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
    vec3 ofs = vec3( uTime * uCloudSpeed * 30.0, uTime * uCloudSpeed * 20.0, uTime * uCloudSpeed * 40.0 );
    vec4 acc = vec4( 0, 0, 0, 0 ); // this is the final color value we return

    // early exit if we're beneath a certain threshold
    // this doesn't seem to save any frames, though
    if ( dot( vec3( 0.0, 1.0, 0.0 ), v ) < 0.0 ) return acc;

    const int samples = 32;
    for ( int i = 0; i < samples; i++ ) {
        float d = ( float( i ) * 12.0 + 200.0 - cPosition_World.y ) / v.y;
        vec3 cloudPos = cloud_scale * ( cPosition_World.xyz + d * v + ofs );
        float cloud_sample = uCloudiness * sample_cloud( cloudPos );

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

vec3 desaturate( vec3 color, float desaturation ) {
    float intensity = dot( vec3( 0.3, 0.59, 0.11 ), color );
    color = mix( vec3( intensity ), color, 1.0 - desaturation );
    return color;
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

    sky = desaturate( sky, 0.5 * uCloudiness * uCloudiness ); // desaturate with cloudiness
    sky *= ( 1.0 - 0.5 * uCloudiness * uCloudiness ); // darken with cloudiness

    sky += sun( eye );
    vec4 cl = clouds( eye );

    float t = pow( 1.0 - 0.7 * vDirection.y, 15.0 ); // what is t?
    sky = mix( sky, cl.rgb, cl.a * ( 1.0 - t ) );

    fragColor = vec4( sky.r, sky.g, sky.b, 1.0 );
}
