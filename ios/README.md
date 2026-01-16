# Rental Helper iOS Apps

Native SwiftUI apps for Rental Helper inventory management.

## Apps

### CleanerApp
For cleaning staff to:
- Select properties
- Count inventory items
- Use AI camera to auto-count
- Submit reports

### ManagerApp
For property managers to:
- View dashboard stats
- Monitor inventory levels
- Track all properties
- Review cleaning reports

## Setup

### Prerequisites
- Xcode 16.0+
- macOS Sequoia 15.0+
- iOS 17.0+ deployment target
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) (for generating Xcode projects)

### Install XcodeGen

```bash
brew install xcodegen
```

### Generate Xcode Projects

```bash
cd ios/CleanerApp
xcodegen generate

cd ../ManagerApp
xcodegen generate
```

### Open in Xcode

```bash
open CleanerApp/CleanerApp.xcodeproj
# or
open ManagerApp/ManagerApp.xcodeproj
```

### Configure Signing

1. Open the project in Xcode
2. Select the target
3. Go to "Signing & Capabilities"
4. Select your Development Team
5. Xcode will automatically manage signing

## Architecture

```
ios/
├── Rental HelperShared/          # Shared Swift Package
│   ├── Package.swift
│   └── Sources/
│       └── Rental HelperShared/
│           ├── Models.swift       # Codable data models
│           ├── APIClient.swift    # Network layer
│           └── Views/             # Shared UI components
│
├── CleanerApp/              # Cleaner iOS App
│   ├── project.yml          # XcodeGen config
│   └── CleanerApp/
│       ├── CleanerApp.swift
│       ├── ContentView.swift
│       ├── Views/
│       └── ViewModels/
│
└── ManagerApp/              # Manager iOS App
    ├── project.yml          # XcodeGen config
    └── ManagerApp/
        ├── ManagerApp.swift
        ├── ContentView.swift
        ├── Views/
        └── ViewModels/
```

## Authentication

Both apps use Clerk for authentication with:
- Apple Sign In
- Google Sign In

The Clerk publishable key is configured in `Rental HelperShared/Rental HelperShared.swift`.

## API

All API calls go through the shared `APIClient` which:
- Automatically attaches Clerk JWT tokens
- Handles authentication errors
- Provides type-safe responses

## TestFlight Deployment

1. Generate the Xcode projects with XcodeGen
2. Open in Xcode
3. Set your Development Team
4. Archive (Product → Archive)
5. Distribute to App Store Connect
6. Add testers in TestFlight

## Environment

The apps connect to: `https://inventory-lemon-psi.vercel.app`

To use a different API endpoint, modify `APIClient.swift` base URL.
