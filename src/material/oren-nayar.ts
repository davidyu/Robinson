///<reference path='material.ts' />

class OrenNayarMaterial extends Material {
  diffuse: gml.Vec4;
  roughness: number;
  constructor( diffuse: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 )
             , roughness: number = 0.5 ) {
    super();
    this.diffuse = diffuse;
    this.roughness = roughness;
  }
}
