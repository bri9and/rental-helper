import Foundation
import StockBnBShared

@MainActor
class SuppliesViewModel: ObservableObject {
    @Published var products: [SupplyProduct] = []
    @Published var categories: [String] = []
    @Published var isLoading = false
    @Published var error: String?

    func loadSupplies() async {
        isLoading = true
        error = nil

        do {
            let response = try await APIClient.shared.fetchSupplies()
            products = response.products
            categories = response.categories
            // Update cart manager with associate tag
            CartManager.shared.amazonAssociateTag = response.amazonAssociateTag
        } catch let apiError as APIError {
            error = apiError.error
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func products(in category: String) -> [SupplyProduct] {
        products.filter { $0.category == category }
    }
}
