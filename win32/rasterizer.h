//
// The software rasterizer
//

#include "types.inc"

class VertexShader;
class FragmentShader;

class Rasterizer {
private:
    VertexShader   * VS;
    FragmentShader * FS;

    u8  * Framebuffer;
    u8  * Backbuffer;
    u32 * Depthbuffer;
public:
    u8 * GetImage( void );

    Rasterizer( int width, int height );
    ~Rasterizer();
};
