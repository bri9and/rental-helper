import Foundation
import StockBnBShared

@MainActor
class PropertiesViewModel: ObservableObject {
    @Published var properties: [Property] = []
    @Published var isLoading = false
    @Published var error: String?

    func loadProperties() async {
        isLoading = true
        error = nil

        do {
            properties = try await APIClient.shared.fetchProperties()
        } catch let apiError as APIError {
            error = apiError.error
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}
