# Swift Package Generator

This GitHub Action automatically generates and commits a Swift Package using provided input parameters.

## Description

This action simplifies the process of creating and updating Swift Packages.  It takes your `package.swift` file, project name, iOS target version, and artifact path as input, and generates the necessary files, commits the changes, and optionally attaches a release artifact.

## Inputs

| Name             | Description                               | Required | Default |
|-----------------|-------------------------------------------|----------|---------|
| `project-file`  | Path to the `Package.swift` file.         | Yes      | `package.swift` |
| `project-name`  | Project Name.                             | Yes      |         |
| `ios-version`   | iOS target version.                       | No       | `16`     |
| `artifact-path` | Path to the release artifact zip file.    | Yes      |         |

## Usage

To use this action in your workflow, add the following to your `.github/workflows/main.yml` file:

```yaml
name: Build and Release Swift Package

on:
  push:
    branch:
      - develop

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate Swift Package
        uses: cxs457/swift-package-generator@v1 # Replace with the correct action name
        with:
          project-file: Package.swift
          project-name: MySwiftPackage
          ios-version: 15 # Example: Override default iOS version
          artifact-path: build/MySwiftPackage.zip # Example: Path to your artifact

