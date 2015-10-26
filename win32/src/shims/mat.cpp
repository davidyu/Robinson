#include <stdint.h>

#include "vec.h"
#include "mat.h"

typedef uint8_t uint8;
typedef uint16_t uint16;
typedef uint32_t uint32;

void transpose( const Mat4 in, Mat4& out ) {
    for ( uint8 i = 0; i < 4; i++ ) {
        for ( uint8 j = 0; j < 4; j++ ) {
            out.data[i][j] = in.data[j][i];
        }
    }
}

void matmul( const Mat4 lhs, const Mat4 rhs, Mat4& out ) {
    for ( uint8 i = 0; i < 4; i++ ) {
        for ( uint8 j = 0; j < 4; j++ ) {
            float sum = 0;
            for ( uint8 k = 0; k < 4; k++ ) {
                sum += lhs.data[i][k] * rhs.data[k][j];
            }
            out.data[i][j] = sum;
        }
    }
}

void vecmat( const Vec4 lhs, const Mat4 rhs, Vec4& out ) {
    for ( uint8 i = 0; i < 4; i++ ) {
       float sum = 0;
       for ( uint8 j = 0; j < 4; j++ ) {
           sum += lhs.data[i] * rhs.data[j][i];
       }
       out.data[i] = sum;
    }
}

Mat4 fromRows( Vec4 r0, Vec4 r1, Vec4 r2, Vec4 r3 ) {
    Mat4 out;
    for ( uint8 i = 0; i < 4; i++ ) {
        out.data[0][i] = r0.data[i];
    }

    for ( uint8 i = 0; i < 4; i++ ) {
        out.data[1][i] = r1.data[i];
    }

    for ( uint8 i = 0; i < 4; i++ ) {
        out.data[2][i] = r2.data[i];
    }

    for ( uint8 i = 0; i < 4; i++ ) {
        out.data[3][i] = r3.data[i];
    }

    return out;
}

Mat4 fromCols( Vec4 c0, Vec4 c1, Vec4 c2, Vec4 c3 ) {
    Mat4 out;
    for ( uint8 i = 0; i < 4; i++ ) {
        out.data[i][0] = c0.data[i];
    }

    for ( uint8 i = 0; i < 4; i++ ) {
        out.data[i][1] = c1.data[i];
    }

    for ( uint8 i = 0; i < 4; i++ ) {
        out.data[i][2] = c2.data[i];
    }

    for ( uint8 i = 0; i < 4; i++ ) {
        out.data[i][3] = c3.data[i];
    }

    return out;
}
