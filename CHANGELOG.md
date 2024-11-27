# Changelog

## [Unreleased]
- 

## [0.9.0] - 2024-11-27
### Added
- Changelog

### Fixed
- Fixed issue with JS and CSS merging logic where files from subdirectories were incorrectly included.
- Fixed merged file paths: Merged JavaScript and CSS files are now output correctly at the intended path (on keep_structure=true, previously files were outputted as folder/folder.js, now it's folder.js).
- Fixed issues with unnecessary folder creation when merging files.

## [0.8.0]
### Added
- Initial release of EzMinify plugin for Laravel / Vite
- Support for minifying JS and CSS files with options for merging and structure keeping.
