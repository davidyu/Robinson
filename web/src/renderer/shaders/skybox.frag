precision mediump float;

varying vec3 vDirection;

uniform samplerCube environment;
uniform bool        proceduralSky;

vec3 flipX( vec3 v ) {
    return vec3( -v.x, v.y, v.z );
}

float sun( vec3 v ) {
 	vec3 sun_pos = normalize( vec3( 1 ) );
    float sun_body = max( 0.0, dot( v, sun_pos ) );
    return 0.47 * pow( sun_body, 350.0 )
         + 0.4 * pow( sun_body, 2.0 );
}

void main() {
    if ( proceduralSky ) {
        // procedural sky
        vec3 eye = normalize( vDirection );
        eye.y = max( eye.y, 0.0 );

        vec3 sky = vec3( pow( 1.0 - eye.y, 2.0 )        // red...meh
                       , 1.0 - eye.y                    // green...meh
                       , 0.6 + ( 1.0 - eye.y ) * 0.4 ); // blue depends on how far up we are

        sky += vec3( 1.0 ) * sun( eye );

        gl_FragColor = vec4( sky.r, sky.g, sky.b, 1.0 );
    } else {
        gl_FragColor = textureCube( environment, vDirection );
    }
}
