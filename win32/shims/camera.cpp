#include "camera.h"

// the view matrix is inv( CameraBasis ) * (-CameraTranslation)
// to understand why, recall that a view matrix transforms vectors from world
// space into eye space. To do this, we multiply the world space position by
// the inverse eye basis. Then we move everything by the inverse of the eye
// translation (or the result of negating the camera position)
Mat4 Camera::GetViewMatrix() {
    auto xaxis = right;
    auto yaxis = up;
    auto zaxis = aim;

    // TODO make sure this matrix is orthonormal/
    // we want the inverse of the camera orientation, but because we know this matrix is orthonormal, we can just transpose it
    Mat4 inverseEyeBasis = fromRows( xaxis, yaxis, zaxis, Vec4( 0, 0, 0, 1 ) );
    Mat4 inverseEyeTranslate = fromCols( Vec4( 1, 0, 0, 0 ), Vec4( 0, 1, 0, 0 ), Vec4( 0, 0, 1, 0 ), Vec4( -pos.x, -pos.y, -pos.z, 1 ) );

    Mat4 viewMatrix = inverseEyeBasis * inverseEyeTranslate;
    return viewMatrix;
}
