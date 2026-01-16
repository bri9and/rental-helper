import SwiftUI
import StockBnBShared

struct CartView: View {
    @ObservedObject private var cart = CartManager.shared
    @Environment(\.dismiss) private var dismiss
    @State private var isCheckingOut = false
    @State private var checkoutError: String?
    @State private var showingCheckoutSuccess = false

    var body: some View {
        Group {
            if cart.isEmpty {
                emptyCartView
            } else {
                cartContent
            }
        }
        .navigationTitle("Cart")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Close") {
                    dismiss()
                }
            }

            if !cart.isEmpty {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Clear") {
                        cart.clearCart()
                    }
                    .foregroundColor(.red)
                }
            }
        }
        .alert("Order Placed!", isPresented: $showingCheckoutSuccess) {
            Button("Done") {
                dismiss()
            }
        } message: {
            Text("Your cart has been sent to Amazon. Complete your purchase in the browser.")
        }
        .alert("Checkout Error", isPresented: .constant(checkoutError != nil)) {
            Button("OK") {
                checkoutError = nil
            }
        } message: {
            if let error = checkoutError {
                Text(error)
            }
        }
    }

    private var emptyCartView: some View {
        VStack(spacing: 16) {
            Image(systemName: "cart")
                .font(.system(size: 64))
                .foregroundColor(.secondary)

            Text("Your cart is empty")
                .font(.headline)

            Text("Add supplies from the catalog to get started.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Button("Browse Supplies") {
                dismiss()
            }
            .buttonStyle(.borderedProminent)
            .tint(.green)
        }
        .padding()
    }

    private var cartContent: some View {
        VStack(spacing: 0) {
            List {
                ForEach(cart.items) { item in
                    CartItemRow(item: item)
                }
                .onDelete { indexSet in
                    for index in indexSet {
                        cart.removeFromCart(cart.items[index].product)
                    }
                }
            }
            .listStyle(.plain)

            // Checkout section
            checkoutSection
        }
    }

    private var checkoutSection: some View {
        VStack(spacing: 16) {
            Divider()

            // Order summary
            VStack(spacing: 8) {
                HStack {
                    Text("Subtotal (\(cart.itemCount) items)")
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("$\(cart.totalAmount, specifier: "%.2f")")
                        .font(.headline)
                }

                Text("Shipping & tax calculated at checkout on Amazon")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal)

            // Checkout button
            Button {
                checkout()
            } label: {
                HStack {
                    if isCheckingOut {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "cart.fill")
                    }
                    Text("Checkout with Amazon")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.green)
                .foregroundColor(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .disabled(isCheckingOut)
            .padding(.horizontal)

            // Branding
            HStack(spacing: 4) {
                Image(systemName: "house.fill")
                    .font(.caption)
                Text("Powered by Rental Helper")
                    .font(.caption)
            }
            .foregroundColor(.secondary)
            .padding(.bottom, 8)
        }
        .padding(.vertical)
        .background(Color(.systemBackground))
    }

    private func checkout() {
        guard let amazonURL = cart.generateAmazonCartURL() else {
            checkoutError = "Could not generate Amazon cart URL"
            return
        }

        isCheckingOut = true

        Task {
            do {
                // Save order to backend
                let orderRequest = SaveCartOrderRequest(
                    items: cart.toOrderItems(),
                    totalAmount: cart.totalAmount,
                    amazonCartUrl: amazonURL.absoluteString
                )

                _ = try await APIClient.shared.saveCartOrder(orderRequest)

                // Open Amazon in Safari
                await MainActor.run {
                    UIApplication.shared.open(amazonURL)
                    cart.clearCart()
                    isCheckingOut = false
                    showingCheckoutSuccess = true
                }
            } catch {
                await MainActor.run {
                    isCheckingOut = false
                    checkoutError = "Failed to save order: \(error.localizedDescription)"
                }
            }
        }
    }
}

struct CartItemRow: View {
    let item: CartItem
    @ObservedObject private var cart = CartManager.shared

    var body: some View {
        HStack(spacing: 12) {
            // Product image
            AsyncImage(url: URL(string: item.product.image)) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                default:
                    Rectangle()
                        .fill(Color(.systemGray6))
                        .overlay {
                            Image(systemName: "photo")
                                .foregroundColor(.secondary)
                        }
                }
            }
            .frame(width: 60, height: 60)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            // Product info
            VStack(alignment: .leading, spacing: 4) {
                Text(item.product.name)
                    .font(.subheadline)
                    .lineLimit(2)

                Text("$\(item.product.price, specifier: "%.2f") each")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            // Quantity stepper
            VStack(alignment: .trailing, spacing: 4) {
                HStack(spacing: 12) {
                    Button {
                        cart.updateQuantity(for: item.product, quantity: item.quantity - 1)
                    } label: {
                        Image(systemName: "minus.circle")
                            .font(.title3)
                    }

                    Text("\(item.quantity)")
                        .font(.headline)
                        .frame(minWidth: 20)

                    Button {
                        cart.updateQuantity(for: item.product, quantity: item.quantity + 1)
                    } label: {
                        Image(systemName: "plus.circle")
                            .font(.title3)
                    }
                }
                .foregroundColor(.green)

                Text("$\(item.subtotal, specifier: "%.2f")")
                    .font(.subheadline.weight(.semibold))
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    NavigationStack {
        CartView()
    }
}
