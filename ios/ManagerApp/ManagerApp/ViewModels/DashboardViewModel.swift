import Foundation
import StockBnBShared

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var stats: DashboardStats?
    @Published var isLoading = false
    @Published var error: String?

    func loadStats() async {
        isLoading = true
        error = nil

        do {
            stats = try await APIClient.shared.fetchDashboardStats()
        } catch let apiError as APIError {
            error = apiError.error
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}
