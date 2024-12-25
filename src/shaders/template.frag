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

float hash21(vec2 uv, float seed) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * seed);
}

float Trapeze(vec2 uv, float topWidth, float bottomWidth, float height) {
    uv.y *= -1.0;

    // define top and bottom edge
    float topEdge = -height / 2.0;
    float bottomEdge = height / 2.0;

    // define left and right edge for top and bottom
    float topLeftEdge = -topWidth / 2.0;
    float topRightEdge = topWidth / 2.0;
    float bottomLeftEdge = -bottomWidth / 2.0;
    float bottomRightEdge = bottomWidth / 2.0;

    // Check if we're outside the trapeze vertically
    if (uv.y < topEdge || uv.y > bottomEdge) {
        return 0.0;
    }

    // Calculate left and right edges based on Y interpolation
    float leftEdge = mix(topLeftEdge, bottomLeftEdge, (uv.y - topEdge) / height);
    float rightEdge = mix(topRightEdge, bottomRightEdge, (uv.y - topEdge) / height);

    // Check if we're outside the trapeze horizontally
    if (uv.x < leftEdge || uv.x > rightEdge) {
        return 0.0;
    }

    // If we've got this far we're inside the trapeze
    return 1.0;
}

float inv(float x) {
    return 1. - x;
}

float perlinNoise(vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);

    vec2 u = f * f * (3. - 2. * f);

    return mix(
        mix(hash21(i + vec2(0., 0.)), hash21(i + vec2(1., 0.)), u.x),
        mix(hash21(i + vec2(0., 1.)), hash21(i + vec2(1., 1.)), u.x),
        u.y
    );
}

vec3 overlay(vec3 obj, vec3 col) {
    if (obj.x > 0. || obj.y > 0. || obj.z > 0.) {
        col = obj;
    }

    return col;
}

float Voronoi(vec2 uv, float seed) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);

    float minDist = 1.0;
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = vec2(hash21(i + neighbor, seed), hash21(i + neighbor, seed + 321.9));
            vec2 diff = neighbor + point - f;
            float dist = dot(diff, diff);

            minDist = min(minDist, dist);
        }
    }

    return 1.0 - minDist;
}

float smoothVoronoi(vec2 uv, float seed) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);

    float minDist = 1.0;
    float secondMinDist = 1.0;
    vec2 minPoint = vec2(0.0);
    vec2 secondMinPoint = vec2(0.0);
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = vec2(hash21(i + neighbor, seed), hash21(i + neighbor, seed + 321.9));
            vec2 diff = neighbor + point - f;
            float dist = dot(diff, diff);

            if (dist < minDist) {
                secondMinDist = minDist;
                secondMinPoint = minPoint;
                minDist = dist;
                minPoint = point;
            } else if (dist < secondMinDist) {
                secondMinDist = dist;
                secondMinPoint = point;
            }
        }
    }

    float dist = minDist / secondMinDist;
    return 1.0 - dist;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy - 0.5;

    vec3 col = vec3(0.0);

    float seed = 1234.5;//iTime * 0.1;

    float voronoi = smoothVoronoi(uv * 10.0, seed);

    col = smoothstep(0.1, 0.95, vec3(voronoi));
//    col = vec3(step(0.3, voronoi));

    fragColor = vec4(col, 1.0);
}

void main() {
    mainImage(outColor, fragCoord);
}
