// RentalHelperShared
// Shared components for RentalHelper iOS apps

@_exported import Clerk

// Re-export all public types
public enum RentalHelper {
    public static let apiClient = APIClient.shared

    /// The Clerk publishable key for RentalHelper — loaded from Info.plist or environment
    public static let clerkPublishableKey: String = {
        if let key = Bundle.main.object(forInfoDictionaryKey: "CLERK_PUBLISHABLE_KEY") as? String, !key.isEmpty {
            return key
        }
        if let key = ProcessInfo.processInfo.environment["CLERK_PUBLISHABLE_KEY"], !key.isEmpty {
            return key
        }
        #if DEBUG
        return "pk_test_YWxpdmUtbWFjYXF1ZS00My5jbGVyay5hY2NvdW50cy5kZXYk"
        #else
        fatalError("CLERK_PUBLISHABLE_KEY must be set in Info.plist or environment for production builds")
        #endif
    }()

}
