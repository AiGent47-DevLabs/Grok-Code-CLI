#!/usr/bin/env node

/**
 * Canvas Preview System for GROK CLI
 * Provides live preview for HTML, JavaScript, and Python visualizations
 */

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');
const open = require('open');

class CanvasPreview {
  constructor() {
    this.app = express();
    this.server = null;
    this.port = 8888;
  }

  async startPreview(filePath, options = {}) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.html':
        await this.previewHTML(filePath);
        break;
      case '.js':
        await this.previewJavaScript(filePath);
        break;
      case '.py':
        await this.previewPython(filePath);
        break;
      default:
        console.log(chalk.red(`Unsupported file type: ${ext}`));
    }
  }

  async previewHTML(filePath) {
    // Serve the HTML file directly
    this.app.use(express.static(path.dirname(filePath)));
    
    this.server = this.app.listen(this.port, () => {
      console.log(chalk.green(`✨ Canvas preview running at http://localhost:${this.port}`));
      console.log(chalk.gray('Press Ctrl+C to stop'));
      open(`http://localhost:${this.port}/${path.basename(filePath)}`);
    });
  }

  async previewJavaScript(filePath) {
    // Create wrapper HTML for JavaScript
    const jsContent = await fs.readFile(filePath, 'utf8');
    const wrapperHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>GROK Canvas Preview</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 20px;
      background: #1a1a1a;
      color: #ffffff;
    }
    #canvas { 
      border: 1px solid #444;
      display: block;
      margin: 20px auto;
    }
    #output {
      background: #2a2a2a;
      padding: 10px;
      border-radius: 5px;
      margin-top: 20px;
      font-family: 'Monaco', 'Menlo', monospace;
    }
  </style>
</head>
<body>
  <h1>GROK Canvas Preview</h1>
  <canvas id="canvas" width="800" height="600"></canvas>
  <div id="output"></div>
  <script>
    // Capture console.log
    const output = document.getElementById('output');
    const originalLog = console.log;
    console.log = function(...args) {
      originalLog.apply(console, args);
      output.innerHTML += args.join(' ') + '<br>';
    };
    
    // User code
    ${jsContent}
  </script>
</body>
</html>`;

    // Serve the wrapper
    this.app.get('/', (req, res) => {
      res.send(wrapperHTML);
    });
    
    this.server = this.app.listen(this.port, () => {
      console.log(chalk.green(`✨ Canvas preview running at http://localhost:${this.port}`));
      open(`http://localhost:${this.port}`);
    });
  }

  async previewPython(filePath) {
    // For Python, we'll use matplotlib/plotly backend
    const pythonWrapper = `
import sys
import json
import base64
from io import BytesIO

# Try to import visualization libraries
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    has_matplotlib = True
except:
    has_matplotlib = False

# Execute user script
exec(open('${filePath}').read())

# If matplotlib figure exists, save it
if has_matplotlib and plt.get_fignums():
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_data = base64.b64encode(buffer.read()).decode()
    print(json.dumps({"type": "image", "data": image_data}))
`;

    // Execute Python and capture output
    exec(`python3 -c "${pythonWrapper}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red('Python execution error:'), error);
        return;
      }

      try {
        const result = JSON.parse(stdout);
        if (result.type === 'image') {
          // Serve the image
          this.servePythonVisualization(result.data);
        }
      } catch (e) {
        // Plain text output
        console.log(chalk.yellow('Python output:'), stdout);
      }
    });
  }

  servePythonVisualization(imageData) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>GROK Python Canvas</title>
  <style>
    body { 
      background: #1a1a1a;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
      padding: 20px;
    }
    img { 
      max-width: 90%;
      border: 1px solid #444;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <h1>GROK Python Visualization</h1>
  <img src="data:image/png;base64,${imageData}" />
</body>
</html>`;

    this.app.get('/', (req, res) => {
      res.send(html);
    });
    
    this.server = this.app.listen(this.port, () => {
      console.log(chalk.green(`✨ Canvas preview running at http://localhost:${this.port}`));
      open(`http://localhost:${this.port}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log(chalk.yellow('Canvas preview stopped'));
    }
  }
}

module.exports = CanvasPreview;