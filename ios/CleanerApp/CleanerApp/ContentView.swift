import SwiftUI
import ClerkSDK
import StockBnBShared

struct ContentView: View {
    @ObservedObject private var clerk = Clerk.shared

    var body: some View {
        Group {
            if clerk.loadingState == .loading {
                LoadingView(message: "Loading...")
            } else if let user = clerk.user {
                NavigationStack {
                    PropertyListView()
                        .toolbar {
                            ToolbarItem(placement: .topBarTrailing) {
                                Menu {
                                    Text(user.primaryEmailAddress?.emailAddress ?? "User")
                                    Button("Sign Out", role: .destructive) {
                                        Task {
                                            try? await clerk.signOut()
                                        }
                                    }
                                } label: {
                                    Image(systemName: "person.circle.fill")
                                        .font(.title2)
                                        .foregroundColor(.green)
                                }
                            }
                        }
                }
            } else {
                SignInView()
            }
        }
    }
}

struct SignInView: View {
    @State private var isLoading = false

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Logo
            VStack(spacing: 12) {
                Image(systemName: "shippingbox.fill")
                    .font(.system(size: 64))
                    .foregroundColor(.green)

                Text("Rental Helper")
                    .font(.largeTitle.bold())

                Text("Cleaner App")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }

            Spacer()

            VStack(spacing: 16) {
                Text("Sign in to get started")
                    .font(.headline)
                    .foregroundColor(.secondary)

                SignInWithGoogleButton()
                    .frame(height: 50)
            }
            .padding(.horizontal, 32)

            Spacer()

            Text("Your inventory, simplified")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.bottom)
        }
        .background(Color(.systemBackground))
    }
}

struct SignInWithGoogleButton: View {
    @State private var isLoading = false

    var body: some View {
        Button {
            isLoading = true
            Task {
                do {
                    try await Clerk.shared.signIn.create(strategy: .oauthGoogle)
                } catch {
                    print("Google sign in failed: \(error)")
                }
                isLoading = false
            }
        } label: {
            HStack {
                if isLoading {
                    ProgressView()
                        .tint(.primary)
                } else {
                    Image(systemName: "g.circle.fill")
                        .font(.title2)
                    Text("Continue with Google")
                        .fontWeight(.medium)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color(.systemGray6))
            .foregroundColor(.primary)
            .cornerRadius(12)
        }
        .disabled(isLoading)
    }
}

#Preview {
    ContentView()
}
