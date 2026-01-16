import SwiftUI
import StockBnBShared

struct ReportResultsView: View {
    let results: ReportSubmissionResponse
    let onNewReport: () -> Void

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Summary header
                summaryHeader

                // Results list
                ForEach(results.results) { result in
                    ResultItemRow(result: result)
                }

                // Actions
                VStack(spacing: 12) {
                    Button(action: onNewReport) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("New Report")
                        }
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                }
                .padding(.top)
            }
            .padding()
        }
    }

    private var summaryHeader: some View {
        VStack(spacing: 12) {
            if results.hasShortages {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.orange)

                Text("Report Submitted with Warnings")
                    .font(.headline)

                Text("Some items couldn't be fully restocked from warehouse")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            } else {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 48))
                    .foregroundColor(.green)

                Text("Report Submitted Successfully")
                    .font(.headline)

                Text("All items have been restocked")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            if results.hasLowStockAlerts {
                HStack {
                    Image(systemName: "exclamationmark.circle.fill")
                        .foregroundColor(.orange)
                    Text("Some warehouse items are running low")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 4)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(results.hasShortages ? Color.orange.opacity(0.1) : Color.green.opacity(0.1))
        .cornerRadius(16)
    }
}

struct ResultItemRow: View {
    let result: ReportResult

    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(result.itemName)
                        .font(.headline)

                    Text("SKU: \(result.sku)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                // Badges
                HStack(spacing: 8) {
                    if result.shortage {
                        Badge(text: "SHORTAGE", color: .red)
                    }
                    if result.lowStockAlert {
                        Badge(text: "LOW STOCK", color: .orange)
                    }
                }
            }

            // Stats
            HStack(spacing: 0) {
                StatColumn(label: "Counted", value: "\(result.observedCount)", color: .primary)
                Divider().frame(height: 40)
                StatColumn(label: "Needed", value: "\(result.needed)", color: .secondary)
                Divider().frame(height: 40)
                StatColumn(label: "Restocked", value: "\(result.restocked)", color: .green)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(16)
    }
}

struct Badge: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.2))
            .foregroundColor(color)
            .cornerRadius(6)
    }
}

struct StatColumn: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2.bold())
                .foregroundColor(color)
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    ReportResultsView(
        results: ReportSubmissionResponse(
            success: true,
            reportId: "123",
            results: [
                ReportResult(
                    sku: "TP-001",
                    itemName: "Toilet Paper",
                    observedCount: 2,
                    parLevel: 6,
                    needed: 4,
                    restocked: 4,
                    shortage: false,
                    newWarehouseQuantity: 20,
                    lowStockAlert: false
                ),
                ReportResult(
                    sku: "SOAP-001",
                    itemName: "Hand Soap",
                    observedCount: 0,
                    parLevel: 3,
                    needed: 3,
                    restocked: 1,
                    shortage: true,
                    newWarehouseQuantity: 0,
                    lowStockAlert: true
                )
            ],
            hasShortages: true,
            hasLowStockAlerts: true
        )
    ) {
        print("New report")
    }
}
