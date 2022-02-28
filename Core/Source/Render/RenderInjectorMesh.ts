namespace FudgeCore {
  export interface RenderBuffers {
    // regular/smooth shading
    vertices: WebGLBuffer;
    indices: WebGLBuffer;
    textureUVs: WebGLBuffer;
    normalsVertex: WebGLBuffer;
    // for flat shading  TODO: may create another RenderBuffer for flat
    verticesFlat: WebGLBuffer;
    indicesFlat: WebGLBuffer;
    normalsFlat: WebGLBuffer;
    textureUVsFlat: WebGLBuffer;
  }
  //gives WebGL Buffer the data from the {@link Mesh]]
  export class RenderInjectorMesh {
    public static decorate(_constructor: Function): void {
      Object.defineProperty(_constructor.prototype, "useRenderBuffers", {
        value: RenderInjectorMesh.useRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "createRenderBuffers", {
        value: RenderInjectorMesh.createRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "deleteRenderBuffers", {
        value: RenderInjectorMesh.deleteRenderBuffers
      });
    }

    protected static createRenderBuffers(this: Mesh): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      function createBuffer(_type: GLenum, _array: Float32Array | Uint16Array): WebGLBuffer {
        let buffer: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
        crc3.bindBuffer(_type, buffer);
        crc3.bufferData(_type, _array, WebGL2RenderingContext.STATIC_DRAW);
        return buffer;
      }

      let vertices: WebGLBuffer = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.vertices);
      let indices: WebGLBuffer = createBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.indices);
      let normalsVertex: WebGLBuffer = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.normalsVertex);
      let textureUVs: WebGLBuffer = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.textureUVs);
      let verticesFlat: WebGLBuffer = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.verticesFlat);
      let indicesFlat: WebGLBuffer = createBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.indicesFlat);
      let normalsFlat: WebGLBuffer = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.normalsFlat);
      let textureUVsFlat: WebGLBuffer = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.textureUVsFlat);


      let renderBuffers: RenderBuffers = {
        //smooth
        vertices: vertices,
        indices: indices,
        textureUVs: textureUVs,
        normalsVertex: normalsVertex,
        // flat
        verticesFlat: verticesFlat,
        indicesFlat: indicesFlat,
        normalsFlat: normalsFlat,
        textureUVsFlat: textureUVsFlat
      };

      this.renderBuffers = renderBuffers;
    }

    protected static useRenderBuffers(this: Mesh, _shader: typeof Shader, _mtxMeshToWorld: Matrix4x4, _mtxMeshToView: Matrix4x4, _id?: number): number {
      if (!this.renderBuffers)
        this.createRenderBuffers();
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      function setBuffer(_name: string, _buffer: WebGLBuffer): void {
        let attribute: number = _shader.attributes[_name];
        if (attribute == undefined)
          return;
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _buffer);
        crc3.enableVertexAttribArray(attribute);
        RenderWebGL.setAttributeStructure(
          attribute,
          { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 }
        );
      }

      let uProjection: WebGLUniformLocation = _shader.uniforms["u_projection"];
      crc3.uniformMatrix4fv(uProjection, false, _mtxMeshToView.get());

      let uNormal: WebGLUniformLocation = _shader.uniforms["u_normal"];
      if (uNormal) {
        let normalMatrix: Matrix4x4 = Matrix4x4.TRANSPOSE(Matrix4x4.INVERSION(_mtxMeshToWorld));
        crc3.uniformMatrix4fv(uNormal, false, normalMatrix.get());
      }

      setBuffer("a_position", this.renderBuffers.vertices);
      setBuffer("a_positionFlat", this.renderBuffers.verticesFlat);
      setBuffer("a_normalFace", this.renderBuffers.normalsFlat);
      setBuffer("a_normalVertex", this.renderBuffers.normalsVertex);


      // feed in texture coordinates if shader accepts a_textureUVs
      let aTextureUVs: number = _shader.attributes["a_textureUVs"];
      if (aTextureUVs) {
        if (_shader == ShaderFlatTextured)
          crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.textureUVsFlat);
        else
          crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.textureUVs);
        crc3.enableVertexAttribArray(aTextureUVs); // enable the buffer
        crc3.vertexAttribPointer(aTextureUVs, 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }

      // feed in an id of the node if shader accepts u_id. Used for picking
      let uId: WebGLUniformLocation = _shader.uniforms["u_id"];
      if (uId)
        RenderWebGL.getRenderingContext().uniform1i(uId, _id);

      if (_shader == ShaderFlat || _shader == ShaderFlatTextured) {
        crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderBuffers.indicesFlat);
        return this.indicesFlat.length;
      }

      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderBuffers.indices);
      return this.indices.length;
    }

    protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (_renderBuffers) {
        // TODO: cleanup all buffers, flat/normals is missing...
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.vertices);
        crc3.deleteBuffer(_renderBuffers.textureUVs);
        crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.indices);
      }
    }
  }
}