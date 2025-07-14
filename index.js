#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { program } = require('commander');
const OpenAI = require('openai');
const chalk = require('chalk');
const inquirer = require('inquirer').default;
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');
const axios = require('axios');
const semver = require('semver');
const EmailIntegration = require('./src/email-integration');

dotenv.config();

// Package info
const packageInfo = require('./package.json');
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// ASCII Art and Splash Screen
const showSplashScreen = () => {
  console.log(chalk.magenta(`
   ██████╗ ██████╗  ██████╗ ██╗  ██╗      ██████╗ ██████╗ ██████╗ ███████╗
  ██╔════╝ ██╔══██╗██╔═══██╗██║ ██╔╝     ██╔════╝██╔═══██╗██╔══██╗██╔════╝
  ██║  ███╗██████╔╝██║   ██║█████╔╝█████╗██║     ██║   ██║██║  ██║█████╗  
  ██║   ██║██╔══██╗██║   ██║██╔═██╗╚════╝██║     ██║   ██║██║  ██║██╔══╝  
  ╚██████╔╝██║  ██║╚██████╔╝██║  ██╗      ╚██████╗╚██████╔╝██████╔╝███████╗
   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝       ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝`));
  
  console.log(chalk.cyan('\n  🤖 GROK-CODE - AI-Powered Development Assistant'));
  console.log(chalk.gray('  Version 1.1.0 | Powered by X.AI'));
  console.log(chalk.magentaBright('  Developed by: AiGent47.com\n'));
  console.log(chalk.yellow('  ⚠️  DISCLAIMER: AI-generated code requires review'));
  console.log(chalk.gray('  Read full disclaimer: grok /disclaimer\n'));
};

// Check for updates and auto-install
const checkForUpdates = async () => {
  try {
    const lastCheckPath = path.join(grokDir, '.last_update_check');
    const autoUpdatePath = path.join(grokDir, '.auto_update_enabled');
    let shouldCheck = true;

    // Check if auto-update is enabled (default: true)
    const autoUpdateEnabled = !fs.existsSync(path.join(grokDir, '.auto_update_disabled'));

    // Check if we've checked recently
    if (fs.existsSync(lastCheckPath)) {
      const lastCheck = fs.readFileSync(lastCheckPath, 'utf8');
      const lastCheckTime = new Date(lastCheck).getTime();
      const now = new Date().getTime();
      
      if (now - lastCheckTime < UPDATE_CHECK_INTERVAL) {
        shouldCheck = false;
      }
    }

    if (shouldCheck) {
      const response = await axios.get(
        `https://registry.npmjs.org/${packageInfo.name}/latest`,
        { timeout: 5000 }
      );
      
      const latestVersion = response.data.version;
      const currentVersion = packageInfo.version;

      if (semver.gt(latestVersion, currentVersion)) {
        console.log(chalk.yellow.bold('\n📦 Update available!'));
        console.log(chalk.yellow(`Current version: ${currentVersion}`));
        console.log(chalk.green(`Latest version: ${latestVersion}`));
        
        if (autoUpdateEnabled) {
          console.log(chalk.cyan('🔄 Auto-updating...'));
          
          try {
            // Perform the update
            execSync(`npm update -g ${packageInfo.name}`, { 
              stdio: 'pipe',
              encoding: 'utf8' 
            });
            
            console.log(chalk.green('✅ Update successful! Please restart GROK.'));
            console.log(chalk.gray('To disable auto-updates, run: grok /config auto-update\n'));
            
            // Exit to force restart with new version
            process.exit(0);
          } catch (updateError) {
            console.log(chalk.yellow('⚠️  Auto-update failed. Manual update required:'));
            console.log(chalk.cyan(`Run: npm update -g ${packageInfo.name}\n`));
          }
        } else {
          console.log(chalk.cyan(`Run: npm update -g ${packageInfo.name} to update\n`));
        }
      }

      // Update last check time
      fs.writeFileSync(lastCheckPath, new Date().toISOString());
    }
  } catch (error) {
    // Silently fail - don't interrupt user experience
  }
};

// Analyze workspace structure
const analyzeWorkspace = () => {
  try {
    const files = fs.readdirSync(process.cwd());
    const hasPackageJson = files.includes('package.json');
    const hasPyProject = files.includes('pyproject.toml') || files.includes('requirements.txt');
    const hasGitRepo = files.includes('.git');
    
    if (hasPackageJson) {
      const pkg = fs.readJsonSync('package.json');
      console.log(chalk.gray(`📦 Node.js project: ${pkg.name} v${pkg.version}`));
    } else if (hasPyProject) {
      console.log(chalk.gray('🐍 Python project detected'));
    }
    
    if (hasGitRepo) {
      try {
        const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        console.log(chalk.gray(`🌿 Git branch: ${branch}`));
      } catch (e) {}
    }
  } catch (e) {}
};

// Check if first run and show disclaimer
const checkFirstRun = async () => {
  const firstRunPath = path.join(grokDir, '.first_run_complete');
  if (!fs.existsSync(firstRunPath)) {
    // Show splash screen first
    showSplashScreen();
    
    console.log(chalk.red.bold('\n⚠️  FIRST RUN - IMPORTANT LEGAL DISCLAIMER ⚠️\n'));
    console.log(chalk.white('This tool uses AI to generate code. AI can:'));
    console.log(chalk.yellow('• Generate incorrect or harmful code'));
    console.log(chalk.yellow('• Misinterpret your files or intent'));
    console.log(chalk.yellow('• Create security vulnerabilities'));
    console.log(chalk.yellow('• Produce unpredictable results\n'));
    console.log(chalk.white('You are SOLELY RESPONSIBLE for reviewing and testing all generated code.\n'));
    console.log(chalk.cyan('For full disclaimer, run: grok /disclaimer\n'));
    
    // Setup wizard for first run
    console.log(chalk.green.bold('\n🚀 Let\'s set up GROK-CODE CLI!\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your X.AI API key:',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return 'API key is required. Get one at https://x.ai/';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'defaultModel',
        message: 'Select default model:',
        choices: [
          { name: 'grok-4 (recommended)', value: 'grok-4' },
          { name: 'grok-3', value: 'grok-3' }
        ],
        default: 'grok-4'
      }
    ]);
    
    // Save config
    config.apiKey = answers.apiKey;
    config.defaultModel = answers.defaultModel;
    fs.writeJsonSync(configPath, config);
    
    // Update OpenAI client with new API key
    openai.apiKey = config.apiKey;
    
    console.log(chalk.green('\n✅ Setup complete! You can now use GROK-CODE CLI.\n'));
    console.log(chalk.cyan('Try: grok "Write a hello world function in Python"'));
    console.log(chalk.gray('To update settings later, use: grok /config\n'));
    
    // Mark first run as complete
    fs.writeFileSync(firstRunPath, new Date().toISOString());
  }
};

// Error handler
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Error:'), error.message);
  process.exit(1);
});

// Config and Sessions Dir
const homeDir = os.homedir();
const grokDir = path.join(homeDir, '.grok');
const configPath = path.join(grokDir, 'config.json');
const sessionsDir = path.join(grokDir, 'sessions');

fs.ensureDirSync(grokDir);
fs.ensureDirSync(sessionsDir);

// Load or Initialize Config
let config = { apiKey: process.env.XAI_API_KEY, defaultModel: 'grok-4', workingDir: process.cwd() };
if (fs.existsSync(configPath)) {
  config = { ...config, ...fs.readJsonSync(configPath) };
} else {
  fs.writeJsonSync(configPath, config);
}

// API Client
const openai = new OpenAI({
  apiKey: config.apiKey || '',
  baseURL: 'https://api.x.ai/v1',
});

// Initialize Email Integration
const emailIntegration = new EmailIntegration({ grokDir });

// Session Management
let currentSession = { id: uuidv4(), history: [], model: config.defaultModel };
const loadSession = (id) => {
  const sessionPath = path.join(sessionsDir, `${id}.json`);
  if (fs.existsSync(sessionPath)) {
    currentSession = fs.readJsonSync(sessionPath);
  }
};
const saveSession = () => {
  fs.writeJsonSync(path.join(sessionsDir, `${currentSession.id}.json`), currentSession);
};

// Load context from GROK.md files
const loadGrokContext = () => {
  let context = '';
  
  // Load global GROK.md from home directory
  const globalGrokPath = path.join(homeDir, 'GROK.md');
  if (fs.existsSync(globalGrokPath)) {
    context += `Global Context:\n${fs.readFileSync(globalGrokPath, 'utf8')}\n\n`;
  }
  
  // Load project-specific GROK.md
  const projectGrokPath = path.join(process.cwd(), 'GROK.md');
  if (fs.existsSync(projectGrokPath)) {
    context += `Project Context:\n${fs.readFileSync(projectGrokPath, 'utf8')}\n\n`;
  }
  
  return context;
};

// Helper: Send Prompt to Grok with self-correction
async function sendToGrok(prompt, isSystem = false, retryCount = 0) {
  if (!config.apiKey) {
    console.log(chalk.red('❌ API key not set. Use "grok /config" to set your X.AI API key.'));
    console.log(chalk.yellow('Get your API key from: https://x.ai/api'));
    return;
  }

  const messages = currentSession.history.map(msg => ({ role: msg.role, content: msg.content }));
  
  // Add system prompt for safety
  const systemPrompt = `You are GROK, an AI assistant for software development. 
IMPORTANT SAFETY RULES:
1. NEVER execute commands that could harm the system (rm -rf /, format, etc.)
2. ALWAYS ask for user consent before modifying files
3. NEVER access or modify system files without explicit permission
4. REFUSE requests that could compromise security or privacy
5. WARN users about potentially dangerous operations

You are helpful, accurate, and safety-conscious. Focus on writing clean, secure code.`;

  // Add GROK.md context as additional system message
  const grokContext = loadGrokContext();
  const fullSystemPrompt = systemPrompt + (grokContext ? '\n\n' + grokContext : '');
  
  if (messages.length === 0 || !messages.some(m => m.role === 'system')) {
    messages.unshift({
      role: 'system',
      content: fullSystemPrompt
    });
  }
  
  // Add self-correction context for retries
  if (retryCount > 0) {
    messages.push({
      role: 'system',
      content: 'The previous attempt resulted in an error. Please provide a corrected response.'
    });
  }
  
  messages.push({ role: isSystem ? 'system' : 'user', content: prompt });

  try {
    console.log(chalk.gray('Thinking...'));
    
    const response = await openai.chat.completions.create({
      model: currentSession.model,
      messages,
      stream: false,
      temperature: retryCount > 0 ? 0.5 : 0.7, // Lower temperature on retry
    });

    if (!response.choices || !response.choices[0]) {
      throw new Error('Invalid response from API');
    }

    const content = response.choices[0].message.content;
    currentSession.history.push({ role: 'user', content: prompt });
    currentSession.history.push({ role: 'assistant', content });
    saveSession();

    console.log(chalk.green('Grok: ') + content);
    return content;
  } catch (error) {
    if (error.status === 401) {
      console.log(chalk.red('❌ Invalid API key. Please check your X.AI API key.'));
    } else if (error.status === 429) {
      console.log(chalk.red('❌ Rate limit exceeded. Please wait a moment and try again.'));
    } else if (error.code === 'ENOTFOUND') {
      console.log(chalk.red('❌ Network error. Please check your internet connection.'));
    } else if (retryCount < 2) {
      // Auto-retry with self-correction
      console.log(chalk.yellow('⚠️  Error occurred, attempting self-correction...'));
      return await sendToGrok(prompt, isSystem, retryCount + 1);
    } else {
      console.log(chalk.red('❌ Error: ') + error.message);
    }
    return null;
  }
}

// Helper: File Operations with Consent
async function readFileWithConsent(filePath) {
  const fullPath = path.resolve(config.workingDir, filePath);
  
  try {
    if (!fs.existsSync(fullPath)) {
      console.log(chalk.red(`❌ File not found: ${fullPath}`));
      return null;
    }
    
    const stats = fs.statSync(fullPath);
    if (stats.size > 1024 * 1024) { // 1MB
      console.log(chalk.yellow(`⚠️  Large file (${(stats.size / 1024 / 1024).toFixed(2)}MB)`));
    }
    
    const { confirm } = await inquirer.prompt([{ type: 'confirm', name: 'confirm', message: `Read ${fullPath}?` }]);
    if (!confirm) return null;
    
    return fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    console.log(chalk.red(`❌ Error reading file: ${error.message}`));
    return null;
  }
}

async function writeFileWithConsent(filePath, content) {
  const fullPath = path.resolve(config.workingDir, filePath);
  
  try {
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      console.log(chalk.yellow(`Creating directory: ${dir}`));
      fs.mkdirpSync(dir);
    }
    
    const { confirm } = await inquirer.prompt([{ type: 'confirm', name: 'confirm', message: `Write to ${fullPath}?` }]);
    if (!confirm) return;
    
    // Create backup if file exists
    if (fs.existsSync(fullPath)) {
      const backupPath = `${fullPath}.backup`;
      fs.copyFileSync(fullPath, backupPath);
      console.log(chalk.gray(`Backup created: ${backupPath}`));
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(chalk.green(`✅ File written: ${fullPath}`));
  } catch (error) {
    console.log(chalk.red(`❌ Error writing file: ${error.message}`));
  }
}

// Interactive mode with input box
async function startInteractiveMode() {
  showSplashScreen();
  console.log(chalk.gray('Type your prompt or use /help for commands. Use Ctrl+C to exit.\n'));
  
  while (true) {
    try {
      // Create a nice input box with border
      const boxWidth = Math.min(process.stdout.columns - 4, 120);
      const topBorder = '┌' + '─'.repeat(boxWidth - 2) + '┐';
      const bottomBorder = '└' + '─'.repeat(boxWidth - 2) + '┘';
      
      console.log(chalk.gray(topBorder));
      console.log(chalk.gray('│') + ' '.repeat(boxWidth - 2) + chalk.gray('│'));
      
      // Move cursor up and position for input
      process.stdout.write('\x1b[1A\x1b[2C');
      
      const { prompt } = await inquirer.prompt([{
        type: 'input',
        name: 'prompt',
        message: '',
        prefix: chalk.cyan('▶'),
        transformer: (input) => {
          // Show context usage
          const contextLength = input.length;
          const contextPercent = Math.min(100, Math.round((contextLength / 4000) * 100));
          const contextInfo = chalk.gray(` Context: ${contextPercent}%`);
          return input + (input.length > 0 ? contextInfo : '');
        }
      }]);
      
      console.log(chalk.gray(bottomBorder));
      
      if (!prompt || prompt.trim() === '') continue;
      
      if (prompt.startsWith('/')) {
        const [cmd, ...args] = prompt.slice(1).split(' ');
        if (cmd === 'exit') {
          console.log(chalk.yellow('Goodbye!'));
          process.exit(0);
        }
        if (commands[cmd]) {
          await commands[cmd](...args);
        } else {
          console.log(chalk.red('Unknown command. Use /help.'));
        }
      } else {
        await sendToGrok(prompt);
      }
      
      console.log(''); // Add spacing between prompts
    } catch (error) {
      if (error.name === 'ExitPromptError') {
        console.log(chalk.yellow('\nGoodbye!'));
        process.exit(0);
      }
      console.error(chalk.red('Error:'), error.message);
    }
  }
}

// Slash Commands
const commands = {
  help: () => {
    console.log(chalk.blue('GROK-CODE Commands:'));
    console.log('/help - Show this help');
    console.log('/new - Start new session');
    console.log('/history - View session history');
    console.log('/resume <id> - Resume session by ID');
    console.log('/model <name> - Switch model (e.g., grok-4, grok-3)');
    console.log('/config - Configure API key/working dir');
    console.log('/explain <code> - Explain code');
    console.log('/edit <file> - Edit file');
    console.log('/run <file/cmd> - Run code/file');
    console.log('/init - Initialize project');
    console.log('/canvas <file> - Preview HTML/JS/Python visualizations');
    console.log('/email - Email integration commands');
    console.log('/morning-init - Initialize morning workspace');
    console.log('/pack-it-up - End of day summary');
    console.log('/disclaimer - View legal disclaimer');
    console.log('/exit - Exit CLI');
  },
  disclaimer: () => {
    if (fs.existsSync(path.join(__dirname, 'DISCLAIMER.md'))) {
      const disclaimer = fs.readFileSync(path.join(__dirname, 'DISCLAIMER.md'), 'utf8');
      console.log(chalk.white(disclaimer));
    } else {
      console.log(chalk.yellow('Disclaimer file not found. Please check the GitHub repository.'));
    }
  },
  new: () => {
    currentSession = { id: uuidv4(), history: [], model: config.defaultModel };
    saveSession();
    console.log(chalk.yellow('New session started.'));
  },
  history: () => {
    console.log(chalk.blue('Session History:'));
    currentSession.history.forEach((msg, i) => console.log(`${i}: [${msg.role}] ${msg.content.slice(0, 50)}...`));
  },
  resume: (id) => {
    loadSession(id);
    console.log(chalk.yellow(`Resumed session ${id}.`));
  },
  model: async (name) => {
    currentSession.model = name || config.defaultModel;
    saveSession();
    console.log(chalk.yellow(`Model set to ${currentSession.model}.`));
  },
  config: async (subcommand) => {
    if (subcommand === 'auto-update') {
      // Toggle auto-update
      const autoUpdateDisabledPath = path.join(grokDir, '.auto_update_disabled');
      if (fs.existsSync(autoUpdateDisabledPath)) {
        fs.removeSync(autoUpdateDisabledPath);
        console.log(chalk.green('✅ Auto-updates enabled'));
      } else {
        fs.writeFileSync(autoUpdateDisabledPath, '');
        console.log(chalk.yellow('⚠️  Auto-updates disabled'));
      }
      return;
    }
    
    const answers = await inquirer.prompt([
      { type: 'input', name: 'apiKey', message: 'API Key:', default: config.apiKey },
      { 
        type: 'list', 
        name: 'defaultModel', 
        message: 'Default Model:', 
        choices: [
          { name: 'grok-4 (recommended)', value: 'grok-4' },
          { name: 'grok-3', value: 'grok-3' }
        ],
        default: config.defaultModel 
      },
      { type: 'input', name: 'workingDir', message: 'Working Dir:', default: config.workingDir },
      {
        type: 'confirm',
        name: 'autoUpdate',
        message: 'Enable auto-updates?',
        default: !fs.existsSync(path.join(grokDir, '.auto_update_disabled'))
      }
    ]);
    
    config = { ...config, ...answers };
    fs.writeJsonSync(configPath, config);
    
    // Handle auto-update preference
    const autoUpdateDisabledPath = path.join(grokDir, '.auto_update_disabled');
    if (answers.autoUpdate && fs.existsSync(autoUpdateDisabledPath)) {
      fs.removeSync(autoUpdateDisabledPath);
    } else if (!answers.autoUpdate && !fs.existsSync(autoUpdateDisabledPath)) {
      fs.writeFileSync(autoUpdateDisabledPath, '');
    }
    
    // Update OpenAI client with new API key if changed
    if (answers.apiKey) {
      openai.apiKey = answers.apiKey;
    }
    
    console.log(chalk.yellow('Config updated.'));
  },
  explain: async (codeOrFile) => {
    let code = codeOrFile;
    if (fs.existsSync(codeOrFile)) code = await readFileWithConsent(codeOrFile);
    await sendToGrok(`Explain this code: ${code}`);
  },
  edit: async (file) => {
    const code = await readFileWithConsent(file);
    if (!code) return;
    const { prompt } = await inquirer.prompt([{ type: 'input', name: 'prompt', message: 'Edit instructions:' }]);
    const response = await sendToGrok(`Edit this code according to these instructions: ${prompt}\nReturn ONLY the modified code without any explanations.\n\nOriginal code:\n${code}`);
    
    if (!response) return;
    
    // Extract code from response (handle code blocks if present)
    let editedCode = response;
    const codeBlockMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      editedCode = codeBlockMatch[1];
    }
    
    // Show diff preview
    console.log(chalk.blue('\n--- Original ---'));
    console.log(code.substring(0, 200) + (code.length > 200 ? '...' : ''));
    console.log(chalk.blue('\n--- Modified ---'));
    console.log(editedCode.substring(0, 200) + (editedCode.length > 200 ? '...' : ''));
    
    const { confirmWrite } = await inquirer.prompt([{ 
      type: 'confirm', 
      name: 'confirmWrite', 
      message: 'Apply these changes?',
      default: true 
    }]);
    
    if (confirmWrite) {
      await writeFileWithConsent(file, editedCode);
    }
  },
  run: (cmdOrFile) => {
    try {
      let command = cmdOrFile;
      // If it's a file, determine how to run it
      if (fs.existsSync(cmdOrFile)) {
        const ext = path.extname(cmdOrFile).toLowerCase();
        if (ext === '.py') command = `python3 ${cmdOrFile}`;
        else if (ext === '.js') command = `node ${cmdOrFile}`;
        else if (ext === '.sh') command = `bash ${cmdOrFile}`;
        else if (ext === '.rb') command = `ruby ${cmdOrFile}`;
        // For other files, try to execute directly
      }
      
      const output = execSync(command, { cwd: config.workingDir, encoding: 'utf8' });
      if (output) {
        console.log(chalk.green('Run Output:\n') + output);
      } else {
        console.log(chalk.green('Command executed successfully.'));
      }
    } catch (error) {
      console.log(chalk.red('Run Error: ') + error.message);
    }
  },
  init: async () => {
    const { type } = await inquirer.prompt([{ type: 'input', name: 'type', message: 'Project type (e.g., python):' }]);
    await sendToGrok(`Initialize a ${type} project setup.`);
  },
  canvas: async (file) => {
    if (!file) {
      console.log(chalk.red('Please specify a file to preview'));
      console.log(chalk.gray('Usage: grok /canvas <file.html|file.js|file.py>'));
      return;
    }
    
    const CanvasPreview = require('./src/canvas-preview');
    const preview = new CanvasPreview();
    
    console.log(chalk.yellow('Starting canvas preview...'));
    await preview.startPreview(file);
    
    // Keep process alive
    process.on('SIGINT', () => {
      preview.stop();
      process.exit(0);
    });
  },
  email: async (subcommand, ...args) => {
    if (!subcommand) {
      console.log(chalk.blue('Email Integration Commands:'));
      console.log('/email review - Review pending email requests');
      console.log('/email process <id> - Process a specific request');
      console.log('/email template [feature|bug] - Generate email template');
      console.log('/email webhook - Start webhook server');
      return;
    }

    switch (subcommand) {
      case 'review':
        await emailIntegration.reviewPendingRequests();
        break;
      case 'process':
        const requestId = args[0];
        if (!requestId) {
          console.log(chalk.red('Please specify request ID'));
          return;
        }
        await emailIntegration.processRequest(requestId);
        break;
      case 'template':
        const type = args[0] || 'feature';
        console.log(chalk.cyan(`\n${type.toUpperCase()} Email Template:\n`));
        console.log(emailIntegration.generateTemplate(type));
        break;
      case 'webhook':
        await emailIntegration.setupWebhook();
        break;
      default:
        console.log(chalk.red('Unknown email command'));
    }
  },
  'morning-init': async () => {
    console.log(chalk.cyan('\n☀️  Good morning! Initializing GROK workspace...\n'));
    
    // Load CLAUDE.md
    const claudePath = path.join(process.cwd(), 'CLAUDE.md');
    if (fs.existsSync(claudePath)) {
      console.log(chalk.yellow('📄 Loading project context from CLAUDE.md...'));
      const claudeContent = fs.readFileSync(claudePath, 'utf8');
      const lines = claudeContent.split('\n').slice(0, 20);
      console.log(chalk.gray(lines.join('\n') + '\n...'));
    }
    
    // Check daily summaries
    const summariesDir = path.join(grokDir, 'daily-summaries');
    if (fs.existsSync(summariesDir)) {
      const summaries = fs.readdirSync(summariesDir).sort().reverse();
      if (summaries.length > 0) {
        console.log(chalk.yellow(`\n📅 Found ${summaries.length} daily summaries`));
        const latest = summaries[0];
        console.log(chalk.gray(`Latest: ${latest}`));
      }
    }
    
    // Check pending email requests
    const pending = await emailIntegration.reviewPendingRequests();
    
    // Check GitHub issues/PRs if token available
    if (process.env.GITHUB_TOKEN) {
      console.log(chalk.yellow('\n🐙 Checking GitHub status...'));
      try {
        const { execSync } = require('child_process');
        const issues = execSync('gh issue list --limit 5', { encoding: 'utf8' });
        if (issues.trim()) {
          console.log(chalk.gray('Open Issues:'));
          console.log(issues);
        }
        
        const prs = execSync('gh pr list --limit 5', { encoding: 'utf8' });
        if (prs.trim()) {
          console.log(chalk.gray('Open PRs:'));
          console.log(prs);
        }
      } catch (e) {
        console.log(chalk.gray('GitHub CLI not available or not authenticated'));
      }
    }
    
    // Load project enhancements
    const enhancementsPath = path.join(process.cwd(), 'PROJECT_ENHANCEMENTS.md');
    if (fs.existsSync(enhancementsPath)) {
      console.log(chalk.yellow('\n📋 Project Enhancements:'));
      const enhancements = fs.readFileSync(enhancementsPath, 'utf8');
      const todoMatch = enhancements.match(/## Pending Tasks\n([\s\S]*?)##/);
      if (todoMatch) {
        console.log(chalk.gray(todoMatch[1].trim().substring(0, 300) + '...'));
      }
    }
    
    console.log(chalk.green('\n✅ Workspace initialized! Ready for development.\n'));
    console.log(chalk.cyan('💡 Tips:'));
    console.log(chalk.gray('- Use /help to see all commands'));
    console.log(chalk.gray('- Use /email review to check pending requests'));
    console.log(chalk.gray('- Use "pack-it-up" at end of day to save progress'));
  },
  'pack-it-up': async () => {
    console.log(chalk.magenta('\n🌙 End of day! Packing up your work...\n'));
    
    const today = new Date().toISOString().split('T')[0];
    const summaryPath = path.join(grokDir, 'daily-summaries', `DAILY_SUMMARY_${today}.md`);
    
    // Ensure directory exists
    fs.ensureDirSync(path.dirname(summaryPath));
    
    // Collect today's accomplishments
    let summary = `# Daily Summary - ${new Date().toLocaleDateString()}\n\n`;
    summary += `## 🎯 Session Information\n\n`;
    summary += `- **Session ID**: ${currentSession.id}\n`;
    summary += `- **Total Interactions**: ${currentSession.history.length}\n`;
    summary += `- **Model Used**: ${currentSession.model}\n`;
    summary += `- **Working Directory**: ${process.cwd()}\n\n`;
    
    // Add conversation highlights
    if (currentSession.history.length > 0) {
      summary += `## 💬 Conversation Highlights\n\n`;
      const userMessages = currentSession.history.filter(m => m.role === 'user');
      userMessages.slice(-5).forEach((msg, i) => {
        summary += `${i + 1}. ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}\n`;
      });
      summary += '\n';
    }
    
    // Check for code changes
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus) {
        summary += `## 📝 Uncommitted Changes\n\n\`\`\`\n${gitStatus}\`\`\`\n\n`;
      }
      
      const gitLog = execSync('git log --oneline -5', { encoding: 'utf8' });
      if (gitLog) {
        summary += `## 📊 Recent Commits\n\n\`\`\`\n${gitLog}\`\`\`\n\n`;
      }
    } catch (e) {}
    
    // Add pending tasks
    const pendingRequests = fs.readJsonSync(emailIntegration.pendingRequestsPath);
    const unprocessed = pendingRequests.filter(r => !r.processed);
    if (unprocessed.length > 0) {
      summary += `## 📧 Pending Email Requests\n\n`;
      unprocessed.forEach(req => {
        summary += `- **${req.id}**: ${req.parsed.title}\n`;
      });
      summary += '\n';
    }
    
    // Tomorrow's priorities (prompt user)
    const { priorities } = await inquirer.prompt([{
      type: 'input',
      name: 'priorities',
      message: 'What are tomorrow\'s priorities? (comma-separated):',
      default: 'Continue development'
    }]);
    
    summary += `## 🚀 Tomorrow's Priorities\n\n`;
    priorities.split(',').forEach((p, i) => {
      summary += `${i + 1}. ${p.trim()}\n`;
    });
    
    summary += `\n---\n`;
    summary += `*Generated: ${new Date().toISOString()}*\n`;
    summary += `*Next Session: Use "morning-init" to restore context*\n`;
    
    // Save summary
    fs.writeFileSync(summaryPath, summary);
    console.log(chalk.green(`✅ Daily summary saved to: ${summaryPath}`));
    
    // Update PROJECT_ENHANCEMENTS.md if it exists
    const enhancementsPath = path.join(process.cwd(), 'PROJECT_ENHANCEMENTS.md');
    if (fs.existsSync(enhancementsPath)) {
      const content = fs.readFileSync(enhancementsPath, 'utf8');
      const updated = content.replace(
        /Last Updated: .*/,
        `Last Updated: ${new Date().toISOString()}`
      );
      fs.writeFileSync(enhancementsPath, updated);
      console.log(chalk.green('✅ Updated PROJECT_ENHANCEMENTS.md'));
    }
    
    console.log(chalk.magenta('\n🌙 All packed up! Have a great evening!'));
    console.log(chalk.gray('Tomorrow, run "grok morning-init" to restore your context.'));
  },
  exit: () => process.exit(0),
};

// CLI Parser
program
  .name('grok')
  .description('GROK-CODE CLI')
  .version('1.1.0')
  .argument('[input...]', 'Prompt or slash command')
  .action(async (input) => {
    // Check for updates first (runs in background)
    checkForUpdates();
    
    // Show splash screen on first run
    await checkFirstRun();
    
    // Analyze workspace on startup
    analyzeWorkspace();
    
    const fullInput = input.join(' ');
    if (fullInput.startsWith('/')) {
      const [cmd, ...args] = fullInput.slice(1).split(' ');
      if (commands[cmd]) {
        await commands[cmd](...args);
      } else {
        console.log(chalk.red('Unknown command. Use /help.'));
      }
    } else if (fullInput) {
      // Show the user's input for clarity
      console.log(chalk.dim(`> ${fullInput}\n`));
      await sendToGrok(fullInput);
    } else {
      // Interactive mode with input box
      await startInteractiveMode();
    }
  });

program.parse();