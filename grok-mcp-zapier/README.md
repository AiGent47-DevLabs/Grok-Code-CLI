# GROK MCP Zapier Connector

Connect GROK CLI to Zapier for powerful AI-driven automation workflows using the Model Context Protocol (MCP).

## Features

- 🤖 **AI Code Generation** - Generate code from natural language in your Zapier workflows
- 📝 **Code Explanation** - Get AI explanations of code snippets
- 🔧 **File Editing** - Edit files with AI assistance
- 🚀 **Command Execution** - Run commands and scripts
- 🏗️ **Project Initialization** - Create new projects with AI guidance
- 🔄 **Automatic Updates** - Self-updating capability built-in

## Installation

1. Install GROK CLI globally:
```bash
npm install -g @aigent47-devlabs/grok-code-cli
```

2. Clone this MCP connector:
```bash
git clone https://github.com/AiGent47-DevLabs/grok-mcp-zapier.git
cd grok-mcp-zapier
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings:
# PORT=3000
# WEBHOOK_SECRET=your-webhook-secret
# ZAPIER_API_KEY=your-zapier-api-key
```

4. Start the MCP server:
```bash
npm start
```

## Zapier Integration

### 1. Create a Zapier App

1. Go to [Zapier Developer Platform](https://developer.zapier.com)
2. Create a new app called "GROK CLI"
3. Import the `zapier-app-definition.json` file

### 2. Configure Authentication

The connector uses API key authentication:
- **API Key**: Your MCP API key
- **Webhook URL**: Your server URL (e.g., `https://your-server.com`)

### 3. Available Actions

#### Generate Code
Generate code using GROK AI from natural language prompts.

**Input Fields:**
- `prompt` (required): Description of what code to generate
- `language` (optional): Programming language (python, javascript, etc.)

**Example:**
```
Prompt: "Create a function to calculate fibonacci numbers"
Language: "python"
```

#### Explain Code
Get an AI explanation of code snippets.

**Input Fields:**
- `code` (required): The code to explain

#### Run Command
Execute commands or scripts.

**Input Fields:**
- `command` (required): Command to execute

#### Create Project
Initialize a new project with AI assistance.

**Input Fields:**
- `project_type` (required): Type of project (python, node, react, etc.)
- `project_name` (optional): Name of the project

### 4. Available Triggers

#### New Code Generated
Triggers when new code is generated through the system.

#### New Project Created
Triggers when a new project is initialized.

## MCP Configuration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "grok-zapier": {
      "command": "node",
      "args": ["./path/to/grok-mcp-zapier/src/index.js"],
      "env": {
        "PORT": "3000",
        "WEBHOOK_SECRET": "your-webhook-secret",
        "ZAPIER_API_KEY": "your-zapier-api-key"
      }
    }
  }
}
```

## Security

- All webhook endpoints require a secret for authentication
- API endpoints use API key authentication
- Self-correction built-in for error handling
- Automatic updates ensure latest security patches

## Auto-Update Feature

The GROK CLI includes automatic updates:
- Checks for updates every 24 hours
- Auto-installs updates by default
- Can be disabled with: `grok /config auto-update`

## Example Zapier Workflows

### 1. Slack to Code
1. Trigger: New Slack message with code request
2. Action: Generate Code with GROK
3. Action: Post code to Slack thread

### 2. GitHub Issue to Implementation
1. Trigger: New GitHub issue
2. Action: Generate Code based on issue description
3. Action: Create GitHub pull request

### 3. Email to Script
1. Trigger: New email with script request
2. Action: Generate Code
3. Action: Run Command to test
4. Action: Email results back

## Development

### Running Tests
```bash
npm test
```

### Running in Development Mode
```bash
npm run dev
```

## Troubleshooting

### MCP Server Not Starting
- Check that GROK CLI is installed globally
- Verify environment variables are set
- Check port availability

### Zapier Authentication Failed
- Verify your API key is correct
- Check webhook URL is accessible
- Ensure WEBHOOK_SECRET matches

### Commands Not Executing
- Verify GROK CLI works standalone
- Check file permissions
- Review server logs

## Support

- 🐛 Report bugs: [GitHub Issues](https://github.com/AiGent47-DevLabs/grok-mcp-zapier/issues)
- 📧 Contact: robert@aigent47.com

## License

MIT License - see LICENSE file for details

---

Made with ❤️ by AiGent47 DevLabs