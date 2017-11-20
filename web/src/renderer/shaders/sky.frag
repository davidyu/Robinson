precision mediump float;

varying vec3 vDirection;
const   vec3 sunPos = vec3( 1, 1, 1 );
const  float vTime = 1.0;

vec3 sun( vec3 v ) {
    float sun_body = clamp( dot( v, sunPos ), 0.0, 1.0 );
    return vec3( 1.6, 1.4, 1.0 ) * 0.47 * pow( sun_body, 350.0 )
         + vec3( 0.8, 0.9, 1.0 ) * 0.40 * pow( sun_body, 2.0 );
}

vec4 clouds( vec3 v )
{
    vec2 pos = vec2( vTime * 80.0, vTime * 60.0 );
    vec4 acc = vec4( 0, 0, 0, 0 );

    const int layers = 100;
    for ( int i = 0; i < layers; i++ ) {
        float height = ( float( i ) * 12.0 + 350.0 - v.y );
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
