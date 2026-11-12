import SwiftUI
import UniformTypeIdentifiers
import WebKit

@main
struct CafeApp: App {
    var body: some Scene {
        WindowGroup {
            if let folder = Bundle.main.url(forResource: "Web", withExtension: nil) {
                BundledCafeView(folder: folder)
                    .background(Color(red: 0.96, green: 0.91, blue: 0.85))
            } else {
                Text("Die Spieldateien fehlen in diesem Testbuild.")
            }
        }
    }
}

struct BundledCafeView: UIViewRepresentable {
    let folder: URL

    func makeCoordinator() -> CafeNavigationDelegate {
        CafeNavigationDelegate()
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.setURLSchemeHandler(CafeAssets(folder: folder), forURLScheme: CafeAssets.scheme)

        let view = WKWebView(frame: .zero, configuration: config)
        view.navigationDelegate = context.coordinator
        view.allowsBackForwardNavigationGestures = false
        view.load(URLRequest(url: CafeAssets.entry))
        return view
    }

    func updateUIView(_ view: WKWebView, context: Context) {}
}

final class CafeNavigationDelegate: NSObject, WKNavigationDelegate {
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        if let url = action.request.url, CafeAssets.isLocal(url) {
            decisionHandler(.allow)
        } else {
            decisionHandler(.cancel)
        }
    }
}

final class CafeAssets: NSObject, WKURLSchemeHandler {
    static let scheme = "cafe-offline"
    static let entry = URL(string: "cafe-offline://localhost/index.html")!
    private let folder: URL

    init(folder: URL) {
        self.folder = folder.standardizedFileURL.resolvingSymlinksInPath()
    }

    static func isLocal(_ url: URL) -> Bool {
        url.scheme == scheme && url.host == "localhost" && url.port == nil
    }

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url, Self.isLocal(url) else {
            task.didFailWithError(URLError(.unsupportedURL))
            return
        }
        let relativePath = url.path == "/" ? "index.html" : String(url.path.dropFirst())
        let file = folder.appendingPathComponent(relativePath)
            .standardizedFileURL.resolvingSymlinksInPath()
        guard file.path.hasPrefix(folder.path + "/"),
              let info = try? file.resourceValues(forKeys: [.isRegularFileKey]),
              info.isRegularFile == true else {
            task.didFailWithError(URLError(.fileDoesNotExist))
            return
        }
        do {
            let data = try Data(contentsOf: file, options: [.mappedIfSafe])
            let ext = file.pathExtension.lowercased()
            let mime: String
            switch ext {
            case "html": mime = "text/html"
            case "css": mime = "text/css"
            case "js", "mjs": mime = "text/javascript"
            case "svg": mime = "image/svg+xml"
            default: mime = UTType(filenameExtension: ext)?.preferredMIMEType ?? "application/octet-stream"
            }
            task.didReceive(URLResponse(
                url: url,
                mimeType: mime,
                expectedContentLength: data.count,
                textEncodingName: mime.hasPrefix("text/") ? "utf-8" : nil
            ))
            task.didReceive(data)
            task.didFinish()
        } catch {
            task.didFailWithError(error)
        }
    }

    // Each bundled request finishes synchronously in start.
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}
