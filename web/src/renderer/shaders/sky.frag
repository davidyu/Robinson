precision mediump float;

uniform vec4 cPosition_World;
uniform float uTime;
varying vec3 vDirection;

const   float sun_size = sqrt( 1.0 / 3.0 );  // radius of sun sphere
const   float sun_flare_size = 0.5;

const   float sky_saturation = 0.5;       // how blue should the sky be (if we look straight up)
const   float sky_horizon_offset = -0.3;  // between -1 and 1, moves horizon down if negative, moves horizon up if positive 

const   float cloudiness = 0.2;

// noise functions by Inigo Quilez
float hash(float n) { return fract(sin(n) * 1e4); }

float noise(vec3 x) {
    const vec3 step = vec3(110, 241, 171);

    vec3 i = mod( floor(x), vec3( 5 ) * step );
    vec3 f = fract(x);
 
    float n = dot(i, step);

    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

float fbm( vec3 x ) {
	float v = 0.0;
	float a = 0.5;
	vec3 shift = vec3( 100 );
    const int NUM_OCTAVES = 5;
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise( x );
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

vec3 sun( vec3 v ) {
    float sun_body = clamp( dot( v, vec3( sun_size ) ), 0.0, 1.0 );
    return vec3( 1.6, 1.4, 1.0 ) * 0.47 * pow( sun_body, 350.0 )
         + vec3( 0.8, 0.9, 1.0 ) * 0.40 * pow( sun_body, ( 1.0 - sun_flare_size ) * 100.0 );
}

vec4 clouds( vec3 v )
{
    vec2 ofs = vec2( uTime * 80.0, uTime * 60.0 );
    vec4 acc = vec4( 0, 0, 0, 0 );

    const int layers = int( float( 100 ) * cloudiness );
    for ( int i = 0; i < layers; i++ ) {
        float height = ( float( i ) * 12.0 + 350.0 - cPosition_World.y ) / v.y;
        vec3 cloudPos = cPosition_World.xyz + height*v + vec3( 831.0, 321.0 + float( i ) * 0.15 - 0.2*ofs.x, 1330.0 + 0.3*ofs.y );
        float density = cloudiness * smoothstep( 0.5, 1.0, fbm( cloudPos * 0.0015 ) );
        vec3  color = mix( vec3( 1.1, 1.05, 1.0 ), vec3( 0.3, 0.3, 0.2 ), density );

        density = ( 1.0 - acc.w ) * density;
        acc += vec4( color * density, density );
    }

    acc.rgb /= acc.w + 0.0001;
    float alpha = smoothstep( 0.7, 1.0, acc.w );

    acc.rgb -= 0.6 * vec3( 0.8, 0.75, 0.7 ) * alpha * pow( vec3( sun_size ), vec3( 13.0 ) );
    acc.rgb += 0.2 * vec3( 1.3, 1.2, 1.0 ) * ( 1.0 - alpha ) * pow( vec3( sun_size ), vec3( 5.0 ) );

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

    // for everything else, for now, we only care about everything at eye level and above
    eye.y = clamp( eye.y, 0.0, 1.0 );

    sky += sun( eye );
    vec4 cl = clouds( eye );

    float t = pow( 1.0 - 0.7 * vDirection.y, 15.0 ); // what is t?
    sky = mix( sky, cl.rgb, cl.a * ( 1.0 - t ) );

    gl_FragColor = vec4( sky.r, sky.g, sky.b, 1.0 );
}
