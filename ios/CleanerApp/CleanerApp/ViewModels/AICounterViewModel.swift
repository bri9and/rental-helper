import Foundation
import SwiftUI
import PhotosUI
import StockBnBShared

@MainActor
class AICounterViewModel: ObservableObject {
    @Published var capturedImage: UIImage?
    @Published var isProcessing = false
    @Published var result: AICountResponse?
    @Published var error: String?

    func processPhoto(_ item: PhotosPickerItem?, itemName: String) async {
        guard let item = item else { return }

        isProcessing = true
        error = nil
        result = nil

        do {
            // Load the image data
            guard let data = try await item.loadTransferable(type: Data.self) else {
                error = "Failed to load image"
                isProcessing = false
                return
            }

            // Create UIImage for preview
            guard let image = UIImage(data: data) else {
                error = "Invalid image format"
                isProcessing = false
                return
            }

            capturedImage = image

            // Compress and convert to base64
            guard let compressedData = image.jpegData(compressionQuality: 0.7) else {
                error = "Failed to compress image"
                isProcessing = false
                return
            }

            let base64String = compressedData.base64EncodedString()

            // Send to API
            let response = try await APIClient.shared.countItemsWithAI(
                imageBase64: base64String,
                itemName: itemName,
                mimeType: "image/jpeg"
            )

            result = response

            // Haptic feedback
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()

        } catch let apiError as APIError {
            error = apiError.error
        } catch {
            self.error = error.localizedDescription
        }

        isProcessing = false
    }
}
