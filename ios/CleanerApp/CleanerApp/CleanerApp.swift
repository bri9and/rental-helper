import SwiftUI
import StockBnBShared
import ClerkSDK

@main
struct CleanerApp: App {
    init() {
        Clerk.configure(publishableKey: StockBnB.clerkPublishableKey)
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
