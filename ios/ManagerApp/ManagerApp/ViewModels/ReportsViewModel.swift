import Foundation
import StockBnBShared

@MainActor
class ReportsViewModel: ObservableObject {
    @Published var reports: [RecentReport] = []
    @Published var isLoading = false
    @Published var error: String?

    func loadReports() async {
        isLoading = true
        error = nil

        do {
            reports = try await APIClient.shared.fetchRecentReports()
        } catch let apiError as APIError {
            error = apiError.error
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}
