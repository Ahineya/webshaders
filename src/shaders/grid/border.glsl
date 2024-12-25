#ifndef Border_glsl
#define Border_glsl

float Border(vec2 uv, float thickness) {
    return S(-0.5, -0.5 + thickness, abs(uv.x)) * S(0.5 - thickness, 0.5, abs(uv.y))
    + S(-0.5, -0.5 + thickness, abs(uv.y)) * S(0.5 - thickness, 0.5, abs(uv.x));
}

#endif

