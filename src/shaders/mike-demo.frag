#version 300 es
precision highp float;

in vec2 fragCoord;

uniform vec3 iResolution;
uniform float iTime;

out vec4 outColor;

float fn(float x) {
    return sin(x * 10.) * 0.5; // Function to draw. Replace it with your approximated thingie
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy - 0.5; // scale uv.x and uv.y from -0.5 to 0.5

    vec3 col = vec3(0.0); // Let the color be black

    float fnY = fn(uv.x); // Get the y value of the function

    float dist = distance(uv, vec2(uv.x, fnY)); // Calculate distance to the function

    float curve = smoothstep(0.02, 0.019, dist); // Draw a line with a thickness of 0.01

    float y = uv.y + 0.5; // scale uv.y from 0 to 1 to use it as a color

    col = vec3(curve) * vec3(1.0 - y, 0.0, .0 + y); // Draw the line with a gradient from blue to red

    if (col == vec3(0.0)) { // If the pixel is not on the line
        col.r = uv.y < fnY ? -uv.y : 0.0; // Draw a gradient from red to black UNDER the line (uv.y < fnY)
    }

    fragColor = vec4(col, 1.0);
}

void main() {
    mainImage(outColor, fragCoord);
}
