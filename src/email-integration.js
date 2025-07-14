const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { Octokit } = require('@octokit/rest');
const yaml = require('js-yaml');

class EmailIntegration {
  constructor(config) {
    this.config = config;
    this.pendingRequestsPath = path.join(config.grokDir, 'pending-requests.json');
    this.githubToken = process.env.GITHUB_TOKEN;
    
    if (this.githubToken) {
      this.octokit = new Octokit({ auth: this.githubToken });
    }
    
    // Ensure pending requests file exists
    if (!fs.existsSync(this.pendingRequestsPath)) {
      fs.writeJsonSync(this.pendingRequestsPath, []);
    }
  }

  /**
   * Format email content into structured feature request
   */
  async formatEmailRequest(emailContent) {
    const request = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      raw: emailContent,
      parsed: this.parseEmailContent(emailContent),
      status: 'pending',
      processed: false
    };

    // Save to pending requests
    const pending = fs.readJsonSync(this.pendingRequestsPath);
    pending.push(request);
    fs.writeJsonSync(this.pendingRequestsPath, pending);

    return request;
  }

  /**
   * Parse email content to extract structured information
   */
  parseEmailContent(content) {
    const lines = content.split('\n');
    const parsed = {
      type: 'feature', // default
      title: '',
      description: '',
      priority: 'medium',
      labels: [],
      components: []
    };

    // Simple parsing logic - can be enhanced with AI
    lines.forEach(line => {
      const lower = line.toLowerCase();
      
      // Detect type
      if (lower.includes('bug') || lower.includes('error') || lower.includes('issue')) {
        parsed.type = 'bug';
      } else if (lower.includes('feature') || lower.includes('enhancement')) {
        parsed.type = 'feature';
      }
      
      // Detect priority
      if (lower.includes('urgent') || lower.includes('critical')) {
        parsed.priority = 'high';
      } else if (lower.includes('low priority') || lower.includes('nice to have')) {
        parsed.priority = 'low';
      }
      
      // Extract title (first non-empty line)
      if (!parsed.title && line.trim()) {
        parsed.title = line.trim();
      }
    });

    // Rest is description
    parsed.description = lines.slice(1).join('\n').trim();

    // Auto-label based on content
    if (parsed.type === 'bug') {
      parsed.labels.push('bug');
    } else {
      parsed.labels.push('enhancement');
    }
    
    parsed.labels.push(`priority:${parsed.priority}`);
    parsed.labels.push('email-request');

    return parsed;
  }

  /**
   * Review and approve pending requests
   */
  async reviewPendingRequests() {
    const pending = fs.readJsonSync(this.pendingRequestsPath);
    const unprocessed = pending.filter(r => !r.processed);

    if (unprocessed.length === 0) {
      console.log(chalk.gray('No pending email requests.'));
      return;
    }

    console.log(chalk.cyan(`\n📧 ${unprocessed.length} pending email requests:\n`));

    for (const request of unprocessed) {
      console.log(chalk.yellow('━'.repeat(60)));
      console.log(chalk.cyan('Request ID:'), request.id);
      console.log(chalk.cyan('Received:'), new Date(request.timestamp).toLocaleString());
      console.log(chalk.cyan('Type:'), request.parsed.type);
      console.log(chalk.cyan('Priority:'), request.parsed.priority);
      console.log(chalk.cyan('Title:'), request.parsed.title);
      console.log(chalk.cyan('Description:'));
      console.log(chalk.gray(request.parsed.description.substring(0, 200) + '...'));
      console.log(chalk.cyan('Labels:'), request.parsed.labels.join(', '));
      console.log(chalk.yellow('━'.repeat(60)));
    }

    return unprocessed;
  }

  /**
   * Process approved request and create GitHub issue
   */
  async processRequest(requestId, approved = true) {
    const pending = fs.readJsonSync(this.pendingRequestsPath);
    const request = pending.find(r => r.id === requestId);

    if (!request) {
      console.log(chalk.red('Request not found.'));
      return;
    }

    if (!approved) {
      request.status = 'rejected';
      request.processed = true;
      fs.writeJsonSync(this.pendingRequestsPath, pending);
      console.log(chalk.yellow('Request rejected.'));
      return;
    }

    // Create GitHub issue
    if (this.octokit) {
      try {
        const issue = await this.octokit.issues.create({
          owner: 'AiGent47-DevLabs',
          repo: 'Grok-Code-CLI',
          title: `[${request.parsed.type}] ${request.parsed.title}`,
          body: this.formatIssueBody(request),
          labels: request.parsed.labels
        });

        request.status = 'created';
        request.processed = true;
        request.githubIssue = issue.data.number;
        
        console.log(chalk.green(`✅ Created GitHub issue #${issue.data.number}`));
        console.log(chalk.gray(`View at: ${issue.data.html_url}`));
      } catch (error) {
        console.log(chalk.red('Failed to create GitHub issue:'), error.message);
        request.status = 'error';
      }
    } else {
      console.log(chalk.yellow('GitHub token not configured. Issue creation skipped.'));
      request.status = 'pending-github';
    }

    request.processed = true;
    fs.writeJsonSync(this.pendingRequestsPath, pending);
  }

  /**
   * Format issue body for GitHub
   */
  formatIssueBody(request) {
    return `## 📧 Email Request

**Received:** ${new Date(request.timestamp).toLocaleString()}
**Type:** ${request.parsed.type}
**Priority:** ${request.parsed.priority}

## Description

${request.parsed.description}

---

### Original Email Content
\`\`\`
${request.raw}
\`\`\`

---
*This issue was automatically created from an email request by GROK Email Integration Agent*`;
  }

  /**
   * Setup email webhook endpoint (for email services that support webhooks)
   */
  async setupWebhook(port = 3000) {
    const express = require('express');
    const app = express();
    
    app.use(express.json());
    app.use(express.text());

    app.post('/email-webhook', async (req, res) => {
      try {
        const emailContent = req.body.text || req.body.content || JSON.stringify(req.body);
        const request = await this.formatEmailRequest(emailContent);
        
        res.json({
          success: true,
          requestId: request.id,
          message: 'Email request received and queued for review'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    app.listen(port, () => {
      console.log(chalk.green(`📧 Email webhook listening on port ${port}`));
      console.log(chalk.gray(`Webhook URL: http://localhost:${port}/email-webhook`));
    });
  }

  /**
   * Process email from file (for testing)
   */
  async processEmailFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(chalk.red('Email file not found.'));
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const request = await this.formatEmailRequest(content);
    
    console.log(chalk.green('✅ Email request formatted:'));
    console.log(chalk.cyan('Request ID:'), request.id);
    console.log(chalk.cyan('Title:'), request.parsed.title);
    console.log(chalk.gray('\nUse "grok /email review" to review pending requests'));
    
    return request;
  }

  /**
   * Generate email template for users
   */
  generateTemplate(type = 'feature') {
    const templates = {
      feature: `Subject: Feature Request - [Brief description]

Hi GROK Team,

I'd like to request a new feature for the GROK CLI:

Feature Title: [Clear, concise title]

Description:
[Detailed description of what you want]

Use Case:
[Why this feature would be helpful]

Priority: [High/Medium/Low]

Additional Context:
[Any other relevant information]

Thanks!`,
      
      bug: `Subject: Bug Report - [Brief description]

Hi GROK Team,

I've encountered a bug in GROK CLI:

Bug Title: [Clear, concise title]

Steps to Reproduce:
1. [First step]
2. [Second step]
3. [What happens]

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happens]

Environment:
- GROK Version: [version]
- OS: [operating system]
- Node Version: [node version]

Priority: [High/Medium/Low]

Thanks!`
    };

    return templates[type] || templates.feature;
  }
}

module.exports = EmailIntegration;