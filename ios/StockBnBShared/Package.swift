// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "StockBnBShared",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "StockBnBShared",
            targets: ["StockBnBShared"]
        ),
    ],
    dependencies: [
        .package(url: "https://github.com/clerk/clerk-ios", from: "0.51.0"),
    ],
    targets: [
        .target(
            name: "StockBnBShared",
            dependencies: [
                .product(name: "Clerk", package: "clerk-ios"),
            ]
        ),
        .testTarget(
            name: "StockBnBSharedTests",
            dependencies: ["StockBnBShared"]
        ),
    ]
)
