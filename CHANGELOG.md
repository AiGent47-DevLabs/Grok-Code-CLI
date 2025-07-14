# Changelog

All notable changes to GROK-CODE CLI will be documented in this file.

## [1.2.0] - 2025-07-14

### Added
- Interactive input box UI with borders (like Claude Code)
- Context usage percentage indicator while typing
- System safety prompt to prevent harmful operations
- User input echo for better transcript clarity
- Multi-agent project management system
- Global and local project registries
- GROK.md template file
- Sync agent for automatic file updates

### Enhanced
- Improved error messages with self-correction
- Better workspace analysis on startup
- More robust auto-update system

### Fixed
- Interactive mode now properly triggers when no arguments provided
- System prompt now always includes safety rules

## [1.1.0] - 2025-07-14

### Added
- Auto-update system (checks every 24 hours)
- Self-correction on API errors (retries up to 2 times)
- GROK.md context support (global and project-specific)
- Workspace analysis on startup
- MCP Zapier connector for automation

### Changed
- Updated package name to @aigent47-devlabs/grok-code-cli
- Enhanced error handling with retry logic

## [1.0.0] - 2025-07-13

### Initial Release
- Basic CLI functionality
- Natural language code generation
- File editing with AI assistance
- Code execution support
- Session management
- Multi-model support (grok-4, grok-3)
- Configuration management
- Safety features with user consent