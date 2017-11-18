precision mediump float;

varying vec3 vDirection;

uniform samplerCube environment;
uniform bool        proceduralSky;

vec3 flipX( vec3 v ) {
    return vec3( -v.x, v.y, v.z );
}

vec3 sun( vec3 v ) {
 	vec3 sun_pos = normalize( vec3( 1 ) );
    float sun_body = clamp( dot( v, sun_pos ), 0.0, 1.0 );
    return vec3( 1.6, 1.4, 1.0 ) * 0.47 * pow( sun_body, 350.0 )
         + vec3( 0.8, 0.9, 1.0 ) * 0.40 * pow( sun_body, 2.0 );
}

void main() {
    if ( proceduralSky ) {
        // procedural sky
        vec3 eye = normalize( vDirection );
        eye.y = max( eye.y, 0.0 );

        vec3 sky = vec3( pow( 1.0 - eye.y, 2.0 )        // red...meh
                       , 1.0 - eye.y                    // green...meh
                       , 0.4 + ( 1.0 - eye.y ) * 0.4 ); // blue depends on how far up we are

        sky += sun( eye );

        gl_FragColor = vec4( sky.r, sky.g, sky.b, 1.0 );
    } else {
        gl_FragColor = textureCube( environment, vDirection );
    }
}
