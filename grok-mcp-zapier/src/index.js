#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Initialize Express app for Zapier webhooks
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuration
const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'grok-mcp-secret';

// Helper to execute GROK CLI commands
async function executeGrokCommand(command, args = []) {
  try {
    const fullCommand = `grok ${command} ${args.join(' ')}`;
    const output = execSync(fullCommand, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// MCP Server setup
const server = new Server(
  {
    name: 'grok-mcp-zapier',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools for MCP
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'grok_generate_code',
        description: 'Generate code using GROK AI based on a natural language prompt',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The natural language prompt describing what code to generate',
            },
            language: {
              type: 'string',
              description: 'Programming language (optional)',
              enum: ['python', 'javascript', 'typescript', 'java', 'go', 'rust'],
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'grok_explain_code',
        description: 'Get an AI explanation of code',
        inputSchema: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'The code to explain',
            },
            file_path: {
              type: 'string',
              description: 'Path to a file containing code (alternative to code parameter)',
            },
          },
        },
      },
      {
        name: 'grok_edit_file',
        description: 'Edit a file using AI instructions',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: 'Path to the file to edit',
            },
            instructions: {
              type: 'string',
              description: 'Instructions for how to edit the file',
            },
          },
          required: ['file_path', 'instructions'],
        },
      },
      {
        name: 'grok_run_command',
        description: 'Run a command or script',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Command or file path to run',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'grok_create_project',
        description: 'Initialize a new project with AI assistance',
        inputSchema: {
          type: 'object',
          properties: {
            project_type: {
              type: 'string',
              description: 'Type of project to create',
              enum: ['python', 'node', 'react', 'vue', 'django', 'express'],
            },
            project_name: {
              type: 'string',
              description: 'Name of the project',
            },
          },
          required: ['project_type'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'grok_generate_code': {
      const { prompt, language } = args;
      const fullPrompt = language 
        ? `Write ${language} code: ${prompt}`
        : prompt;
      
      const result = await executeGrokCommand('', [fullPrompt]);
      return {
        content: [
          {
            type: 'text',
            text: result.success ? result.output : `Error: ${result.error}`,
          },
        ],
      };
    }

    case 'grok_explain_code': {
      const { code, file_path } = args;
      const command = file_path ? `/explain ${file_path}` : `/explain "${code}"`;
      
      const result = await executeGrokCommand(command);
      return {
        content: [
          {
            type: 'text',
            text: result.success ? result.output : `Error: ${result.error}`,
          },
        ],
      };
    }

    case 'grok_edit_file': {
      const { file_path, instructions } = args;
      // Create a temporary file with instructions
      const tempFile = path.join(os.tmpdir(), 'grok-edit-instructions.txt');
      await fs.writeFile(tempFile, instructions);
      
      const result = await executeGrokCommand('/edit', [file_path]);
      
      // Clean up temp file
      await fs.remove(tempFile);
      
      return {
        content: [
          {
            type: 'text',
            text: result.success ? 'File edited successfully' : `Error: ${result.error}`,
          },
        ],
      };
    }

    case 'grok_run_command': {
      const { command } = args;
      const result = await executeGrokCommand('/run', [command]);
      
      return {
        content: [
          {
            type: 'text',
            text: result.success ? result.output : `Error: ${result.error}`,
          },
        ],
      };
    }

    case 'grok_create_project': {
      const { project_type, project_name } = args;
      const projectPrompt = project_name 
        ? `Create a ${project_type} project named ${project_name}`
        : `Initialize a ${project_type} project`;
      
      const result = await executeGrokCommand('/init', [project_type]);
      
      return {
        content: [
          {
            type: 'text',
            text: result.success ? `Project created: ${result.output}` : `Error: ${result.error}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Zapier webhook endpoints
app.post('/zapier/webhook/:action', async (req, res) => {
  const { action } = req.params;
  const { secret, ...data } = req.body;

  // Verify webhook secret
  if (secret !== WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let result;

    switch (action) {
      case 'generate':
        result = await executeGrokCommand('', [data.prompt]);
        break;

      case 'explain':
        result = await executeGrokCommand('/explain', [data.code || data.file_path]);
        break;

      case 'edit':
        result = await executeGrokCommand('/edit', [data.file_path]);
        break;

      case 'run':
        result = await executeGrokCommand('/run', [data.command]);
        break;

      case 'init':
        result = await executeGrokCommand('/init', [data.project_type]);
        break;

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    if (result.success) {
      res.json({ 
        success: true, 
        output: result.output,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Zapier authentication endpoint
app.get('/zapier/auth/test', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.ZAPIER_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  res.json({ 
    success: true, 
    message: 'Authentication successful',
    service: 'GROK MCP Zapier Connector'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'grok-mcp-zapier',
    version: '1.0.0'
  });
});

// Start Express server for Zapier webhooks
app.listen(PORT, () => {
  console.log(`Zapier webhook server listening on port ${PORT}`);
});

// Start MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GROK MCP Zapier connector started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});