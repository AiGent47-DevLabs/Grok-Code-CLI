# Launching the Multi-Agent System

## Quick Start

To activate the multi-agent system, run:

```bash
# Install dependencies for agents
npm install chokidar js-yaml

# Start the sync agent
node agents/sync-agent.js &

# Or use the master launcher (when implemented)
grok /agents start
```

## How It Works

### 1. On Startup
```
You → "grok"
  ↓
Master Agent reads MASTER_PERSONA.yaml
  ↓
Loads GROK.md (global + local)
  ↓
Checks GLOBAL_PROJECT_REGISTRY.md
  ↓
Activates relevant sub-agents
```

### 2. When You Make Changes
```
You edit PROJECT_ENHANCEMENTS.md
  ↓
Sync Agent detects change
  ↓
Updates GLOBAL_PROJECT_REGISTRY.md
  ↓
Master Agent aware of new priorities
  ↓
Assigns tasks to relevant agents
```

### 3. Status Check
```bash
# Ask for global status
grok "What's the status of all my projects?"

# Master agent will:
# 1. Read GLOBAL_PROJECT_REGISTRY.md
# 2. Read GLOBAL_AGENT_REGISTRY.md
# 3. Generate comprehensive report
```

## Example Interaction

```bash
# You want to add a new enhancement
grok "Add voice input support to the enhancement list"

# Master agent will:
# 1. Identify this is for GROK CLI project
# 2. Delegate to documentation agent
# 3. Update PROJECT_ENHANCEMENTS.md
# 4. Sync agent auto-updates global registry

# You want to check agent status
grok "Which agents are working on what?"

# Master agent reads GLOBAL_AGENT_REGISTRY.md
# Shows you current assignments and progress
```

## File Structure After Setup

```
~/
├── GROK.md                      # Your global context
├── GLOBAL_PROJECT_REGISTRY.md   # All projects
├── GLOBAL_AGENT_REGISTRY.md     # All agents
├── MASTER_PERSONA.yaml          # Agent hierarchy
│
└── Your-Project/
    ├── GROK.md                  # Project context
    ├── PROJECT_ENHANCEMENTS.md  # Local enhancements
    ├── PROJECT_AGENTS.md        # Local agents
    └── agents/
        └── sync-agent.js        # Sync automation
```

## Benefits

1. **Always Current**: Files auto-sync every 30 minutes
2. **No Manual Updates**: Agents handle documentation
3. **Bird's Eye View**: See all projects at once
4. **Intelligent Delegation**: Right agent for each task
5. **Progress Tracking**: Real-time status updates

## Next Steps

1. **Test the sync agent**: Make changes to PROJECT_ENHANCEMENTS.md
2. **Add more projects**: Create PROJECT_* files in other directories
3. **Customize agents**: Modify MASTER_PERSONA.yaml for your needs
4. **Monitor performance**: Check GLOBAL_AGENT_REGISTRY.md

Remember: The system is designed to be self-managing. Once set up, it maintains itself!