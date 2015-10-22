#include <math.h>
#include "vec.h"
#include "frustum.h"

// this is identical to a conventional OpenGL projection matrix, which
// assumes a symmetric view frustum (top = -bottom, left = -right) 
Mat4 ViewFrustum::GetProjectionMatrix() {

    float d = 1 / tan( fovyRad / 2 );
    float A = - ( zFar + zNear ) / ( zFar - zNear );
    float B = - 2 * zFar * zNear / ( zFar - zNear );

    Mat4 projectionMatrix = fromRows( Vec4( d / aspectRatio, 0, 0, 0 )
                                     , Vec4( 0, d, 0, 0 )
                                     , Vec4( 0, 0, A, B )
                                     , Vec4( 0, 0, -1, 0 ) );

    return projectionMatrix;
}
