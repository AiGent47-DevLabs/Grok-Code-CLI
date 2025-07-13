# TODO: Missing Features from Design Document

## High Priority (Security)

- [ ] Encrypt API keys in config file
- [ ] Add sandboxed execution option for /run command *(Can be solved with Daytona)*
- [ ] Implement audit logging for all file changes

## Medium Priority (Core Features)

- [ ] Add model backend abstraction for multiple LLM providers
- [ ] Add /docs command for documentation generation
- [ ] Add /test command for automated test creation
- [ ] Add batch processing capability for multiple files *(Can be enhanced with Daytona)*
- [ ] Show file diffs before applying changes

## Low Priority (Advanced Features)

- [ ] Add plugin system with hooks for extensions
- [ ] Add scripting/automation features
- [ ] Add Docker/venv integration for sandboxed execution *(Daytona provides this)*
- [ ] Add pipeline support for shell integration

## Daytona Integration (Recommended Solution)

Many of the security and scalability features can be implemented using Daytona:

### What Daytona Solves:
- ✅ **Sandboxed Execution**: Cloud-based isolated environments
- ✅ **Resource Management**: Built-in CPU/memory/storage limits
- ✅ **Preview Capability**: Instant web app previews
- ✅ **State Persistence**: Long-living sandboxes for complex workflows
- ✅ **Multi-Language Support**: Python, TypeScript, and more

### Implementation Priority:
1. **Phase 1**: Basic sandbox integration for `/run` command
2. **Phase 2**: Enhanced `/edit` with sandbox testing
3. **Phase 3**: Batch processing across multiple sandboxes
4. **Phase 4**: Full workspace management features

See [DAYTONA_INTEGRATION.md](DAYTONA_INTEGRATION.md) for detailed implementation guide.

## Implementation Notes

### API Key Encryption
Use node-keytar or similar for secure credential storage:
```javascript
const keytar = require('keytar');
await keytar.setPassword('grok-cli', 'api-key', apiKey);
```

### Model Abstraction
Create adapter interface:
```javascript
class LLMAdapter {
  async complete(messages) { /* abstract */ }
}
class GrokAdapter extends LLMAdapter { /* ... */ }
class OpenAIAdapter extends LLMAdapter { /* ... */ }
```

### Audit Logging
Track all operations:
```javascript
const audit = {
  timestamp: new Date(),
  action: 'file_write',
  file: filepath,
  user: os.userInfo().username,
  changes: diff
};
``` 