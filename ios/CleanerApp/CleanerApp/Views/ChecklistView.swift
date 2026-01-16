import SwiftUI
import StockBnBShared
import PhotosUI

struct ChecklistView: View {
    let property: Property
    @StateObject private var viewModel: ChecklistViewModel
    @State private var selectedItem: ChecklistItem?
    @State private var showCamera = false

    init(property: Property) {
        self.property = property
        self._viewModel = StateObject(wrappedValue: ChecklistViewModel(propertyId: property.id))
    }

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.checklist.isEmpty {
                LoadingView(message: "Loading checklist...")
            } else if let error = viewModel.error {
                ErrorView(message: error) {
                    Task { await viewModel.loadChecklist() }
                }
            } else if viewModel.checklist.isEmpty {
                EmptyStateView(
                    icon: "checklist",
                    title: "No Items",
                    message: "This property doesn't have any inventory items configured."
                )
            } else if let results = viewModel.submissionResults {
                ReportResultsView(
                    results: results,
                    onNewReport: {
                        viewModel.resetForm()
                    }
                )
            } else {
                checklistForm
            }
        }
        .navigationTitle(property.name)
        .navigationBarTitleDisplayMode(.large)
        .task {
            await viewModel.loadChecklist()
        }
        .sheet(item: $selectedItem) { item in
            AICounterView(itemName: item.name) { count in
                viewModel.updateCount(for: item.sku, count: count)
                selectedItem = nil
            }
        }
    }

    private var checklistForm: some View {
        VStack(spacing: 0) {
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(viewModel.checklist) { item in
                        ChecklistItemRow(
                            item: item,
                            count: viewModel.countBinding(for: item.sku),
                            onCameraPressed: {
                                selectedItem = item
                            }
                        )
                    }

                    // Notes section
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Notes (optional)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)

                        TextField("Any issues or observations...", text: $viewModel.notes, axis: .vertical)
                            .textFieldStyle(.roundedBorder)
                            .lineLimit(3...6)
                    }
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(16)
                }
                .padding()
            }

            // Submit button
            VStack {
                Button {
                    Task { await viewModel.submitReport() }
                } label: {
                    HStack {
                        if viewModel.isSubmitting {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Image(systemName: "checkmark.circle.fill")
                            Text("Submit Report")
                        }
                    }
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(viewModel.isSubmitting)
                .padding()
            }
            .background(Color(.systemBackground))
            .shadow(color: .black.opacity(0.05), radius: 8, y: -4)
        }
    }
}

struct ChecklistItemRow: View {
    let item: ChecklistItem
    @Binding var count: Int
    let onCameraPressed: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.name)
                        .font(.headline)

                    Text("SKU: \(item.sku)")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack(spacing: 12) {
                        Label("Par: \(item.parLevel)", systemImage: "target")
                        Label("Stock: \(item.warehouseQuantity)", systemImage: "shippingbox")
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                }

                Spacer()
            }

            HStack {
                StepperInput(value: $count)

                Button(action: onCameraPressed) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(width: 44, height: 44)
                        .background(Color.purple)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(16)
    }
}

#Preview {
    NavigationStack {
        ChecklistView(property: Property(
            id: "1",
            name: "Beach House",
            address: "123 Ocean Dr",
            itemCount: 5
        ))
    }
}
