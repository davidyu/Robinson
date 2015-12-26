precision mediump float;

float attenuate( float distance, float radius ) {
    distance = max( distance - radius, 0.0 );
    float d = distance / radius + 1.0;
    return 1.0 / ( d * d );
}

vec4 degamma( vec4 linear ) {
    const float screenGamma = 2.2;
    return pow( linear, vec4( 1.0 / screenGamma ) );
}

