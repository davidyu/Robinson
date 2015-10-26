#include "rasterizer.h"

#include "vec.h"
#include "vertex_shader.h"
#include "fragment_shader.h"

Rasterizer::Rasterizer( int width, int height )
    : VS( null )
    , FS( null )
    , Framebuffer( null )
    , Backbuffer( null )
    , Depthbuffer( null ) {

}

Rasterizer::~Rasterizer() {}

u8 * Rasterizer::GetImage() {
    return Framebuffer;
}
