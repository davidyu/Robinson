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
    float radius;
};

uniform Light lights[10];

uniform highp mat4 uMMatrix;           // model matrix -> trasnforms to world space
uniform highp mat4 uMVMatrix;          // model view matrix
uniform highp mat4 uPMatrix;           // projection matrix
uniform highp mat3 uNormalMVMatrix;    // inverse model view matrix
uniform highp mat3 uNormalWorldMatrix; // inverse model matrix

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
    mediump vec3 view = normalize( -( vPosition.xyz / vPosition.w ) );
    mediump vec3 normal = normalize( vNormal );

    for ( int i = 0; i < 10; i++ ) {
        if ( !lights[i].enabled ) continue;

        Light light = lights[i];

        vec3 lightdir;
        // directional lights have 0 in w
        if ( light.position.w == 0.0 ) lightdir = normalize( light.position.xyz );
        else                           lightdir = normalize( light.position.xyz / light.position.w - vPosition.xyz );

        float lightdist = length( light.position.xyz / light.position.w - vPosition.xyz );
        lightdist = max( lightdist - light.radius, 0.0 );

        float d = lightdist / light.radius + 1.0;
        float attenuation = 1.0 / ( d * d );

        // diffuse term
        color += attenuation * mat.diffuse * light.color * max( dot( normal, lightdir ), 0.0 );

        // specular term
        // the half vector is exactly between the view vector and the light direction vector
        vec3 halfv = normalize( view + lightdir );
        color += attenuation * mat.specular * light.color * pow( max( dot( normal, halfv ), 0.0 ), mat.shininess );
    }

    gl_FragColor = pow( color, vec4( 1.0 / screenGamma ) );
}
