/**
 * objectives.js — Learning Objectives tracking system
 * Provides per-simulation goal tracking with visual progress feedback
 */
const Objectives = (() => {
  let currentObjectives = [];
  let panelEl = null;

  const objectivesDef = {
    chemistry: [
      { id: 'select_chem', label: '화학 물질 선택하기', completed: false },
      { id: 'drag_beaker', label: '비커 옮기기', completed: false },
      { id: 'mix_reaction', label: '반응 완료하기', completed: false },
      { id: 'observe_temp', label: '온도 변화 관찰하기', completed: false },
      { id: 'try_exo', label: '발열 반응 일으키기', completed: false }
    ],
    physics: [
      { id: 'adjust_angle', label: '발사 각도 조정하기', completed: false },
      { id: 'launch', label: '투사체 발사하기', completed: false },
      { id: 'observe_height', label: '5m 이상 높이 도달하기', completed: false },
      { id: 'hit_target', label: '목표 지점 명중하기', completed: false },
      { id: 'compare', label: '2개 이상 궤적 비교하기', completed: false }
    ],
    anatomy: [
      { id: 'inspect_part', label: '신체 부위 클릭하기', completed: false },
      { id: 'toggle_layer', label: '레이어 토글하기', completed: false },
      { id: 'view_skeleton', label: '골격 보기', completed: false },
      { id: 'view_organs', label: '장기 보기', completed: false },
      { id: 'explore_3', label: '3개 이상 장기 탐색하기', completed: false }
    ]
  };

  function init(simType) {
    currentObjectives = (objectivesDef[simType] || []).map(o => ({ ...o, completed: false }));
    render();
  }

  function render() {
    const container = document.getElementById('sim-canvas-container');
    if (!container) return;

    // Remove existing panel
    if (panelEl) { panelEl.remove(); panelEl = null; }

    const completed = currentObjectives.filter(o => o.completed).length;
    const total = currentObjectives.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    panelEl = document.createElement('div');
    panelEl.className = 'objectives-panel';
    panelEl.innerHTML = `
      <div class="obj-header">
        <div class="obj-title">🎯 학습 목표</div>
        <div class="obj-progress">${completed}/${total}</div>
      </div>
      <div class="obj-bar"><div class="obj-bar-fill" style="width: ${pct}%"></div></div>
      <ul class="obj-list">
        ${currentObjectives.map(o => `
          <li class="obj-item ${o.completed ? 'completed' : ''}" data-id="${o.id}">
            <span class="obj-check">${o.completed ? '✓' : ''}</span>
            <span>${o.label}</span>
          </li>
        `).join('')}
      </ul>
    `;
    container.appendChild(panelEl);
  }

  function complete(objectiveId) {
    const obj = currentObjectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return;

    obj.completed = true;
    render();

    // Flash the just-completed item
    if (panelEl) {
      const item = panelEl.querySelector(`[data-id="${objectiveId}"]`);
      if (item) {
        item.classList.add('just-completed');
        setTimeout(() => item.classList.remove('just-completed'), 500);
      }
    }

    // Check if all complete
    const allDone = currentObjectives.every(o => o.completed);
    if (allDone) {
      setTimeout(() => {
        Notifications.success('🏆 모든 목표 달성!', '훌륭합니다 — 이 시뮬레이션을 마스터하셨습니다.');
      }, 600);
    }

    Analytics.trackEvent('objectives', 'complete', { id: objectiveId });
  }

  function isCompleted(objectiveId) {
    const obj = currentObjectives.find(o => o.id === objectiveId);
    return obj ? obj.completed : false;
  }

  function clear() {
    if (panelEl) { panelEl.remove(); panelEl = null; }
    currentObjectives = [];
  }

  return { init, complete, isCompleted, clear };
})();
