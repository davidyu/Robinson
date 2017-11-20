precision mediump float;

uniform vec3 cPosition_World;
varying vec3 vDirection;
const   vec3 unit = normalize( vec3( 1 ) ); // radius of unit sphere, representing the sun
const  float vTime = 1.0;

// noise functions from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float mod289( float x ) { return x - floor( x * ( 1.0 / 289.0 ) ) * 289.0; }
vec4  mod289( vec4  x ) { return x - floor( x * ( 1.0 / 289.0 ) ) * 289.0; }
vec4  perm  ( vec4  x ) { return mod289( ( ( x * 34.0 ) + 1.0 ) * x ); }

float noise( vec3 v ) {
    vec3 a = floor( v );
    vec3 d = v - a;
    d = d * d * ( 3.0 - 2.0 * d );

    vec4 b = a.xxyy + vec4( 0.0, 1.0, 0.0, 1.0 );
    vec4 k1 = perm( b.xyxy );
    vec4 k2 = perm( k1.xyxy + b.zzww );

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm( c );
    vec4 k4 = perm( c + 1.0 );

    vec4 o1 = fract( k3 * ( 1.0 / 41.0 ) );
    vec4 o2 = fract( k4 * ( 1.0 / 41.0 ) );

    vec4 o3 = o2 * d.z + o1 * ( 1.0 - d.z );
    vec2 o4 = o3.yw * d.x + o3.xz * ( 1.0 - d.x );

    return o4.y * d.y + o4.x * ( 1.0 - d.y );
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
    float sun_body = clamp( dot( v, unit ), 0.0, 1.0 );
    return vec3( 1.6, 1.4, 1.0 ) * 0.47 * pow( sun_body, 350.0 )
         + vec3( 0.8, 0.9, 1.0 ) * 0.40 * pow( sun_body, 2.0 );
}

vec4 clouds( vec3 v )
{
    vec2 pos = vec2( vTime * 80.0, vTime * 60.0 );
    vec4 acc = vec4( 0, 0, 0, 0 );

    const int layers = 100;
    for ( int i = 0; i < layers; i++ ) {
        float height = ( float( i ) * 12.0 + 350.0 - cPosition_World.y ) / v.y;
    }

    return acc;
}

void main() {
    // procedural sky
    vec3 eye = normalize( vDirection );
    eye.y = max( eye.y, 0.0 );

    vec3 sky = vec3( pow( 1.0 - eye.y, 2.0 )        // red...meh
                   , 1.0 - eye.y                    // green...meh
                   , 0.6 + ( 1.0 - eye.y ) * 0.4 ); // blue depends on how far up we are

    sky += sun( eye );

    vec4 cl = clouds( eye );
    sky = mix( sky, cl.rgb, cl.a * ( 1.0 - eye.y ) );

    gl_FragColor = vec4( sky.r, sky.g, sky.b, 1.0 );
}
