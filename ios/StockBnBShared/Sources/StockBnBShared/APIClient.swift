import Foundation
import Clerk

public actor APIClient {
    public static let shared = APIClient()

    private let baseURL: URL
    private let session: URLSession
    private let decoder: JSONDecoder

    public init(baseURL: URL = URL(string: "https://inventory-lemon-psi.vercel.app")!) {
        self.baseURL = baseURL
        self.session = URLSession.shared
        self.decoder = JSONDecoder()
    }

    // MARK: - Authentication

    private func getAuthToken() async throws -> String? {
        return try await Clerk.shared.session?.getToken()?.jwt
    }

    private func authenticatedRequest(for endpoint: String, method: String = "GET", body: Data? = nil) async throws -> URLRequest {
        let url = baseURL.appendingPathComponent(endpoint)
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = try await getAuthToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = body
        }

        return request
    }

    // MARK: - Properties

    public func fetchProperties() async throws -> [Property] {
        let request = try await authenticatedRequest(for: "/api/properties")
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? decoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to fetch properties")
        }

        let propertiesResponse = try decoder.decode(PropertiesResponse.self, from: data)
        return propertiesResponse.properties
    }

    public func fetchChecklist(propertyId: String) async throws -> ChecklistResponse {
        let request = try await authenticatedRequest(for: "/api/properties/\(propertyId)/checklist")
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode == 404 {
            throw APIError(error: "Property not found")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? decoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to fetch checklist")
        }

        return try decoder.decode(ChecklistResponse.self, from: data)
    }

    // MARK: - Inventory

    public func fetchInventory() async throws -> [WarehouseItem] {
        let request = try await authenticatedRequest(for: "/api/inventory")
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? decoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to fetch inventory")
        }

        let inventoryResponse = try decoder.decode(InventoryResponse.self, from: data)
        return inventoryResponse.items
    }

    // MARK: - Reports

    public func submitReport(_ report: ReportSubmission) async throws -> ReportSubmissionResponse {
        let encoder = JSONEncoder()
        let body = try encoder.encode(report)

        let request = try await authenticatedRequest(for: "/api/reports", method: "POST", body: body)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? decoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to submit report")
        }

        return try decoder.decode(ReportSubmissionResponse.self, from: data)
    }

    public func fetchRecentReports(limit: Int = 20, propertyId: String? = nil) async throws -> [RecentReport] {
        var endpoint = "/api/reports/recent?limit=\(limit)"
        if let propertyId = propertyId {
            endpoint += "&propertyId=\(propertyId)"
        }

        let request = try await authenticatedRequest(for: endpoint)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? decoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to fetch reports")
        }

        let reportsResponse = try decoder.decode(RecentReportsResponse.self, from: data)
        return reportsResponse.reports
    }

    // MARK: - Dashboard

    public func fetchDashboardStats() async throws -> DashboardStats {
        let request = try await authenticatedRequest(for: "/api/dashboard/stats")
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? decoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to fetch stats")
        }

        return try decoder.decode(DashboardStats.self, from: data)
    }

    // MARK: - AI Count

    public func countItemsWithAI(imageBase64: String, itemName: String, mimeType: String = "image/jpeg") async throws -> AICountResponse {
        let aiRequest = AICountRequest(imageBase64: imageBase64, itemName: itemName, mimeType: mimeType)
        let encoder = JSONEncoder()
        let body = try encoder.encode(aiRequest)

        let request = try await authenticatedRequest(for: "/api/ai/count", method: "POST", body: body)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? decoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to count items")
        }

        return try decoder.decode(AICountResponse.self, from: data)
    }

    // MARK: - Supplies

    public func fetchSupplies() async throws -> SuppliesResponse {
        let request = try await authenticatedRequest(for: "/api/supplies")
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? decoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to fetch supplies")
        }

        return try decoder.decode(SuppliesResponse.self, from: data)
    }

    // MARK: - Cart

    public func saveCartOrder(_ orderRequest: SaveCartOrderRequest) async throws -> CartOrder {
        let encoder = JSONEncoder()
        let body = try encoder.encode(orderRequest)

        let request = try await authenticatedRequest(for: "/api/cart", method: "POST", body: body)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? decoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to save order")
        }

        let orderResponse = try decoder.decode(SaveCartOrderResponse.self, from: data)
        return orderResponse.order
    }

    public func fetchCartHistory() async throws -> [CartOrder] {
        // Configure decoder to handle ISO8601 dates
        let customDecoder = JSONDecoder()
        customDecoder.dateDecodingStrategy = .iso8601

        let request = try await authenticatedRequest(for: "/api/cart")
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError(error: "Invalid response")
        }

        if httpResponse.statusCode == 401 {
            throw APIError(error: "Unauthorized")
        }

        if httpResponse.statusCode != 200 {
            if let error = try? customDecoder.decode(APIError.self, from: data) {
                throw error
            }
            throw APIError(error: "Failed to fetch order history")
        }

        let historyResponse = try customDecoder.decode(CartHistoryResponse.self, from: data)
        return historyResponse.orders
    }
}
