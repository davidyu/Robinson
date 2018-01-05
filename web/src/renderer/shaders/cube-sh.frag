#version 300 es

precision mediump float;

in mediump vec2 vTexCoord;
uniform samplerCube environment;

out vec4 fragColor;

void main( void ) {
    if ( vTexCoord.x >= 7.0 / 8.0 ) {
        fragColor = vec4( 1, 0, 0, 1 );
    } else if ( vTexCoord.x >= 6.0 / 8.0 ) {
        fragColor = vec4( 0, 1, 0, 1 );
    } else if ( vTexCoord.x >= 5.0 / 8.0 ) {
        fragColor = vec4( 0, 0, 1, 1 );
    } else if ( vTexCoord.x >= 4.0 / 8.0 ) {
        fragColor = vec4( 0, 0, 0, 1 );
    } else if ( vTexCoord.x >= 3.0 / 8.0 ) {
        fragColor = vec4( 1, 1, 1, 1 );
    } else if ( vTexCoord.x >= 2.0 / 8.0 ) {
        fragColor = vec4( 1, 1, 0, 1 );
    } else if ( vTexCoord.x >= 1.0 / 8.0 ) {
        fragColor = vec4( 0, 1, 1, 1 );
    } else if ( vTexCoord.x >= 0.0 / 8.0 ) {
        fragColor = vec4( 1, 0, 1, 1 );
    }
}
