//
// light.ts
// user editable light base interface

class Light {
  position: TSM.vec4;
  enabled: boolean;
  color: TSM.vec4;

  constructor() {
    this.position = new TSM.vec4( [ 0, 0, 0, 1 ] );
    this.enabled = true;
    this.color = new TSM.vec4( [ 1, 1, 1, 1 ] );
  }
}

class PointLight extends Light {
  constructor( position: TSM.vec4, color: TSM.vec4 ) {
    super();
    this.position = position;
    this.color = color;
  }
}
