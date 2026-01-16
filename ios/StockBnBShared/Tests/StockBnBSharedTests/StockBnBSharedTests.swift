import XCTest
@testable import StockBnBShared

final class StockBnBSharedTests: XCTestCase {
    func testPropertyDecoding() throws {
        let json = """
        {
            "id": "123",
            "name": "Beach House",
            "address": "123 Ocean Dr",
            "itemCount": 5
        }
        """
        let data = json.data(using: .utf8)!
        let property = try JSONDecoder().decode(Property.self, from: data)

        XCTAssertEqual(property.id, "123")
        XCTAssertEqual(property.name, "Beach House")
        XCTAssertEqual(property.address, "123 Ocean Dr")
        XCTAssertEqual(property.itemCount, 5)
    }

    func testWarehouseItemDecoding() throws {
        let json = """
        {
            "_id": "abc123",
            "name": "Toilet Paper",
            "sku": "TP-001",
            "quantity": 50,
            "parLevel": 100,
            "lowStockThreshold": 20,
            "costPerUnit": 1.50,
            "isLowStock": false
        }
        """
        let data = json.data(using: .utf8)!
        let item = try JSONDecoder().decode(WarehouseItem.self, from: data)

        XCTAssertEqual(item.id, "abc123")
        XCTAssertEqual(item.name, "Toilet Paper")
        XCTAssertEqual(item.sku, "TP-001")
        XCTAssertEqual(item.quantity, 50)
        XCTAssertEqual(item.isLowStock, false)
    }

    func testReportSubmissionEncoding() throws {
        let report = ReportSubmission(
            propertyId: "prop123",
            items: [
                ReportItemSubmission(sku: "TP-001", observedCount: 5),
                ReportItemSubmission(sku: "SOAP-001", observedCount: 3)
            ],
            notes: "All good"
        )

        let encoder = JSONEncoder()
        let data = try encoder.encode(report)
        let json = String(data: data, encoding: .utf8)!

        XCTAssertTrue(json.contains("prop123"))
        XCTAssertTrue(json.contains("TP-001"))
        XCTAssertTrue(json.contains("All good"))
    }

    func testDashboardStatsDecoding() throws {
        let json = """
        {
            "totalItems": 150,
            "lowStockItems": 5,
            "properties": 10,
            "todayReports": 3,
            "lowStockItemsList": [
                {
                    "name": "Shampoo",
                    "sku": "SH-001",
                    "quantity": 2,
                    "lowStockThreshold": 10
                }
            ]
        }
        """
        let data = json.data(using: .utf8)!
        let stats = try JSONDecoder().decode(DashboardStats.self, from: data)

        XCTAssertEqual(stats.totalItems, 150)
        XCTAssertEqual(stats.lowStockItems, 5)
        XCTAssertEqual(stats.properties, 10)
        XCTAssertEqual(stats.todayReports, 3)
        XCTAssertEqual(stats.lowStockItemsList.count, 1)
        XCTAssertEqual(stats.lowStockItemsList[0].name, "Shampoo")
    }
}
