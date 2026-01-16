import SwiftUI

public struct ErrorView: View {
    let message: String
    let retryAction: (() -> Void)?

    public init(message: String, retryAction: (() -> Void)? = nil) {
        self.message = message
        self.retryAction = retryAction
    }

    public var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 48))
                .foregroundColor(.red)

            Text("Something went wrong")
                .font(.headline)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            if let retryAction = retryAction {
                Button(action: retryAction) {
                    Label("Try Again", systemImage: "arrow.clockwise")
                        .font(.subheadline.weight(.medium))
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

#Preview {
    ErrorView(message: "Failed to load properties. Please check your internet connection.") {
        print("Retry tapped")
    }
}
