import SwiftUI
import StockBnBShared

struct OrderHistoryView: View {
    @StateObject private var viewModel = OrderHistoryViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.orders.isEmpty {
                LoadingView(message: "Loading order history...")
            } else if let error = viewModel.error {
                ErrorView(message: error) {
                    Task { await viewModel.loadOrders() }
                }
            } else if viewModel.orders.isEmpty {
                emptyHistoryView
            } else {
                ordersList
            }
        }
        .navigationTitle("Order History")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("Close") {
                    dismiss()
                }
            }
        }
        .refreshable {
            await viewModel.loadOrders()
        }
        .task {
            await viewModel.loadOrders()
        }
    }

    private var emptyHistoryView: some View {
        VStack(spacing: 16) {
            Image(systemName: "clock.arrow.circlepath")
                .font(.system(size: 64))
                .foregroundColor(.secondary)

            Text("No Order History")
                .font(.headline)

            Text("Your past orders will appear here after you checkout.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }

    private var ordersList: some View {
        List(viewModel.orders) { order in
            OrderRow(order: order)
        }
        .listStyle(.plain)
    }
}

struct OrderRow: View {
    let order: CartOrder
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Order header
            Button {
                withAnimation {
                    isExpanded.toggle()
                }
            } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(order.submittedAt, style: .date)
                            .font(.headline)

                        Text("\(order.items.count) items")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    Text("$\(order.totalAmount, specifier: "%.2f")")
                        .font(.title3.weight(.semibold))
                        .foregroundColor(.green)

                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .buttonStyle(.plain)

            // Expanded items list
            if isExpanded {
                VStack(spacing: 8) {
                    Divider()

                    ForEach(order.items, id: \.amazonAsin) { item in
                        HStack {
                            Text(item.name)
                                .font(.subheadline)
                                .lineLimit(1)

                            Spacer()

                            Text("x\(item.quantity)")
                                .font(.caption)
                                .foregroundColor(.secondary)

                            Text("$\(item.price * Double(item.quantity), specifier: "%.2f")")
                                .font(.subheadline)
                        }
                    }

                    // View on Amazon button
                    if let url = URL(string: order.amazonCartUrl) {
                        Button {
                            UIApplication.shared.open(url)
                        } label: {
                            HStack {
                                Image(systemName: "arrow.up.right.square")
                                Text("View on Amazon")
                            }
                            .font(.subheadline)
                            .foregroundColor(.green)
                        }
                        .padding(.top, 4)
                    }
                }
            }
        }
        .padding(.vertical, 8)
    }
}

@MainActor
class OrderHistoryViewModel: ObservableObject {
    @Published var orders: [CartOrder] = []
    @Published var isLoading = false
    @Published var error: String?

    func loadOrders() async {
        isLoading = true
        error = nil

        do {
            orders = try await APIClient.shared.fetchCartHistory()
        } catch let apiError as APIError {
            error = apiError.error
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }
}

#Preview {
    NavigationStack {
        OrderHistoryView()
    }
}
