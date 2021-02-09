namespace FudgeCore {
  /**
   * Renders for Raycasting
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export abstract class ShaderPick extends Shader {
    public static getVertexShaderSource(): string {
      return `#version 300 es
        in vec3 a_position;       
        uniform mat4 u_projection;
        
        void main() {   
            gl_Position = u_projection * vec4(a_position, 1.0);
        }`;
    }
    public static getFragmentShaderSource(): string {
      return `#version 300 es
        precision mediump float;
        precision highp int;
        
        uniform int u_id;
        uniform vec4 u_color;
        out vec4 frag;
        
        void main() {
           float id = float(u_id); 

           // TODO: vertical dimension!
           if (gl_FragCoord.x < id || gl_FragCoord.x >= id + 1.0)
             discard;
           float upperbyte = trunc(gl_FragCoord.z * 256.0) / 256.0;
           float lowerbyte = fract(gl_FragCoord.z * 256.0);

           float luminance = (float(u_color.r) + float(u_color.g) + float(u_color.b))/3.0;
                        
           frag = vec4(upperbyte, lowerbyte, luminance, u_color.a);
        }`;
    }
  }
}