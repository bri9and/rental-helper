import Foundation
import SwiftUI
import StockBnBShared

@MainActor
class ChecklistViewModel: ObservableObject {
    let propertyId: String

    @Published var checklist: [ChecklistItem] = []
    @Published var counts: [String: Int] = [:]
    @Published var notes: String = ""
    @Published var isLoading = false
    @Published var isSubmitting = false
    @Published var error: String?
    @Published var submissionResults: ReportSubmissionResponse?

    init(propertyId: String) {
        self.propertyId = propertyId
    }

    func loadChecklist() async {
        isLoading = true
        error = nil

        do {
            let response = try await APIClient.shared.fetchChecklist(propertyId: propertyId)
            checklist = response.checklist

            // Initialize counts to par levels (what should be there)
            for item in checklist {
                counts[item.sku] = item.parLevel
            }
        } catch let apiError as APIError {
            error = apiError.error
        } catch {
            error = error.localizedDescription
        }

        isLoading = false
    }

    func countBinding(for sku: String) -> Binding<Int> {
        Binding(
            get: { self.counts[sku] ?? 0 },
            set: { self.counts[sku] = $0 }
        )
    }

    func updateCount(for sku: String, count: Int) {
        counts[sku] = count
    }

    func submitReport() async {
        isSubmitting = true
        error = nil

        do {
            let items = checklist.map { item in
                ReportItemSubmission(
                    sku: item.sku,
                    observedCount: counts[item.sku] ?? 0
                )
            }

            let report = ReportSubmission(
                propertyId: propertyId,
                items: items,
                notes: notes.isEmpty ? nil : notes
            )

            let response = try await APIClient.shared.submitReport(report)
            submissionResults = response

            // Haptic feedback
            UINotificationFeedbackGenerator().notificationOccurred(
                response.hasShortages ? .warning : .success
            )
        } catch let apiError as APIError {
            error = apiError.error
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        } catch {
            self.error = error.localizedDescription
            UINotificationFeedbackGenerator().notificationOccurred(.error)
        }

        isSubmitting = false
    }

    func resetForm() {
        submissionResults = nil
        notes = ""
        // Reset counts to par levels
        for item in checklist {
            counts[item.sku] = item.parLevel
        }
    }
}
