precision mediump float;

// fs in/vs out
varying mediump vec4 vPosition;  // vertex position in view space, no need to convert
varying mediump vec3 vNormal;    // normal vector in model space, need to convert here

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
uniform highp mat3 uInverseViewMatrix;

// material properties
struct Material {
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec4 emissive;
    float shininess;
};

uniform Material mat;

uniform samplerCube environment;
uniform samplerCube irradiance;

void main( void ) {
    mediump vec4 color = mat.ambient + mat.emissive;
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

        // specular term
        // the half vector is exactly between the view vector and the light direction vector
        vec3 halfv = normalize( view + lightdir );

        float specular = pow( max( dot( normal, halfv ), 0.0 ), mat.shininess );
        color += attenuation * mat.specular * light.color * specular;
    }

    vec4 ibl_diffuse = engamma( textureCube( irradiance, reflected ) ) * mat.diffuse;
    vec4 ibl_specular = engamma( textureCube( environment, reflected ) ) * mat.specular;

    color += ibl_diffuse + ibl_specular;

    gl_FragColor = degamma( color );
}
