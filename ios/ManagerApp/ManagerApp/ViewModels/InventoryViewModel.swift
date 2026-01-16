import Foundation
import StockBnBShared

@MainActor
class InventoryViewModel: ObservableObject {
    @Published var items: [WarehouseItem] = []
    @Published var isLoading = false
    @Published var error: String?

    func loadInventory() async {
        isLoading = true
        error = nil

        do {
            items = try await APIClient.shared.fetchInventory()
        } catch let apiError as APIError {
            error = apiError.error
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}
