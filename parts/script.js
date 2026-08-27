// TAB NAVIGATION
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById(`tab-${targetTab}`).classList.add('active');
  });
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// PLAYER LIST & MODAL
function posBadge(pos) {
  if (pos === '投手')  return 'badge-pitcher';
  if (pos === '捕手')  return 'badge-catcher';
  if (pos === '内野手') return 'badge-infield';
  return 'badge-outfield';
}

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let curQ = '', curPos = 'all';
const grid = document.getElementById('playerGrid');
const empty = document.getElementById('emptyState');
const countEl = document.getElementById('countNum');

function filtered() {
  return PLAYERS.filter(p => {
    const q = curQ.trim().toLowerCase();
    const mQ = !q || 
               p.name.toLowerCase().includes(q) || 
               p.kana.includes(q) || 
               p.number === q || 
               p.name.replace(/\s/g,'').toLowerCase().includes(q);
    const mP = curPos === 'all' || p.position === curPos;
    return mQ && mP;
  });
}

function renderPlayers() {
  grid.querySelectorAll('.player-card').forEach(c => c.remove());
  const list = filtered();
  countEl.textContent = list.length;
  if (!list.length) { empty.classList.add('visible'); return; }
  empty.classList.remove('visible');
  list.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'player-card';
    card.setAttribute('role','listitem');
    card.setAttribute('tabindex','0');
    card.style.animationDelay = (i * 0.03) + 's';
    
    const commentHtml = p.my_comment ? `<p class="card-comment-snippet">${esc(p.my_comment)}</p>` : '';

    card.innerHTML = `
      <div>
        <div class="card-number" aria-hidden="true">${esc(p.number)}</div>
        <span class="card-badge ${posBadge(p.position)}">${esc(p.position)}</span>
        <p class="card-name">${esc(p.name)}</p>
        <p class="card-kana">${esc(p.kana)}</p>
        ${commentHtml}
      </div>
      <div class="card-footer">
        <div class="card-num-label">背番号 <span>${esc(p.number)}</span></div>
        <div class="card-arrow" aria-hidden="true">&#8250;</div>
      </div>`;
    card.addEventListener('click', () => openModal(p));
    card.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); openModal(p); } });
    grid.appendChild(card);
  });
}

const overlay = document.getElementById('modalOverlay');
const mClose  = document.getElementById('modalClose');

function openModal(p) {
  document.getElementById('modalBigNum').textContent      = '#' + p.number;
  document.getElementById('modalPlayerName').textContent  = p.name;
  document.getElementById('modalKana').textContent        = p.kana;
  document.getElementById('modalNumber').textContent      = p.number;
  document.getElementById('modalComment').textContent     = p.my_comment || '紹介コメントはありません。';
  
  const badge = document.getElementById('modalBadge');
  badge.textContent = p.position;
  badge.className   = 'modal-badge ' + posBadge(p.position);
  
  const chantSec = document.getElementById('chantSection');
  if (p.chant_lyrics) {
    chantSec.style.display = 'block';
    document.getElementById('modalChant').textContent = p.chant_lyrics;
  } else {
    chantSec.style.display = 'none';
  }

  const vid = document.getElementById('modalVideo');
  const actionLinks = document.getElementById('actionLinks');
  
  if (p.youtube_id) {
    vid.innerHTML = `<div class="video-iframe-wrap"><iframe src="https://www.youtube.com/embed/${esc(p.youtube_id)}?rel=0" title="${esc(p.name)} 応援歌" allowfullscreen loading="lazy"></iframe></div>`;
  } else {
    vid.innerHTML = '';
  }

  const q = encodeURIComponent(p.name + ' 応援歌 千葉ロッテマリーンズ');
  let linksHtml = '';
  
  if (p.official_url) {
    linksHtml += `
      <a class="official-link-btn" href="${esc(p.official_url)}" target="_blank" rel="noopener noreferrer">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        公式プロフィールを見る
      </a>`;
  }
  
  linksHtml += `
    <a class="yt-search-link" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener noreferrer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5L15.8 12l-6.05 3.5z"/></svg>
      YouTubeで応援歌を検索
    </a>`;
    
  actionLinks.innerHTML = linksHtml;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  mClose.focus();
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  const ifr = document.querySelector('#modalVideo iframe');
  if (ifr) ifr.src = ifr.src;
}

mClose.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

const sInput = document.getElementById('searchInput');
const clrBtn = document.getElementById('clearBtn');
sInput.addEventListener('input', () => {
  curQ = sInput.value;
  clrBtn.classList.toggle('visible', curQ.length > 0);
  renderPlayers();
});
clrBtn.addEventListener('click', () => {
  sInput.value = ''; curQ = '';
  clrBtn.classList.remove('visible');
  sInput.focus(); renderPlayers();
});
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    curPos = btn.dataset.pos;
    renderPlayers();
  });
});

// ORDER MAKER
const POS_OPTIONS = ['投', '捕', '一', '二', '三', '遊', '左', '中', '右', '指'];
const DEFAULT_ORDER = [
  { pos: '中', playerId: '2026_00001274' },
  { pos: '二', playerId: '2026_00001280' },
  { pos: '左', playerId: '2026_00001251' },
  { pos: '指', playerId: '2026_00001260' },
  { pos: '一', playerId: '2026_00001301' },
  { pos: '右', playerId: '2026_00001182' },
  { pos: '三', playerId: '2026_00001255' },
  { pos: '捕', playerId: '2026_00001268' },
  { pos: '遊', playerId: '2026_00001257' }
];
const DEFAULT_SP = '2026_00001258';

function initOrderForm() {
  const spSelect = document.getElementById('sp-select');
  const slotList = document.getElementById('orderSlotList');
  
  const pitchers = PLAYERS.filter(p => p.position === '投手');
  const allPlayersSorted = [...PLAYERS].sort((a,b) => parseInt(a.number) - parseInt(b.number));
  
  pitchers.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `#${p.number} ${p.name}`;
    spSelect.appendChild(opt);
  });

  slotList.innerHTML = '';
  for (let i = 1; i <= 9; i++) {
    const item = document.createElement('div');
    item.className = 'order-slot-item';

    let posOptionsHtml = POS_OPTIONS.map(pos => `<option value="${pos}">${pos}</option>`).join('');
    let playerOptionsHtml = `<option value="">-- 選択 --</option>` + 
      allPlayersSorted.map(p => `<option value="${p.id}">#${p.number} ${p.name} (${p.position})</option>`).join('');

    item.innerHTML = `
      <span class="slot-num">${i}</span>
      <select class="slot-pos-select" id="order-pos-${i}">${posOptionsHtml}</select>
      <select class="slot-player-select" id="order-player-${i}">${playerOptionsHtml}</select>
    `;
    slotList.appendChild(item);
  }

  loadSavedOrder();

  spSelect.addEventListener('change', updateBoardPreview);
  for (let i = 1; i <= 9; i++) {
    document.getElementById(`order-pos-${i}`).addEventListener('change', updateBoardPreview);
    document.getElementById(`order-player-${i}`).addEventListener('change', updateBoardPreview);
  }
}

function updateBoardPreview() {
  const spId = document.getElementById('sp-select').value;
  const spPlayer = PLAYERS.find(p => p.id === spId);
  document.getElementById('board-sp-name').textContent = spPlayer ? `#${spPlayer.number} ${spPlayer.name}` : '未設定';

  const boardGrid = document.getElementById('boardOrderGrid');
  boardGrid.innerHTML = '';

  for (let i = 1; i <= 9; i++) {
    const pos = document.getElementById(`order-pos-${i}`).value;
    const pId = document.getElementById(`order-player-${i}`).value;
    const player = PLAYERS.find(p => p.id === pId);

    const row = document.createElement('div');
    row.className = 'board-row';
    row.innerHTML = `
      <span class="board-bat-num">${i}</span>
      <span class="board-pos-badge">${pos}</span>
      <div class="board-player-info">
        <span class="board-player-name">${player ? player.name : '未設定'}</span>
        <span class="board-player-num">${player ? '#' + player.number : ''}</span>
      </div>
    `;
    boardGrid.appendChild(row);
  }
}

function saveOrder() {
  const orderData = {
    sp: document.getElementById('sp-select').value,
    lineup: []
  };

  for (let i = 1; i <= 9; i++) {
    orderData.lineup.push({
      pos: document.getElementById(`order-pos-${i}`).value,
      playerId: document.getElementById(`order-player-${i}`).value
    });
  }

  localStorage.setItem('marines_best_order_v1', JSON.stringify(orderData));
  showToast('ベストスタメンを保存しました！');
  updateBoardPreview();
}

function loadSavedOrder() {
  const saved = localStorage.getItem('marines_best_order_v1');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.sp) document.getElementById('sp-select').value = data.sp;
      if (Array.isArray(data.lineup)) {
        data.lineup.forEach((item, idx) => {
          const slotIdx = idx + 1;
          if (slotIdx <= 9) {
            if (item.pos) document.getElementById(`order-pos-${slotIdx}`).value = item.pos;
            if (item.playerId) document.getElementById(`order-player-${slotIdx}`).value = item.playerId;
          }
        });
      }
      updateBoardPreview();
      return;
    } catch(e) {}
  }

  document.getElementById('sp-select').value = DEFAULT_SP;
  DEFAULT_ORDER.forEach((item, idx) => {
    const slotIdx = idx + 1;
    document.getElementById(`order-pos-${slotIdx}`).value = item.pos;
    document.getElementById(`order-player-${slotIdx}`).value = item.playerId;
  });
  updateBoardPreview();
}

document.getElementById('saveOrderBtn').addEventListener('click', saveOrder);
document.getElementById('resetOrderBtn').addEventListener('click', () => {
  localStorage.removeItem('marines_best_order_v1');
  loadSavedOrder();
  showToast('オーダーを初期状態にリセットしました');
});

// GAME LOGS & STATS AUTOMATION
let gameLogs = [];

function initGameLogs() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('logDate').value = today;

  loadGameLogs();

  document.getElementById('gameLogForm').addEventListener('submit', e => {
    e.preventDefault();
    addGameLog();
  });

  document.getElementById('clearLogsBtn').addEventListener('click', () => {
    if (confirm('すべての観戦記録を消去してもよろしいですか？')) {
      gameLogs = [];
      saveGameLogs();
      showToast('観戦ログを全消去しました');
    }
  });
}

function addGameLog() {
  const date = document.getElementById('logDate').value;
  const opponent = document.getElementById('logOpponent').value;
  const stadium = document.getElementById('logStadium').value;
  const result = document.querySelector('input[name="logResult"]:checked').value;
  const memo = document.getElementById('logMemo').value.trim();

  if (!date || !opponent || !stadium) return;

  const newLog = {
    id: Date.now().toString(),
    date,
    opponent,
    stadium,
    result,
    memo
  };

  gameLogs.unshift(newLog);
  saveGameLogs();
  
  document.getElementById('logMemo').value = '';
  showToast('観戦記録を保存しました！');
}

window.deleteGameLog = function(id) {
  gameLogs = gameLogs.filter(log => log.id !== id);
  saveGameLogs();
  showToast('ログを削除しました');
};

function saveGameLogs() {
  localStorage.setItem('marines_game_logs_v1', JSON.stringify(gameLogs));
  renderGameLogs();
}

function loadGameLogs() {
  const saved = localStorage.getItem('marines_game_logs_v1');
  if (saved) {
    try {
      gameLogs = JSON.parse(saved);
    } catch(e) { gameLogs = []; }
  } else {
    gameLogs = [
      { id: '1', date: '2026-05-18', opponent: '福岡ソフトバンクホークス', stadium: 'ZOZOマリンスタジアム', result: 'win', memo: '小島7回無失点の好投！9回益田締めて勝利！' },
      { id: '2', date: '2026-04-29', opponent: 'オリックス・バファローズ', stadium: 'ZOZOマリンスタジアム', result: 'win', memo: '藤原の先頭打者ホームラン！風速12m' }
    ];
    saveGameLogs();
  }
  renderGameLogs();
}

function renderGameLogs() {
  const listEl = document.getElementById('logList');
  listEl.innerHTML = '';

  let wins = 0, losses = 0, draws = 0;
  const stadiumCounts = {};

  gameLogs.forEach(log => {
    if (log.result === 'win') wins++;
    else if (log.result === 'lose') losses++;
    else if (log.result === 'draw') draws++;

    stadiumCounts[log.stadium] = (stadiumCounts[log.stadium] || 0) + 1;

    const item = document.createElement('div');
    item.className = 'log-item';

    let resText = '〇 勝', resClass = 'win';
    if (log.result === 'lose') { resText = '● 敗'; resClass = 'lose'; }
    if (log.result === 'draw') { resText = '△ 分'; resClass = 'draw'; }

    item.innerHTML = `
      <div class="log-main-info">
        <span class="result-pill ${resClass}">${resText}</span>
        <div class="log-details">
          <div class="log-date-stadium">${log.date} &nbsp;📍 ${esc(log.stadium)}</div>
          <div class="log-vs">vs ${esc(log.opponent)}</div>
          ${log.memo ? `<div class="log-memo">${esc(log.memo)}</div>` : ''}
        </div>
      </div>
      <button class="log-del-btn" title="削除" onclick="deleteGameLog('${log.id}')">✕</button>
    `;
    listEl.appendChild(item);
  });

  const totalGames = wins + losses + draws;
  const decGames = wins + losses;
  let winRateStr = '.---';

  if (decGames > 0) {
    const rate = wins / decGames;
    if (rate === 1) winRateStr = '1.000';
    else winRateStr = rate.toFixed(3).replace(/^0/, '');
  }

  document.getElementById('stat-win-rate').textContent = winRateStr;
  document.getElementById('stat-total').innerHTML = `${totalGames} <span style="font-size:16px;">試合</span>`;
  document.getElementById('stat-w-l').textContent = `${wins}勝 ${losses}敗`;
  document.getElementById('stat-draw-count').textContent = draws;

  let topStadium = '-';
  let maxC = 0;
  for (const [st, count] of Object.entries(stadiumCounts)) {
    if (count > maxC) { maxC = count; topStadium = st; }
  }
  if (topStadium.includes('ZOZO')) topStadium = 'ZOZOマリン';
  else if (topStadium.includes('エスコン')) topStadium = 'エスコンF';
  else if (topStadium.includes('PayPay')) topStadium = 'PayPayドーム';
  else if (topStadium.includes('京セラ')) topStadium = '京セラドーム';

  document.getElementById('stat-top-stadium').textContent = topStadium;
}

renderPlayers();
initOrderForm();
initGameLogs();
