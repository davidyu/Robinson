import AppKit
import Foundation
import Metal
import MetalKit

class Renderer {
    var ready: Bool
    var view: MTKView?

    init( window: NSWindow ) {
        let device = MTLCreateSystemDefaultDevice()
        view = MTKView( frame: window.contentLayoutRect
                      , device: device )
        ready = true
    }

    func draw() {
    }
}
