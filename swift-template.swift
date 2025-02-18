// swift-tools-version: 6.0
import Foundation
import PackageDescription

let package = Package(
   name: projectName,
   platforms: [.iOS(iosVersion)],
   products: [
      .library(
        name: projectName,
        targets: [projectName]
      ),
   ],
   dependencies: [],
   targets: [
      .binaryTarget(
         name: projectName,
         path: artifactPath,
         checksum: checksumValue
      ),
   ]
)
