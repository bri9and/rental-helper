import SwiftUI
import StockBnBShared

struct InventoryListView: View {
    @StateObject private var viewModel = InventoryViewModel()
    @State private var searchText = ""

    var filteredItems: [WarehouseItem] {
        if searchText.isEmpty {
            return viewModel.items
        }
        return viewModel.items.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.sku.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.items.isEmpty {
                LoadingView(message: "Loading inventory...")
            } else if let error = viewModel.error {
                ErrorView(message: error) {
                    Task { await viewModel.loadInventory() }
                }
            } else if viewModel.items.isEmpty {
                EmptyStateView(
                    icon: "shippingbox",
                    title: "No Inventory Items",
                    message: "Your warehouse is empty. Add items from the web dashboard."
                )
            } else {
                inventoryList
            }
        }
        .navigationTitle("Inventory")
        .searchable(text: $searchText, prompt: "Search items")
        .refreshable {
            await viewModel.loadInventory()
        }
        .task {
            await viewModel.loadInventory()
        }
    }

    private var inventoryList: some View {
        List(filteredItems) { item in
            InventoryItemRow(item: item)
        }
        .listStyle(.plain)
    }
}

struct InventoryItemRow: View {
    let item: WarehouseItem

    var body: some View {
        HStack(spacing: 16) {
            // Stock indicator
            ZStack {
                Circle()
                    .fill(item.isLowStock ? Color.orange.opacity(0.1) : Color.green.opacity(0.1))
                    .frame(width: 48, height: 48)

                Image(systemName: item.isLowStock ? "exclamationmark.triangle.fill" : "shippingbox.fill")
                    .font(.title3)
                    .foregroundColor(item.isLowStock ? .orange : .green)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.headline)

                Text("SKU: \(item.sku)")
                    .font(.caption)
                    .foregroundColor(.secondary)

                HStack(spacing: 12) {
                    Label("Par: \(item.parLevel)", systemImage: "target")
                    Label("Threshold: \(item.lowStockThreshold)", systemImage: "exclamationmark.circle")
                }
                .font(.caption)
                .foregroundColor(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("\(item.quantity)")
                    .font(.title2.bold())
                    .foregroundColor(item.isLowStock ? .orange : .primary)

                Text("in stock")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    NavigationStack {
        InventoryListView()
    }
}
