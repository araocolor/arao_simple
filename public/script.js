// ─── Firebase Auth 헬퍼 ────────────────────────────────────────────────────────
async function authHeaders() {
  const user = firebase.auth().currentUser;
  if (!user) return { 'Content-Type': 'application/json' };
  const token = await user.getIdToken();
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
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

  // Firebase Auth 상태 감지 — 이미 로그인된 경우 자동으로 패널 표시
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      showAdminPanel();
    } else {
      loginPage.style.display = 'flex';
      adminPage.style.display = 'none';
    }
  });

  // 로그인 폼
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      errorEl.style.display = 'none';
    } catch (err) {
      errorEl.textContent = 'Invalid email or password';
      errorEl.style.display = 'block';
    }
  });

  // 로그아웃
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await firebase.auth().signOut();
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
          headers: await authHeaders(),
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
