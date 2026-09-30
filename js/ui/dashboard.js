/**
 * dashboard.js — Student progress dashboard with Chart.js visualizations
 * Focused on Anatomy Explorer tracking
 */
const Dashboard = (() => {
  let charts = {};
  let initialized = false;

  function init() {
    if (initialized) return;
    initialized = true;
    renderMetrics();
    renderProgressChart();
    renderCompletionChart();
    renderTimeChart();
    renderScoreChart();
  }

  function renderMetrics() {
    const m = Analytics.getMetrics();
    const container = document.getElementById('dashboard-metrics');
    if (!container) return;

    const cards = [
      { label: '총 세션 수', value: m.totalSessions, change: m.sessionDelta, positive: true },
      { label: '총 학습 시간', value: m.timeInvested, change: m.timeDelta, positive: true },
      { label: '평균 점수', value: m.avgScore, change: m.scoreDelta, positive: true },
      { label: '완료율', value: m.completionRate, change: m.completionDelta, positive: true }
    ];

    container.innerHTML = cards.map(c => `
      <div class="dash-metric">
        <div class="dash-metric-label">${c.label}</div>
        <div class="dash-metric-value">${c.value}</div>
        <div class="dash-metric-change ${c.positive ? 'positive' : 'negative'}">
          ${c.positive ? '↑' : '↓'} ${c.change} (지난달 대비)
        </div>
      </div>
    `).join('');
  }

  function chartColors() {
    return {
      anat: { border: '#ef4444', bg: 'rgba(239,68,68,0.1)', bgSolid: 'rgba(239,68,68,0.6)' },
      bones: { border: '#3b82f6', bg: 'rgba(59,130,246,0.1)', bgSolid: 'rgba(59,130,246,0.6)' },
      organs: { border: '#10b981', bg: 'rgba(16,185,129,0.1)', bgSolid: 'rgba(16,185,129,0.6)' }
    };
  }

  function baseTooltip() {
    return {
      backgroundColor: 'rgba(17,24,39,0.9)',
      titleFont: { family: 'Inter', weight: '600' },
      bodyFont: { family: 'Inter' },
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1, padding: 12, cornerRadius: 8
    };
  }

  function baseLegend() {
    return {
      position: 'bottom',
      labels: { color: '#94a3b8', padding: 16, font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyleWidth: 8 }
    };
  }

  function renderProgressChart() {
    const ctx = document.getElementById('chart-progress');
    if (!ctx) return;
    const w = Analytics.getProgressData();
    const c = chartColors();
    charts.progress = new Chart(ctx, {
      type: 'line',
      data: {
        labels: w.labels,
        datasets: [
          { label: '근육', data: w.anatomy, borderColor: c.anat.border, backgroundColor: c.anat.bg, fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2 },
          { label: '뼈', data: w.physics, borderColor: c.bones.border, backgroundColor: c.bones.bg, fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2 },
          { label: '장기', data: w.chemistry, borderColor: c.organs.border, backgroundColor: c.organs.bg, fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: baseLegend(), tooltip: baseTooltip() },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' }, title: { display: true, text: '점수 (%)', color: '#64748b' } }
        }
      }
    });
  }

  function renderCompletionChart() {
    const ctx = document.getElementById('chart-completion');
    if (!ctx) return;
    const comp = Analytics.getCompletionData();
    charts.completion = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['근육', '뼈', '장기'],
        datasets: [{ data: comp.values, backgroundColor: ['rgba(239,68,68,0.8)', 'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)'], borderColor: ['#ef4444', '#3b82f6', '#10b981'], borderWidth: 2 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%',
        plugins: { legend: baseLegend(), tooltip: { ...baseTooltip(), callbacks: { label: (c) => ` ${c.label}: ${c.raw}% 탐색` } } }
      }
    });
  }

  function renderTimeChart() {
    const ctx = document.getElementById('chart-time');
    if (!ctx) return;
    const t = Analytics.getTimeData();
    const c = chartColors();
    charts.time = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: t.labels,
        datasets: [
          { label: '인체 해부학 탐색기', data: t.anatomy, backgroundColor: c.anat.bgSolid, borderColor: c.anat.border, borderWidth: 1, borderRadius: 4 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: baseLegend(), tooltip: baseTooltip() },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' }, title: { display: true, text: '분', color: '#64748b' } }
        }
      }
    });
  }

  function renderScoreChart() {
    const ctx = document.getElementById('chart-scores');
    if (!ctx) return;
    const c = chartColors();
    const s = Analytics.getScoreData();
    charts.scores = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: s.labels,
        datasets: [
          { label: '인체 해부학', data: s.anatomy, borderColor: c.anat.border, backgroundColor: c.anat.bg, pointBackgroundColor: c.anat.border, borderWidth: 2, pointRadius: 4 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: { r: { beginAtZero: true, max: 100, ticks: { color: '#64748b', backdropColor: 'transparent' }, grid: { color: 'rgba(255,255,255,0.06)' }, angleLines: { color: 'rgba(255,255,255,0.06)' }, pointLabels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } } },
        plugins: { legend: baseLegend(), tooltip: baseTooltip() }
      }
    });
  }

  function destroy() {
    Object.values(charts).forEach(c => c?.destroy());
    charts = {};
    initialized = false;
  }

  return { init, destroy };
})();
