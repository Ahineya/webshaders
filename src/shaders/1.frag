#version 300 es
precision highp float;

#define S(a, b, c) smoothstep(a, b, c)
#define PI 3.1415926535897932384626433832795
#define DOUBLE_PI 6.283185307179586476925286766559

in vec2 fragCoord;
uniform vec3 iResolution;
uniform float iTime;

out vec4 outColor;

#include "helpers/helpers.glsl"
#include "shapes/shapes.glsl"
#include "grid/grid.glsl"

mat2x2 rotate(float a) {
    return mat2x2(cos(a), -sin(a), sin(a), cos(a));
}

float hash21(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy - 0.5;
    vec3 col = vec3(0.0);

    col.rgb = vec3(0.01, 0.11, 0.01);

    uv = squareGrid(uv, 6.0);
    float border = Border(uv, 0.05);

    float slowTime = iTime * 0.5;

    slowTime = (sin(slowTime) * 0.5) * PI / 2.1;

    mat2x2 rot = rotate(slowTime);
    uv = rot * uv;
    float cylinder = Cylinder(0.0, 0.12, uv.x);

    float circle = S(0.4, 0.3, length(uv));
    circle *= hash21(uv);

    // Distort the circle based on time
    float distortion = S(0.5, 0.4, abs(uv.x));
    distortion *= cos(iTime) * 0.5 - 0.5;
    circle *= distortion;

    col += circle;
    col.r += cylinder;
    col.r += border;

    fragColor = vec4(col, 1.0);
}

void main() {
    mainImage(outColor, fragCoord);
}
