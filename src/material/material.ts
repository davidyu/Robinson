class Material {
  isTextureMapped: boolean;
  constructor() {
    this.isTextureMapped = false;
  }

  getShaderName(): string {
    return null;
  }

  setMaterialProperties( gl: WebGLRenderingContext & WebGL2RenderingContext, shader: CompiledProgramData ) {
  }
}

