#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021
*/

  // MINIMAL (no define needed): buffers for transformation
uniform mat4 u_mtxProjection;

  // FLAT: offer buffers for face normals and their transformation
  #if defined(FLAT)
in vec3 a_vctPositionFlat;
in vec3 a_vctNormalFace;
uniform mat4 u_mtxNormal;
flat out vec4 v_vctColor;
  #else
  // regular if not FLAT
in vec3 a_vctPosition;
out vec4 v_vctColor;
  #endif

// LIGHT: offer buffers for lighting vertices with different light types
  #if defined(LIGHT)
struct LightAmbient {
  vec4 color;
};
struct LightDirectional {
  vec4 color;
  vec3 direction;
};

const uint MAX_LIGHTS_DIRECTIONAL = 100u;

uniform LightAmbient u_ambient;
uniform uint u_nLightsDirectional;
uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];
  #endif 

  // TEXTURE: offer buffers for UVs and pivot matrix
  #if defined(TEXTURE)
in vec2 a_vctTexture;
uniform mat3 u_mtxPivot;
out vec2 v_vctTexture;
  #endif

  // GOURAUD: offer buffers for vertex normals, their transformation and the shininess
  #if defined(GOURAUD)
in vec3 a_vctNormalVertex;
uniform mat4 u_mtxNormal;
  #endif

  // CAMERA: offer buffer and functionality for specular reflection depending on the camera-position
  #if defined(CAMERA)
uniform float u_fShininess;
uniform mat4 u_mtxWorld;
uniform vec3 u_vctCamera;

float calculateReflection(vec3 light_dir, vec3 view_dir, vec3 normal, float shininess) {
  if(shininess <= 0.0)
    return 0.0;
  vec3 reflection = normalize(reflect(-light_dir, normal));
  float spec_dot = dot(reflection, view_dir);
  return pow(max(spec_dot, 0.0), shininess * 10.0) * shininess;
  // return max(spec_dot, 0.0) * shininess;
}
  #endif

void main() {
  vec4 posVertex;

    #if defined(FLAT)
    // FLAT: use the special vertex and normal buffers for flat shading
  posVertex = vec4(a_vctPositionFlat, 1.0);
  vec3 normal = normalize(mat3(u_mtxNormal) * a_vctNormalFace);
  v_vctColor = u_ambient.color;
    #else 
  posVertex = vec4(a_vctPosition, 1.0);
    #endif

    // use the regular vertex buffer
  gl_Position = u_mtxProjection * posVertex;

    // GOURAUD: use the vertex normals
    #if defined(GOURAUD)
  v_vctColor = u_ambient.color;
  vec3 normal = normalize(mat3(u_mtxNormal) * a_vctNormalVertex);
    #endif

    #if defined(LIGHT)
  // calculate the directional lighting effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    float illumination = -dot(normal, u_directional[i].direction);
    if(illumination > 0.0f) {
      v_vctColor += illumination * u_directional[i].color;
        #if defined(CAMERA)
      vec3 view_dir = normalize(vec3(u_mtxWorld * posVertex) - u_vctCamera);
      // for(uint i = 0u; i < u_nLightsDirectional; i++) {
      float reflection = calculateReflection(u_directional[i].direction, view_dir, normal, u_fShininess);
      v_vctColor += reflection * u_directional[i].color;
        #endif
    }
  }
    #endif

    // TEXTURE: transform UVs
    #if defined(TEXTURE)
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
    #endif

    // always full opacity for now...
  v_vctColor.a = 1.0;
}