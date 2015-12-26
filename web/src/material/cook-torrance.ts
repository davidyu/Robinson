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
}
