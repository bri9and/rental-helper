import Foundation
import StockBnBShared

@MainActor
class CartManager: ObservableObject {
    static let shared = CartManager()

    @Published var items: [CartItem] = []
    @Published var amazonAssociateTag: String = "rentalhelper-20"

    var itemCount: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    var totalAmount: Double {
        items.reduce(0) { $0 + $1.subtotal }
    }

    var isEmpty: Bool {
        items.isEmpty
    }

    private init() {}

    func addToCart(_ product: SupplyProduct) {
        if let index = items.firstIndex(where: { $0.product.id == product.id }) {
            items[index].quantity += 1
        } else {
            items.append(CartItem(product: product, quantity: 1))
        }
    }

    func removeFromCart(_ product: SupplyProduct) {
        items.removeAll { $0.product.id == product.id }
    }

    func updateQuantity(for product: SupplyProduct, quantity: Int) {
        if quantity <= 0 {
            removeFromCart(product)
        } else if let index = items.firstIndex(where: { $0.product.id == product.id }) {
            items[index].quantity = quantity
        }
    }

    func clearCart() {
        items.removeAll()
    }

    func quantity(for product: SupplyProduct) -> Int {
        items.first(where: { $0.product.id == product.id })?.quantity ?? 0
    }

    // Generate Amazon Add-to-Cart URL with all items
    func generateAmazonCartURL() -> URL? {
        guard !items.isEmpty else { return nil }

        var components = URLComponents(string: "https://www.amazon.com/gp/aws/cart/add.html")
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "AssociateTag", value: amazonAssociateTag)
        ]

        for (index, item) in items.enumerated() {
            let position = index + 1
            queryItems.append(URLQueryItem(name: "ASIN.\(position)", value: item.product.amazonAsin))
            queryItems.append(URLQueryItem(name: "Quantity.\(position)", value: String(item.quantity)))
        }

        components?.queryItems = queryItems
        return components?.url
    }

    // Convert cart items to OrderItems for API submission
    func toOrderItems() -> [OrderItem] {
        items.map { cartItem in
            OrderItem(
                productId: cartItem.product.id,
                amazonAsin: cartItem.product.amazonAsin,
                name: cartItem.product.name,
                quantity: cartItem.quantity,
                price: cartItem.product.price
            )
        }
    }
}
