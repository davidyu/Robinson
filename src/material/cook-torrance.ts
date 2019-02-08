///<reference path='material.ts' />

class CookTorranceMaterial extends Material {
  diffuse: gml.Vec4;
  specular: gml.Vec4;
  roughness: number;
  fresnel: number; // reference fresnel value at normal incidence
  constructor( diffuse: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 )
             , specular: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 )
             , roughness: number = 0.5
             , fresnel: number = 1.586 ) {
    super();
    this.diffuse = diffuse;
    this.specular = specular;
    this.roughness = roughness;
    this.fresnel = fresnel;
  }

  getShaderName(): string {
    return "cook-torrance";
  }

  setMaterialProperties( gl: WebGLRenderingContext & WebGL2RenderingContext, shader: CompiledProgramData ) {
    gl.useProgram( shader.program );
    shader.setup( gl, shader.attributes, shader.uniforms );
    gl.uniform4fv( shader.uniforms[ "diffuse" ], this.diffuse.v );
    gl.uniform4fv( shader.uniforms[ "specular" ], this.specular.v );
    gl.uniform1f ( shader.uniforms[ "roughness" ], this.roughness );
    gl.uniform1f ( shader.uniforms[ "fresnel" ], this.fresnel );
  }
}
