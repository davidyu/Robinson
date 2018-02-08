// Implementation heavily based on josephg's noisejs, which is based on Stefan Gustavson's implementation.
// Source:
//  https://github.com/josephg/noisejs/blob/master/perlin.js

class Noise {
  perm: number[];
  grad3: gml.Vec3[];
  gradP: gml.Vec3[];
  p: number[];

  worleyFeaturePoints: gml.Vec3[];

  constructor() {
    this.grad3 = [ new gml.Vec3(1,1,0), new gml.Vec3(-1,1,0), new gml.Vec3(1,-1,0), new gml.Vec3(-1,-1,0)
                 , new gml.Vec3(1,0,1), new gml.Vec3(-1,0,1), new gml.Vec3(1,0,-1), new gml.Vec3(-1,0,-1)
                 , new gml.Vec3(0,1,1), new gml.Vec3(0,-1,1), new gml.Vec3(0,1,-1), new gml.Vec3(0,-1,-1) ];

    this.p = [151,160,137,91,90,15,
              131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
              190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
              88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
              77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
              102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
              135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
              5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
              223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
              129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
              251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
              49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
              138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

    // "allocate" space
    this.perm  = new Array( 512 );
    this.gradP = new Array( 512 );

    this.seed( 0 );

    // generate random feature points for Worley noise
    this.worleySeed = 12345;
  }

  // josephg: This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  seed( seed: number ) {
    if(seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    for(var i = 0; i < 256; i++) {
      var v;
      if (i & 1) {
        v = this.p[i] ^ (seed & 255);
      } else {
        v = this.p[i] ^ ((seed>>8) & 255);
      }

      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }

  fade( t: number ) {
    return t*t*t*(t*(t*6-15)+10);
  }

  lerp( a: number, b: number, t: number ) {
    return (1-t)*a + t*b;
  }

  worley3Texture( gl: WebGL2RenderingContext, size: number ): WebGLTexture {
    //2. Generate a reproducible random number generator for the cube
    let random = this.lcgRandom( this.worleySeed );

    this.worleyFeaturePoints = [];
    let numFP = 64;

    for ( let i = 0; i < numFP; i++ ) {
      let x = Math.sin( i + 1 ) * random;
      let y = Math.cos( i + 1 ) * random;
      let z = Math.sin ( 2 * i + 1 ) * random;

      let featurePointX = size * ( x - Math.floor( x ) );
      let featurePointY = size * ( y - Math.floor( y ) );
      let featurePointZ = size * ( z - Math.floor( z ) );

      this.worleyFeaturePoints.push( new gml.Vec3( featurePointX, featurePointY, featurePointZ ) );
    }

    let rgb = [];
    for ( let z = 0; z < size; z++ ) {
      for ( let y = 0; y < size; y++ ) {
        for ( let x = 0; x < size; x++ ) {
          let n = 1.0 - this.worley3( x, y, z ) / ( 0.5 * size );
          rgb.push( n * 255 ); // R
          rgb.push( n * 255 ); // G
          rgb.push( n * 255 ); // B
        }
      }
    }

    let data = new Uint8Array( rgb );
    let noiseTexture = gl.createTexture();

    gl.bindTexture( gl.TEXTURE_3D, noiseTexture );

    // no mips
    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0 );
    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 0 );
    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texImage3D   ( gl.TEXTURE_3D, 0, gl.RGB, size, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, data );
    gl.bindTexture  ( gl.TEXTURE_3D, null );

    return noiseTexture;
  }

  perlin3Texture( gl: WebGL2RenderingContext, size: number ): WebGLTexture {
    let rgb = [];
    for ( let z = 0; z < size; z++ ) {
      for ( let y = 0; y < size; y++ ) {
        for ( let x = 0; x < size; x++ ) {
          let n = this.perlin3( x * 1.001, y * 1.001, z * 1.001, size - 1 );
          rgb.push( n * 255 ); // R
          rgb.push( n * 255 ); // G
          rgb.push( n * 255 ); // B
        }
      }
    }

    let data = new Uint8Array( rgb );
    let noiseTexture = gl.createTexture();

    gl.bindTexture( gl.TEXTURE_3D, noiseTexture );

    // no mips
    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0 );
    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 0 );
    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
    gl.texParameteri( gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    gl.texImage3D   ( gl.TEXTURE_3D, 0, gl.RGB, size, size, size, 0, gl.RGB, gl.UNSIGNED_BYTE, data );
    gl.bindTexture  ( gl.TEXTURE_3D, null );

    return noiseTexture;
  }

  perlin3( x, y, z, period: number = 255 ) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    // Get relative xyz coordinates of point within that cell
    x = x - X; y = y - Y; z = z - Z;
    // Wrap the integer cells at specified period
    X = X & period; Y = Y & period; Z = Z & period;

    // Calculate noise contributions from each of the eight corners
    var n000 = this.gradP[X+  this.perm[Y+  this.perm[Z  ]]].dot3(x,   y,     z);
    var n001 = this.gradP[X+  this.perm[Y+  this.perm[Z+1]]].dot3(x,   y,   z-1);
    var n010 = this.gradP[X+  this.perm[Y+1+this.perm[Z  ]]].dot3(x,   y-1,   z);
    var n011 = this.gradP[X+  this.perm[Y+1+this.perm[Z+1]]].dot3(x,   y-1, z-1);
    var n100 = this.gradP[X+1+this.perm[Y+  this.perm[Z  ]]].dot3(x-1,   y,   z);
    var n101 = this.gradP[X+1+this.perm[Y+  this.perm[Z+1]]].dot3(x-1,   y, z-1);
    var n110 = this.gradP[X+1+this.perm[Y+1+this.perm[Z  ]]].dot3(x-1, y-1,   z);
    var n111 = this.gradP[X+1+this.perm[Y+1+this.perm[Z+1]]].dot3(x-1, y-1, z-1);

    // Compute the fade curve value for x, y, z
    var u = this.fade(x);
    var v = this.fade(y);
    var w = this.fade(z);

    // Interpolate
    return this.lerp( this.lerp(
                        this.lerp(n000, n100, u),
                        this.lerp(n001, n101, u), w),
                      this.lerp(
                        this.lerp(n010, n110, u),
                        this.lerp(n011, n111, u), w),
                     v );
  }

  probLookup( value: number ) {
    if (value < 393325350)  return 1;
    if (value < 1022645910) return 2;
    if (value < 1861739990) return 3;
    if (value < 2700834071) return 4;
    if (value < 3372109335) return 5;
    if (value < 3819626178) return 6;
    if (value < 4075350088) return 7;
    if (value < 4203212043) return 8;
    return 9;
  }

  lcgRandom( lastValue ): number {
    return ( ( 1103515245 * lastValue + 12345 ) % 0x100000000 );
  }

  hash( x, y, z ): number {
    return ( ( ( ( ( 2166136261 ^ x ) * 16777619 ) ^ y ) * 16777619 ) ^ z ) * 16777619;
  }

  worleySeed: number = 0;

  worley3( x, y, z, period: number = 255 ) {
    let closest = Number.MAX_VALUE;
    for ( let i = 0; i < this.worleyFeaturePoints.length; i++ ) {
      let dx = ( this.worleyFeaturePoints[i].x - x ) * ( this.worleyFeaturePoints[i].x - x );
      let dy = ( this.worleyFeaturePoints[i].y - y ) * ( this.worleyFeaturePoints[i].y - y );
      let dz = ( this.worleyFeaturePoints[i].z - z ) * ( this.worleyFeaturePoints[i].z - z );
      let dist = Math.sqrt( dx + dy + dz );
      if ( closest > dist ) {
        closest = dist;
      }
    }

    return closest;
  }
}

/*
 * License from josephg/noisejs:
 *
 *  ISC License
 *  
 *  Copyright (c) 2013, Joseph Gentle
 *  
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *  
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
 *  OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
