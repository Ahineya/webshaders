#ifndef Cylinder_glsl
#define Cylinder_glsl

float Cylinder(float cylinderPos, float width, float x) {
    float halfWidth = width / 2.0;

    return smoothstep(cylinderPos - halfWidth, cylinderPos, x) - smoothstep(cylinderPos, cylinderPos + halfWidth, x);
}

#endif
