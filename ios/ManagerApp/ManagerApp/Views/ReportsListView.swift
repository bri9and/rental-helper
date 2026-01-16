import SwiftUI
import StockBnBShared

struct ReportsListView: View {
    @StateObject private var viewModel = ReportsViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading && viewModel.reports.isEmpty {
                LoadingView(message: "Loading reports...")
            } else if let error = viewModel.error {
                ErrorView(message: error) {
                    Task { await viewModel.loadReports() }
                }
            } else if viewModel.reports.isEmpty {
                EmptyStateView(
                    icon: "doc.text.fill",
                    title: "No Reports",
                    message: "No cleaning reports have been submitted yet."
                )
            } else {
                reportsList
            }
        }
        .navigationTitle("Reports")
        .refreshable {
            await viewModel.loadReports()
        }
        .task {
            await viewModel.loadReports()
        }
    }

    private var reportsList: some View {
        List(viewModel.reports) { report in
            ReportRow(report: report)
        }
        .listStyle(.plain)
    }
}

struct ReportRow: View {
    let report: RecentReport

    private var formattedDate: String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        if let date = formatter.date(from: report.date) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .short
            return displayFormatter.string(from: date)
        }

        // Try without fractional seconds
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: report.date) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .short
            return displayFormatter.string(from: date)
        }

        return report.date
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(report.propertyName)
                        .font(.headline)

                    Text(formattedDate)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(report.totalRestocked)")
                        .font(.title3.bold())
                        .foregroundColor(.green)

                    Text("restocked")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            if let notes = report.notes, !notes.isEmpty {
                Text(notes)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }

            HStack {
                Label("\(report.itemCount) items checked", systemImage: "checkmark.circle")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    NavigationStack {
        ReportsListView()
    }
}
