import SwiftUI
import StockBnBShared

struct PropertiesListView: View {
    @StateObject private var viewModel = PropertiesViewModel()

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
                    message: "You haven't added any properties yet. Add properties from the web dashboard."
                )
            } else {
                propertiesList
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

    private var propertiesList: some View {
        List(viewModel.properties) { property in
            PropertyRow(property: property)
        }
        .listStyle(.plain)
    }
}

struct PropertyRow: View {
    let property: Property

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.purple.opacity(0.1))
                    .frame(width: 48, height: 48)

                Image(systemName: "house.fill")
                    .font(.title3)
                    .foregroundColor(.purple)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(property.name)
                    .font(.headline)

                if let address = property.address, !address.isEmpty {
                    Text(address)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("\(property.itemCount)")
                    .font(.title3.bold())
                    .foregroundColor(.primary)

                Text("items")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    NavigationStack {
        PropertiesListView()
    }
}
