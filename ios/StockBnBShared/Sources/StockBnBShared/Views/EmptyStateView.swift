import SwiftUI

public struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    let actionTitle: String?
    let action: (() -> Void)?

    public init(
        icon: String,
        title: String,
        message: String,
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.icon = icon
        self.title = title
        self.message = message
        self.actionTitle = actionTitle
        self.action = action
    }

    public var body: some View {
        VStack(spacing: 16) {
            Image(systemName: icon)
                .font(.system(size: 56))
                .foregroundColor(.secondary.opacity(0.6))

            Text(title)
                .font(.headline)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.subheadline.weight(.medium))
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
                .padding(.top, 8)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

#Preview {
    EmptyStateView(
        icon: "house.fill",
        title: "No Properties",
        message: "You haven't added any properties yet. Add your first property to get started.",
        actionTitle: "Add Property"
    ) {
        print("Add property tapped")
    }
}
