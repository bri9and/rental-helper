import SwiftUI
import StockBnBShared

struct SuppliesListView: View {
    @StateObject private var viewModel = SuppliesViewModel()
    @ObservedObject private var cart = CartManager.shared
    @State private var searchText = ""
    @State private var selectedCategory: String? = nil
    @State private var showingCart = false
    @State private var showingHistory = false

    var filteredProducts: [SupplyProduct] {
        var products = viewModel.products

        if let category = selectedCategory {
            products = products.filter { $0.category == category }
        }

        if !searchText.isEmpty {
            products = products.filter {
                $0.name.localizedCaseInsensitiveContains(searchText) ||
                $0.description.localizedCaseInsensitiveContains(searchText)
            }
        }

        return products
    }

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.products.isEmpty {
                LoadingView(message: "Loading supplies...")
            } else if let error = viewModel.error {
                ErrorView(message: error) {
                    Task { await viewModel.loadSupplies() }
                }
            } else if viewModel.products.isEmpty {
                EmptyStateView(
                    icon: "bag",
                    title: "No Supplies",
                    message: "Supplies catalog is not available."
                )
            } else {
                suppliesContent
            }
        }
        .navigationTitle("Supplies")
        .searchable(text: $searchText, prompt: "Search supplies")
        .refreshable {
            await viewModel.loadSupplies()
        }
        .task {
            await viewModel.loadSupplies()
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                HStack(spacing: 16) {
                    Button {
                        showingHistory = true
                    } label: {
                        Image(systemName: "clock.arrow.circlepath")
                    }

                    Button {
                        showingCart = true
                    } label: {
                        ZStack(alignment: .topTrailing) {
                            Image(systemName: "cart")
                            if cart.itemCount > 0 {
                                Text("\(cart.itemCount)")
                                    .font(.caption2.bold())
                                    .foregroundColor(.white)
                                    .frame(minWidth: 16, minHeight: 16)
                                    .background(Color.green)
                                    .clipShape(Circle())
                                    .offset(x: 8, y: -8)
                            }
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showingCart) {
            NavigationStack {
                CartView()
            }
        }
        .sheet(isPresented: $showingHistory) {
            NavigationStack {
                OrderHistoryView()
            }
        }
    }

    private var suppliesContent: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Category filter
                categoryPicker

                // Products grid
                LazyVGrid(columns: [
                    GridItem(.flexible(), spacing: 12),
                    GridItem(.flexible(), spacing: 12)
                ], spacing: 12) {
                    ForEach(filteredProducts) { product in
                        ProductCard(product: product)
                    }
                }
                .padding(.horizontal)

                // Affiliate disclosure
                Text("As an Amazon Associate, we earn from qualifying purchases.")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .padding(.top, 16)
                    .padding(.bottom, 32)
            }
        }
    }

    private var categoryPicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                CategoryChip(
                    title: "All",
                    isSelected: selectedCategory == nil
                ) {
                    selectedCategory = nil
                }

                ForEach(viewModel.categories, id: \.self) { category in
                    CategoryChip(
                        title: category,
                        isSelected: selectedCategory == category
                    ) {
                        selectedCategory = category
                    }
                }
            }
            .padding(.horizontal)
        }
    }
}

struct CategoryChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.weight(.medium))
                .foregroundColor(isSelected ? .white : .primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.green : Color(.systemGray5))
                .clipShape(Capsule())
        }
    }
}

struct ProductCard: View {
    let product: SupplyProduct
    @ObservedObject private var cart = CartManager.shared

    var quantityInCart: Int {
        cart.quantity(for: product)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Product image
            AsyncImage(url: URL(string: product.image)) { phase in
                switch phase {
                case .empty:
                    Rectangle()
                        .fill(Color(.systemGray6))
                        .overlay {
                            ProgressView()
                        }
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                case .failure:
                    Rectangle()
                        .fill(Color(.systemGray6))
                        .overlay {
                            Image(systemName: "photo")
                                .foregroundColor(.secondary)
                        }
                @unknown default:
                    EmptyView()
                }
            }
            .frame(height: 120)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            // Product info
            VStack(alignment: .leading, spacing: 4) {
                Text(product.name)
                    .font(.subheadline.weight(.medium))
                    .lineLimit(2)
                    .frame(minHeight: 40, alignment: .top)

                Text(product.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)

                HStack {
                    Text("$\(product.price, specifier: "%.2f")")
                        .font(.headline)
                        .foregroundColor(.green)

                    Spacer()
                }
            }

            // Add to cart button or quantity stepper
            if quantityInCart == 0 {
                Button {
                    cart.addToCart(product)
                } label: {
                    HStack {
                        Image(systemName: "cart.badge.plus")
                        Text("Add")
                    }
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.green)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            } else {
                HStack {
                    Button {
                        cart.updateQuantity(for: product, quantity: quantityInCart - 1)
                    } label: {
                        Image(systemName: "minus.circle.fill")
                            .font(.title2)
                            .foregroundColor(.green)
                    }

                    Spacer()

                    Text("\(quantityInCart)")
                        .font(.headline)
                        .frame(minWidth: 30)

                    Spacer()

                    Button {
                        cart.addToCart(product)
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                            .foregroundColor(.green)
                    }
                }
                .padding(.vertical, 6)
                .padding(.horizontal, 8)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
    }
}

#Preview {
    NavigationStack {
        SuppliesListView()
    }
}
