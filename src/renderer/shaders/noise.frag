precision mediump float;

in vec3 vDirection;
out vec4 fragColor;

// noise functions by Inigo Quilez
float hash(float n) { return fract(sin(n) * 1e4); }

float noise(vec3 x) {
    const vec3 step = vec3(110, 241, 171);

    vec3 i = mod( floor(x), vec3( 5 ) * step );
    vec3 f = fract(x);
 
    float n = dot(i, step);

    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

void main() {
    float noise = noise( vDirection );
    fragColor = vec4( noise, noise, noise, 1.0 );
}
