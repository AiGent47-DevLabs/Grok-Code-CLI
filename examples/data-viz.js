// Interactive Data Visualization
// This will be wrapped in HTML by the canvas preview system

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Sample data
const data = [
  { month: 'Jan', grok: 45, gemini: 38 },
  { month: 'Feb', grok: 52, gemini: 42 },
  { month: 'Mar', grok: 61, gemini: 55 },
  { month: 'Apr', grok: 73, gemini: 68 },
  { month: 'May', grok: 85, gemini: 74 },
  { month: 'Jun', grok: 92, gemini: 82 }
];

// Chart settings
const padding = 60;
const barWidth = 40;
const barGap = 20;
let animationProgress = 0;

// Colors
const grokColor = '#9D4EDD';
const geminiColor = '#4285F4';

// Animation
function animate() {
  requestAnimationFrame(animate);
  
  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Update animation
  if (animationProgress < 1) {
    animationProgress += 0.02;
  }
  
  drawChart();
  drawLegend();
}

function drawChart() {
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const maxValue = 100;
  
  // Draw axes
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();
  
  // Draw title
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('GROK vs Gemini Performance Comparison', canvas.width / 2, 30);
  
  // Draw bars
  data.forEach((item, index) => {
    const x = padding + (index * (barWidth * 2 + barGap)) + barGap;
    const grokHeight = (item.grok / maxValue) * chartHeight * animationProgress;
    const geminiHeight = (item.gemini / maxValue) * chartHeight * animationProgress;
    
    // GROK bar
    ctx.fillStyle = grokColor;
    ctx.fillRect(x, canvas.height - padding - grokHeight, barWidth, grokHeight);
    
    // Gemini bar
    ctx.fillStyle = geminiColor;
    ctx.fillRect(x + barWidth, canvas.height - padding - geminiHeight, barWidth, geminiHeight);
    
    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(item.month, x + barWidth, canvas.height - padding + 20);
    
    // Values
    if (animationProgress > 0.5) {
      ctx.font = '12px Arial';
      ctx.fillStyle = grokColor;
      ctx.fillText(item.grok, x + barWidth/2, canvas.height - padding - grokHeight - 5);
      ctx.fillStyle = geminiColor;
      ctx.fillText(item.gemini, x + barWidth * 1.5, canvas.height - padding - geminiHeight - 5);
    }
  });
  
  // Y-axis labels
  ctx.fillStyle = '#888';
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 10; i++) {
    const y = canvas.height - padding - (i * chartHeight / 10);
    ctx.fillText(i * 10, padding - 10, y + 4);
  }
}

function drawLegend() {
  const legendX = canvas.width - 150;
  const legendY = 60;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(legendX - 10, legendY - 10, 140, 60);
  
  // GROK
  ctx.fillStyle = grokColor;
  ctx.fillRect(legendX, legendY, 20, 15);
  ctx.fillStyle = '#fff';
  ctx.font = '14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('GROK', legendX + 30, legendY + 12);
  
  // Gemini
  ctx.fillStyle = geminiColor;
  ctx.fillRect(legendX, legendY + 25, 20, 15);
  ctx.fillStyle = '#fff';
  ctx.fillText('Gemini', legendX + 30, legendY + 37);
}

// Handle resize
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

// Add interactivity
canvas.addEventListener('click', () => {
  animationProgress = 0;
});

// Add hover info
const info = document.createElement('div');
info.style.position = 'absolute';
info.style.background = 'rgba(0, 0, 0, 0.8)';
info.style.color = 'white';
info.style.padding = '10px';
info.style.borderRadius = '5px';
info.style.display = 'none';
info.style.pointerEvents = 'none';
document.body.appendChild(info);

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Check if hovering over a bar
  let hovering = false;
  data.forEach((item, index) => {
    const barX = padding + (index * (barWidth * 2 + barGap)) + barGap;
    if (x >= barX && x <= barX + barWidth * 2 && y >= padding && y <= canvas.height - padding) {
      hovering = true;
      info.style.display = 'block';
      info.style.left = e.clientX + 10 + 'px';
      info.style.top = e.clientY - 30 + 'px';
      info.innerHTML = `<strong>${item.month}</strong><br>GROK: ${item.grok}<br>Gemini: ${item.gemini}`;
    }
  });
  
  if (!hovering) {
    info.style.display = 'none';
  }
});

// Start animation
animate();