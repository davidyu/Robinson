precision mediump float;

// fs in/vs out
varying mediump vec4 vPosition;  // vertex position in view space, no need to convert
varying mediump vec3 vNormal;    // normal vector in model space, need to convert here

struct Light {
    vec4 position;
    vec4 color;
    bool enabled;
};

uniform Light lights[10];

uniform highp mat4 uMVMatrix;     // model view matrix
uniform highp mat4 uPMatrix;      // projection matrix
uniform highp mat3 uNormalMatrix; // inverse model view matrix

// material properties
struct Material {
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    vec4 emissive;
    float shininess;
};

uniform Material mat;

void main( void ) {
    mediump vec4 color = mat.ambient + mat.emissive;
    mediump vec3 eye = normalize( -( vPosition.xyz / vPosition.w ) );
    mediump vec3 normal = normalize( uNormalMatrix * vNormal );

    for ( int i = 0; i < 10; i++ ) {
        if ( !lights[i].enabled ) continue;

        Light light = lights[i];

        vec3 lightdir;
        // directional lights have 0 in w
        if ( light.position.w == 0.0 ) lightdir = normalize( light.position.xyz );
        else                           lightdir = normalize( light.position.xyz / light.position.w - vPosition.xyz );

        // diffuse term
        color += mat.diffuse * light.color * max( dot( normal, lightdir ), 0.0 );

        // specular term
        // the half vector is exactly between the eye vector and the light direction vector
        vec3 halfv = normalize( eye + lightdir );
        color += mat.specular * light.color * pow( max( dot( normal, halfv ), 0.0 ), mat.shininess );
    }

    gl_FragColor = color;
}
