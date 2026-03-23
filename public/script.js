// ─── JWT 헬퍼 ──────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('admin_token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// ─── Landing page ──────────────────────────────────────────────────────────────
async function loadLanding() {
  try {
    const res = await fetch('/api/sections');
    const sections = await res.json();

    const heroSection = document.getElementById('hero-section');
    if (sections.length > 0) {
      heroSection.innerHTML = `
        <h1>${escapeHtml(sections[0].title)}</h1>
        <p>${escapeHtml(sections[0].content)}</p>
      `;
    }

    const container = document.getElementById('sections-container');
    container.innerHTML = '';
    sections.slice(1).forEach(section => {
      const card = document.createElement('div');
      card.className = 'section-card';
      card.innerHTML = `<h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.content)}</p>`;
      container.appendChild(card);
    });

    // 로딩 완료 — 오버레이 숨기고 콘텐츠 표시
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('hide');
    setTimeout(() => {
      overlay.style.display = 'none';
      heroSection.style.display = '';
      container.style.display = '';
    }, 200);

  } catch (err) {
    console.error('Failed to load sections', err);
  }
}

// ─── Admin ─────────────────────────────────────────────────────────────────────
async function initAdmin() {
  const loginPage = document.getElementById('login-page');
  const adminPage = document.getElementById('admin-page');

  // 이미 로그인 상태인지 확인
  const authRes = await fetch('/api/auth-check', {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const auth = await authRes.json();

  if (auth.loggedIn) {
    showAdminPanel();
  }

  // 로그인 폼
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('admin_token', data.token);
      errorEl.style.display = 'none';
      showAdminPanel();
    } else {
      errorEl.textContent = 'Invalid username or password';
      errorEl.style.display = 'block';
    }
  });

  // 로그아웃
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.removeItem('admin_token');
    loginPage.style.display = 'flex';
    adminPage.style.display = 'none';
    document.getElementById('login-form').reset();
  });

  async function showAdminPanel() {
    loginPage.style.display = 'none';
    adminPage.style.display = 'block';
    await loadEditors();
  }

  async function loadEditors() {
    const res = await fetch('/api/sections');
    const sections = await res.json();
    const container = document.getElementById('editors-container');
    container.innerHTML = '';

    sections.forEach(section => {
      const editor = document.createElement('div');
      editor.className = 'section-editor';
      editor.innerHTML = `
        <div class="editor-label">Section ${section.id}</div>
        <input type="text" placeholder="Title" value="${escapeHtml(section.title)}" data-id="${section.id}" data-field="title">
        <textarea placeholder="Content" data-id="${section.id}" data-field="content">${escapeHtml(section.content)}</textarea>
        <button class="save-btn" data-id="${section.id}">Save</button>
      `;
      container.appendChild(editor);
    });

    container.querySelectorAll('.save-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const titleInput = container.querySelector(`input[data-id="${id}"]`);
        const contentInput = container.querySelector(`textarea[data-id="${id}"]`);

        const res = await fetch(`/api/sections/${id}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            title: titleInput.value,
            content: contentInput.value
          })
        });

        if (res.ok) {
          btn.textContent = 'Saved';
          btn.classList.add('saved');
          setTimeout(() => {
            btn.textContent = 'Save';
            btn.classList.remove('saved');
          }, 1500);
        }
      });
    });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
