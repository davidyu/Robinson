//
// light.ts
// user editable light base interface

class Light {
  position: gml.Vec4;
  enabled: boolean;
  color: gml.Vec4;
  radius: number;

  constructor() {
    this.position = new gml.Vec4( 0, 0, 0, 1 );
    this.enabled = true;
    this.color = new gml.Vec4( 1, 1, 1, 1 );
    this.radius = 1;
  }
}

class PointLight extends Light {
  constructor( position: gml.Vec4, color: gml.Vec4, radius: number = 1 ) {
    super();
    this.position = position;
    this.color = color;
    this.radius = radius;
  }
}
