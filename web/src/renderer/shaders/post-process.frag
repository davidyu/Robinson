#version 300 es

precision mediump float;

in mediump vec2 vTexCoord;
in mediump vec3 vDirection;

uniform sampler2D screen_color;
uniform sampler2D screen_depth;

uniform highp mat4 uVMatrix;

const float maxblur = 2.0;
const float aperture = 1.0;   // bigger for shallower depth of field

const float zNear = 0.1;
const float zFar  = 1000.0;

// TODO make me focal length rather than compressed z space
const float focus = 0.025;    // focus distance (in depth buffer (z) space...so it's highly compressed)

const vec3  sun_pos = normalize( vec3( 0.0, 1.0, 0.4 ) );
const float sun_flare_size = 0.5;

const float sampleDist = 1.0;
const float sampleStrength = 2.2;
const vec2 aspectcorrect = vec2( 1.0, 848.0/480.0 );
 
out vec4 fragColor;

float linearize(float depth)
{
    return (2.0 * zNear) / (zFar + zNear - depth * (zFar - zNear));
}

void main()
{
    // Bokeh DOF implementation reference: http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
    float depth = linearize( texture( screen_depth, vTexCoord ).x );
    
    if ( depth >= 0.99 ) {
        // don't perform DOF on skybox
        fragColor = texture( screen_color, vTexCoord );
        return;
    }

    float blur_factor = depth - focus;
    vec2 dofblur = vec2( clamp( blur_factor * aperture, -maxblur, maxblur ) );

    vec4 col = vec4( 0.0 );

    // TODO two-pass DOF to save sampling cost?
    col += texture( screen_color, vTexCoord );
    col += texture( screen_color, vTexCoord + ( vec2( 0.0,0.4     ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( 0.15,0.37   ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( 0.29,0.29   ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( -0.37,0.15  ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( 0.4,0.0     ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( 0.37,-0.15  ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( 0.29,-0.29  ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( -0.15,-0.37 ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( 0.0,-0.4    ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( -0.15,0.37  ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( -0.29,0.29  ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( 0.37,0.15   ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( -0.4,0.0    ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( -0.37,-0.15 ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( -0.29,-0.29 ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( 0.15,-0.37  ) * aspectcorrect ) * dofblur );
    col += texture( screen_color, vTexCoord + ( vec2( 0.15,0.37   ) * aspectcorrect ) * dofblur * 0.9 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.37,0.15  ) * aspectcorrect ) * dofblur * 0.9 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.37,-0.15  ) * aspectcorrect ) * dofblur * 0.9 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.15,-0.37 ) * aspectcorrect ) * dofblur * 0.9 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.15,0.37  ) * aspectcorrect ) * dofblur * 0.9 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.37,0.15   ) * aspectcorrect ) * dofblur * 0.9 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.37,-0.15 ) * aspectcorrect ) * dofblur * 0.9 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.15,-0.37  ) * aspectcorrect ) * dofblur * 0.9 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.29,0.29   ) * aspectcorrect ) * dofblur * 0.7 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.4,0.0     ) * aspectcorrect ) * dofblur * 0.7 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.29,-0.29  ) * aspectcorrect ) * dofblur * 0.7 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.0,-0.4    ) * aspectcorrect ) * dofblur * 0.7 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.29,0.29  ) * aspectcorrect ) * dofblur * 0.7 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.4,0.0    ) * aspectcorrect ) * dofblur * 0.7 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.29,-0.29 ) * aspectcorrect ) * dofblur * 0.7 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.0,0.4     ) * aspectcorrect ) * dofblur * 0.7 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.29,0.29   ) * aspectcorrect ) * dofblur * 0.4 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.4,0.0     ) * aspectcorrect ) * dofblur * 0.4 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.29,-0.29  ) * aspectcorrect ) * dofblur * 0.4 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.0,-0.4    ) * aspectcorrect ) * dofblur * 0.4 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.29,0.29  ) * aspectcorrect ) * dofblur * 0.4 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.4,0.0    ) * aspectcorrect ) * dofblur * 0.4 );
    col += texture( screen_color, vTexCoord + ( vec2( -0.29,-0.29 ) * aspectcorrect ) * dofblur * 0.4 );
    col += texture( screen_color, vTexCoord + ( vec2( 0.0,0.4     ) * aspectcorrect ) * dofblur * 0.4 );

    fragColor = col / 41.0;

    fragColor.a = 1.0;
}
