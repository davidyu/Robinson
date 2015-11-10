// simple angle interface with explicit constructors to reduce
// user confusion

interface Angle {
  toDegrees(): number;
  toRadians(): number;
}

function fromRadians( rad: number ): Angle {
  return new Radian( rad );
}

function fromDegrees( deg: number ): Angle {
  return new Degree( deg );
}

// implementation detail; no need to care about these classes
class Degree implements Angle {
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

class Radian implements Angle {
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
