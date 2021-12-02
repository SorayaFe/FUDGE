#version 300 es
/**
* Phong shading
* Implementation based on https://www.gsn-lib.org/docs/nodes/ShaderPluginNode.php
* @authors Luis Keck, HFU, 2021
*/
precision highp float;
#define GLSLIFY 1
#define GLSLIFY 1

struct LightAmbient {
    vec4 color;
};
struct LightDirectional {
    vec4 color;
    vec3 direction;
};

const uint MAX_LIGHTS_DIRECTIONAL = 10u;
uniform LightAmbient u_ambient;
uniform uint u_nLightsDirectional;
uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];

in vec3 f_normal;
in vec3 v_position;
uniform vec4 u_color;
uniform float u_shininess;
out vec4 frag;

vec3 calculateReflection(vec3 light_dir, vec3 view_dir, vec3 normal, float shininess) {
    vec3 color = vec3(1);
    vec3 R = reflect(-light_dir, normal);
    float spec_dot = max(dot(R, view_dir), 0.0);
    color += pow(spec_dot, shininess);
    return color;
}

void main() {
    frag = u_ambient.color;
    for(uint i = 0u; i < u_nLightsDirectional; i++) {
        vec3 light_dir = normalize(-u_directional[i].direction);
        vec3 view_dir = normalize(v_position);
        vec3 N = normalize(f_normal);

        float illuminance = dot(light_dir, N);
        if(illuminance > 0.0) {
            vec3 reflection = calculateReflection(light_dir, view_dir, N, u_shininess);
            frag += vec4(reflection, 1.0) * illuminance * u_directional[i].color;
        }
    }
    frag *= u_color;
    frag.a = 1.0;
}       