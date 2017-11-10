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
        vDirection = normalize( vDirection );
        vDirection.y = max( vDirection.y, 0 );
        gl_FragColor = vec3( pow( 1 - vDirection.y, 2 )            // blue...meh
                           , 1 - vDirection.y                      // green...meh
                           , 0.6 + ( 1.0 - vDirection.y ) * 0.4 ); // blue depends on how far up we are
    } else {
        gl_FragColor = textureCube( environment, vDirection );
    }
}
