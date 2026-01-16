import SwiftUI

public struct LoadingView: View {
    let message: String

    public init(message: String = "Loading...") {
        self.message = message
    }

    public var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    LoadingView(message: "Fetching properties...")
}
