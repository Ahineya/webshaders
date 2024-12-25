#ifndef squareGrid_glsl
#define squareGrid_glsl

vec2 squareGrid(vec2 uv, float cellCount) {
    return fract(uv * cellCount) - 0.5;
}

#endif
