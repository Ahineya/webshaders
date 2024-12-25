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

float Line(float x, float pos, float width) {
    float halfW = width / 2.0;
    return step(-halfW + x, pos) - step(halfW + x, pos);
}

float Layer(vec2 uv, vec2 id) {
    uv = squareGrid(uv, 10.);

    float randVal = hash21(id);

    uv *= rotate(PI/4.);

    if (randVal > 0.5) {
        uv *= rotate(PI/2.);
    }

    return Line(abs(uv.x), sqrt(pow(0.5, 2.)) / sqrt(2.0), 0.12);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy - 0.5;
    uv *= 3.;
    uv *= rotate(iTime * 0.1);
    uv += vec2(iTime * 0.17);

    vec2 origUv = uv;
    vec3 col = vec3(0.0);

    vec2 id = floor(origUv * 10.0);

    col += Layer(uv, id);

    fragColor = vec4(col, 1.0);
}

void main() {
    mainImage(outColor, fragCoord);
}
