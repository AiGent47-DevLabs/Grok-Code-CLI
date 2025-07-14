import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta
import seaborn as sns

# Set style
plt.style.use('dark_background')
sns.set_palette("husl")

# Generate sample data
dates = [datetime.now() - timedelta(days=x) for x in range(30, 0, -1)]
grok_performance = np.random.normal(85, 10, 30).clip(0, 100)
gemini_performance = np.random.normal(78, 12, 30).clip(0, 100)

# Add trend
grok_performance += np.linspace(0, 10, 30)
gemini_performance += np.linspace(0, 5, 30)

# Create figure with subplots
fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
fig.suptitle('GROK vs Gemini: 30-Day Performance Analysis', fontsize=20, color='white')

# 1. Line plot comparison
ax1.plot(dates, grok_performance, label='GROK', color='#9D4EDD', linewidth=2.5, marker='o', markersize=4)
ax1.plot(dates, gemini_performance, label='Gemini', color='#4285F4', linewidth=2.5, marker='s', markersize=4)
ax1.fill_between(dates, grok_performance, alpha=0.3, color='#9D4EDD')
ax1.fill_between(dates, gemini_performance, alpha=0.3, color='#4285F4')
ax1.set_title('Performance Over Time', fontsize=14)
ax1.set_ylabel('Performance Score')
ax1.legend()
ax1.grid(True, alpha=0.3)
ax1.set_ylim(0, 100)

# 2. Distribution comparison
ax2.hist(grok_performance, bins=15, alpha=0.7, label='GROK', color='#9D4EDD', edgecolor='white')
ax2.hist(gemini_performance, bins=15, alpha=0.7, label='Gemini', color='#4285F4', edgecolor='white')
ax2.set_title('Performance Distribution', fontsize=14)
ax2.set_xlabel('Performance Score')
ax2.set_ylabel('Frequency')
ax2.legend()
ax2.grid(True, alpha=0.3, axis='y')

# 3. Box plot comparison
data_to_plot = [grok_performance, gemini_performance]
box_plot = ax3.boxplot(data_to_plot, labels=['GROK', 'Gemini'], patch_artist=True)
colors = ['#9D4EDD', '#4285F4']
for patch, color in zip(box_plot['boxes'], colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)
for element in ['whiskers', 'fliers', 'means', 'medians', 'caps']:
    plt.setp(box_plot[element], color='white')
ax3.set_title('Performance Range Comparison', fontsize=14)
ax3.set_ylabel('Performance Score')
ax3.grid(True, alpha=0.3, axis='y')

# 4. Scatter plot with trend lines
ax4.scatter(range(30), grok_performance, label='GROK', color='#9D4EDD', s=50, alpha=0.6)
ax4.scatter(range(30), gemini_performance, label='Gemini', color='#4285F4', s=50, alpha=0.6)

# Add trend lines
z_grok = np.polyfit(range(30), grok_performance, 1)
p_grok = np.poly1d(z_grok)
z_gemini = np.polyfit(range(30), gemini_performance, 1)
p_gemini = np.poly1d(z_gemini)

ax4.plot(range(30), p_grok(range(30)), "--", color='#9D4EDD', linewidth=2, alpha=0.8)
ax4.plot(range(30), p_gemini(range(30)), "--", color='#4285F4', linewidth=2, alpha=0.8)

ax4.set_title('Performance Trend Analysis', fontsize=14)
ax4.set_xlabel('Days')
ax4.set_ylabel('Performance Score')
ax4.legend()
ax4.grid(True, alpha=0.3)

# Add statistics
stats_text = f"""
Statistics (30 days):

GROK:
  Mean: {np.mean(grok_performance):.1f}
  Std: {np.std(grok_performance):.1f}
  Max: {np.max(grok_performance):.1f}
  
Gemini:
  Mean: {np.mean(gemini_performance):.1f}
  Std: {np.std(gemini_performance):.1f}
  Max: {np.max(gemini_performance):.1f}
"""

fig.text(0.02, 0.02, stats_text, fontsize=10, color='white', 
         bbox=dict(boxstyle="round,pad=0.5", facecolor='black', alpha=0.7))

# Adjust layout and display
plt.tight_layout()
plt.show()

# Print summary
print("=" * 50)
print("PERFORMANCE ANALYSIS SUMMARY")
print("=" * 50)
print(f"\nGROK Performance:")
print(f"  - Average: {np.mean(grok_performance):.2f}")
print(f"  - Improvement: +{grok_performance[-1] - grok_performance[0]:.2f} over 30 days")
print(f"  - Consistency (lower is better): {np.std(grok_performance):.2f}")

print(f"\nGemini Performance:")
print(f"  - Average: {np.mean(gemini_performance):.2f}")
print(f"  - Improvement: +{gemini_performance[-1] - gemini_performance[0]:.2f} over 30 days")
print(f"  - Consistency (lower is better): {np.std(gemini_performance):.2f}")

print(f"\nWinner: {'GROK' if np.mean(grok_performance) > np.mean(gemini_performance) else 'Gemini'}")
print("=" * 50)