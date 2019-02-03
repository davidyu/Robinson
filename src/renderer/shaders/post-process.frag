#version 300 es

// attribution: Dennis Gustafsson
// Single-pass Bokeh DOF
// tuxedolabs.blogspot.com/2018/05/bokeh-depth-of-field-in-single-pass.html

precision mediump float;

in mediump vec2 vTexCoord;
in mediump vec3 vDirection;

uniform sampler2D screen_color;
uniform sampler2D screen_depth;

uniform highp mat4 uVMatrix;
uniform float focus;

const float zNear = 0.1;
const float zFar  = 1000.0;
 
out vec4 fragColor;

const vec2 uPixelSize = vec2( 1.0 / 848.0, 1.0 / 480.0 );

const float GOLDEN_ANGLE = 2.39996323;
const float MAX_BLUR_SIZE = 20.0;
const float RAD_SCALE = 1.5;
const float FOCUS_SCALE = 20.0;

float getBlurSize( float depth, float focusPoint )
{
    float coc = clamp( ( 1.0 / focusPoint - 1.0 / depth ) * FOCUS_SCALE, -1.0, 1.0 );
    return abs( coc ) * MAX_BLUR_SIZE;
}

float linearize( float depth )
{
    return (2.0 * zNear) / (zFar + zNear - depth * (zFar - zNear));
}

vec3 depthOfField( vec2 texCoord, float focusPoint )
{
    float centerDepth = linearize( texture( screen_depth, texCoord ).r ) * zFar;
    float centerSize = getBlurSize( centerDepth, focusPoint );
    vec3 color = texture( screen_color, texCoord ).rgb;
    float tot = 1.0;

    float radius = RAD_SCALE;
    for ( float ang = 0.0; radius < MAX_BLUR_SIZE; ang += GOLDEN_ANGLE )
    {
        vec2 tc = texCoord + vec2( cos( ang ), sin( ang ) ) * uPixelSize * radius;

        vec3 sampleColor = texture( screen_color, tc ).rgb;
        float sampleDepth = linearize( texture( screen_depth, tc ).r ) * zFar;
        float sampleSize = getBlurSize(sampleDepth, focusPoint );
        if (sampleDepth > centerDepth) {
            sampleSize = clamp( sampleSize, 0.0, centerSize * 2.0 );
        }

        float m = smoothstep( radius - 0.5, radius + 0.5, sampleSize );
        color += mix( color / tot, sampleColor, m );
        tot += 1.0;
        radius += RAD_SCALE/radius;
    }
    
    return color / tot;
}

void main()
{
    fragColor = vec4( depthOfField( vTexCoord, focus * zFar ), 1.0 );
}
