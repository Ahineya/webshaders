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

float Tomb(vec2 uv, float crossThickness, mat2x2 crossRotation) {
    vec3 col = vec3(0.0);

    float tombHeight = 0.25;
    float tomb = Trapeze(uv + vec2(0., 0.5) + vec2(0., -tombHeight / 2.), 0.2, 0.4, tombHeight);

    float crossHeight = 1. - tombHeight;
    float crossV = Trapeze(uv + vec2(0., 0.5) + vec2(0., -crossHeight / 2. - tombHeight), crossThickness, crossThickness, crossHeight);
    float crossH = Trapeze(((uv + vec2(0, 0.5) + vec2(0., -tombHeight - crossHeight * 2. / 3.)) * crossRotation), 0.5, 0.5, crossThickness);

    col = vec3(tomb);
    col = max(col, vec3(crossV));
    col = max(col, vec3(crossH));

    return col.r;
}

float hillCurve(float x) {
    return sin(x * 3.) * sin(x * 4.5) * sin(x * 7.) * 0.08;
}

vec3 Layer(vec2 uv, vec2 id) {
    vec3 col = vec3(0.0);

    float hc = hillCurve(uv.x);
    float idhc = hillCurve((id.x + 0.5) / 10.);
    float hills = uv.y > hc ? 0. : 1.;

    uv.x = fract(uv.x * 10.) - 0.5;
    uv.y *= 10.;
    uv.y -= idhc * 10. + 0.35;

    float rand = hash21(vec2(id.x, 0.)); // from 0 to 1. Need from 0.8 to 1.2

    float randRotation = hash21(vec2(id.x + 123.5, 0.));
    float randScale = rand * 0.4 + 0.8;
    if (rand < 0.6) {
        col += Tomb((uv * vec2(randScale, randScale) + vec2(0.25 * (rand - 0.5), 0.)) * rotate(-PI / 40. + (randRotation - 0.25) / 5.), 0.1, rotate(-PI / 40. + rand / 5.));
    }
    col = max(col, hills);

    return col;
}

float inv(float x) {
    return 1. - x;
}

vec3 Ground(vec2 uv) {
    vec3 col = vec3(0.0);

    for (float i = 1.; i > 0.; i -= 0.1) {
        float rand = hash21(vec2(i, 0.));

        vec2 layerScale = vec2(5. * i);
        vec2 layerOffset = vec2(iTime * 0.05 * inv(i - 0.01), 0.);

        vec2 layerUv = uv * layerScale + layerOffset;

        layerUv += vec2(i * rand * 124., inv(i) * 0.5);
        vec2 layerId = floor(layerUv * 10.);

        vec3 color = vec3(0.71, 0.71, 1.);


        float slowTime = -sin(iTime * 0.2) * 0.5 + 0.5;
        float sineTime = -cos(iTime * 0.4) * 0.5 + 0.5;

        if (slowTime > .5) {
            sineTime = -cos(0.2) * 0.5 + 0.5;
        }

        color *= (sineTime * 1.6 + 0.4) + 0.4;

        float tintI = (i * 0.4) * 0.6 + 0.1;
        color *= tintI;

        vec3 layer = Layer(layerUv, layerId) * color;

        if (layer.x > 0.0 || layer.y > 0.0 || layer.z > 0.0) {
            col = layer;
        }
    }

    return col;
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

vec3 Moon(vec2 uv) {
    vec3 col = vec3(0.0);
    float t = -cos(iTime * 0.2) * 0.5;
    float t2 = sin(iTime * 0.2) * 0.5;
    vec2 moonUv = uv + vec2(-t * 1.2, -t2 / 2.);
    float circle = length(moonUv);
    col = max(col, smoothstep(0.1, 0.09, circle));

    vec3 moonTexture = 1. - (vec3(perlinNoise(moonUv * 10.) * perlinNoise(moonUv * 23.) * perlinNoise(moonUv * 40.) * perlinNoise(moonUv * 67.)) / 0.6);
    col = min(col, moonTexture);

    return col;
}

vec3 Moonshine(vec2 uv) {
    vec3 col = vec3(0.0);
    float t = -cos(iTime * 0.2) * 0.5;
    float t2 = sin(iTime * 0.2) * 0.5;
    vec2 moonUv = uv + vec2(-t * 1.2, -t2 / 2.);
    float circle = length(uv + moonUv);
    col = max(col, smoothstep(0.95, 0.01, circle) * 0.2 * (t2 + 0.5));

    return col;
}

vec3 Stars(vec2 uv, vec3 col) {
    vec3 starCol = vec3(0.0);
    // Stars
    float noise = hash21(vec2(uv.x, uv.y));

    if (col.x == 0.0 && col.y == 0.0 && col.z == 0.0) {
        starCol += pow(noise, 100.);
    }

    // Big stars

    vec2 id = floor((uv + 0.5) * 20.);
    float rand = hash21(id, 121112.12134);
    vec2 starUv = vec2(fract(uv.x * 20.), fract(uv.y * 20.));
    float circle = length(starUv - 0.5);
    float star = smoothstep(clamp(0.01, 0.1, rand / 10.), 0.005, circle);

    if (uv.y > 0. && rand > 0.95) {
        starCol = max(starCol, vec3(star) * (clamp(0.5, 1., sin(fract(iTime * 6.) + rand * 100.5) * rand*100.) * 0.5 + 0.5));
    }

    return starCol;
}

vec3 overlay(vec3 obj, vec3 col) {
    if (obj.x > 0. || obj.y > 0. || obj.z > 0.) {
        col = obj;
    }

    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy - 0.5;

    vec3 col = vec3(0.0);

    col += Stars(uv, col);
    col = overlay(Moon(uv), col);
    col = overlay(Ground(uv), col);
    col += Moonshine(uv);

    fragColor = vec4(col, 1.0);
}

void main() {
    mainImage(outColor, fragCoord);
}
