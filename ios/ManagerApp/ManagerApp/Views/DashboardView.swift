import SwiftUI
import StockBnBShared

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.stats == nil {
                LoadingView(message: "Loading dashboard...")
            } else if let error = viewModel.error {
                ErrorView(message: error) {
                    Task { await viewModel.loadStats() }
                }
            } else if let stats = viewModel.stats {
                dashboardContent(stats)
            }
        }
        .navigationTitle("Dashboard")
        .refreshable {
            await viewModel.loadStats()
        }
        .task {
            await viewModel.loadStats()
        }
    }

    private func dashboardContent(_ stats: DashboardStats) -> some View {
        ScrollView {
            VStack(spacing: 20) {
                // Stats grid
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                    StatCard(
                        title: "Total Items",
                        value: "\(stats.totalItems)",
                        icon: "shippingbox.fill",
                        color: .blue
                    )

                    StatCard(
                        title: "Low Stock",
                        value: "\(stats.lowStockItems)",
                        icon: "exclamationmark.triangle.fill",
                        color: stats.lowStockItems > 0 ? .orange : .green
                    )

                    StatCard(
                        title: "Properties",
                        value: "\(stats.properties)",
                        icon: "house.fill",
                        color: .purple
                    )

                    StatCard(
                        title: "Today's Reports",
                        value: "\(stats.todayReports)",
                        icon: "doc.text.fill",
                        color: .green
                    )
                }

                // Low stock items
                if !stats.lowStockItemsList.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.orange)
                            Text("Low Stock Items")
                                .font(.headline)
                        }

                        ForEach(stats.lowStockItemsList) { item in
                            LowStockItemRow(item: item)
                        }
                    }
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(16)
                }
            }
            .padding()
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(color)
                Spacer()
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.system(size: 32, weight: .bold, design: .rounded))

                Text(title)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(16)
    }
}

struct LowStockItemRow: View {
    let item: LowStockItem

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.subheadline.weight(.medium))

                Text("SKU: \(item.sku)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("\(item.quantity)")
                    .font(.headline)
                    .foregroundColor(.orange)

                Text("/ \(item.lowStockThreshold) threshold")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.orange.opacity(0.1))
        .cornerRadius(12)
    }
}

#Preview {
    NavigationStack {
        DashboardView()
    }
}
