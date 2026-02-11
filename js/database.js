/* ============================================
   database.js - API Client & UI Helpers
   Communicates with Express backend via REST API
   ============================================ */

const API_BASE = '/api';

/**
 * Initialize - verify backend is reachable
 */
async function initDatabase() {
  try {
    const res = await fetch(`${API_BASE}/vehicles/count`);
    if (!res.ok) throw new Error('Backend not reachable');
    console.log('Connected to backend API');
  } catch (err) {
    console.error('Backend connection failed:', err.message);
  }
}

/* ============================================
   API Helper Functions
   ============================================ */

async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

async function apiPost(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

async function apiPut(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

/**
 * Reset database via API
 */
async function resetDatabase() {
  try {
    await apiPost('/reset', {});
    location.reload();
  } catch (err) {
    showToast('Failed to reset database: ' + err.message, 'error');
  }
}

/* ============================================
   Toast Notification Helper
   ============================================ */

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

/* ============================================
   Modal Helper Functions
   ============================================ */

function showModal(title, bodyHTML, onSave, saveLabel = 'Save') {
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'activeModal';
  overlay.innerHTML = `
    <div class="modal">
      <h3>${title}</h3>
      <div class="modal-body">${bodyHTML}</div>
      <div class="modal-actions">
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" id="modalSaveBtn">${saveLabel}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.getElementById('modalSaveBtn').onclick = onSave;
}

function closeModal() {
  const modal = document.getElementById('activeModal');
  if (modal) modal.remove();
}
