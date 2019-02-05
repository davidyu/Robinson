///<reference path='material.ts' />

class LambertMaterial extends Material {
  diffuse: gml.Vec4;
  constructor( diffuse: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 ) ) {
    super();
    this.diffuse = diffuse;
  }

  setMaterialProperties( gl: WebGLRenderingContext & WebGL2RenderingContext, shaderLibrary: ShaderLibrary ) {
    let shader = shaderLibrary.programs[ "lambert" ];
    gl.useProgram( shader.program );
    shader.setup( gl, shader.attributes, shader.uniforms );
    gl.uniform4fv( shader.uniforms[ "diffuse" ], this.diffuse.v );
    return shader;
  }
}
