precision mediump float;

// we assume all input colors have no built-in gamma correction, and apply gamma
// correction at the very end in this fragment shader

const float screenGamma = 2.2;

// fs in/vs out
varying mediump vec4 vPosition;  // vertex position in view space, no need to convert
varying mediump vec3 vNormal;    // normal vector in model space, need to convert here

struct Light {
    vec4 position;
    vec4 color;
    bool enabled;
};

uniform Light lights[10];

uniform highp mat4 uMMatrix;           // model matrix -> trasnforms to world space
uniform highp mat4 uMVMatrix;          // model view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat3 uNormalMVMatrix;    // inverse model view matrix
uniform highp mat3 uNormalWorldMatrix; // inverse model matrix

// material properties
struct Material {
    vec4 diffuse;
    vec4 specular;
    float roughness;
    float fresnel; // fresnel at normal incidence
};

uniform Material mat;

void main( void ) {
    mediump vec4 color = vec4( 0, 0, 0, 1 );
    mediump vec3 view = normalize( -( vPosition.xyz / vPosition.w ) );
    mediump vec3 normal = normalize( vNormal );

    for ( int i = 0; i < 10; i++ ) {
        if ( !lights[i].enabled ) continue;

        Light light = lights[i];

        vec3 lightdir;
        // directional lights have 0 in w
        if ( light.position.w == 0.0 ) lightdir = normalize( light.position.xyz );
        else                           lightdir = normalize( light.position.xyz / light.position.w - vPosition.xyz );

        float VdotN = dot( view, normal );
        float LdotN = dot( lightdir, normal );

        float gamma = dot( view - normal * VdotN
                         , lightdir - normal * LdotN );

        float rsq = mat.roughness * mat.roughness;

        float A = 1.0 - 0.5 * ( rsq / ( rsq + 0.57 ) );
        float B = 0.45 * ( rsq / ( rsq + 0.09 ) );

        float term1 = acos( VdotN );
        float term2 = acos( LdotN );

        float alpha = max( term1, term2 );
        float beta = min( term1, term2 );

        float C = sin( alpha ) * tan( beta );

        color += mat.diffuse * light.color * max( LdotN, 0.0 ) * ( A + B * max( 0.0, gamma ) * C );
    }

    gl_FragColor = pow( color, vec4( 1.0 / screenGamma ) );
}
