import AppKit

class WindowDelegate: NSObject, NSWindowDelegate {
    func windowWillClose( notification: NSNotification ) {
        NSApplication.sharedApplication().terminate(0)
    }

    func windowDidResize( notification: NSNotification ) {
        let window = notification.object as! NSWindow
        window.backgroundColor = NSColor( red   : CGFloat( 1.0 )
                                        , green : CGFloat( 0.0 )
                                        , blue  : CGFloat( 0.0 )
                                        , alpha : CGFloat( 1.0 )
                                        )
    }
}

class ApplicationDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow
    var renderTimer: NSTimer?
    var renderer: Renderer

    init( window: NSWindow ) {
        self.window = window
        self.renderer = Renderer( window: self.window )
    }

    func applicationDidFinishLaunching( notification: NSNotification ) {
        self.renderTimer = NSTimer( timeInterval: (1.0/60)
                                  , target: self
                                  , selector: "renderTimerFired"
                                  , userInfo: nil
                                  , repeats: true )

        NSRunLoop.currentRunLoop().addTimer( self.renderTimer!
                                           , forMode: NSDefaultRunLoopMode )
        NSRunLoop.currentRunLoop().addTimer( self.renderTimer!
                                           , forMode: NSEventTrackingRunLoopMode )
    }

    func renderTimerFired() {
        self.renderer.draw()
    }
}

func main(args: [String]) -> Int {
    let app: NSApplication = NSApplication.sharedApplication()
    app.setActivationPolicy( NSApplicationActivationPolicy.Regular ) // this tells OS X that this is a standard application that appears in the dock

    let window: NSWindow = NSWindow( contentRect : NSMakeRect( 0, 0, 800, 600 )
                                   , styleMask   : NSTitledWindowMask | NSClosableWindowMask | NSResizableWindowMask
                                   , backing     : NSBackingStoreType.Buffered
                                   , `defer`     : true )

    window.center()
    window.title = "Robinson demo"
    window.makeKeyAndOrderFront( window )

    let windDelegate = WindowDelegate()
    window.delegate = windDelegate

    let appDelegate = ApplicationDelegate( window: window )

    if appDelegate.renderer.ready {
        let view = appDelegate.renderer.view!
        window.contentView = view
    }

    app.delegate = appDelegate
    app.activateIgnoringOtherApps( true )
    app.run()

    return 0
}
