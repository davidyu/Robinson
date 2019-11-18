float attenuate( float distance, float radius ) {
    distance = max( distance - radius, 0.0 );
    float d = distance / radius + 1.0;

    // attenuation cutoff to avoid unlimited light influence
    // see https://imdoingitwrong.wordpress.com/2011/01/31/light-attenuation/
    float unbounded = 1.0 / ( d * d );
    const float cutoff = 0.001;
    return max( ( unbounded - cutoff ) / ( 1.0 - cutoff ), 0.0 );
}

vec4 gamma_compress( vec4 linear ) {
    /* encode gamma - files are usually encoded in this gamma space
     * manual gamma correction before displaying a frame generally refers to
     * applying gamma compression to the frame because the monitor will
     * automatically applies gamma expansion before displaying it
     */
    const float screenGamma = 2.2;
    return pow( linear, vec4( 1.0 / screenGamma ) );
}

vec4 gamma_expand( vec4 c ) {
    // decode gamma - monitors apply this automatically
    const float screenGamma = 2.2;
    return pow( c, vec4( screenGamma ) );
}
