#extension GL_EXT_shader_texture_lod : enable

precision mediump float;

float attenuate( float distance, float radius ) {
    distance = max( distance - radius, 0.0 );
    float d = distance / radius + 1.0;

    // attenuation cutoff to avoid unlimited light influence
    // see https://imdoingitwrong.wordpress.com/2011/01/31/light-attenuation/
    float unbounded = 1.0 / ( d * d );
    const float cutoff = 0.001;
    return max( ( unbounded - cutoff ) / ( 1.0 - cutoff ), 0.0 );
}

vec4 degamma( vec4 linear ) {
    const float screenGamma = 2.2;
    return pow( linear, vec4( 1.0 / screenGamma ) );
}

vec4 engamma( vec4 c ) {
    const float screenGamma = 2.2;
    return pow( c, vec4( screenGamma ) );
}

