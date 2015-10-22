#ifndef DOTS_VECTOR_H
struct Vec4;
#endif

#ifndef DOTS_MATRIX_H
#define DOTS_MATRIX_H

template <int rows, int cols> struct Mat {
    union {
        float data[rows][cols];
        float flat[rows * cols];
    };
};

template<> struct Mat<4,4> {
    union {
        float data[4][4];
        float flat[16];
        struct { float m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33; };
        struct { float r00, r01, r02,  tx, r10, r11, r12,  ty, r20, r21, r22,  tz, m30, m31, m32, m33; };
        struct { float  sx, m01, m02, m03, m10,  sy, m12, m13, m20, m21,  sz, m23, m30, m31, m32, m33; };
    };
};

typedef Mat<4,4> Mat4;

void transpose( const Mat4 in, Mat4& out );
void matmul( const Mat4 lhs, const Mat4 rhs, Mat4& out );
void vecmat( const Vec4 lhs, const Mat4 rhs, Vec4& out );

Mat4 fromRows( Vec4 r0, Vec4 r1, Vec4 r2, Vec4 r3 );
Mat4 fromCols( Vec4 c0, Vec4 c1, Vec4 c2, Vec4 c3 );

inline Mat4 operator *( const Mat4& lhs, const Mat4& rhs ) {
    Mat4 out;
    matmul( lhs, rhs, out );
    return out;
}

inline Vec4 operator *( const Vec4& lhs, const Mat4& rhs ) {
    Vec4 out;
    vecmat( lhs, rhs, out );
    return out;
}

#endif
