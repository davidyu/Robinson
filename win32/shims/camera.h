#include "vec.h"
#include "mat.h"

class Camera {
    Point3 pos;
    Vec4 aim;
    Vec4 right;
    Vec4 up;

    Mat4 GetViewMatrix();
};
