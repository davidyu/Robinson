// simple angle interface with explicit constructors to reduce
// user confusion

module gml {
  export interface Angle {
    toDegrees(): number;
    toRadians(): number;
  }

  export function fromRadians( rad: number ): Angle {
    return new Radian( rad );
  }

  export function fromDegrees( deg: number ): Angle {
    return new Degree( deg );
  }

  // implementation detail; no need to care about these classes
  export class Degree implements Angle {
    v: number;

    constructor( deg: number ) {
      this.v = deg;
    }

    toDegrees(): number {
      return this.v;
    }

    toRadians(): number {
      return this.v * Math.PI / 180;
    }
  }

  export class Radian implements Angle {
    v: number;

    constructor( rad: number ) {
      this.v = rad;
    }

    toRadians(): number {
      return this.v;
    }

    toDegrees(): number {
      return this.v * 180 / Math.PI;
    }
  }
}
