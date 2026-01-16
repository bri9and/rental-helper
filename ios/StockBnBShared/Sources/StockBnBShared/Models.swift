import Foundation

// MARK: - Property Models

public struct Property: Codable, Identifiable, Hashable {
    public let id: String
    public let name: String
    public let address: String?
    public let itemCount: Int

    public init(id: String, name: String, address: String?, itemCount: Int) {
        self.id = id
        self.name = name
        self.address = address
        self.itemCount = itemCount
    }
}

public struct PropertiesResponse: Codable {
    public let properties: [Property]
}

// MARK: - Inventory Models

public struct WarehouseItem: Codable, Identifiable, Hashable {
    public let id: String
    public let name: String
    public let sku: String
    public let quantity: Int
    public let parLevel: Int
    public let lowStockThreshold: Int
    public let costPerUnit: Double?
    public let isLowStock: Bool

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case name, sku, quantity, parLevel, lowStockThreshold, costPerUnit, isLowStock
    }

    public init(id: String, name: String, sku: String, quantity: Int, parLevel: Int, lowStockThreshold: Int, costPerUnit: Double?, isLowStock: Bool) {
        self.id = id
        self.name = name
        self.sku = sku
        self.quantity = quantity
        self.parLevel = parLevel
        self.lowStockThreshold = lowStockThreshold
        self.costPerUnit = costPerUnit
        self.isLowStock = isLowStock
    }
}

public struct InventoryResponse: Codable {
    public let items: [WarehouseItem]
}

// MARK: - Checklist Models

public struct ChecklistItem: Codable, Identifiable, Hashable {
    public var id: String { sku }
    public let sku: String
    public let name: String
    public let parLevel: Int
    public let warehouseQuantity: Int

    public init(sku: String, name: String, parLevel: Int, warehouseQuantity: Int) {
        self.sku = sku
        self.name = name
        self.parLevel = parLevel
        self.warehouseQuantity = warehouseQuantity
    }
}

public struct ChecklistProperty: Codable {
    public let id: String
    public let name: String
    public let address: String?
}

public struct ChecklistResponse: Codable {
    public let property: ChecklistProperty
    public let checklist: [ChecklistItem]
}

// MARK: - Report Models

public struct ReportItemSubmission: Codable {
    public let sku: String
    public let observedCount: Int

    public init(sku: String, observedCount: Int) {
        self.sku = sku
        self.observedCount = observedCount
    }
}

public struct ReportSubmission: Codable {
    public let propertyId: String
    public let items: [ReportItemSubmission]
    public let notes: String?

    public init(propertyId: String, items: [ReportItemSubmission], notes: String?) {
        self.propertyId = propertyId
        self.items = items
        self.notes = notes
    }
}

public struct ReportResult: Codable, Identifiable, Hashable {
    public var id: String { sku }
    public let sku: String
    public let itemName: String
    public let observedCount: Int
    public let parLevel: Int
    public let needed: Int
    public let restocked: Int
    public let shortage: Bool
    public let newWarehouseQuantity: Int
    public let lowStockAlert: Bool
}

public struct ReportSubmissionResponse: Codable {
    public let success: Bool
    public let reportId: String
    public let results: [ReportResult]
    public let hasShortages: Bool
    public let hasLowStockAlerts: Bool
}

// MARK: - Recent Reports Models

public struct RecentReportItem: Codable, Hashable {
    public let sku: String
    public let observedCount: Int
    public let restockedAmount: Int
}

public struct RecentReport: Codable, Identifiable, Hashable {
    public let id: String
    public let propertyId: String
    public let propertyName: String
    public let date: String
    public let itemCount: Int
    public let totalRestocked: Int
    public let notes: String?
    public let items: [RecentReportItem]
}

public struct RecentReportsResponse: Codable {
    public let reports: [RecentReport]
}

// MARK: - Dashboard Models

public struct LowStockItem: Codable, Identifiable, Hashable {
    public var id: String { sku }
    public let name: String
    public let sku: String
    public let quantity: Int
    public let lowStockThreshold: Int
}

public struct DashboardStats: Codable {
    public let totalItems: Int
    public let lowStockItems: Int
    public let properties: Int
    public let todayReports: Int
    public let lowStockItemsList: [LowStockItem]
}

// MARK: - AI Count Models

public struct AICountRequest: Codable {
    public let imageBase64: String
    public let itemName: String
    public let mimeType: String

    public init(imageBase64: String, itemName: String, mimeType: String = "image/jpeg") {
        self.imageBase64 = imageBase64
        self.itemName = itemName
        self.mimeType = mimeType
    }
}

public struct AICountResponse: Codable {
    public let success: Bool
    public let count: Int
    public let confidence: String
    public let description: String
}

// MARK: - Error Models

public struct APIError: Codable, Error {
    public let error: String
}

// MARK: - Supplies/Shop Models

public struct SupplyProduct: Codable, Identifiable, Hashable {
    public let id: String
    public let name: String
    public let category: String
    public let price: Double
    public let image: String
    public let amazonAsin: String
    public let description: String

    public init(id: String, name: String, category: String, price: Double, image: String, amazonAsin: String, description: String) {
        self.id = id
        self.name = name
        self.category = category
        self.price = price
        self.image = image
        self.amazonAsin = amazonAsin
        self.description = description
    }
}

public struct SuppliesResponse: Codable {
    public let products: [SupplyProduct]
    public let categories: [String]
    public let amazonAssociateTag: String
}

// Cart item for local cart state
public struct CartItem: Identifiable, Hashable {
    public let product: SupplyProduct
    public var quantity: Int

    public var id: String { product.id }

    public var subtotal: Double {
        product.price * Double(quantity)
    }

    public init(product: SupplyProduct, quantity: Int = 1) {
        self.product = product
        self.quantity = quantity
    }
}

// Order item from API response
public struct OrderItem: Codable, Hashable {
    public let productId: String
    public let amazonAsin: String
    public let name: String
    public let quantity: Int
    public let price: Double

    public init(productId: String, amazonAsin: String, name: String, quantity: Int, price: Double) {
        self.productId = productId
        self.amazonAsin = amazonAsin
        self.name = name
        self.quantity = quantity
        self.price = price
    }
}

// Saved cart order from API
public struct CartOrder: Codable, Identifiable {
    public let id: String
    public let items: [OrderItem]
    public let totalAmount: Double
    public let amazonCartUrl: String
    public let submittedAt: Date

    public init(id: String, items: [OrderItem], totalAmount: Double, amazonCartUrl: String, submittedAt: Date) {
        self.id = id
        self.items = items
        self.totalAmount = totalAmount
        self.amazonCartUrl = amazonCartUrl
        self.submittedAt = submittedAt
    }
}

public struct CartHistoryResponse: Codable {
    public let orders: [CartOrder]
}

// Request to save cart order
public struct SaveCartOrderRequest: Codable {
    public let items: [OrderItem]
    public let totalAmount: Double
    public let amazonCartUrl: String

    public init(items: [OrderItem], totalAmount: Double, amazonCartUrl: String) {
        self.items = items
        self.totalAmount = totalAmount
        self.amazonCartUrl = amazonCartUrl
    }
}

public struct SaveCartOrderResponse: Codable {
    public let order: CartOrder
}
