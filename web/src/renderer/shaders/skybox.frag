precision mediump float;

varying vec3 vDirection;

uniform samplerCube environment;
uniform bool        proceduralSky;

vec3 flipX( vec3 v ) {
    return vec3( -v.x, v.y, v.z );
}

void main() {
    if ( proceduralSky ) {
        // procedural sky
        vec3 eye = normalize( vDirection );
        eye.y = max( eye.y, 0.0 );
        gl_FragColor = vec4( pow( 1.0 - eye.y, 2.0 )        // red...meh
                           , 1.0 - eye.y                    // green...meh
                           , 0.6 + ( 1.0 - eye.y ) * 0.4    // blue depends on how far up we are
                           , 1.0 );
    } else {
        gl_FragColor = textureCube( environment, vDirection );
    }
}
