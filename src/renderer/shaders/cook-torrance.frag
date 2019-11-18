#version 300 es

precision mediump float;

// utils.inc forward decls
float attenuate( float distance, float radius );
vec4 gamma_compress( vec4 linear );
vec4 gamma_expand( vec4 c );
// end utils.inc forward decls

// fs in/vs out
in mediump vec4 vPosition;        // vertex position in view space, no need to convert
in mediump vec3 vNormal;          // normal vector in model space, need to convert here

struct Light {
    vec4 position;
    vec4 color;
    bool enabled;
    float radius;
};

uniform Light lights[10];

uniform mediump vec4 cPosition_World;  // camera in world space

uniform highp mat4 uMMatrix;           // model matrix -> trasnforms to world space
uniform highp mat4 uMVMatrix;          // model view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat3 uNormalVMatrix;     // inverse transpose of view matrix
uniform highp mat3 uNormalMVMatrix;    // inverse transpose of model view matrix
uniform highp mat3 uInverseViewMatrix; // inverse of view matrix

uniform samplerCube environment;
uniform samplerCube irradiance;

uniform float environmentMipMaps;

// material properties
struct Material {
    vec4 diffuse;
    vec4 specular;
    float roughness;
    float fresnel; // fresnel at normal incidence
};

uniform Material mat;

out vec4 fragColor;

void main( void ) {
    mediump vec4 color = vec4( 0, 0, 0, 1 );
    mediump vec3 view = normalize( -( vPosition.xyz / vPosition.w ) );
    mediump vec3 normal = normalize( vNormal );
    mediump vec3 reflected = uInverseViewMatrix * ( -reflect( view, normal ) );
    float rsq = mat.roughness * mat.roughness;

    for ( int i = 0; i < 10; i++ ) {
        if ( !lights[i].enabled ) continue;

        Light light = lights[i];

        vec3 lightdir;
        // directional lights have 0 in w
        if ( light.position.w == 0.0 ) lightdir = normalize( light.position.xyz );
        else                           lightdir = normalize( light.position.xyz / light.position.w - vPosition.xyz );

        vec3 halfv = normalize( view + lightdir );

        float HdotN = dot( halfv, normal );
        float VdotN = dot( view, normal );
        float LdotN = dot( lightdir, normal );
        float VdotH = dot( view, halfv );

        float geo = min( 1.0, min( ( 2.0 * HdotN * VdotN ) / VdotH, ( 2.0 * HdotN * LdotN ) / VdotH ) );

        float HdotN2 = HdotN * HdotN;
        float rough = ( 1.0 / ( 4.0 * rsq * pow( HdotN, 4.0 ) ) ) * exp( ( HdotN2 - 1.0 )  / ( rsq * HdotN2 ) );

        float fresnel = pow( 1.0 - VdotH, 5.0 ) * ( 1.0 - mat.fresnel ) + mat.fresnel;
        float specular = ( fresnel * geo * rough ) / ( VdotN * LdotN );

        float attenuation = attenuate( length( light.position.xyz / light.position.w - vPosition.xyz ), light.radius );
        color += ( ( mat.specular * specular ) + mat.diffuse ) * attenuation * light.color * max( LdotN, 0.0 );
    }

    vec4 ibl_diffuse = gamma_expand( texture( irradiance, reflected ) ) * mat.diffuse;

    float lod = mat.roughness * environmentMipMaps;
    vec4 ibl_specular = gamma_expand( textureLod( environment, reflected, lod ) ) * mat.specular;

    color += ibl_diffuse * mat.roughness + ibl_specular * ( 1.0 - mat.roughness );

    fragColor = gamma_compress( color );
}
