// Landing page
async function loadLanding() {
  try {
    const res = await fetch('/api/sections');
    const sections = await res.json();

    if (sections.length > 0) {
      document.getElementById('hero-title').textContent = sections[0].title;
      document.getElementById('hero-content').textContent = sections[0].content;
    }

    const container = document.getElementById('sections-container');
    container.innerHTML = '';
    sections.slice(1).forEach(section => {
      const card = document.createElement('div');
      card.className = 'section-card';
      card.innerHTML = `<h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.content)}</p>`;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load sections', err);
  }
}

// Admin
async function initAdmin() {
  const loginPage = document.getElementById('login-page');
  const adminPage = document.getElementById('admin-page');

  // Check if already logged in
  const authRes = await fetch('/api/auth-check');
  const auth = await authRes.json();

  if (auth.loggedIn) {
    showAdminPanel();
  }

  // Login form
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
      errorEl.style.display = 'none';
      showAdminPanel();
    } else {
      errorEl.textContent = 'Invalid username or password';
      errorEl.style.display = 'block';
    }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
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
          headers: { 'Content-Type': 'application/json' },
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
