# GROK.md - Project Context for GROK-CODE CLI

## Project Overview
GROK-CODE CLI is an AI-powered command-line interface for code generation, editing, and automation using X.AI's Grok models. It's designed as a zero-maintenance tool with automatic updates.

## Architecture Philosophy
- **Zero Maintenance**: Auto-updates ensure users always have the latest features
- **Multi-Agent System**: Distributed agents handle specific tasks
- **Self-Correcting**: Automatic retry with context adjustment on errors
- **Extensible**: Plugin system for custom tools (coming in v1.3.0)

## Key Components

### 1. Core CLI (`index.js`)
- Main entry point and command processor
- Session management
- Auto-update checker
- Workspace analyzer
- GROK.md context loader

### 2. Multi-Agent System
- **Master Agent**: Overall orchestration and coordination
- **Sync Agents**: Handle file synchronization between local/global
- **Feature Agents**: Implement specific enhancements
- **Test Agents**: Automated testing and quality assurance

### 3. Configuration Files
- `MASTER_PERSONA.yaml`: Defines agent hierarchy and capabilities
- `SYNC_CONFIG.yaml`: Synchronization rules and automation
- `PROJECT_ENHANCEMENTS.md`: Local enhancement tracking
- `PROJECT_AGENTS.md`: Local agent assignments

### 4. Global Registries
- `GLOBAL_PROJECT_REGISTRY.md`: All projects and their enhancements
- `GLOBAL_AGENT_REGISTRY.md`: All agents across all projects

## Current Focus Areas
1. **Enhanced Search**: Implementing AI-powered file indexing
2. **Extended Context**: Supporting 100k+ token contexts
3. **Plugin System**: Building extensibility framework
4. **Team Features**: Adding collaboration capabilities

## Development Guidelines
- Maintain backward compatibility within major versions
- Follow zero-maintenance philosophy
- Keep CLI lightweight (<50MB)
- Ensure all features work offline-first
- Test on Windows, macOS, and Linux

## API Patterns
- Use consistent error handling with self-correction
- Implement progress indicators for long operations
- Always request user consent for file operations
- Log important operations for debugging

## Testing Strategy
- Unit tests for all commands
- Integration tests for agent interactions
- End-to-end tests for user workflows
- Performance benchmarks for context handling

## Release Process
1. Update version in package.json and index.js
2. Update CHANGELOG.md
3. Run full test suite
4. Commit with conventional commit message
5. `npm publish` (triggers GitHub sync automatically)

## Future Vision
- Support for open-source LLMs
- Local model execution
- Voice interface
- Mobile companion app
- Blockchain audit trail

## Important Files
- Entry point: `index.js`
- Tests: `test/` directory (to be created)
- Docs: `readme.md`, `GROK_VS_CLAUDE.md`
- Config: `package.json`, `.npmignore`

## Environment Variables
- `XAI_API_KEY`: X.AI API key for Grok access
- `GROK_AUTO_UPDATE`: Set to 'false' to disable auto-updates
- `GROK_CONTEXT_LIMIT`: Override default context limit

## Common Issues & Solutions
1. **API Key Not Set**: Run `grok /config` to set up
2. **Auto-update Failed**: Check npm permissions
3. **Large File Timeout**: Increase context limit
4. **Windows Path Issues**: Use forward slashes

Remember: This tool is designed to evolve automatically. Users should rarely need manual intervention.