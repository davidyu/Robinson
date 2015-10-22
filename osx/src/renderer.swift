import AppKit
import OpenGL.GL3
import Foundation

class Renderer {
    var ready: Bool
    var glview: NSOpenGLView?
    var context: NSOpenGLContext?
    var colorFrameBuffer: GLuint;

    init( window: NSWindow ) {
        colorFrameBuffer = GLuint();

        let attr: [NSOpenGLPixelFormatAttribute] = [ UInt32( NSOpenGLPFADoubleBuffer )
                                                   , UInt32( NSOpenGLPFAColorSize ), UInt32( 32 )
                                                   , UInt32( NSOpenGLPFADepthSize ), UInt32( 32 )
                                                   , UInt32( 0 )
                                                   ]

        let fmt = NSOpenGLPixelFormat( attributes: attr )
        glview = NSOpenGLView( frame      : window.frame
                             , pixelFormat: fmt )

        context = NSOpenGLContext( format: fmt
                                 , shareContext: nil )

        ready = true
        ready = ( glview != nil && context != nil )

        self.compileShaders()
    }

    func compileShader( filename: String, type: Int32 ) {
        func getFileExtension( type: Int32 ) -> String {
            switch ( type ) {
            case GL_FRAGMENT_SHADER: return "frag"
            case GL_VERTEX_SHADER:   return "vert"
            default:                 return ""
            }
        }

        var extensionType = getFileExtension( type )

        var path = NSBundle.mainBundle().pathForResource( "shaders/" + filename, ofType: "frag" )
        var error: NSError? = nil
        var contents = String( contentsOfFile: path!, encoding: NSUTF8StringEncoding, error: &error )

        if contents == nil {
            println( "failed to read contents of shader file: " )
        }

        var shaderHandle: GLuint = glCreateShader( GLenum( type ) )
        let shaderContent = (contents! as NSString ).UTF8String
        let shaderLength = UnsafeMutablePointer<GLint>.alloc( 1 )
        shaderLength.initialize( GLint( count( contents! ) ) )

        glShaderSource( shaderHandle, GLsizei( 1 ), UnsafePointer( shaderContent ), shaderLength )
        glCompileShader( shaderHandle )

        shaderLength.dealloc( 1 )

        var compileSuccess: GLint = GLint()
        glGetShaderiv( shaderHandle, GLenum( GL_COMPILE_STATUS ), &compileSuccess )

        if compileSuccess == GL_FALSE {
            println("Failed to compile shader!")
        }
    }

    func compileShaders() {
        self.compileShader( "test", type: GL_FRAGMENT_SHADER )
        self.compileShader( "test", type: GL_VERTEX_SHADER )
    }

    func draw() {
        context!.makeCurrentContext()

        glClearColor( 1.0, 0.0, 0.0, 1.0 )
        glClearDepth( 1.0 );
        glClear( UInt32( GL_COLOR_BUFFER_BIT ) | UInt32( GL_DEPTH_BUFFER_BIT ) )

        glEnable( GLenum( GL_DEPTH_TEST ) )
        glDepthFunc( GLenum( GL_LEQUAL ) )

        context!.flushBuffer()
    }
}
