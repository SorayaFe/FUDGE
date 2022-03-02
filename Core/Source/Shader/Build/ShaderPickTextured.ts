namespace FudgeCore {
/** Code generated by CompileShaders.mjs using the information in CompileShaders.json */

export abstract class ShaderPickTextured extends Shader {
  public static getVertexShaderSource(): string { 
return `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
in vec3 a_vctPosition;       
in vec2 a_vctTexture;
uniform mat4 u_mtxProjection;
uniform mat3 u_mtxPivot;

out vec2 v_vctTexture;

void main() {   
    gl_Position = u_mtxProjection * vec4(a_vctPosition, 1.0);
    v_vctTexture = vec2(u_mtxPivot * vec3(a_vctTexture, 1.0)).xy;
}
`; }

  public static getFragmentShaderSource(): string { 
return `#version 300 es
/**
* Renders for Raycasting
* @authors Jirka Dell'Oro-Friedl, HFU, 2019
*/
precision mediump float;
precision highp int;

uniform int u_id;
uniform vec2 u_vctSize;
in vec2 v_vctTexture;
uniform vec4 u_vctColor;
uniform sampler2D u_texture;

out ivec4 frag;

void main() {
    float id = float(u_id); 
    float pixel = trunc(gl_FragCoord.x) + u_vctSize.x * trunc(gl_FragCoord.y);

    if (pixel != id)
      discard;
    
    vec4 color = u_vctColor * texture(u_texture, v_vctTexture);
    uint icolor = uint(color.r * 255.0) << 24 | uint(color.g * 255.0) << 16 | uint(color.b * 255.0) << 8 | uint(color.a * 255.0);
  
  frag = ivec4(floatBitsToInt(gl_FragCoord.z), icolor, floatBitsToInt(v_vctTexture.x), floatBitsToInt(v_vctTexture.y));
}
`; }
}
}