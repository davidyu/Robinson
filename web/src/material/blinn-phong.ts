///<reference path='material.ts' />
class BlinnPhongMaterial extends Material {
  ambient: gml.Vec4;
  diffuse: gml.Vec4;
  specular: gml.Vec4;
  emissive: gml.Vec4;
  shininess: number;
  constructor( ambient: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 )
             , diffuse: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 )
             , specular: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 )
             , emissive: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 )
             , shininess: number = 1.0 ) {
    super();
    this.ambient = ambient;
    this.diffuse = diffuse;
    this.specular = specular;
    this.emissive = emissive;
    this.shininess = shininess;
  }
}

