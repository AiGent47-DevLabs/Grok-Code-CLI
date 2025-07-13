#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { program } = require('commander');
const OpenAI = require('openai');
const chalk = require('chalk');
const inquirer = require('inquirer');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { execSync } = require('child_process');

dotenv.config();

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
  console.log(chalk.gray('  Version 1.0.0 | Powered by X.AI'));
  console.log(chalk.magentaBright('  Developed by: AiGent47.com\n'));
  console.log(chalk.yellow('  ⚠️  DISCLAIMER: AI-generated code requires review'));
  console.log(chalk.gray('  Read full disclaimer: grok /disclaimer\n'));
};

// Check if first run and show disclaimer
const checkFirstRun = () => {
  const firstRunPath = path.join(grokDir, '.first_run_complete');
  if (!fs.existsSync(firstRunPath)) {
    console.log(chalk.red.bold('\n⚠️  FIRST RUN - IMPORTANT LEGAL DISCLAIMER ⚠️\n'));
    console.log(chalk.white('This tool uses AI to generate code. AI can:'));
    console.log(chalk.yellow('• Generate incorrect or harmful code'));
    console.log(chalk.yellow('• Misinterpret your files or intent'));
    console.log(chalk.yellow('• Create security vulnerabilities'));
    console.log(chalk.yellow('• Produce unpredictable results\n'));
    console.log(chalk.white('You are SOLELY RESPONSIBLE for reviewing and testing all generated code.\n'));
    console.log(chalk.cyan('For full disclaimer, run: grok /disclaimer\n'));
    
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

// Helper: Send Prompt to Grok
async function sendToGrok(prompt, isSystem = false) {
  if (!config.apiKey) {
    console.log(chalk.red('❌ API key not set. Use "grok /config" to set your X.AI API key.'));
    console.log(chalk.yellow('Get your API key from: https://x.ai/api'));
    return;
  }

  const messages = currentSession.history.map(msg => ({ role: msg.role, content: msg.content }));
  messages.push({ role: isSystem ? 'system' : 'user', content: prompt });

  try {
    console.log(chalk.gray('Thinking...'));
    
    const response = await openai.chat.completions.create({
      model: currentSession.model,
      messages,
      stream: false,
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
  config: async () => {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'apiKey', message: 'API Key:', default: config.apiKey },
      { type: 'input', name: 'workingDir', message: 'Working Dir:', default: config.workingDir },
    ]);
    config = { ...config, ...answers };
    fs.writeJsonSync(configPath, config);
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
      const output = execSync(cmdOrFile, { cwd: config.workingDir, stdio: 'pipe' });
      console.log(chalk.green('Run Output: ') + output.toString());
    } catch (error) {
      console.log(chalk.red('Run Error: ') + error.message);
    }
  },
  init: async () => {
    const { type } = await inquirer.prompt([{ type: 'input', name: 'type', message: 'Project type (e.g., python):' }]);
    await sendToGrok(`Initialize a ${type} project setup.`);
  },
  exit: () => process.exit(0),
};

// CLI Parser
program
  .name('grok')
  .description('GROK-CODE CLI')
  .version('1.0.0')
  .argument('[input...]', 'Prompt or slash command')
  .action(async (input) => {
    // Show splash screen on first run
    checkFirstRun();
    
    const fullInput = input.join(' ');
    if (fullInput.startsWith('/')) {
      const [cmd, ...args] = fullInput.slice(1).split(' ');
      if (commands[cmd]) {
        await commands[cmd](...args);
      } else {
        console.log(chalk.red('Unknown command. Use /help.'));
      }
    } else if (fullInput) {
      await sendToGrok(fullInput);
    } else {
      showSplashScreen();
      commands.help();
    }
  });

program.parse();