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

#define BLOOD_RED 0.6, 0.0, 0.0
#define BLOOD_RED_HEX 0.8137254901960784, 0.09607843137254902, 0.13725490196078433

#define MAX_ITER 1000
#define CURVE_SAMPLE_STEP 0.01

mat2x2 rotate(float a) {
    return mat2x2(cos(a), -sin(a), sin(a), cos(a));
}

float hash21(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
}

float hash21(vec2 uv, float seed) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * seed);
}

float Line(float x, float pos, float width) {
    float halfW = width / 2.0;
    return step(-halfW + x, pos) - step(halfW + x, pos);
}

float smin(float a, float b, float k)
{
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float smax(float a, float b, float k)
{
    return smin(a, b, -k);
}

vec3 smin(vec3 a, vec3 b, float k)
{
    float h = clamp(0.5 + 0.5 * (b.x - a.x) / k, 0.0, 1.0);
    return mix(b, a, h) - vec3(k * h * (1.0 - h));
}

vec3 smax(vec3 a, vec3 b, float k)
{
    return smin(a, b, -k);
}

float distanceToLine(vec2 p, float a, float b, float c) {
    float x = p.x;
    float y = p.y;
    float fx = sin(x*a) * sin(x*b) * sin(x*c);

    float dfx = a*cos(x*a) * sin(x*b) * sin(x*c)
        + b*sin(x*a) * cos(x*b) * sin(x*c)
        + c*sin(x*a) * sin(x*b) * cos(x*c);

    float nx = x - dfx * (fx - y);
    float ny = sin(nx*a) * sin(nx*b) * sin(nx*c);

    return sqrt((x - nx) * (x - nx) + (y - ny) * (y - ny));
}

// The function defining the curve.
float curve(float x) {
    return sin(x * 27.0) * sin(x * 21.0 + (abs(sin(iTime * 0.1) )* 0.5 + 0.5)) * sin(x * 3.0 + (abs(sin(iTime * 0.1) )* 0.5 + 0.5));
}

vec3 randomColor(vec2 uv) {
    float r = hash21(uv * 100. + iTime * 0.001, 123. * fract(iTime * 0.001));
    float g = hash21(uv * 100. + iTime * 0.001, 424. * fract(iTime * 0.1));
    float b = hash21(uv * 100. + iTime * 0.001, 234. * fract(iTime * 0.01));

    return vec3(r, g, b);
}

float curveDistance(vec2 uv) {
    float minDist = 10000.0;

    float x = uv.x;
    float y = curve(x);

    for (float x = -0.5; x < 0.5; x += CURVE_SAMPLE_STEP) {
        float dist = distance(vec2(x, y), uv);
        minDist = min(minDist, dist);
    }

    return minDist;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy - 0.5;

    vec3 col = vec3(0.0);

//    float d = curveDistance(uv);

    float y = curve(uv.x);
    float d = abs(uv.y - y);

    col = uv.y > y ? vec3(BLOOD_RED) * smoothstep(0., 0.15, d) : vec3(0.0);

    float x = curve(uv.y);
    d = abs(uv.x - x);

    col = smax(col, uv.x > x ? vec3(BLOOD_RED) * smoothstep(0., 0.15, d) : vec3(0.0), 0.01);

    float noise = hash21(uv * 100.0 + iTime * 0.001, hash21(vec2(fract(iTime * 0.001)), 4124.) * 100.0);

    col = max(col, randomColor(uv) * 0.2 );

    fragColor = vec4(col, 1.0);
}

void main() {
    mainImage(outColor, fragCoord);
}
