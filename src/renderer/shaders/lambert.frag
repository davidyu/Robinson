precision mediump float;

// we assume all input colors have no built-in gamma correction, and apply gamma
// correction at the very end in this fragment shader

// fs in/vs out
in mediump vec4 vPosition;  // vertex position in view space, no need to convert
in mediump vec3 vNormal;    // normal vector in model space, need to convert here

struct Light {
    vec4 position;
    vec4 color;
    bool enabled;
    float radius;
};

uniform Light lights[10];

uniform highp mat4 uMMatrix;           // model matrix -> trasnforms to world space
uniform highp mat4 uMVMatrix;          // model view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat3 uNormalMVMatrix;    // inverse model view matrix
uniform highp mat3 uNormalWorldMatrix; // inverse model matrix
uniform highp mat3 uInverseViewMatrix; // inverse of view matrix

// material properties
struct Material {
    vec4 diffuse;
};

uniform Material mat;

uniform samplerCube irradiance;

out vec4 fragColor;

void main( void ) {
    mediump vec4 color = vec4( 0, 0, 0, 1 );
    mediump vec3 view = normalize( -( vPosition.xyz / vPosition.w ) );
    mediump vec3 normal = normalize( vNormal );
    mediump vec3 reflected = uInverseViewMatrix * ( -reflect( view, normal ) );

    for ( int i = 0; i < 10; i++ ) {
        if ( !lights[i].enabled ) continue;

        Light light = lights[i];

        vec3 lightdir;
        // directional lights have 0 in w
        if ( light.position.w == 0.0 ) lightdir = normalize( light.position.xyz );
        else                           lightdir = normalize( light.position.xyz / light.position.w - vPosition.xyz );

        float attenuation = attenuate( length( light.position.xyz / light.position.w - vPosition.xyz ), light.radius );

        // diffuse term
        color += attenuation * mat.diffuse * light.color * max( dot( normal, lightdir ), 0.0 );
    }

    vec4 ibl_diffuse = engamma( texture( irradiance, reflected ) ) * mat.diffuse;
    color += ibl_diffuse;

    fragColor = degamma( color );
}
