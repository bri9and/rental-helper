import SwiftUI
import StockBnBShared

struct PropertyListView: View {
    @StateObject private var viewModel = PropertyListViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.properties.isEmpty {
                LoadingView(message: "Loading properties...")
            } else if let error = viewModel.error {
                ErrorView(message: error) {
                    Task { await viewModel.loadProperties() }
                }
            } else if viewModel.properties.isEmpty {
                EmptyStateView(
                    icon: "house.fill",
                    title: "No Properties",
                    message: "You don't have any properties configured yet. Add properties from the web dashboard."
                )
            } else {
                propertyList
            }
        }
        .navigationTitle("Properties")
        .refreshable {
            await viewModel.loadProperties()
        }
        .task {
            await viewModel.loadProperties()
        }
    }

    private var propertyList: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.flexible())], spacing: 12) {
                ForEach(viewModel.properties) { property in
                    NavigationLink(value: property) {
                        PropertyCard(property: property)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
        }
        .navigationDestination(for: Property.self) { property in
            ChecklistView(property: property)
        }
    }
}

struct PropertyCard: View {
    let property: Property

    var body: some View {
        HStack(spacing: 16) {
            // Icon
            ZStack {
                Circle()
                    .fill(Color.green.opacity(0.1))
                    .frame(width: 48, height: 48)

                Image(systemName: "house.fill")
                    .font(.title2)
                    .foregroundColor(.green)
            }

            // Details
            VStack(alignment: .leading, spacing: 4) {
                Text(property.name)
                    .font(.headline)
                    .foregroundColor(.primary)

                if let address = property.address, !address.isEmpty {
                    Text(address)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }

                Text("\(property.itemCount) items to check")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(16)
    }
}

#Preview {
    NavigationStack {
        PropertyListView()
    }
}
