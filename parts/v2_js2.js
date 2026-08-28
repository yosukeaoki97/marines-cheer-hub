// ─── GAME LOG ────────────────────────────────────────────────────────────────
let gameLogs = [];

function initGameLogs() {
  document.getElementById('logDate').value = new Date().toISOString().split('T')[0];
  loadGameLogs();
  document.getElementById('gameLogForm').addEventListener('submit', e => { e.preventDefault(); addGameLog(); });
  document.getElementById('clearLogsBtn').addEventListener('click', () => {
    if (confirm('すべての観戦記録を削除しますか？')) {
      gameLogs = []; saveGameLogs(); showToast('観戦ログを全消去しました');
    }
  });
}

function addGameLog() {
  const date     = document.getElementById('logDate').value;
  const opponent = document.getElementById('logOpponent').value;
  const stadium  = document.getElementById('logStadium').value;
  const result   = document.querySelector('input[name="logResult"]:checked').value;
  const memo     = document.getElementById('logMemo').value.trim();
  if (!date || !opponent || !stadium) { showToast('日付・対戦相手・球場を入力してください'); return; }
  gameLogs.unshift({ id: Date.now().toString(), date, opponent, stadium, result, memo });
  saveGameLogs();
  document.getElementById('logMemo').value = '';
  showToast('観戦記録を保存しました！');
}

window.deleteGameLog = function(id) {
  gameLogs = gameLogs.filter(l => l.id !== id);
  saveGameLogs(); showToast('ログを削除しました');
};

function saveGameLogs() {
  localStorage.setItem('marines_logs_v2', JSON.stringify(gameLogs));
  renderGameLogs();
}

function loadGameLogs() {
  const saved = localStorage.getItem('marines_logs_v2');
  if (saved) {
    try { gameLogs = JSON.parse(saved); } catch(e) { gameLogs = []; }
  } else {
    gameLogs = [
      { id:'s1', date:'2026-05-18', opponent:'福岡ソフトバンクホークス', stadium:'ZOZOマリンスタジアム', result:'win', memo:'小島7回無失点！ファン感謝デー前夜のアツい勝利' },
      { id:'s2', date:'2026-04-29', opponent:'オリックス・バファローズ', stadium:'ZOZOマリンスタジアム', result:'win', memo:'藤原の先頭打者ホームランから始まった快勝！' }
    ];
    saveGameLogs();
  }
  renderGameLogs();
}

function renderGameLogs() {
  const listEl = document.getElementById('logList');
  listEl.innerHTML = '';
  let wins = 0, losses = 0, draws = 0;
  const stadCount = {};

  // ── 日付降順ソート（新しい日付が上）──
  const sorted = [...gameLogs].sort((a, b) => {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });

  sorted.forEach(log => {
    if (log.result === 'win')       wins++;
    else if (log.result === 'lose') losses++;
    else                            draws++;
    stadCount[log.stadium] = (stadCount[log.stadium] || 0) + 1;

    const item = document.createElement('div');
    item.className = 'log-item';
    const rt = log.result === 'win' ? '〇 勝' : log.result === 'lose' ? '● 負' : '△ 分';
    const rc = log.result === 'win' ? 'win'  : log.result === 'lose' ? 'lose' : 'draw';
    item.innerHTML =
      '<div class="log-main-info">' +
        '<span class="result-pill ' + rc + '">' + rt + '</span>' +
        '<div class="log-details">' +
          '<div class="log-date-stadium">' + esc(log.date) + ' &#128205;' + esc(log.stadium) + '</div>' +
          '<div class="log-vs">vs ' + esc(log.opponent) + '</div>' +
          (log.memo ? '<div class="log-memo">' + esc(log.memo) + '</div>' : '') +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:5px;align-items:center;flex-shrink:0;">' +
        '<button class="log-del-btn" title="編集" style="color:var(--accent);font-size:13px;padding:4px 8px;" onclick="editGameLog(\'' + log.id + '\')">✏️</button>' +
        '<button class="log-del-btn" title="このログを削除" onclick="deleteGameLog(\'' + log.id + '\')">&#x2715;</button>' +
      '</div>';
    listEl.appendChild(item);
  });

  const decGames = wins + losses;
  let rateStr = '.---';
  if (decGames > 0) {
    const r = wins / decGames;
    rateStr = r >= 1 ? '1.000' : r.toFixed(3).replace(/^0/, '');
  }
  document.getElementById('stat-win-rate').textContent = rateStr;
  document.getElementById('stat-total').innerHTML = (wins + losses + draws) + ' <span style="font-size:14px;">試合</span>';
  document.getElementById('stat-w-l').textContent = wins + '勝 ' + losses + '敗';
  document.getElementById('stat-draw').textContent = draws;

  let topStad = '-', maxC = 0;
  for (const [s, c] of Object.entries(stadCount)) { if (c > maxC) { maxC = c; topStad = s; } }
  // Shorten stadium name for display
  const shortMap = { 'ZOZOマリンスタジアム':'ZOZOマリン', 'エスコンフィールドHOKKAIDO':'エスコンF', 'みずほPayPayドーム福岡':'PayPayドーム', '京セラドーム大阪':'京セラD', 'ベルーナドーム':'ベルーナD', '楽天モバイルパーク宮城':'楽天モバパ' };
  document.getElementById('stat-stadium').textContent = shortMap[topStad] || topStad;
}

// ─── ゲームログ編集 ────────────────────────────────────────────────────────────
window.editGameLog = function(id) {
  const log = gameLogs.find(l => l.id === id);
  if (!log) return;
  document.getElementById('logEditId').value      = log.id;
  document.getElementById('logEditDate').value    = log.date;
  document.getElementById('logEditMemo').value    = log.memo || '';

  // opponent
  const oppEl = document.getElementById('logEditOpponent');
  for (let i = 0; i < oppEl.options.length; i++) {
    if (oppEl.options[i].value === log.opponent) { oppEl.selectedIndex = i; break; }
  }
  // stadium
  const stadEl = document.getElementById('logEditStadium');
  for (let i = 0; i < stadEl.options.length; i++) {
    if (stadEl.options[i].value === log.stadium) { stadEl.selectedIndex = i; break; }
  }
  // result
  const radios = document.querySelectorAll('input[name="logEditResult"]');
  radios.forEach(r => { r.checked = (r.value === log.result); });

  const overlay = document.getElementById('logEditModalOverlay');
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'all';
};

function initGameLogEdit() {
  function closeLogEditModal() {
    const overlay = document.getElementById('logEditModalOverlay');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  }

  document.getElementById('logEditClose').addEventListener('click', closeLogEditModal);
  document.getElementById('logEditCancel').addEventListener('click', closeLogEditModal);
  document.getElementById('logEditModalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('logEditModalOverlay')) closeLogEditModal();
  });

  document.getElementById('logEditSave').addEventListener('click', () => {
    const id       = document.getElementById('logEditId').value;
    const date     = document.getElementById('logEditDate').value;
    const opponent = document.getElementById('logEditOpponent').value;
    const stadium  = document.getElementById('logEditStadium').value;
    const result   = document.querySelector('input[name="logEditResult"]:checked');
    const memo     = document.getElementById('logEditMemo').value.trim();

    if (!date || !opponent || !stadium || !result) {
      showToast('日付・対戦相手・球場・結果を入力してください');
      return;
    }
    const idx = gameLogs.findIndex(l => l.id === id);
    if (idx === -1) { showToast('ログが見つかりませんでした'); return; }

    gameLogs[idx] = { id, date, opponent, stadium, result: result.value, memo };
    saveGameLogs();
    closeLogEditModal();
    showToast('観戦ログを更新しました！');
  });
}



// ─── GALLERY (localForage / IndexedDB) ───────────────────────────────────────
const GALLERY_KEY = 'marines_gallery_v1';
let galleryPhotos = [];
let selectedDataUrl = null;

async function initGallery() {
  document.getElementById('photoDate').value = new Date().toISOString().split('T')[0];

  // Load from IndexedDB via localForage
  try {
    const saved = await localforage.getItem(GALLERY_KEY);
    if (Array.isArray(saved)) galleryPhotos = saved;
  } catch(e) { console.warn('localForage load error', e); galleryPhotos = []; }
  renderGallery();

  // Upload zone
  const zone      = document.getElementById('uploadZone');
  const fileInput = document.getElementById('photoFileInput');
  const previewEl = document.getElementById('uploadPreviewImg');

  function triggerFileSelect() { fileInput.click(); }
  zone.addEventListener('click', triggerFileSelect);
  zone.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); triggerFileSelect(); } });

  function handleFileChange(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      selectedDataUrl = ev.target.result;
      previewEl.src = selectedDataUrl;
      previewEl.style.display = 'block';
      zone.classList.add('has-img');
      const inner = zone.querySelector('.upload-zone-inner');
      if (inner) inner.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', e => handleFileChange(e.target.files[0]));

  // Drag-and-drop
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--accent)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFileChange(file);
  });

  // Form submit
  document.getElementById('galleryUploadForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!selectedDataUrl) { showToast('写真を選択してください'); return; }
    const photo = {
      id:       Date.now().toString(),
      dataUrl:  selectedDataUrl,
      date:     document.getElementById('photoDate').value,
      stadium:  document.getElementById('photoStadium').value,
      opponent: document.getElementById('photoOpponent').value,
      caption:  document.getElementById('photoCaption').value.trim()
    };
    galleryPhotos.unshift(photo);
    try { await localforage.setItem(GALLERY_KEY, galleryPhotos); }
    catch(e) { console.error('localForage save error', e); showToast('保存に失敗しました（ストレージ容量を確認してください）'); return; }
    renderGallery();
    resetUploadForm();
    showToast('写真をギャラリーに追加しました！');
  });

  // Lightbox events
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('photoLightbox').addEventListener('click', e => {
    if (e.target === document.getElementById('photoLightbox')) closeLightbox();
  });
  const lbEditBtn = document.getElementById('lightboxEditBtn');
  if (lbEditBtn) {
    lbEditBtn.addEventListener('click', () => {
      if (currentLightboxPhoto) {
        const pId = currentLightboxPhoto.id;
        closeLightbox();
        editPhoto(pId);
      }
    });
  }
}

function resetUploadForm() {
  document.getElementById('galleryUploadForm').reset();
  selectedDataUrl = null;
  const previewEl = document.getElementById('uploadPreviewImg');
  previewEl.style.display = 'none';
  previewEl.src = '';
  const zone = document.getElementById('uploadZone');
  zone.classList.remove('has-img');
  const inner = zone.querySelector('.upload-zone-inner');
  if (inner) inner.style.display = '';
  document.getElementById('photoDate').value = new Date().toISOString().split('T')[0];
}

window.deletePhoto = async function(id) {
  galleryPhotos = galleryPhotos.filter(p => p.id !== id);
  try { await localforage.setItem(GALLERY_KEY, galleryPhotos); } catch(e) { console.error(e); }
  renderGallery();
  showToast('写真を削除しました');
};

function renderGallery() {
  const photoGrid = document.getElementById('photoGrid');
  const emptyEl   = document.getElementById('galleryEmpty');
  photoGrid.innerHTML = '';

  if (!galleryPhotos.length) { emptyEl.classList.add('visible'); return; }
  emptyEl.classList.remove('visible');

  // ── 日付降順ソート（新しい日付が上）──
  const sorted = [...galleryPhotos].sort((a, b) => {
    if ((a.date || '') > (b.date || '')) return -1;
    if ((a.date || '') < (b.date || '')) return 1;
    return 0;
  });

  sorted.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    const metaDate = photo.date + (photo.stadium ? ' &#128205;' + photo.stadium : '') + (photo.opponent ? ' vs ' + photo.opponent : '');
    card.innerHTML =
      '<img src="' + photo.dataUrl + '" alt="' + esc(photo.caption || '観戦写真') + '" loading="lazy" />' +
      '<div class="photo-card-meta">' +
        '<div class="photo-card-date">' + metaDate + '</div>' +
        '<div class="photo-card-caption">' + esc(photo.caption || '') + '</div>' +
      '</div>';
    card.addEventListener('click', () => openLightbox(photo));
    photoGrid.appendChild(card);
  });
}

// ─── フォト編集 ───────────────────────────────────────────────────────────────
window.editPhoto = function(id) {
  const photo = galleryPhotos.find(p => p.id === id);
  if (!photo) return;
  document.getElementById('photoEditId').value      = photo.id;
  document.getElementById('photoEditDate').value    = photo.date || '';
  document.getElementById('photoEditCaption').value = photo.caption || '';

  const stadEl = document.getElementById('photoEditStadium');
  for (let i = 0; i < stadEl.options.length; i++) {
    if (stadEl.options[i].value === (photo.stadium || '')) { stadEl.selectedIndex = i; break; }
  }
  const oppEl = document.getElementById('photoEditOpponent');
  for (let i = 0; i < oppEl.options.length; i++) {
    if (oppEl.options[i].value === (photo.opponent || '')) { oppEl.selectedIndex = i; break; }
  }

  const overlay = document.getElementById('photoEditModalOverlay');
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'all';
};

function initPhotoEdit() {
  function closePhotoEditModal() {
    const overlay = document.getElementById('photoEditModalOverlay');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  }

  document.getElementById('photoEditClose').addEventListener('click', closePhotoEditModal);
  document.getElementById('photoEditCancel').addEventListener('click', closePhotoEditModal);
  document.getElementById('photoEditModalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('photoEditModalOverlay')) closePhotoEditModal();
  });

  // 編集モーダル内からの写真削除
  const delBtn = document.getElementById('photoEditDelete');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      const id = document.getElementById('photoEditId').value;
      if (!id) return;
      if (confirm('この写真をギャラリーから削除しますか？')) {
        galleryPhotos = galleryPhotos.filter(p => p.id !== id);
        try {
          await localforage.setItem(GALLERY_KEY, galleryPhotos);
        } catch(e) {
          console.error('localForage delete error', e);
        }
        renderGallery();
        closePhotoEditModal();
        closeLightbox();
        showToast('写真を削除しました');
      }
    });
  }

  document.getElementById('photoEditSave').addEventListener('click', async () => {
    const id      = document.getElementById('photoEditId').value;
    const date    = document.getElementById('photoEditDate').value;
    const stadium = document.getElementById('photoEditStadium').value;
    const opponent= document.getElementById('photoEditOpponent').value;
    const caption = document.getElementById('photoEditCaption').value.trim();

    const idx = galleryPhotos.findIndex(p => p.id === id);
    if (idx === -1) { showToast('写真データが見つかりませんでした'); return; }

    galleryPhotos[idx] = Object.assign({}, galleryPhotos[idx], { date, stadium, opponent, caption });
    try {
      await localforage.setItem(GALLERY_KEY, galleryPhotos);
    } catch(e) {
      console.error('localForage save error on edit', e);
      showToast('保存に失敗しました');
      return;
    }
    renderGallery();
    closePhotoEditModal();
    showToast('写真情報を更新しました！');
  });
}


let currentLightboxPhoto = null;

function openLightbox(photo) {
  currentLightboxPhoto = photo;
  document.getElementById('lightboxImg').src = photo.dataUrl;
  let info = photo.date || '';
  if (photo.stadium)  info += ' &#128205;' + photo.stadium;
  if (photo.opponent) info += ' vs ' + photo.opponent;
  document.getElementById('lightboxDate').innerHTML    = info;
  document.getElementById('lightboxCaption').textContent = photo.caption || '';
  document.getElementById('photoLightbox').classList.add('open');
}

function closeLightbox() {
  document.getElementById('photoLightbox').classList.remove('open');
  currentLightboxPhoto = null;
}

// ─── BACKUP / RESTORE (JSON EXPORT / IMPORT) ──────────────────────────────────
function initBackupSystem() {
  const exportBtn = document.getElementById('exportDataBtn');
  const importBtn = document.getElementById('importDataBtn');
  const fileInput = document.getElementById('backupFileInput');

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        let galleryData = [];
        if (window.localforage) {
          galleryData = (await localforage.getItem(GALLERY_KEY)) || [];
        }
        const data = {
          app: 'marines-cheer-hub',
          version: '2.0',
          exportedAt: new Date().toISOString(),
          order: JSON.parse(localStorage.getItem('marines_order_v2') || 'null'),
          gamelogs: JSON.parse(localStorage.getItem('marines_logs_v2') || '[]'),
          gallery: galleryData
        };

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `marines_cheer_hub_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('バックアップJSONを出力しました');
      } catch (err) {
        console.error('Export error:', err);
        showToast('エクスポート中にエラーが発生しました');
      }
    });
  }

  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const imported = JSON.parse(evt.target.result);
          if (!imported || (imported.order === undefined && !imported.gamelogs && !imported.gallery)) {
            showToast('無効なバックアップファイルです');
            return;
          }

          if (confirm('現在のデータをファイルの内容で上書き復元しますか？')) {
            if (imported.order !== undefined) {
              if (imported.order === null) localStorage.removeItem('marines_order_v2');
              else localStorage.setItem('marines_order_v2', JSON.stringify(imported.order));
            }
            if (imported.gamelogs !== undefined) {
              localStorage.setItem('marines_logs_v2', JSON.stringify(imported.gamelogs));
            }
            if (imported.gallery !== undefined && window.localforage) {
              await localforage.setItem(GALLERY_KEY, imported.gallery);
            }

            showToast('データを正常に復元しました！再読み込みします...');
            setTimeout(() => {
              location.reload();
            }, 1000);
          }
        } catch (err) {
          console.error('Import error:', err);
          showToast('JSONファイルの読み込みに失敗しました');
        } finally {
          fileInput.value = '';
        }
      };
      reader.readAsText(file);
    });
  }
}

// ─── GOOGLE IDENTITY SERVICES & GOOGLE DRIVE API SYNC ─────────────────────────
let googleTokenClient = null;
let googleAccessToken = null;
let googleUser = null;

const GDRIVE_FILE_NAME = 'marines_cheer_hub_data.json';
const DEFAULT_CLIENT_ID = '735794584683-ga1e3p56fcnsej3jjaeme8ogo9vb2hc5.apps.googleusercontent.com';

function getStoredClientId() {
  return localStorage.getItem('marines_gdrive_client_id') || DEFAULT_CLIENT_ID;
}

function setStoredClientId(clientId) {
  localStorage.setItem('marines_gdrive_client_id', clientId.trim());
}

function initGoogleDriveSync() {
  const authBtn      = document.getElementById('googleAuthBtn');
  const logoutBtn    = document.getElementById('googleLogoutBtn');
  const saveBtn      = document.getElementById('gdriveSaveBtn');
  const loadBtn      = document.getElementById('gdriveLoadBtn');
  const configBtn    = document.getElementById('gdriveConfigBtn');
  
  const modalOverlay = document.getElementById('gdriveConfigModalOverlay');
  const modalClose   = document.getElementById('gdriveConfigClose');
  const modalCancel  = document.getElementById('gdriveConfigCancel');
  const modalSave    = document.getElementById('gdriveConfigSave');
  const clientIdInput= document.getElementById('gdriveClientIdInput');

  function openConfigModal() {
    if (clientIdInput) clientIdInput.value = getStoredClientId();
    if (modalOverlay) {
      modalOverlay.style.opacity = '1';
      modalOverlay.style.pointerEvents = 'all';
    }
  }
  function closeConfigModal() {
    if (modalOverlay) {
      modalOverlay.style.opacity = '0';
      modalOverlay.style.pointerEvents = 'none';
    }
  }

  if (configBtn) configBtn.addEventListener('click', openConfigModal);
  if (modalClose) modalClose.addEventListener('click', closeConfigModal);
  if (modalCancel) modalCancel.addEventListener('click', closeConfigModal);
  
  if (modalSave) {
    modalSave.addEventListener('click', () => {
      const val = clientIdInput ? clientIdInput.value.trim() : '';
      if (!val) {
        showToast('クライアントIDを入力してください');
        return;
      }
      setStoredClientId(val);
      closeConfigModal();
      showToast('Client IDを保存しました！');
      initGISClient();
    });
  }

  function initGISClient() {
    const clientId = getStoredClientId();
    if (!clientId || typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      return false;
    }
    try {
      googleTokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (response) => {
          if (response.error) {
            console.error('GIS Error:', response);
            showToast('Googleログインエラー: ' + response.error);
            return;
          }
          googleAccessToken = response.access_token;
          await fetchUserProfile();
          updateGoogleUI(true);
          showToast('Googleでログインしました！');
        }
      });
      return true;
    } catch (e) {
      console.error('initGISClient Error:', e);
      return false;
    }
  }

  async function fetchUserProfile() {
    if (!googleAccessToken) return;
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      if (res.ok) {
        googleUser = await res.json();
      }
    } catch (e) {
      console.warn('User profile fetch failed:', e);
    }
  }

  function updateGoogleUI(isLoggedIn) {
    const unloggedEl = document.getElementById('googleAuthUnlogged');
    const loggedEl   = document.getElementById('googleAuthLogged');
    const avatarImg  = document.getElementById('userAvatarImg');
    const nameText   = document.getElementById('userNameText');

    if (isLoggedIn && googleUser) {
      if (unloggedEl) unloggedEl.style.display = 'none';
      if (loggedEl)   loggedEl.style.display   = 'flex';
      if (avatarImg)  avatarImg.src = googleUser.picture || '';
      if (nameText)   nameText.textContent = googleUser.name || 'ユーザー';
    } else {
      if (unloggedEl) unloggedEl.style.display = 'flex';
      if (loggedEl)   loggedEl.style.display   = 'none';
    }
  }

  if (authBtn) {
    authBtn.addEventListener('click', () => {
      const clientId = getStoredClientId();
      if (!clientId) {
        openConfigModal();
        showToast('先にGoogle API クライアントIDを設定してください');
        return;
      }
      if (!googleTokenClient) {
        const ok = initGISClient();
        if (!ok) {
          showToast('Google APIライブラリの準備中です。少し待ってお試しください');
          return;
        }
      }
      googleTokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (googleAccessToken && typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        google.accounts.oauth2.revoke(googleAccessToken, () => {});
      }
      googleAccessToken = null;
      googleUser = null;
      updateGoogleUI(false);
      showToast('ログアウトしました');
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!googleAccessToken) {
        showToast('Googleでログインしてください');
        return;
      }
      showToast('Google Driveへ同期保存中...');

      try {
        let galleryData = [];
        if (window.localforage) {
          galleryData = (await localforage.getItem(GALLERY_KEY)) || [];
        }
        const payload = {
          app: 'marines-cheer-hub',
          version: '2.0',
          updatedAt: new Date().toISOString(),
          order: JSON.parse(localStorage.getItem('marines_order_v2') || 'null'),
          gamelogs: JSON.parse(localStorage.getItem('marines_logs_v2') || '[]'),
          gallery: galleryData
        };

        const jsonString = JSON.stringify(payload, null, 2);

        const searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${GDRIVE_FILE_NAME}'&fields=files(id,name)`,
          { headers: { Authorization: `Bearer ${googleAccessToken}` } }
        );
        const searchData = await searchRes.json();
        const existingFile = searchData.files && searchData.files[0];

        if (existingFile) {
          const updateRes = await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
            {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${googleAccessToken}`,
                'Content-Type': 'application/json'
              },
              body: jsonString
            }
          );
          if (updateRes.ok) {
            showToast('☁️ Google Drive (appDataFolder) にデータを保存しました！');
          } else {
            throw new Error('Update failed');
          }
        } else {
          const metadata = {
            name: GDRIVE_FILE_NAME,
            parents: ['appDataFolder'],
            mimeType: 'application/json'
          };
          const boundary = '-------314159265358979323846';
          const delimiter = "\r\n--" + boundary + "\r\n";
          const close_delim = "\r\n--" + boundary + "--";

          const multipartRequestBody =
            delimiter +
            'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            jsonString +
            close_delim;

          const createRes = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${googleAccessToken}`,
                'Content-Type': `multipart/related; boundary="${boundary}"`
              },
              body: multipartRequestBody
            }
          );
          if (createRes.ok) {
            showToast('☁️ Google Drive (appDataFolder) に新規保存しました！');
          } else {
            throw new Error('Create failed');
          }
        }
      } catch (err) {
        console.error('Drive save error:', err);
        showToast('Google Driveへの保存に失敗しました');
      }
    });
  }

  if (loadBtn) {
    loadBtn.addEventListener('click', async () => {
      if (!googleAccessToken) {
        showToast('Googleでログインしてください');
        return;
      }
      showToast('Google Driveからデータ検索中...');

      try {
        const searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${GDRIVE_FILE_NAME}'&fields=files(id,name,modifiedTime)`,
          { headers: { Authorization: `Bearer ${googleAccessToken}` } }
        );
        const searchData = await searchRes.json();
        const file = searchData.files && searchData.files[0];

        if (!file) {
          showToast('Google Drive内にバックアップデータが見つかりませんでした');
          return;
        }

        const fileRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          { headers: { Authorization: `Bearer ${googleAccessToken}` } }
        );
        const imported = await fileRes.json();

        const modDate = file.modifiedTime ? new Date(file.modifiedTime).toLocaleString('ja') : '';
        if (confirm(`Google Driveのデータ（更新日時: ${modDate}）で現在のデータを上書き復元しますか？`)) {
          if (imported.order !== undefined) {
            if (imported.order === null) localStorage.removeItem('marines_order_v2');
            else localStorage.setItem('marines_order_v2', JSON.stringify(imported.order));
          }
          if (imported.gamelogs !== undefined) {
            localStorage.setItem('marines_logs_v2', JSON.stringify(imported.gamelogs));
          }
          if (imported.gallery !== undefined && window.localforage) {
            await localforage.setItem(GALLERY_KEY, imported.gallery);
          }

          showToast('Google Driveからデータを復元しました！再読み込みします...');
          setTimeout(() => location.reload(), 1000);
        }
      } catch (err) {
        console.error('Drive load error:', err);
        showToast('Google Driveからの復元に失敗しました');
      }
    });
  }

  window.addEventListener('load', () => {
    setTimeout(initGISClient, 500);
  });
}

// ─── SCHEDULE & STATS MODAL ──────────────────────────────────────────────────
function initScheduleModal() {
  const btn = document.getElementById('scheduleModalBtn');
  const overlay = document.getElementById('scheduleModalOverlay');
  const closeBtn = document.getElementById('scheduleModalClose');

  if (btn && overlay) {
    btn.addEventListener('click', () => {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
    });
  }
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    });
  }
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
      }
    });
  }
}

// ─── MARINES AI CHAT WIDGET ──────────────────────────────────────────────────
function initAIChat() {
  const toggleBtn = document.getElementById('aiChatToggleBtn');
  const windowEl  = document.getElementById('aiChatWindow');
  const closeBtn  = document.getElementById('aiChatClose');
  const formEl    = document.getElementById('aiChatForm');
  const inputEl   = document.getElementById('aiChatInput');
  const bodyEl    = document.getElementById('aiChatBody');

  if (!toggleBtn || !windowEl) return;

  toggleBtn.addEventListener('click', () => {
    windowEl.classList.toggle('open');
    if (windowEl.classList.contains('open')) {
      inputEl.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => windowEl.classList.remove('open'));
  }

  function appendMsg(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg ' + sender;
    msgDiv.innerHTML = '<div class="msg-bubble">' + text + '</div>';
    bodyEl.appendChild(msgDiv);
    bodyEl.scrollTop = bodyEl.scrollHeight;
    return msgDiv;
  }

  // Gemini API Key Storage
  function getStoredGeminiApiKey() {
    return localStorage.getItem('marines_gemini_api_key') || '';
  }
  function setStoredGeminiApiKey(key) {
    localStorage.setItem('marines_gemini_api_key', key.trim());
  }

  // API Key config button
  const apiKeyBtn = document.getElementById('aiApiKeyConfigBtn');
  if (apiKeyBtn) {
    apiKeyBtn.addEventListener('click', () => {
      const cur = getStoredGeminiApiKey();
      const next = prompt('Google AI Studio で取得した Gemini APIキーを入力してください:\n(※ブラウザ内に安全に保存されます)', cur);
      if (next !== null) {
        setStoredGeminiApiKey(next);
        showToast(next.trim() ? 'Gemini APIキーを保存しました！' : 'APIキーをクリアしました');
      }
    });
  }

  // 簡易マークダウン整形（太字・箇条書き・改行）
  function formatAiResponse(txt) {
    if (!txt) return '';
    return esc(txt)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^[\*\-]\s+(.*)$/gm, '• $1')
      .replace(/\n/g, '<br/>');
  }

  // ─── マリーンズAIチャット送信処理（Gemini Web Search Grounding）───
  async function fetchMarinesAIChat(userInputText) {
    // 1. 現在の日付を取得してプロンプトに注入
    const todayStr = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });

    // 2. 役割とルールを明記したシステムプロンプト
    const systemInstruction = `
あなたは千葉ロッテマリーンズの熱烈かつ誠実な専属AIアシスタント「マリーンズAI」です。
本日の日付は【 ${todayStr} 】です。

【回答ルール】
1. 外部Webサイトやスポナビ等の「リンクだけを提示して回答を終えること」は絶対に禁止します。
2. 試合日程、対戦相手、スコア、選手情報などのリアルタイム情報について質問された場合は、最新情報を検索・取得し、具体的な文章（対戦相手、球場、開始時間、結果など）で直接答えてください。
3. ロッテファンに対して親しみやすく、かつ分かりやすい丁寧な日本語で回答してください。
4. 必要に応じて箇条書きなどを使い、視認性を高めてください。
`;

    // 3. APIリクエストボディ（Google Web Search Groundingを有効化）
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: userInputText }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      tools: [
        {
          googleSearch: {} 
        }
      ]
    };

    try {
      const API_KEY = getStoredGeminiApiKey() || "YOUR_GEMINI_API_KEY"; // ※環境に応じたAPIキー変数を適用してください
      if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY") {
        return "⚠️ **Gemini APIキーが設定されていません。**<br/>チャット右上の「⚙️」ボタンを押して、Gemini APIキーを設定してください。（Google AI Studioで無料取得できます）";
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();
      
      if (data.error) {
        console.error("Gemini API Error:", data.error);
        return `⚠️ APIエラー: ${esc(data.error.message || '通信に失敗しました')}<br/>APIキーが正しいかチャット上部の「⚙️」からご確認ください。`;
      }

      const candidate = data.candidates?.[0];
      const aiResponseText = candidate?.content?.parts?.[0]?.text;

      if (aiResponseText) {
        return formatAiResponse(aiResponseText);
      } else {
        return "申し訳ありません。回答の取得に失敗しました。時間をおいて再度お試しください。";
      }

    } catch (error) {
      console.error("AI Chat Error:", error);
      return "通信エラーが発生しました。ネットワーク状態またはAPIキーの設定をご確認ください。";
    }
  }

  if (formEl) {
    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const q = inputEl.value.trim();
      if (!q) return;

      // APIキー直接入力コマンドのサポート
      if (q.startsWith('key:') || q.startsWith('KEY:') || q.startsWith('キー:') || q.startsWith('api_key:')) {
        const newKey = q.replace(/^(key|KEY|キー|api_key):\s*/, '').trim();
        setStoredGeminiApiKey(newKey);
        appendMsg('user', '🔑 APIキーを設定');
        appendMsg('bot', 'Gemini APIキーを保存しました！最新の試合日程や成績について何でも質問してください⚾');
        inputEl.value = '';
        return;
      }

      appendMsg('user', esc(q));
      inputEl.value = '';

      // ローディング表示
      const loadingEl = appendMsg('bot', '<span style="color:var(--muted);font-size:12px;">🔍 最新情報を検索・回答生成中...</span>');

      const botReply = await fetchMarinesAIChat(q);
      loadingEl.querySelector('.msg-bubble').innerHTML = botReply;
      bodyEl.scrollTop = bodyEl.scrollHeight;
    });
  }
}

// ─── INITIALISE ALL ──────────────────────────────────────────────────────────
renderPlayers();
initOrderForm();
initGameLogs();
initGameLogEdit();
initGallery();
initPhotoEdit();
initBackupSystem();
initGoogleDriveSync();
initScheduleModal();
initAIChat();

