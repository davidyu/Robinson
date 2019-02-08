///<reference path='material.ts' />

class LambertMaterial extends Material {
  diffuse: gml.Vec4;
  constructor( diffuse: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 ) ) {
    super();
    this.diffuse = diffuse;
  }

  getShaderName(): string {
    return "lambert";
  }

  setMaterialProperties( gl: WebGLRenderingContext & WebGL2RenderingContext, shader: CompiledProgramData ) {
    gl.useProgram( shader.program );
    shader.setup( gl, shader.attributes, shader.uniforms );
    gl.uniform4fv( shader.uniforms[ "diffuse" ], this.diffuse.v );
  }
}
