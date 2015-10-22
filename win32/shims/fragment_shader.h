#include "vertex_shader.h"

struct FS_OUT {
    Color color;
};

class FragmentShader {
public:
    virtual FS_OUT shade( VS_OUT in ) = 0;
};
