#!/usr/bin/env node

/**
 * Sync Agent - Handles automatic synchronization between local and global files
 * Part of the GROK Multi-Agent System
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const chokidar = require('chokidar');
const { execSync } = require('child_process');

class SyncAgent {
  constructor() {
    this.config = this.loadConfig();
    this.agentId = 'sync-agent-001';
    this.status = 'initializing';
  }

  loadConfig() {
    const configPath = path.join(__dirname, '../SYNC_CONFIG.yaml');
    return yaml.load(fs.readFileSync(configPath, 'utf8'));
  }

  async start() {
    console.log(`🤖 Sync Agent ${this.agentId} starting...`);
    this.status = 'active';
    
    // Set up file watchers
    this.setupWatchers();
    
    // Initial sync
    await this.performInitialSync();
    
    // Schedule periodic syncs
    this.schedulePeriodicSync();
    
    console.log('✅ Sync Agent ready and watching for changes');
  }

  setupWatchers() {
    // Watch for PROJECT_ENHANCEMENTS.md changes
    const enhancementWatcher = chokidar.watch('**/PROJECT_ENHANCEMENTS.md', {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    enhancementWatcher.on('change', (filePath) => {
      console.log(`📝 Enhancement file changed: ${filePath}`);
      this.syncEnhancements(filePath);
    });

    // Watch for PROJECT_AGENTS.md changes
    const agentWatcher = chokidar.watch('**/PROJECT_AGENTS.md', {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    agentWatcher.on('change', (filePath) => {
      console.log(`🤖 Agent file changed: ${filePath}`);
      this.syncAgents(filePath);
    });
  }

  async syncEnhancements(localPath) {
    try {
      const globalPath = path.join(process.env.HOME, 'GLOBAL_PROJECT_REGISTRY.md');
      const localContent = await fs.readFile(localPath, 'utf8');
      
      // Parse project info from local file
      const projectInfo = this.parseProjectInfo(localContent);
      
      // Update global registry
      await this.updateGlobalRegistry(globalPath, projectInfo);
      
      console.log(`✅ Synced enhancements to global registry`);
    } catch (error) {
      console.error(`❌ Sync failed: ${error.message}`);
      this.handleSyncError(error);
    }
  }

  async syncAgents(localPath) {
    try {
      const globalPath = path.join(process.env.HOME, 'GLOBAL_AGENT_REGISTRY.md');
      const localContent = await fs.readFile(localPath, 'utf8');
      
      // Parse agent info from local file
      const agentInfo = this.parseAgentInfo(localContent);
      
      // Update global agent registry
      await this.updateAgentRegistry(globalPath, agentInfo);
      
      console.log(`✅ Synced agents to global registry`);
    } catch (error) {
      console.error(`❌ Agent sync failed: ${error.message}`);
      this.handleSyncError(error);
    }
  }

  parseProjectInfo(content) {
    // Extract project information from markdown
    const lines = content.split('\n');
    const projectId = this.extractValue(lines, 'Project ID:');
    const version = this.extractValue(lines, 'Current Version:');
    
    // Extract enhancements
    const enhancements = this.extractEnhancements(content);
    
    return {
      projectId,
      version,
      enhancements,
      lastUpdate: new Date().toISOString()
    };
  }

  parseAgentInfo(content) {
    // Extract agent information from markdown
    const agents = [];
    const agentSections = content.split('### ');
    
    for (const section of agentSections) {
      if (section.includes('**ID**:')) {
        const agent = {
          id: this.extractValue(section.split('\n'), '**ID**:'),
          status: this.extractValue(section.split('\n'), '**Status**:'),
          task: this.extractValue(section.split('\n'), '**Current Task**:'),
          progress: this.extractValue(section.split('\n'), '**Progress**:')
        };
        agents.push(agent);
      }
    }
    
    return agents;
  }

  extractValue(lines, marker) {
    const line = lines.find(l => l.includes(marker));
    return line ? line.split(marker)[1].trim() : '';
  }

  extractEnhancements(content) {
    const enhancements = [];
    const sections = content.split('###');
    
    for (const section of sections) {
      if (section.includes('Priority Enhancements')) {
        const items = section.split('\n').filter(line => line.match(/^\d+\./));
        enhancements.push(...items);
      }
    }
    
    return enhancements;
  }

  async updateGlobalRegistry(globalPath, projectInfo) {
    // Implementation would merge project info into global registry
    // This is a simplified version
    console.log(`Updating global registry with project ${projectInfo.projectId}`);
  }

  async updateAgentRegistry(globalPath, agents) {
    // Implementation would merge agent info into global registry
    console.log(`Updating agent registry with ${agents.length} agents`);
  }

  schedulePeriodicSync() {
    // Sync every 30 minutes
    setInterval(() => {
      this.performFullSync();
    }, 30 * 60 * 1000);
  }

  async performInitialSync() {
    console.log('🔄 Performing initial sync...');
    await this.performFullSync();
  }

  async performFullSync() {
    // Find all project files and sync them
    const enhancementFiles = await this.findFiles('PROJECT_ENHANCEMENTS.md');
    const agentFiles = await this.findFiles('PROJECT_AGENTS.md');
    
    for (const file of enhancementFiles) {
      await this.syncEnhancements(file);
    }
    
    for (const file of agentFiles) {
      await this.syncAgents(file);
    }
  }

  async findFiles(pattern) {
    // Implementation would recursively find files matching pattern
    return [];
  }

  handleSyncError(error) {
    // Log error and attempt retry based on config
    const retryConfig = this.config.performance;
    
    if (this.retryCount < retryConfig.max_retries) {
      setTimeout(() => {
        this.retryCount++;
        this.performFullSync();
      }, retryConfig.retry_delay * 1000);
    } else {
      this.alertMasterAgent(error);
    }
  }

  alertMasterAgent(error) {
    console.error(`🚨 Critical sync failure, alerting master agent: ${error.message}`);
    // Implementation would notify master agent
  }

  // NPM to GitHub sync
  async syncNpmToGitHub() {
    console.log('📦 Syncing NPM publish to GitHub...');
    
    try {
      execSync('git add .');
      execSync('git commit -m "chore(sync): Auto-sync after npm publish"');
      execSync('git push');
      
      const version = require('../package.json').version;
      execSync(`git tag v${version}`);
      execSync('git push --tags');
      
      console.log('✅ GitHub sync complete');
    } catch (error) {
      console.error('❌ GitHub sync failed:', error.message);
    }
  }
}

// Start the sync agent
if (require.main === module) {
  const agent = new SyncAgent();
  agent.start();
}

module.exports = SyncAgent;