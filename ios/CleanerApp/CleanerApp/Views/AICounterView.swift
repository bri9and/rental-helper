import SwiftUI
import PhotosUI
import StockBnBShared

struct AICounterView: View {
    let itemName: String
    let onCountReceived: (Int) -> Void

    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = AICounterViewModel()
    @State private var selectedPhoto: PhotosPickerItem?

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "camera.viewfinder")
                        .font(.system(size: 48))
                        .foregroundColor(.purple)

                    Text("AI Counter")
                        .font(.title2.bold())

                    Text("Take a photo of \(itemName) and AI will count them for you")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                Spacer()

                // Photo preview or placeholder
                if let image = viewModel.capturedImage {
                    Image(uiImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(maxHeight: 300)
                        .cornerRadius(16)
                        .shadow(radius: 4)
                } else {
                    ZStack {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color(.systemGray6))
                            .frame(height: 200)

                        VStack(spacing: 12) {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.system(size: 40))
                                .foregroundColor(.secondary)
                            Text("No photo selected")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                // Result
                if viewModel.isProcessing {
                    HStack(spacing: 12) {
                        ProgressView()
                        Text("AI is counting...")
                            .foregroundColor(.secondary)
                    }
                    .padding()
                } else if let result = viewModel.result {
                    VStack(spacing: 8) {
                        HStack {
                            Text("Count:")
                                .foregroundColor(.secondary)
                            Text("\(result.count)")
                                .font(.title.bold())
                                .foregroundColor(.purple)
                        }

                        HStack {
                            Text("Confidence:")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            ConfidenceBadge(confidence: result.confidence)
                        }

                        if !result.description.isEmpty {
                            Text(result.description)
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                    }
                    .padding()
                    .background(Color.purple.opacity(0.1))
                    .cornerRadius(12)
                } else if let error = viewModel.error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .padding()
                }

                Spacer()

                // Actions
                VStack(spacing: 12) {
                    PhotosPicker(
                        selection: $selectedPhoto,
                        matching: .images
                    ) {
                        HStack {
                            Image(systemName: "camera.fill")
                            Text(viewModel.capturedImage == nil ? "Take Photo" : "Retake Photo")
                        }
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.purple)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                    .onChange(of: selectedPhoto) { _, newValue in
                        Task {
                            await viewModel.processPhoto(newValue, itemName: itemName)
                        }
                    }

                    if let result = viewModel.result {
                        Button {
                            onCountReceived(result.count)
                            dismiss()
                        } label: {
                            HStack {
                                Image(systemName: "checkmark.circle.fill")
                                Text("Use Count (\(result.count))")
                            }
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                    }
                }
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

struct ConfidenceBadge: View {
    let confidence: String

    var color: Color {
        switch confidence.lowercased() {
        case "high": return .green
        case "medium": return .orange
        default: return .red
        }
    }

    var body: some View {
        Text(confidence.uppercased())
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.2))
            .foregroundColor(color)
            .cornerRadius(6)
    }
}

#Preview {
    AICounterView(itemName: "Toilet Paper Rolls") { count in
        print("Counted: \(count)")
    }
}
