# GROK-CODE CLI

A powerful CLI terminal agent for Grok 4, inspired by Claude Code. Enables code generation, editing, running, and more via natural language interactions.

![npm version](https://img.shields.io/npm/v/@aigent47-devlabs/grok-code-cli)
![license](https://img.shields.io/npm/l/@aigent47-devlabs/grok-code-cli)
![node version](https://img.shields.io/node/v/@aigent47-devlabs/grok-code-cli)

## Features

### Core Features
- 🤖 Natural language code generation and editing
- 📝 Interactive file editing with AI assistance
- 🔧 Execute code and commands directly
- 💾 Session management with conversation history
- 🎨 Beautiful colored terminal output
- 🔒 Safe file operations with user consent
- 🚀 Project initialization assistance
- 🔄 Auto-update system (checks every 24 hours)
- 🔁 Self-correction on API errors
- 📋 GROK.md context support (global and project-specific)

### New in v1.2.0
- 🎨 **Canvas Preview** - Visualize HTML, JavaScript, and Python files in browser
- 📧 **Email Integration** - Convert email requests into GitHub issues
- ☀️ **Morning Init** - Start your day with context from previous sessions
- 🌙 **Pack It Up** - End-of-day summaries with next day priorities
- 🤖 **Multi-Agent System** - Automated GitHub workflow management
- 📦 **Interactive UI** - Beautiful input box like Claude Code

## Important Disclaimer

**⚠️ WARNING**: This tool uses AI to generate code. AI-generated code can be unpredictable, incorrect, or potentially harmful. **You are solely responsible for reviewing and testing all generated code before execution.**

On first run, you'll see a disclaimer notice. For the full legal disclaimer, run:
```bash
grok /disclaimer
```

## Visual Experience

The CLI features a beautiful ASCII art splash screen in X.AI's signature magenta color scheme:

```
 ██████╗ ██████╗  ██████╗ ██╗  ██╗      ██████╗ ██████╗ ██████╗ ███████╗
██╔════╝ ██╔══██╗██╔═══██╗██║ ██╔╝     ██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║  ███╗██████╔╝██║   ██║█████╔╝█████╗██║     ██║   ██║██║  ██║█████╗  
██║   ██║██╔══██╗██║   ██║██╔═██╗╚════╝██║     ██║   ██║██║  ██║██╔══╝  
╚██████╔╝██║  ██║╚██████╔╝██║  ██╗      ╚██████╗╚██████╔╝██████╔╝███████╗
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝       ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝

🤖 GROK-CODE - AI-Powered Development Assistant
Version 1.2.0 | Powered by X.AI
Developed by: AiGent47.com
```

## Prerequisites

- Node.js >= 14.0.0
- npm or yarn
- X.AI API key (get one at [https://x.ai/api](https://x.ai/api))

## Installation

```bash
npm install -g @aigent47-devlabs/grok-code-cli
```

Or with yarn:

```bash
yarn global add @aigent47-devlabs/grok-code-cli
```

## Quick Start

1. Install the CLI globally:
   ```bash
   npm install -g @aigent47-devlabs/grok-code-cli
   ```

2. Configure your API key:
   ```bash
   grok /config
   ```

3. Start using Grok:
   ```bash
   grok "Write a Python script that calculates fibonacci numbers"
   ```

## Configuration

### Initial Setup

On first run, configure your X.AI API key:

```bash
grok /config
```

This will prompt you for:
- **API Key**: Your X.AI API key
- **Working Directory**: Default directory for file operations (defaults to current directory)

Configuration is stored in `~/.grok/config.json`.

### Environment Variables

You can also set your API key via environment variable:

```bash
export XAI_API_KEY="your-api-key-here"
```

### API Key Format

Your X.AI API key should look like: `xai-XXXXXXXXXXXXXXXXXXXXXXXX`

Get your API key from: [https://x.ai/api](https://x.ai/api)

## Commands

### Basic Usage

```bash
# Send a prompt to Grok
grok "Explain how async/await works in JavaScript"

# Use slash commands
grok /help
```

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/help` | Show all available commands | `grok /help` |
| `/new` | Start a new session | `grok /new` |
| `/history` | View current session history | `grok /history` |
| `/resume <id>` | Resume a previous session | `grok /resume abc123` |
| `/model <name>` | Switch AI model | `grok /model grok-3` |
| `/config` | Configure API key and settings | `grok /config` |
| `/explain <code/file>` | Explain code or file contents | `grok /explain app.js` |
| `/edit <file>` | AI-assisted file editing | `grok /edit index.js` |
| `/run <cmd/file>` | Execute command or file | `grok /run "npm test"` |
| `/init` | Initialize a new project | `grok /init` |
| `/canvas <file>` | Preview HTML/JS/Python visualizations | `grok /canvas demo.html` |
| `/email` | Email integration commands | `grok /email review` |
| `/morning-init` | Initialize morning workspace | `grok /morning-init` |
| `/pack-it-up` | End of day summary | `grok /pack-it-up` |
| `/disclaimer` | View legal disclaimer | `grok /disclaimer` |
| `/exit` | Exit the CLI | `grok /exit` |

## Examples

### Code Generation

```bash
# Generate a React component
grok "Create a React TodoList component with add and delete functionality"

# Generate a Python script
grok "Write a Python script to scrape headlines from a news website"
```

### Code Explanation

```bash
# Explain a file
grok /explain server.js

# Explain code snippet
grok /explain "const [state, setState] = useState(0)"
```

### File Editing

```bash
# Edit a file with AI assistance
grok /edit app.js
# Then provide instructions: "Add error handling to all async functions"
```

### Project Initialization

```bash
# Initialize a new project
grok /init
# Then specify: "python" or "node" or "react"
```

### Session Management

```bash
# Start fresh
grok /new

# View conversation history
grok /history

# Resume previous session
grok /resume <session-id>
```

### Canvas Preview (New!)

```bash
# Preview HTML visualization
grok /canvas examples/earth-simulation.html

# Preview JavaScript charts
grok /canvas examples/data-viz.js

# Preview Python plots
grok /canvas examples/analysis.py
```

### Email Integration (New!)

```bash
# Review pending email requests
grok /email review

# Process a specific request
grok /email process <request-id>

# Generate email template
grok /email template feature

# Start webhook server
grok /email webhook
```

### Daily Workflow (New!)

```bash
# Start your day
grok /morning-init

# Work throughout the day...

# End your day
grok /pack-it-up
```

## Session Storage

Sessions are stored in `~/.grok/sessions/` with the following structure:
- Each session is saved as a JSON file
- Session ID is a UUID
- Contains full conversation history
- Preserves model selection

## Safety Features

- **File Consent**: All file operations require explicit user confirmation
- **Backup Creation**: Automatic backups before file modifications
- **Directory Creation**: Automatic directory creation with user consent
- **Large File Warning**: Warns when reading files over 1MB

## Troubleshooting

### API Key Issues

If you see "Invalid API key" errors:
1. Verify your API key at [https://x.ai/api](https://x.ai/api)
2. Re-run `grok /config` to update your key
3. Check environment variable: `echo $XAI_API_KEY`

### Network Errors

If you see network errors:
1. Check your internet connection
2. Verify X.AI API is accessible
3. Check for proxy/firewall issues

### Model Availability

Available models:
- `grok-4` (default)
- `grok-3`
- Additional models as they become available

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/AiGent47-DevLabs/Grok-Code-CLI.git
cd Grok-Code-CLI

# Install dependencies
npm install

# Link for local testing
npm link

# Run locally
grok /help
```

### Running Tests

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by Claude Code and similar AI-powered development tools
- Built with [Commander.js](https://github.com/tj/commander.js/) for CLI parsing
- Uses [Chalk](https://github.com/chalk/chalk) for beautiful terminal colors
- Powered by [X.AI's Grok models](https://x.ai)

## Support

- 🐛 Report bugs via [GitHub Issues](https://github.com/AiGent47-DevLabs/Grok-Code-CLI/issues)
- 💡 Request features via [GitHub Issues](https://github.com/AiGent47-DevLabs/Grok-Code-CLI/issues)
- 📧 Contact: robert@aigent47.com

## Changelog

### v1.2.0 (2025-07-14)
- Added Canvas preview system for visualizations
- Email integration for feature requests
- Morning-init and pack-it-up commands
- Interactive UI with input box
- Multi-agent GitHub automation
- Daily summary system

### v1.1.0 (2025-07-14)
- Auto-update functionality
- Self-correction error handling
- GROK.md context support
- Workspace analysis
- MCP Zapier connector

### v1.0.0 (2025-07-13)
- Initial release
- Basic code generation and editing
- Session management
- File operations with consent
- Multiple model support

## Design Document Compliance

This CLI implements the core features from the original design document:

### ✅ Implemented
- Conversational code generation
- File operations (read/write/edit)
- Session history management
- Slash commands
- Environment integration (/run)
- Multi-model support
- Configuration management
- File access controls

### 🚧 Planned Features
- **Security**: API key encryption, sandboxed execution, audit logging
- **Extensibility**: Plugin support, model backend abstraction
- **Advanced**: Batch processing, file diffs, dedicated /docs and /test commands

See [TODO.md](TODO.md) for the complete roadmap.

---

Made with ❤️ by Robert DiCrisci  
© 2025 AiGent47.com, LLC