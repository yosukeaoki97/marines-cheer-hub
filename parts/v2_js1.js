// ─── TAB SWITCHING ───────────────────────────────────────────────────────────
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.tab;
    tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active'); btn.setAttribute('aria-selected','true');
    document.getElementById('tab-' + t).classList.add('active');
  });
});

// ─── TOAST ───────────────────────────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}

// ─── UTILITIES ───────────────────────────────────────────────────────────────
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function posBadge(pos) {
  if (pos === '投手') return 'badge-pitcher';
  if (pos === '捕手') return 'badge-catcher';
  if (pos === '内野手') return 'badge-infield';
  return 'badge-outfield';
}

// ─── PLAYER LIST ─────────────────────────────────────────────────────────────
let curQ = '', curPos = 'all';
const grid = document.getElementById('playerGrid');
const emptyState = document.getElementById('emptyState');
const countEl = document.getElementById('countNum');

function filterPlayers() {
  return PLAYERS.filter(p => {
    const q = curQ.trim().toLowerCase();
    const nm = p.name ? p.name.toLowerCase() : '';
    const kn = p.kana ? p.kana : '';
    const mQ = !q || nm.includes(q) || kn.includes(q) || p.number === q || nm.replace(/\s/g,'').includes(q);
    const mP = curPos === 'all' || p.position === curPos;
    return mQ && mP;
  });
}

function renderPlayers() {
  grid.querySelectorAll('.player-card').forEach(c => c.remove());
  const list = filterPlayers();
  countEl.textContent = list.length;
  if (!list.length) { emptyState.classList.add('visible'); return; }
  emptyState.classList.remove('visible');
  list.forEach((p, i) => {
    const card = document.createElement('article');
    card.className = 'player-card';
    card.setAttribute('role','listitem');
    card.setAttribute('tabindex','0');
    card.style.animationDelay = (i * 0.025) + 's';
    const commentHtml = p.my_comment ? '<p class="card-comment-snippet">' + esc(p.my_comment) + '</p>' : '';
    const statsHref = (p.stats_url && p.stats_url.trim()) ? p.stats_url : 'https://baseball.yahoo.co.jp/npb/teams/9/stats';
    const statsBtnHtml = '<a class="card-stats-btn" href="' + esc(statsHref) + '" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">📊 スポナビ成績</a>';
    card.innerHTML =
      '<div class="card-number" aria-hidden="true">' + esc(p.number) + '</div>' +
      '<span class="card-badge ' + posBadge(p.position) + '">' + esc(p.position) + '</span>' +
      '<p class="card-name">' + esc(p.name) + '</p>' +
      '<p class="card-kana">' + esc(p.kana) + '</p>' +
      commentHtml +
      statsBtnHtml +
      '<div class="card-footer"><div class="card-num-label">背番号 <span>' + esc(p.number) + '</span></div><div class="card-arrow">&#8250;</div></div>';
    card.addEventListener('click', () => openPlayerModal(p));
    card.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); openPlayerModal(p); } });
    grid.appendChild(card);
  });
}

const sInput = document.getElementById('searchInput');
const clrBtn = document.getElementById('clearBtn');
sInput.addEventListener('input', () => { curQ = sInput.value; clrBtn.classList.toggle('visible', curQ.length > 0); renderPlayers(); });
clrBtn.addEventListener('click', () => { sInput.value = ''; curQ = ''; clrBtn.classList.remove('visible'); sInput.focus(); renderPlayers(); });
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active'); curPos = btn.dataset.pos; renderPlayers();
  });
});

// ─── PLAYER MODAL ────────────────────────────────────────────────────────────
const overlay = document.getElementById('modalOverlay');
const mClose = document.getElementById('modalClose');

function openPlayerModal(p) {
  document.getElementById('modalBigNum').textContent = '#' + p.number;
  document.getElementById('modalPlayerName').textContent = p.name;
  document.getElementById('modalKana').textContent = p.kana;
  document.getElementById('modalNumber').textContent = p.number;
  document.getElementById('modalComment').textContent = p.my_comment || '紹介コメントはありません。';
  const badge = document.getElementById('modalBadge');
  badge.textContent = p.position; badge.className = 'modal-badge ' + posBadge(p.position);
  const chantSec = document.getElementById('chantSection');
  if (p.chant_lyrics) { chantSec.style.display = 'block'; document.getElementById('modalChant').textContent = p.chant_lyrics; }
  else { chantSec.style.display = 'none'; }
  const vid = document.getElementById('modalVideo');
  if (p.youtube_id) {
    vid.innerHTML = '<div class="video-iframe-wrap"><iframe src="https://www.youtube.com/embed/' + esc(p.youtube_id) + '?rel=0" title="' + esc(p.name) + ' 応援歌" allowfullscreen loading="lazy"></iframe></div>';
  } else { vid.innerHTML = ''; }
  const q = encodeURIComponent(p.name + ' 応援歌 千葉ロッテマリーンズ');
  let links = '';
  if (p.official_url) {
    links += '<a class="official-link-btn" href="' + esc(p.official_url) + '" target="_blank" rel="noopener noreferrer">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>公式プロフィール</a>';
  }
  const modalStatsHref = (p.stats_url && p.stats_url.trim()) ? p.stats_url : 'https://baseball.yahoo.co.jp/npb/teams/9/stats';
  links += '<a class="official-link-btn" href="' + esc(modalStatsHref) + '" target="_blank" rel="noopener noreferrer" style="background:linear-gradient(135deg, #f5a623, #d48806);border-color:rgba(245,166,35,0.4);">' +
    '📊 スポナビ個人成績</a>';
  links += '<a class="yt-search-link" href="https://www.youtube.com/results?search_query=' + q + '" target="_blank" rel="noopener noreferrer">' +
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5L15.8 12l-6.05 3.5z"/></svg>応援歌を YouTube で探す</a>';
  document.getElementById('actionLinks').innerHTML = links;
  overlay.classList.add('open'); document.body.style.overflow = 'hidden'; mClose.focus();
}

function closePlayerModal() {
  overlay.classList.remove('open'); document.body.style.overflow = '';
  const ifr = document.querySelector('#modalVideo iframe');
  if (ifr) { ifr.src = ifr.src; }
}

mClose.addEventListener('click', closePlayerModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closePlayerModal(); });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (overlay.classList.contains('open')) closePlayerModal();
  if (document.getElementById('photoLightbox').classList.contains('open')) document.getElementById('photoLightbox').classList.remove('open');
});

// ─── ORDER / GROUND UI ───────────────────────────────────────────────────────
const POS_OPTIONS = ['LF','CF','RF','3B','SS','2B','1B','C','DH'];

const DEFAULT_LINEUP = [
  { batOrder:1, pos:'LF', playerId:'' },
  { batOrder:2, pos:'LF', playerId:'' },
  { batOrder:3, pos:'LF', playerId:'' },
  { batOrder:4, pos:'LF', playerId:'' },
  { batOrder:5, pos:'LF', playerId:'' },
  { batOrder:6, pos:'LF', playerId:'' },
  { batOrder:7, pos:'LF', playerId:'' },
  { batOrder:8, pos:'LF', playerId:'' },
  { batOrder:9, pos:'LF', playerId:'' },
];

let orderState = { sp: '', lineup: JSON.parse(JSON.stringify(DEFAULT_LINEUP)) };

function initOrderForm() {
  const spSelect = document.getElementById('sp-select');
  const slotList = document.getElementById('orderSlotList');
  const allSorted = [...PLAYERS].sort((a,b) => parseInt(a.number||'99') - parseInt(b.number||'99'));
  const pitchers = PLAYERS.filter(p => p.position === '投手');

  pitchers.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = '#' + p.number + ' ' + p.name;
    spSelect.appendChild(opt);
  });

  slotList.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const slot = orderState.lineup[i];
    const item = document.createElement('div');
    item.className = 'order-slot-item';
    const posOpts = POS_OPTIONS.map(k => '<option value="' + k + '">' + k + '</option>').join('');
    const playerOpts = '<option value="">-- 選手 --</option>' +
      allSorted.map(p => '<option value="' + p.id + '">#' + p.number + ' ' + p.name + '</option>').join('');
    item.innerHTML = '<span class="slot-num">' + (i+1) + '</span>' +
      '<select class="slot-pos-select" id="opos-' + i + '" aria-label="' + (i+1) + '番打者の守備位置">' + posOpts + '</select>' +
      '<select class="slot-player-select" id="oplayer-' + i + '" aria-label="' + (i+1) + '番打者の選手">' + playerOpts + '</select>';
    slotList.appendChild(item);
  }

  loadSavedOrder();

  spSelect.addEventListener('change', () => { orderState.sp = spSelect.value; updateGroundDisplay(); });
  for (let i = 0; i < 9; i++) {
    document.getElementById('opos-' + i).addEventListener('change', () => { orderState.lineup[i].pos = document.getElementById('opos-' + i).value; updateGroundDisplay(); });
    document.getElementById('oplayer-' + i).addEventListener('change', () => { orderState.lineup[i].playerId = document.getElementById('oplayer-' + i).value; updateGroundDisplay(); });
  }
}

function updateGroundDisplay() {
  const spPlayer = PLAYERS.find(p => p.id === orderState.sp);
  const pCard = document.getElementById('gpos-P');
  document.getElementById('gname-P').textContent = spPlayer ? spPlayer.name : '---';
  document.getElementById('gnum-P').textContent  = spPlayer ? '#' + spPlayer.number : '';
  
  if (pCard) {
    pCard.onclick = () => {
      if (spPlayer) {
        openPlayerModal(spPlayer);
      } else {
        showToast('先発投手を選択すると紹介モーダルが開きます');
      }
    };
  }

  POS_OPTIONS.forEach(posKey => {
    const slot = orderState.lineup.find(s => s.pos === posKey);
    const player = slot ? PLAYERS.find(p => p.id === slot.playerId) : null;
    const posCard = document.getElementById('gpos-' + posKey);
    const nameEl  = document.getElementById('gname-' + posKey);
    const numEl   = document.getElementById('gnum-'  + posKey);
    const batEl   = document.getElementById('gbat-'  + posKey);

    if (nameEl) nameEl.textContent = player ? player.name : '---';
    if (numEl)  numEl.textContent  = player ? '#' + player.number : '';
    if (batEl) {
      if (slot) { batEl.textContent = slot.batOrder; batEl.style.display = 'inline-flex'; }
      else { batEl.style.display = 'none'; }
    }

    if (posCard) {
      posCard.onclick = () => {
        if (player) {
          openPlayerModal(player);
        } else {
          showToast('右の打順設定で選手を選択すると、紹介モーダルが開きます');
        }
      };
    }
  });
}

function saveOrder() {
  orderState.sp = document.getElementById('sp-select').value;
  for (let i = 0; i < 9; i++) {
    orderState.lineup[i].pos = document.getElementById('opos-' + i).value;
    orderState.lineup[i].playerId = document.getElementById('oplayer-' + i).value;
  }
  localStorage.setItem('marines_order_v2', JSON.stringify(orderState));
  showToast('ベストスタメンを保存しました！');
  updateGroundDisplay();
}

function loadSavedOrder() {
  const saved = localStorage.getItem('marines_order_v2');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      orderState = data;
      if (data.sp) document.getElementById('sp-select').value = data.sp;
      (data.lineup || []).forEach((item, i) => {
        if (i < 9) {
          const posEl    = document.getElementById('opos-' + i);
          const playerEl = document.getElementById('oplayer-' + i);
          if (posEl)    posEl.value    = item.pos      || '';
          if (playerEl) playerEl.value = item.playerId || '';
        }
      });
    } catch(e) { console.error('Order load error', e); }
  } else {
    DEFAULT_LINEUP.forEach((item, i) => {
      const el = document.getElementById('opos-' + i);
      if (el) el.value = item.pos;
    });
    orderState = { sp: '', lineup: JSON.parse(JSON.stringify(DEFAULT_LINEUP)) };
  }
  updateGroundDisplay();
}

document.getElementById('saveOrderBtn').addEventListener('click', saveOrder);
document.getElementById('resetOrderBtn').addEventListener('click', () => {
  localStorage.removeItem('marines_order_v2');
  orderState = { sp: '', lineup: JSON.parse(JSON.stringify(DEFAULT_LINEUP)) };
  document.getElementById('sp-select').value = '';
  DEFAULT_LINEUP.forEach((item, i) => {
    const posEl    = document.getElementById('opos-' + i);
    const playerEl = document.getElementById('oplayer-' + i);
    if (posEl)    posEl.value    = item.pos;
    if (playerEl) playerEl.value = '';
  });
  updateGroundDisplay();
  showToast('オーダーをリセットしました');
});
