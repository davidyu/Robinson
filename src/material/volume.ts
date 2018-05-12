///<reference path='material.ts' />
class VolumeMaterial extends Material {
  layer: number;
  volumeTexture: WebGLTexture;

  constructor( volumeTexture: WebGLTexture ) {
    super();
    this.layer = 0;
    this.volumeTexture = volumeTexture;
  }
}
