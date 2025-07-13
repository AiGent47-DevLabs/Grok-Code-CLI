# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive legal disclaimer (DISCLAIMER.md)
- First-run warning system
- `/disclaimer` command to view full legal text
- ASCII art splash screen with X.AI branding
- "Developed by agent47.com" attribution
- Daytona integration guide for future sandboxing

### Fixed
- Downgraded chalk from v5 to v4 for CommonJS compatibility

## [1.0.0] - 2024-12-13

### Added
- Initial release of GROK-CODE CLI
- Natural language code generation using Grok 4
- Interactive file editing with AI assistance
- Code execution with `/run` command
- Session management with save/resume functionality
- Project initialization with `/init` command
- Configuration management via `/config`
- Beautiful colored terminal output
- File operations with user consent
- Automatic backup creation before file modifications
- Support for multiple Grok models (grok-4, grok-3)
- Environment variable support for API key
- Comprehensive error handling
- Large file warnings

### Security
- All file operations require explicit user confirmation
- API keys stored securely in user home directory
- No automatic code execution without user consent

[1.0.0]: https://github.com/AiGent47-DevLabs/Grok-Code-CLI/releases/tag/v1.0.0 