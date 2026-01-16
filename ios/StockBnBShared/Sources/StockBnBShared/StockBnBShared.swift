// RentalHelperShared
// Shared components for RentalHelper iOS apps

@_exported import Clerk

// Re-export all public types
public enum RentalHelper {
    public static let apiClient = APIClient.shared

    /// The Clerk publishable key for RentalHelper
    public static let clerkPublishableKey = "pk_test_YWxpdmUtbWFjYXF1ZS00My5jbGVyay5hY2NvdW50cy5kZXYk"
}
