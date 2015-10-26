#ifndef DOTS_VECTOR_H
#define DOTS_VECTOR_H

template <int n> struct Vec {
    float data[n];
};

template<> struct Vec<4> {
    union {
        float data[4];
        struct { float x, y, z, w; };
        struct { float r, g, b, a; };
    };

    Vec( float x, float y, float z, float w ) {
        x = x;
        y = y;
        z = z;
        w = w;
    }

    Vec() {
        x = 0;
        y = 0;
        z = 0;
        w = 0;
    }
};

typedef Vec<4> Vec4;
typedef Vec<4> Color;

// points are fundamentally different from vectors, let the compiler/typechecker
// prevent me from interchanging them

template <int n> struct Point {
    float data[n];
};

template<> struct Point<3> {
    union {
        float data[3];
        struct { float x, y, z; };
    };
};

typedef Point<3> Point3;

#endif
