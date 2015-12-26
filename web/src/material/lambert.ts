///<reference path='material.ts' />

class LambertMaterial extends Material {
  diffuse: gml.Vec4;
  constructor( diffuse: gml.Vec4 = new gml.Vec4( 0.5, 0.5, 0.5, 1 ) ) {
    super();
    this.diffuse = diffuse;
  }
}
