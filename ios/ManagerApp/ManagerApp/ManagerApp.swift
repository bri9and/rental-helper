import SwiftUI
import StockBnBShared

@main
struct ManagerApp: App {
    init() {
        Clerk.shared.configure(publishableKey: RentalHelper.clerkPublishableKey)
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
