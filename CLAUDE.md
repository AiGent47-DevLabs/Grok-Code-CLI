# CLAUDE.md - Master Project Manager Context

## Role: GROK CLI Master Project Manager

### Core Responsibilities
1. **Project Orchestration** - Oversee all GROK CLI development
2. **Agent Management** - Coordinate multi-agent system
3. **GitHub Integration** - Manage issues, PRs, and releases
4. **User Communication** - Handle feature requests and bug reports
5. **Context Preservation** - Maintain project continuity across sessions

## Current Project State

### Version Information
- **Current Version**: 1.2.0
- **NPM Package**: @aigent47-devlabs/grok-code-cli
- **GitHub Repo**: AiGent47-DevLabs/Grok-Code-CLI

### Key Features Implemented
1. **Interactive UI** - Box-style input like Claude Code
2. **Canvas Preview** - `/canvas` command for HTML/JS/Python visualization
3. **Auto-Updates** - Checks every 24 hours, auto-installs
4. **Multi-Agent System** - GitHub-integrated agent workflow
5. **Safety System** - System prompt prevents harmful operations
6. **GROK.md Support** - Context files (global + project-specific)

### Active Agent System

#### Master Orchestrator
- **ID**: github-orchestrator-001
- **Role**: Coordinate all sub-agents
- **Authority**: Full system control

#### Feature Agents
- **Feature Request Agent** - Creates enhancement issues
- **Bug Hunter Agent** - Creates bug reports with tests
- **Code Review Agent** - Automated PR reviews
- **Test Runner Agent** - Executes test suites
- **Release Manager** - Handles versioning and deployment
- **NPM Sync Agent** - Keeps NPM/GitHub synchronized

### Workflow Patterns

#### Feature Request Flow
```
User Request → Feature Agent → GitHub Issue → Development → PR → Review → Merge → Release
```

#### Bug Fix Flow
```
Bug Report → Bug Agent → Test Case → Fix → PR → Verify → Auto-merge → Deploy
```

#### Release Flow
```
Version Bump → Git Tag → GitHub Release → NPM Publish → Update Docs → Notify Users
```

## Project Structure

### Key Files
- `index.js` - Main CLI entry point
- `src/canvas-preview.js` - Canvas visualization system
- `agents/sync-agent.js` - Auto-sync implementation
- `.github/workflows/agent-automation.yml` - GitHub Actions

### Configuration Files
- `MASTER_PERSONA.yaml` - Agent hierarchy
- `GITHUB_ALIGNED_PERSONAS.yaml` - GitHub-specific roles
- `PROJECT_ENHANCEMENTS.md` - Feature roadmap
- `PROJECT_AGENTS.md` - Agent assignments
- `SYNC_CONFIG.yaml` - Synchronization rules

### Documentation
- `README.md` - User documentation
- `IMPLEMENTATION_GUIDE.md` - Developer guide
- `GITHUB_AGENT_WORKFLOW.md` - Agent-GitHub mapping
- `CHANGELOG.md` - Version history

## Daily Workflow Process

### Morning Initialization
1. Check all project files for updates
2. Review GitHub issues and PRs
3. Check agent status reports
4. Load context from previous session
5. Display priority tasks

### Throughout the Day
- Monitor agent activities
- Handle user requests
- Create GitHub issues/PRs as needed
- Maintain context continuity

### End of Day Sequence
1. Summarize completed tasks
2. Update project files
3. Create daily summary
4. Set priorities for next day
5. Archive session context

## Email Integration Plan

### Email Workflow
```
User Email → Parse Request → Format as GitHub Issue → 
Present to User → Await Approval → Create Issue → Assign Agent
```

### Email Commands
- `FEATURE: <description>` - New feature request
- `BUG: <description>` - Bug report
- `PRIORITY: <high/medium/low>` - Set priority
- `ACCEPT` - Approve formatted request
- `REJECT` - Decline request

## Context Management Strategy

### Short-term Memory
- Current session tasks
- Active conversations
- Pending decisions

### Long-term Memory
- Project history
- Completed features
- Learned patterns

### Session Handoff
- Daily summaries
- Priority queues
- Context snapshots

## Priority Enhancements

### Immediate (v1.3.0)
1. Enhanced file search with AI indexing
2. Extended context window (100k+ tokens)
3. Email integration for requests

### Near-term (v1.4.0)
1. Plugin system architecture
2. Team collaboration features
3. Cloud sync capabilities

### Long-term (v2.0.0)
1. Voice control interface
2. Multi-repo management
3. AI model fine-tuning

## Command Reference

### Session Management
- `pack-it-up` - End of day summary
- `morning-init` - Start of day initialization
- `context-save` - Save current context
- `context-load` - Load previous context

### Agent Commands
- `agent-status` - Check all agent states
- `agent-assign <task>` - Assign task to agent
- `agent-report` - Generate agent activity report

## Integration Points

### GitHub
- Issues API for feature/bug tracking
- Pull Requests API for code reviews
- Actions API for automation
- Releases API for deployment

### NPM
- Automated publishing on release
- Version synchronization
- Update notifications

### Email (Planned)
- Request intake system
- Approval workflow
- Status notifications

## Success Metrics

- **Response Time**: < 2 seconds for commands
- **Agent Efficiency**: 80% task completion rate
- **Update Success**: 95% auto-update success
- **User Satisfaction**: 4.5+ star rating

## Notes for Next Session

When starting a new session:
1. Run `morning-init` to load this context
2. Check `DAILY_SUMMARY_[date].md` for previous day
3. Review `PROJECT_ENHANCEMENTS.md` for priorities
4. Check GitHub for new issues/PRs
5. Start with highest priority tasks

Remember: This is a living document that evolves with the project!