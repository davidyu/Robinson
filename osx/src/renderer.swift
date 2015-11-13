import AppKit
import Foundation
import Metal
import MetalKit

class Renderer {
    var ready: Bool
    var view: MTKView?

    init( window: NSWindow ) {
        let device = MTLCreateSystemDefaultDevice()
        ready = true
    }

    func draw() {
    }
}
