import SwiftUI
import StockBnBShared

struct SettingsView: View {
    @State private var showingSignOutAlert = false

    var body: some View {
        List {
            // User section
            if let user = Clerk.shared.user {
                Section {
                    HStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(Color.green.opacity(0.1))
                                .frame(width: 60, height: 60)

                            Text(user.firstName?.prefix(1).uppercased() ?? user.primaryEmailAddress?.emailAddress.prefix(1).uppercased() ?? "U")
                                .font(.title.bold())
                                .foregroundColor(.green)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            if let firstName = user.firstName, let lastName = user.lastName {
                                Text("\(firstName) \(lastName)")
                                    .font(.headline)
                            }

                            if let email = user.primaryEmailAddress?.emailAddress {
                                Text(email)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
            }

            // App info section
            Section("About") {
                HStack {
                    Label("Version", systemImage: "info.circle")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }

                HStack {
                    Label("Build", systemImage: "hammer")
                    Spacer()
                    Text("1")
                        .foregroundColor(.secondary)
                }

                Link(destination: URL(string: "https://inventory-lemon-psi.vercel.app")!) {
                    Label("Web Dashboard", systemImage: "globe")
                }
            }

            // Sign out section
            Section {
                Button(role: .destructive) {
                    showingSignOutAlert = true
                } label: {
                    Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                }
            }
        }
        .navigationTitle("Settings")
        .alert("Sign Out", isPresented: $showingSignOutAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Sign Out", role: .destructive) {
                Task {
                    try? await Clerk.shared.signOut()
                }
            }
        } message: {
            Text("Are you sure you want to sign out?")
        }
    }
}

#Preview {
    NavigationStack {
        SettingsView()
    }
}
