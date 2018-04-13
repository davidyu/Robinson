#version 300 es

precision mediump float;

in mediump vec2 vTexCoord;

uniform sampler2D screen_color;
uniform sampler2D screen_depth;

const float maxblur = 2.0;
const float aperture = 2.1;   // bigger for shallower depth of field

// TODO make me focal length rather than compressed z space
const float focus = 0.993;    // focus distance (in depth buffer (z) space...so it's highly compressed)
 
out vec4 fragColor;

void main()
{
    // Bokeh DOF implementation reference: http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
    vec2 aspectcorrect = vec2( 1.0, 848.0/480.0 );
    float depth = texture( screen_depth, vTexCoord ).r;
    float blur_factor = depth - focus;
    vec2 dofblur = vec2( clamp( blur_factor * aperture, -maxblur, maxblur ) );

    vec4 col = vec4( 0.0 );

    col += texture( screen_color, vTexCoord );
    col += texture( screen_color, vTexCoord + (vec2( 0.0,0.4     ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.15,0.37   ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.29,0.29   ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.37,0.15  ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.4,0.0     ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.37,-0.15  ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.29,-0.29  ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.15,-0.37 ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.0,-0.4    ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.15,0.37  ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.29,0.29  ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.37,0.15   ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.4,0.0    ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.37,-0.15 ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.29,-0.29 ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.15,-0.37  ) * aspectcorrect ) * dofblur     ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.15,0.37   ) * aspectcorrect ) * dofblur * 0.9 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.37,0.15  ) * aspectcorrect ) * dofblur * 0.9 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.37,-0.15  ) * aspectcorrect ) * dofblur * 0.9 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.15,-0.37 ) * aspectcorrect ) * dofblur * 0.9 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.15,0.37  ) * aspectcorrect ) * dofblur * 0.9 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.37,0.15   ) * aspectcorrect ) * dofblur * 0.9 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.37,-0.15 ) * aspectcorrect ) * dofblur * 0.9 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.15,-0.37  ) * aspectcorrect ) * dofblur * 0.9 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.29,0.29   ) * aspectcorrect ) * dofblur * 0.7 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.4,0.0     ) * aspectcorrect ) * dofblur * 0.7 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.29,-0.29  ) * aspectcorrect ) * dofblur * 0.7 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.0,-0.4    ) * aspectcorrect ) * dofblur * 0.7 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.29,0.29  ) * aspectcorrect ) * dofblur * 0.7 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.4,0.0    ) * aspectcorrect ) * dofblur * 0.7 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.29,-0.29 ) * aspectcorrect ) * dofblur * 0.7 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.0,0.4     ) * aspectcorrect ) * dofblur * 0.7 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.29,0.29   ) * aspectcorrect ) * dofblur * 0.4 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.4,0.0     ) * aspectcorrect ) * dofblur * 0.4 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.29,-0.29  ) * aspectcorrect ) * dofblur * 0.4 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.0,-0.4    ) * aspectcorrect ) * dofblur * 0.4 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.29,0.29  ) * aspectcorrect ) * dofblur * 0.4 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.4,0.0    ) * aspectcorrect ) * dofblur * 0.4 ) ;
    col += texture( screen_color, vTexCoord + (vec2( -0.29,-0.29 ) * aspectcorrect ) * dofblur * 0.4 ) ;
    col += texture( screen_color, vTexCoord + (vec2( 0.0,0.4     ) * aspectcorrect ) * dofblur * 0.4 ) ;

    fragColor = col / 41.0;
    fragColor.a = 1.0;
}
