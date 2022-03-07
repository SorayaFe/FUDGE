#version 300 es
/**
* Universal Shader as base for many others. Controlled by compiler directives
* @authors 2021, Luis Keck, HFU, 2021 | Jirka Dell'Oro-Friedl, HFU, 2021
*/

  // MINIMAL (no define needed): buffers for transformation
uniform mat4 u_mtxMeshToView;

  // FLAT: offer buffers for face normals and their transformation
  #if defined(FLAT)
in vec3 a_vctPositionFlat;
in vec3 a_vctNormalFace;
uniform mat4 u_mtxNormalMeshToWorld;
flat out vec4 v_vctColor;
  #else
  // regular if not FLAT
in vec3 a_vctPosition;
out vec4 v_vctColor;
  #endif

  // LIGHT: offer buffers for lighting vertices with different light types
  #if defined(LIGHT)
struct LightAmbient {
  vec4 vctColor;
};
struct LightDirectional {
  vec4 vctColor;
  vec3 vctDirection;
};

const uint MAX_LIGHTS_DIRECTIONAL = 100u;

uniform LightAmbient u_ambient;
uniform uint u_nLightsDirectional;
uniform LightDirectional u_directional[MAX_LIGHTS_DIRECTIONAL];
  #endif 

  // TEXTURE: offer buffers for UVs and pivot matrix
  #if defined(TEXTURE)
uniform mat3 u_mtxPivot;
in vec2 a_vctTexture;
out vec2 v_vctTexture;
  #endif

  #if defined(MATCAP) // MatCap-shader generates texture coordinates from surface normals
out vec2 v_vctTexture;
  #endif

  // GOURAUD: offer buffers for vertex normals, their transformation and the shininess
  #if defined(GOURAUD)||defined(MATCAP)
in vec3 a_vctNormalVertex;
uniform mat4 u_mtxNormalMeshToWorld;
  #endif

  // CAMERA: offer buffer and functionality for specular reflection depending on the camera-position
  #if defined(CAMERA)
uniform float u_fShininess;
uniform mat4 u_mtxMeshToWorld;
uniform mat4 u_mtxWorldToView;
uniform vec3 u_vctCamera;

float calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fShininess) {
  if(_fShininess <= 0.0)
    return 0.0;
  vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  float fScpecular = dot(vctReflection, _vctView);
  return pow(max(fScpecular, 0.0), _fShininess * 10.0) * _fShininess;
  // return max(spec_dot, 0.0) * shininess;
}
  #endif

  #if defined(BONES)
uniform mat4 u_mtxMeshToWorld;
// Bones
struct Bone {
  mat4 matrix;
};

const uint MAX_BONES = 10u;

in uvec4 a_iBone;
in vec4 a_fWeight;

uniform Bone u_bones[MAX_BONES];
  #endif

void main() {
  vec4 vctPosition;
  mat4 mtxMeshToView = u_mtxMeshToView;

    #if defined(LIGHT)
  vec3 vctNormal;
  mat4 mtxNormalMeshToWorld = u_mtxNormalMeshToWorld;
    #endif

    #if defined(BONES)
  mat4 mtxSkin = a_fWeight.x * u_bones[a_iBone.x].matrix +
    a_fWeight.y * u_bones[a_iBone.y].matrix +
    a_fWeight.z * u_bones[a_iBone.z].matrix +
    a_fWeight.w * u_bones[a_iBone.w].matrix;

  mtxMeshToView *= mtxSkin;
  mtxNormalMeshToWorld = transpose(inverse(u_mtxMeshToWorld * mtxSkin));
    #endif

    #if defined(FLAT)
    // FLAT: use the special vertex and normal buffers for flat shading
  vctPosition = vec4(a_vctPositionFlat, 1.0);
  vctNormal = a_vctNormalFace;
  v_vctColor = u_ambient.vctColor;
    #else 
  vctPosition = vec4(a_vctPosition, 1.0);
    #endif

    // GOURAUD: use the vertex normals
    #if defined(GOURAUD)
  v_vctColor = u_ambient.vctColor;
  vctNormal = a_vctNormalVertex;
    #endif

    // calculate position and normal according to input and defines
  gl_Position = mtxMeshToView * vctPosition;

    #if defined(CAMERA)
  // view vector needed
  // vec4 posWorld4 = u_mtxMeshToWorld * vctPosition;
  // vec3 vctView = normalize(posWorld4.xyz/posWorld4.w - u_vctCamera);
  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * vctPosition) - u_vctCamera);
    #endif

    #if defined(LIGHT)
  vctNormal = normalize(mat3(mtxNormalMeshToWorld) * vctNormal);
  // calculate the directional lighting effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    float fIllumination = -dot(vctNormal, u_directional[i].vctDirection);
    if(fIllumination > 0.0f) {
      v_vctColor += fIllumination * u_directional[i].vctColor;
        #if defined(CAMERA)
      float fReflection = calculateReflection(u_directional[i].vctDirection, vctView, vctNormal, u_fShininess);
      v_vctColor += fReflection * u_directional[i].vctColor;
        #endif
    }
  }
    #endif

    // TEXTURE: transform UVs
    #if defined(TEXTURE)
  v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
    #endif

    #if defined(MATCAP)
  vec3 vctNormal = normalize(mat3(u_mtxNormalMeshToWorld) * a_vctNormalVertex);
  vctNormal = mat3(u_mtxWorldToView) * vctNormal;
  v_vctTexture = 0.5 * vctNormal.xy / length(vctNormal) + 0.5;
  v_vctTexture.y *= -1.0;
    #endif

    // always full opacity for now...
  v_vctColor.a = 1.0;
}