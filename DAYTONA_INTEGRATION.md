# Daytona Integration Guide for Grok CLI

## Overview

This guide shows how to integrate Daytona sandboxes into the Grok CLI to provide secure, cloud-based execution environments for AI-generated code.

## Installation

```bash
npm install daytona-sdk
```

## Implementation Plan

### 1. Add Daytona Configuration

```javascript
// config.js additions
const daytonaConfig = {
  apiKey: process.env.DAYTONA_API_KEY,
  serverUrl: process.env.DAYTONA_SERVER_URL || 'https://api.daytona.io',
  target: 'cloud' // or 'local' for self-hosted
};
```

### 2. Create Sandbox Manager

```javascript
// daytona-manager.js
const { Daytona } = require('daytona-sdk');

class DaytonaSandboxManager {
  constructor(config) {
    this.daytona = new Daytona({
      apiKey: config.apiKey,
      serverUrl: config.serverUrl,
      target: config.target
    });
    this.activeSandboxes = new Map();
  }

  async createSandbox(sessionId, language = 'python') {
    const sandbox = await this.daytona.create({
      id: sessionId,
      language: language,
      public: true
    });
    
    this.activeSandboxes.set(sessionId, sandbox);
    return sandbox;
  }

  async executeCode(sessionId, code) {
    const sandbox = this.activeSandboxes.get(sessionId);
    if (!sandbox) {
      throw new Error('No active sandbox for this session');
    }
    
    const response = await sandbox.process.codeRun(code);
    return response.result;
  }

  async cleanupSandbox(sessionId) {
    const sandbox = this.activeSandboxes.get(sessionId);
    if (sandbox) {
      await this.daytona.remove(sandbox);
      this.activeSandboxes.delete(sessionId);
    }
  }
}
```

### 3. New Slash Commands

```javascript
// Add to commands object in index.js
sandbox: async (action, ...args) => {
  switch(action) {
    case 'create':
      const language = args[0] || 'python';
      await sandboxManager.createSandbox(currentSession.id, language);
      console.log(chalk.green('✅ Sandbox created'));
      break;
      
    case 'run':
      const code = args.join(' ');
      const result = await sandboxManager.executeCode(currentSession.id, code);
      console.log(chalk.blue('Output:'), result);
      break;
      
    case 'destroy':
      await sandboxManager.cleanupSandbox(currentSession.id);
      console.log(chalk.yellow('🗑️  Sandbox destroyed'));
      break;
  }
},

preview: async () => {
  const sandbox = sandboxManager.activeSandboxes.get(currentSession.id);
  if (sandbox && sandbox.previewUrl) {
    console.log(chalk.green('🌐 Preview URL:'), sandbox.previewUrl);
    // Optionally open in browser
    require('child_process').exec(`open ${sandbox.previewUrl}`);
  }
}
```

### 4. Enhanced Edit Command with Sandboxing

```javascript
edit: async (file) => {
  const code = await readFileWithConsent(file);
  if (!code) return;
  
  const { prompt, useSandbox } = await inquirer.prompt([
    { type: 'input', name: 'prompt', message: 'Edit instructions:' },
    { type: 'confirm', name: 'useSandbox', message: 'Run in sandbox?', default: true }
  ]);
  
  const response = await sendToGrok(`Edit this code: ${prompt}\n\nCode: ${code}`);
  
  if (useSandbox) {
    // Test in sandbox first
    console.log(chalk.blue('Testing in sandbox...'));
    const sandbox = await sandboxManager.createSandbox(currentSession.id);
    
    try {
      const testResult = await sandboxManager.executeCode(currentSession.id, editedCode);
      console.log(chalk.green('✅ Sandbox test passed'));
      console.log('Output:', testResult);
      
      const { applyChanges } = await inquirer.prompt([{
        type: 'confirm',
        name: 'applyChanges',
        message: 'Apply changes to local file?'
      }]);
      
      if (applyChanges) {
        await writeFileWithConsent(file, editedCode);
      }
    } catch (error) {
      console.log(chalk.red('❌ Sandbox test failed:'), error.message);
    }
  }
}
```

## Usage Examples

### Basic Sandbox Workflow

```bash
# Create a Python sandbox
grok /sandbox create python

# Generate code with Grok
grok "Write a Flask web app with a simple API"

# Run the generated code in sandbox
grok /sandbox run "python app.py"

# Preview the web app
grok /preview

# Clean up when done
grok /sandbox destroy
```

### Safe File Editing

```bash
# Edit file with automatic sandbox testing
grok /edit app.py
# Prompt: "Add error handling and input validation"
# The code will be tested in sandbox before applying locally
```

## Environment Variables

Add to your `.env` file:

```
DAYTONA_API_KEY=your_daytona_api_key
DAYTONA_SERVER_URL=https://api.daytona.io
```

## Benefits

1. **Security**: All code runs in isolated environments
2. **Safety**: Test before applying changes locally
3. **Scalability**: Run multiple sandboxes concurrently
4. **Preview**: See web apps instantly without local setup
5. **State**: Sandboxes persist between commands

## Future Enhancements

- Batch processing across multiple sandboxes
- Docker image customization
- Team workspace sharing
- Automated testing pipelines
- Resource monitoring dashboard 