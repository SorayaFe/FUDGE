#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
precision highp int;

uniform int u_id;
uniform vec2 u_size;
uniform vec4 u_vecColor;
out ivec4 frag;

void main() {
    float id = float(u_id); 
    float pixel = trunc(gl_FragCoord.x) + u_size.x * trunc(gl_FragCoord.y);

    if (pixel != id)
      discard;

    uint icolor = uint(u_vecColor.r * 255.0) << 24 | uint(u_vecColor.g * 255.0) << 16 | uint(u_vecColor.b * 255.0) << 8 | uint(u_vecColor.a * 255.0);
                
    frag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, 0, 0);
}