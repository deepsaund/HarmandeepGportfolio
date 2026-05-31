/* ==========================================================================
   Harmandeep Singh - Premium System Administration Controller
   Bespoke Interactive Core Logic for Admin Dashboard Panel
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();
  initTabNavigation();
  initLoginForm();
  initProjectCRUD();
  initEnquiryInbox();
  initSystemConfig();
  initImageUploadPreview();
});

/* ==========================================
   1. GLOBAL UI NOTIFICATION TOAST
   ========================================== */
function showToast(message, isError = false) {
  const toast = document.getElementById('adminToast');
  const toastMsg = document.getElementById('adminToastMsg');
  const icon = toast.querySelector('.toast-icon');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  
  if (isError) {
    toast.classList.add('error');
    icon.textContent = '✕';
  } else {
    toast.classList.remove('error');
    icon.textContent = '✓';
  }

  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* ==========================================
   2. AUTHENTICATION SERVICE CONTROLLER
   ========================================== */
let isUserLoggedIn = false;

async function checkAuthStatus() {
  try {
    const res = await fetch('/api/admin/check');
    const data = await res.json();
    
    if (data.loggedIn) {
      setLoggedInState(true);
    } else {
      setLoggedInState(false);
    }
  } catch (err) {
    console.error('Auth verification failed', err);
    setLoggedInState(false);
  }
}

function setLoggedInState(loggedIn) {
  isUserLoggedIn = loggedIn;
  const loginWrapper = document.getElementById('loginWrapper');
  const dashboardWrapper = document.getElementById('dashboardWrapper');

  if (loggedIn) {
    loginWrapper.classList.add('hidden');
    dashboardWrapper.classList.remove('hidden');
    // Load admin panel data
    loadProjectsData();
    loadEnquiriesData();
    loadConfigData();
  } else {
    loginWrapper.classList.remove('hidden');
    dashboardWrapper.classList.add('hidden');
  }
}

function initLoginForm() {
  const form = document.getElementById('loginForm');
  const logoutBtn = document.getElementById('logoutBtn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUser').value.trim();
      const password = document.getElementById('loginPass').value;

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast(data.message || 'Login verification successful!');
          form.reset();
          setLoggedInState(true);
        } else {
          showToast(data.error || 'Invalid credentials.', true);
        }
      } catch (err) {
        showToast('Server connection failed.', true);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/admin/logout', { method: 'POST' });
        const data = await res.json();
        
        if (res.ok && data.success) {
          showToast('Logged out securely.');
          setLoggedInState(false);
        } else {
          showToast('Logout action failed.', true);
        }
      } catch (err) {
        showToast('Logout action failed.', true);
      }
    });
  }
}

/* ==========================================
   3. SYSTEM TAB ROUTING CONTROLLER
   ========================================== */
function initTabNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.content-tab-view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabTarget = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetView = document.getElementById(`tab-${tabTarget}`);
      if (targetView) targetView.classList.add('active');

      // Reload appropriate data stream
      if (tabTarget === 'projects') loadProjectsData();
      if (tabTarget === 'inbox') loadEnquiriesData();
      if (tabTarget === 'settings') loadConfigData();
    });
  });
}

/* ==========================================
   4. PROJECTS MANAGEMENT WORKFLOW (CRUD)
   ========================================== */
let allProjects = [];

async function loadProjectsData() {
  const grid = document.getElementById('projectsListGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    allProjects = data;

    renderProjectsList(data);
    updateProjectStatistics(data);
  } catch (err) {
    grid.innerHTML = `<div class="admin-loading"><p style="color: var(--error);">Error retrieving projects catalog.</p></div>`;
  }
}

function renderProjectsList(projects) {
  const grid = document.getElementById('projectsListGrid');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = `<div class="inbox-empty" style="grid-column: 1/-1;"><p>No projects found. Add one to start your catalog.</p></div>`;
    return;
  }

  grid.innerHTML = '';
  projects.forEach(project => {
    const isFeatured = project.featured;
    const card = document.createElement('div');
    card.className = 'admin-project-card';
    card.setAttribute('data-id', project.id);
    
    // Resolve image path prefix
    const isUploaded = project.img.startsWith('imageFile-') || project.img.includes('-');
    const imgPath = isUploaded ? `/uploads/${project.img}` : `/${project.img}`;

    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${imgPath}" alt="${project.title}">
        <span class="card-badge">${project.category}</span>
        ${isFeatured ? '<span class="card-featured-tag">Featured</span>' : ''}
      </div>
      <div class="card-details">
        <div class="card-meta">
          <h3>${project.title}</h3>
          <p>${project.subtitle || ''}</p>
        </div>
        <div class="card-actions">
          <button class="card-btn edit" onclick="triggerEditProject(${project.id})">
            Edit Project
          </button>
          <button class="card-btn delete" onclick="triggerDeleteProject(${project.id})">
            Remove
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateProjectStatistics(projects) {
  const totalVal = document.getElementById('statsTotalProjects');
  const featuredVal = document.getElementById('statsFeaturedProjects');
  
  if (totalVal) totalVal.textContent = projects.length;
  if (featuredVal) featuredVal.textContent = projects.filter(p => p.featured).length;
}

// Preview uploaded images in drawer
function initImageUploadPreview() {
  const fileInput = document.getElementById('projFile');
  const urlInput = document.getElementById('projUrl');
  const previewContainer = document.getElementById('imageUploadPreview');
  const previewImg = document.getElementById('previewImgElement');
  const placeholder = previewContainer.querySelector('.preview-placeholder');

  fileInput.addEventListener('change', (e) => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImg.src = event.target.result;
        previewImg.classList.remove('hidden');
        placeholder.classList.add('hidden');
        urlInput.value = ''; // clear text input
      };
      reader.readAsDataURL(file);
    }
  });

  urlInput.addEventListener('input', () => {
    if (urlInput.value.trim()) {
      previewImg.src = `/${urlInput.value.trim()}`;
      previewImg.classList.remove('hidden');
      placeholder.classList.add('hidden');
      fileInput.value = ''; // clear file input
    } else {
      previewImg.classList.add('hidden');
      placeholder.classList.remove('hidden');
    }
  });
}

function initProjectCRUD() {
  const drawer = document.getElementById('projectDrawer');
  const openBtn = document.getElementById('openAddProjectDrawerBtn');
  const closeBtn = document.getElementById('closeDrawerBtn');
  const cancelBtn = document.getElementById('cancelDrawerBtn');
  const form = document.getElementById('projectForm');

  function openDrawer(title = 'Add New Portfolio Project') {
    document.getElementById('drawerTitle').textContent = title;
    drawer.classList.add('open');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    form.reset();
    document.getElementById('projectFormId').value = '';
    const previewImg = document.getElementById('previewImgElement');
    const placeholder = document.getElementById('imageUploadPreview').querySelector('.preview-placeholder');
    previewImg.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openDrawer('Add New Portfolio Project');
    });
  }

  [closeBtn, cancelBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', closeDrawer);
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('projectFormId').value;
      const isEdit = !!id;

      const formData = new FormData(form);
      const url = isEdit ? `/api/admin/projects/${id}` : '/api/admin/projects';
      const method = isEdit ? 'PUT' : 'POST';

      try {
        const res = await fetch(url, {
          method: method,
          body: formData
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast(isEdit ? 'Project specifications updated.' : 'New project added to catalog!');
          closeDrawer();
          loadProjectsData();
        } else {
          showToast(data.error || 'Operation failed.', true);
        }
      } catch (err) {
        showToast('Connection to server lost.', true);
      }
    });
  }
}

// Globally-accessible project edit triggers
window.triggerEditProject = function(id) {
  const project = allProjects.find(p => p.id === id);
  if (!project) return;

  const form = document.getElementById('projectForm');
  form.reset();

  document.getElementById('projectFormId').value = project.id;
  document.getElementById('projTitle').value = project.title;
  document.getElementById('projSubtitle').value = project.subtitle || '';
  document.getElementById('projCategory').value = project.category;
  document.getElementById('projLayout').value = project.layout || 'bento-featured';
  document.getElementById('projObjective').value = project.objective || '';
  document.getElementById('projOutcome').value = project.outcome || '';
  document.getElementById('projFeatured').checked = !!project.featured;

  // Render mockup image preview inside drawer
  const previewImg = document.getElementById('previewImgElement');
  const placeholder = document.getElementById('imageUploadPreview').querySelector('.preview-placeholder');
  const isUploaded = project.img.startsWith('imageFile-') || project.img.includes('-');
  
  previewImg.src = isUploaded ? `/uploads/${project.img}` : `/${project.img}`;
  previewImg.classList.remove('hidden');
  placeholder.classList.add('hidden');

  // Open drawer
  const drawer = document.getElementById('projectDrawer');
  document.getElementById('drawerTitle').textContent = 'Modify Project Specifications';
  drawer.classList.add('open');
};

// Globally-accessible project delete triggers
window.triggerDeleteProject = async function(id) {
  const project = allProjects.find(p => p.id === id);
  if (!project) return;

  const confirmDelete = confirm(`Are you sure you want to permanently delete project: "${project.title}"?`);
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Project removed successfully.');
      loadProjectsData();
    } else {
      showToast(data.error || 'Failed to delete project.', true);
    }
  } catch (err) {
    showToast('Connection to server lost.', true);
  }
};

/* ==========================================
   5. CONTACT INBOX WORKFLOW
   ========================================== */
async function loadEnquiriesData() {
  const wrapper = document.getElementById('messagesListWrapper');
  if (!wrapper) return;

  try {
    const res = await fetch('/api/admin/enquiries');
    const data = await res.json();

    renderEnquiriesList(data);
    updateInboxIndicators(data);
  } catch (err) {
    wrapper.innerHTML = `<div class="inbox-empty"><p style="color: var(--error);">Error retrieving inbox enquiries.</p></div>`;
  }
}

function renderEnquiriesList(messages) {
  const wrapper = document.getElementById('messagesListWrapper');
  if (!wrapper) return;

  if (messages.length === 0) {
    wrapper.innerHTML = `<div class="inbox-empty"><p>Inbox is clean. No enquiries received yet.</p></div>`;
    return;
  }

  wrapper.innerHTML = '';
  messages.forEach(msg => {
    const isUnread = !msg.read;
    const card = document.createElement('div');
    card.className = `message-card ${isUnread ? 'unread' : ''}`;
    card.setAttribute('data-id', msg.id);

    // Format visual timestamp
    const dateObj = new Date(msg.timestamp);
    const dateFormatted = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeFormatted = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    card.innerHTML = `
      <div class="message-header" onclick="toggleExpandMessage(this)">
        <div class="message-sender">
          <h4>
            ${msg.name}
            ${isUnread ? '<span class="message-unread-indicator">New</span>' : ''}
          </h4>
          <p>${msg.email}</p>
        </div>
        <div class="message-meta-right">
          <span class="message-time">${dateFormatted} at ${timeFormatted}</span>
          <button class="message-expand-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
      <div class="message-body">
        <div class="message-content">${msg.details}</div>
        <div class="message-actions">
          <button class="btn btn-secondary" onclick="toggleEnquiryRead(${msg.id}, ${msg.read})">
            ${isUnread ? 'Mark as Read' : 'Mark Unread'}
          </button>
          <button class="btn btn-secondary" style="color: var(--error); border-color: transparent;" onclick="deleteEnquiry(${msg.id})">
            Delete Message
          </button>
        </div>
      </div>
    `;
    wrapper.appendChild(card);
  });
}

function updateInboxIndicators(messages) {
  const unreadCount = messages.filter(m => !m.read).length;
  const badge = document.getElementById('inboxBadge');
  const statusTag = document.getElementById('inboxStatusTag');

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  if (statusTag) {
    statusTag.textContent = `${unreadCount} Unread Message${unreadCount !== 1 ? 's' : ''}`;
  }
}

window.toggleExpandMessage = function(headerEl) {
  const card = headerEl.closest('.message-card');
  card.classList.toggle('open');
};

window.toggleEnquiryRead = async function(id, currentReadState) {
  try {
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: !currentReadState })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      loadEnquiriesData();
    } else {
      showToast('Failed to modify message status.', true);
    }
  } catch (err) {
    showToast('Connection to server lost.', true);
  }
};

window.deleteEnquiry = async function(id) {
  const confirmDelete = confirm('Are you sure you want to permanently delete this client enquiry?');
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Enquiry cleared.');
      loadEnquiriesData();
    } else {
      showToast('Failed to delete enquiry.', true);
    }
  } catch (err) {
    showToast('Connection to server lost.', true);
  }
};

/* ==========================================
   6. GENERAL CONFIGURATION WORKFLOW
   ========================================== */
async function loadConfigData() {
  try {
    const res = await fetch('/api/admin/config');
    const config = await res.json();

    const configName = document.getElementById('configName');
    const configTagline = document.getElementById('configTagline');
    const configResume = document.getElementById('configResume');

    if (configName) configName.value = config.designerName || '';
    if (configTagline) configTagline.value = config.tagline || '';
    if (configResume) configResume.value = config.resumeUrl || '';

  } catch (err) {
    console.error('Failed to retrieve configs', err);
  }
}

function initSystemConfig() {
  const form = document.getElementById('configForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const designerName = document.getElementById('configName').value.trim();
    const tagline = document.getElementById('configTagline').value.trim();
    const resumeUrl = document.getElementById('configResume').value.trim();

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designerName, tagline, resumeUrl })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('System configuration changes saved.');
        loadConfigData();
      } else {
        showToast(data.error || 'Failed to update system variables.', true);
      }
    } catch (err) {
      showToast('Connection to server lost.', true);
    }
  });
}
