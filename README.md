# Swift Package Generator

A GitHub Action to automatically generate Swift Package based on inputs

## Features

- Generate Swift Package file

## Usage

```yaml
name: Generate Swift Package

on:
  push:
    branchs:
      - develop

jobs:
  generate-swift-package:
    runs-on: macos-latest
    steps:
     # To just add a reminder comment:
      - uses: cxs457/package-swift-gen@last-release

        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          file-path: 'build.gradle'
          increment-type: 'patch'
          mode: 'comment-only'
    

```

## License

MIT
