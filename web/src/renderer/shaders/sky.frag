precision mediump float;

uniform vec4 cPosition_World;
uniform float uTime;
varying vec3 vDirection;

const   vec3  sun_light_dir = normalize( vec3( 0.0, 1.0, 0.4 ) );
const   float sun_flare_size = 0.5;

const   float sky_saturation = 0.7;       // how blue should the sky be (if we look straight up)
const   float sky_horizon_offset = -0.3;  // between -1 and 1, moves horizon down if negative, moves horizon up if positive 

const   float cloudiness = 0.4;
const   float cloud_speed = 1.0;

const   vec3  cloud_base_color = vec3( 0.2, 0.3, 0.5 );

// noise functions by Inigo Quilez
float hash(float n) { return fract(sin(n) * 1e4); }

float noise(vec3 x) {
    const vec3 step = vec3(110, 241, 171);

    vec3 i = floor(x);
    vec3 f = fract(x);
 
    float n = dot(i, step);

    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

// Worley noise implementation source:
// https://github.com/Erkaman/glsl-worley
// modified a touch; we only care about F1, so just return that in our 3D worley impl

vec3 permute( vec3 x ) {
    return mod( ( 34.0 * x + 1.0 ) * x, 289.0 );
}

vec3 dist( vec3 x, vec3 y, vec3 z ) {
    return ( x * x + y * y + z * z );
}

float worley(vec3 P, float jitter) {
    float K = 0.142857142857; // 1/7
    float Ko = 0.428571428571; // 1/2-K/2
    float  K2 = 0.020408163265306; // 1/(7*7)
    float Kz = 0.166666666667; // 1/6
    float Kzo = 0.416666666667; // 1/2-1/6*2

	vec3 Pi = mod(floor(P), 289.0);
 	vec3 Pf = fract(P) - 0.5;

	vec3 Pfx = Pf.x + vec3(1.0, 0.0, -1.0);
	vec3 Pfy = Pf.y + vec3(1.0, 0.0, -1.0);
	vec3 Pfz = Pf.z + vec3(1.0, 0.0, -1.0);

	vec3 p = permute(Pi.x + vec3(-1.0, 0.0, 1.0));
	vec3 p1 = permute(p + Pi.y - 1.0);
	vec3 p2 = permute(p + Pi.y);
	vec3 p3 = permute(p + Pi.y + 1.0);

	vec3 p11 = permute(p1 + Pi.z - 1.0);
	vec3 p12 = permute(p1 + Pi.z);
	vec3 p13 = permute(p1 + Pi.z + 1.0);

	vec3 p21 = permute(p2 + Pi.z - 1.0);
	vec3 p22 = permute(p2 + Pi.z);
	vec3 p23 = permute(p2 + Pi.z + 1.0);

	vec3 p31 = permute(p3 + Pi.z - 1.0);
	vec3 p32 = permute(p3 + Pi.z);
	vec3 p33 = permute(p3 + Pi.z + 1.0);

	vec3 ox11 = fract(p11*K) - Ko;
	vec3 oy11 = mod(floor(p11*K), 7.0)*K - Ko;
	vec3 oz11 = floor(p11*K2)*Kz - Kzo; // p11 < 289 guaranteed

	vec3 ox12 = fract(p12*K) - Ko;
	vec3 oy12 = mod(floor(p12*K), 7.0)*K - Ko;
	vec3 oz12 = floor(p12*K2)*Kz - Kzo;

	vec3 ox13 = fract(p13*K) - Ko;
	vec3 oy13 = mod(floor(p13*K), 7.0)*K - Ko;
	vec3 oz13 = floor(p13*K2)*Kz - Kzo;

	vec3 ox21 = fract(p21*K) - Ko;
	vec3 oy21 = mod(floor(p21*K), 7.0)*K - Ko;
	vec3 oz21 = floor(p21*K2)*Kz - Kzo;

	vec3 ox22 = fract(p22*K) - Ko;
	vec3 oy22 = mod(floor(p22*K), 7.0)*K - Ko;
	vec3 oz22 = floor(p22*K2)*Kz - Kzo;

	vec3 ox23 = fract(p23*K) - Ko;
	vec3 oy23 = mod(floor(p23*K), 7.0)*K - Ko;
	vec3 oz23 = floor(p23*K2)*Kz - Kzo;

	vec3 ox31 = fract(p31*K) - Ko;
	vec3 oy31 = mod(floor(p31*K), 7.0)*K - Ko;
	vec3 oz31 = floor(p31*K2)*Kz - Kzo;

	vec3 ox32 = fract(p32*K) - Ko;
	vec3 oy32 = mod(floor(p32*K), 7.0)*K - Ko;
	vec3 oz32 = floor(p32*K2)*Kz - Kzo;

	vec3 ox33 = fract(p33*K) - Ko;
	vec3 oy33 = mod(floor(p33*K), 7.0)*K - Ko;
	vec3 oz33 = floor(p33*K2)*Kz - Kzo;

	vec3 dx11 = Pfx + jitter*ox11;
	vec3 dy11 = Pfy.x + jitter*oy11;
	vec3 dz11 = Pfz.x + jitter*oz11;

	vec3 dx12 = Pfx + jitter*ox12;
	vec3 dy12 = Pfy.x + jitter*oy12;
	vec3 dz12 = Pfz.y + jitter*oz12;

	vec3 dx13 = Pfx + jitter*ox13;
	vec3 dy13 = Pfy.x + jitter*oy13;
	vec3 dz13 = Pfz.z + jitter*oz13;

	vec3 dx21 = Pfx + jitter*ox21;
	vec3 dy21 = Pfy.y + jitter*oy21;
	vec3 dz21 = Pfz.x + jitter*oz21;

	vec3 dx22 = Pfx + jitter*ox22;
	vec3 dy22 = Pfy.y + jitter*oy22;
	vec3 dz22 = Pfz.y + jitter*oz22;

	vec3 dx23 = Pfx + jitter*ox23;
	vec3 dy23 = Pfy.y + jitter*oy23;
	vec3 dz23 = Pfz.z + jitter*oz23;

	vec3 dx31 = Pfx + jitter*ox31;
	vec3 dy31 = Pfy.z + jitter*oy31;
	vec3 dz31 = Pfz.x + jitter*oz31;

	vec3 dx32 = Pfx + jitter*ox32;
	vec3 dy32 = Pfy.z + jitter*oy32;
	vec3 dz32 = Pfz.y + jitter*oz32;

	vec3 dx33 = Pfx + jitter*ox33;
	vec3 dy33 = Pfy.z + jitter*oy33;
	vec3 dz33 = Pfz.z + jitter*oz33;

	vec3 d11 = dist( dx11, dy11, dz11 );
	vec3 d12 = dist( dx12, dy12, dz12 );
	vec3 d13 = dist( dx13, dy13, dz13 );
	vec3 d21 = dist( dx21, dy21, dz21 );
	vec3 d22 = dist( dx22, dy22, dz22 );
	vec3 d23 = dist( dx23, dy23, dz23 );
	vec3 d31 = dist( dx31, dy31, dz31 );
	vec3 d32 = dist( dx32, dy32, dz32 );
	vec3 d33 = dist( dx33, dy33, dz33 );

	vec3 d1a = min( d11, d12 );

	d12 = max( d11, d12 );
	d11 = min( d1a, d13 ); // Smallest now not in d12 or d13
	d13 = max( d1a, d13 );
	d12 = min( d12, d13 ); // 2nd smallest now not in d13

	vec3 d2a = min( d21, d22 );

	d22 = max( d21, d22 );
	d21 = min( d2a, d23 ); // Smallest now not in d22 or d23
	d23 = max( d2a, d23 );
	d22 = min( d22, d23 ); // 2nd smallest now not in d23

	vec3 d3a = min( d31, d32 );

	d32 = max( d31, d32 );
	d31 = min( d3a, d33 ); // Smallest now not in d32 or d33
	d33 = max( d3a, d33 );
	d32 = min( d32, d33 ); // 2nd smallest now not in d33

	vec3 da = min( d11, d21 );

	d21 = max( d11, d21 );
	d11 = min( da, d31 ); // Smallest now in d11
	d31 = max( da, d31 ); // 2nd smallest now not in d31
	d11.xy = ( d11.x < d11.y ) ? d11.xy : d11.yx;
	d11.xz = ( d11.x < d11.z ) ? d11.xz : d11.zx; // d11.x now smallest

	return sqrt( d11.x );
}

float fbm( vec3 x ) {
	float v = 0.0;
	float a = 0.5;
	vec3 shift = vec3( 100 );
    const int NUM_OCTAVES = 5;
	for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += mix( 0.45, 0.7, cloudiness ) * a * noise( x );
        // modulate with Worley noise to produce billowy shapes
        v += mix( 0.3, 0.5, cloudiness ) * a * ( 1.0 - worley( x * 1.0, 1.0 ) );
        x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

vec3 sun( vec3 v ) {
    float sun_body = clamp( dot( v, sun_light_dir ), 0.0, 1.0 );
    return vec3( 1.6, 1.4, 1.0 ) * 0.47 * pow( sun_body, 350.0 )
         + vec3( 0.8, 0.9, 1.0 ) * 0.40 * pow( sun_body, ( 1.0 - sun_flare_size ) * 100.0 );
}

vec4 clouds( vec3 v )
{
    vec2 ofs = vec2( uTime * cloud_speed * 80.0, uTime * cloud_speed * 60.0 );
    vec4 acc = vec4( 0, 0, 0, 0 );

    // early exit if we're beneath a certain threshold
    // this doesn't seem to save any frames, though
    if ( dot( vec3( 0.0, 1.0, 0.0 ), v ) < 0.0 ) return acc;

    const int layers = 50;
    for ( int i = 0; i < layers; i++ ) {
        float height = ( float( i ) * 12.0 + 200.0 - cPosition_World.y ) / v.y;
        vec3 cloudPos = cPosition_World.xyz + height*v + vec3( 831.0, 321.0 + float( i ) * 0.15 - 0.2*ofs.x, 1330.0 + 0.3*ofs.y );
        float density = cloudiness * smoothstep( 0.5, 1.0, fbm( cloudPos * 0.0015 ) );
        vec3  color = mix( vec3( 1.1, 1.05, 1.0 ), cloud_base_color, density );

        density = ( 1.0 - acc.w ) * density;
        acc += vec4( color * density, density );
    }

    acc.rgb /= acc.w + 0.0001;
    float alpha = smoothstep( 0.7, 1.0, acc.w );

    acc.rgb -= 0.6 * vec3( 0.8, 0.75, 0.7 ) * alpha * pow( normalize( vec3( 1.0 ) ), vec3( 13.0 ) );
    acc.rgb += 0.2 * vec3( 1.3, 1.2, 1.0 ) * ( 1.0 - alpha ) * pow( normalize( vec3( 1.0 ) ), vec3( 5.0 ) );

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
