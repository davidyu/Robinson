class BlinnPhongMaterial extends Material {
  ambient: TSM.vec4;
  diffuse: TSM.vec4;
  specular: TSM.vec4;
  emissive: TSM.vec4;
  shininess: number;
  constructor( ambient: TSM.vec4 = new TSM.vec4( [ 0.5, 0.5, 0.5, 1 ] )
             , diffuse: TSM.vec4 = new TSM.vec4( [ 0.5, 0.5, 0.5, 1 ] )
             , specular: TSM.vec4 = new TSM.vec4( [ 0.5, 0.5, 0.5, 1 ] )
             , emissive: TSM.vec4 = new TSM.vec4( [ 0.5, 0.5, 0.5, 1 ] )
             , shininess: number = 1.0 ) {
    super();
    this.ambient = ambient;
    this.diffuse = diffuse;
    this.specular = specular;
    this.emissive = emissive;
    this.shininess = shininess;
  }
}

