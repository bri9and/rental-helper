import SwiftUI
import StockBnBShared

struct ContentView: View {
    var body: some View {
        Group {
            if !Clerk.shared.isLoaded {
                LoadingView(message: "Loading...")
            } else if Clerk.shared.user != nil {
                MainTabView()
            } else {
                SignInView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                DashboardView()
            }
            .tabItem {
                Label("Dashboard", systemImage: "chart.bar.fill")
            }

            NavigationStack {
                InventoryListView()
            }
            .tabItem {
                Label("Inventory", systemImage: "shippingbox.fill")
            }

            NavigationStack {
                PropertiesListView()
            }
            .tabItem {
                Label("Properties", systemImage: "house.fill")
            }

            NavigationStack {
                ReportsListView()
            }
            .tabItem {
                Label("Reports", systemImage: "doc.text.fill")
            }

            NavigationStack {
                SuppliesListView()
            }
            .tabItem {
                Label("Supplies", systemImage: "bag.fill")
            }

            NavigationStack {
                SettingsView()
            }
            .tabItem {
                Label("Settings", systemImage: "gearshape.fill")
            }
        }
        .tint(.green)
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

                Text("Manager Dashboard")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }

            Spacer()

            VStack(spacing: 16) {
                Text("Sign in to manage your inventory")
                    .font(.headline)
                    .foregroundColor(.secondary)

                SignInWithGoogleButton()
                    .frame(height: 50)
            }
            .padding(.horizontal, 32)

            Spacer()

            Text("Your inventory command center")
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
                    _ = try await SignIn.authenticateWithRedirect(strategy: .oauth(provider: .google))
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
