/**
 * -------------------------------------------------------------
 * Harmandeep Singh - Premium Editorial Portfolio Interactions
 * -------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initPaletteSandbox();
  initGridModeToggle();
  initProcessTimelineProgress();
  initMobileMenu();
  
  // Asynchronously fetch and render dynamic catalog items
  await loadDynamicProjects();
  
  initPortfolioFilters();
  initCaseStudyModal();
  initScrollReveals();
  initContactForm();
  initSmoothScrollActiveStates();
  initCustomCursorLens();
  loadConfigDetails();
});

/* ==========================================
   1. Theme & Palette Sandbox Controllers
   ========================================== */
function initTheme() {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (!themeBtn) return;

  // Retrieve previous choice or system default
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  
  let currentTheme = 'dark'; // default is dark
  if (savedTheme) {
    currentTheme = savedTheme;
  } else if (systemPrefersLight) {
    currentTheme = 'light';
  }

  // Set initial theme
  document.documentElement.setAttribute('data-theme', currentTheme);

  // Toggle Action
  themeBtn.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

function initPaletteSandbox() {
  const dropdown = document.getElementById('paletteDropdown');
  if (!dropdown) return;

  const selectBtn = dropdown.querySelector('.palette-select-btn');
  const paletteBtns = dropdown.querySelectorAll('.palette-btn');

  // Load saved palette
  const savedPalette = localStorage.getItem('palette') || 'slate';
  document.documentElement.setAttribute('data-palette', savedPalette);
  
  paletteBtns.forEach(btn => {
    if (btn.getAttribute('data-palette') === savedPalette) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Toggle dropdown
  selectBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  // Select palette action
  paletteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const palette = btn.getAttribute('data-palette');
      document.documentElement.setAttribute('data-palette', palette);
      localStorage.setItem('palette', palette);

      paletteBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dropdown.classList.remove('open');
    });
  });

  // Close when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}

/* ==========================================
   1b. Precision Layout Grid Controller
   ========================================== */
function initGridModeToggle() {
  const gridBtn = document.getElementById('gridToggleBtn');
  if (!gridBtn) return;

  // Load saved grid state
  const savedGrid = localStorage.getItem('gridMode');
  if (savedGrid === 'true') {
    document.body.classList.add('grid-mode-active');
  }

  gridBtn.addEventListener('click', () => {
    const isActive = document.body.classList.toggle('grid-mode-active');
    localStorage.setItem('gridMode', isActive ? 'true' : 'false');
  });
}

/* ==========================================
   1c. Scroll-Linked Process Timeline Connector
   ========================================== */
function initProcessTimelineProgress() {
  const path = document.getElementById('processPathFill');
  if (!path) return;

  const pathLength = 1000; // matching viewBox coordinate boundaries
  path.style.strokeDasharray = pathLength;
  path.style.strokeDashoffset = pathLength;

  function updateTimeline() {
    const processSection = document.getElementById('process');
    if (!processSection) return;
    
    const rect = processSection.getBoundingClientRect();
    const sectionHeight = rect.height;
    const sectionTop = rect.top;
    const windowHeight = window.innerHeight;
    
    // Start filling when top enters, finish when bottom leaves
    const startOffset = windowHeight * 0.6;
    const endOffset = windowHeight * 0.2;
    
    let progress = 0;
    if (sectionTop < startOffset) {
      progress = (startOffset - sectionTop) / (sectionHeight - endOffset);
      progress = Math.max(0, Math.min(1, progress));
    }
    
    path.style.strokeDashoffset = pathLength - (progress * pathLength);
  }
  
  window.addEventListener('scroll', updateTimeline);
  window.addEventListener('resize', updateTimeline);
  updateTimeline();
}

/* ==========================================
   2. Mobile Drawer Navigation
   ========================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  const drawerLinks = document.querySelectorAll('.drawer-link-item');

  if (!menuBtn || !drawer) return;

  function toggleMenu() {
    const isOpen = menuBtn.classList.toggle('active');
    drawer.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('modal-active', isOpen);
  }

  menuBtn.addEventListener('click', toggleMenu);

  // Close when links are clicked
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      drawer.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('modal-active');
    });
  });
}

/* ==========================================
   3. Portfolio Filtering Logic
   ========================================== */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle button active states
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterVal = btn.getAttribute('data-filter');
      const gridContainer = document.querySelector('.portfolio-grid');
      
      if (gridContainer) {
        if (filterVal === 'all') {
          gridContainer.classList.remove('portfolio-filtered');
        } else {
          gridContainer.classList.add('portfolio-filtered');
        }
      }

      // Grid items sort animation
      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        // Hide/Show with subtle fade entry transitions
        if (filterVal === 'all' || itemCategory === filterVal) {
          item.classList.remove('hidden');
          // Trigger entry fade manually
          item.style.opacity = '0';
          item.style.transform = 'scale(0.96) translateY(15px)';
          setTimeout(() => {
            item.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            item.style.opacity = '1';
            item.style.transform = 'scale(1) translateY(0)';
          }, 50);
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================
   4. Immersive Fullscreen Case Study Modal
   ========================================== */
function initCaseStudyModal() {
  const modal = document.getElementById('workModal');
  const modalClose = document.getElementById('modalCloseBtn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  // Modal elements to populate
  const modalImg = document.getElementById('modalImg');
  const modalCategory = document.getElementById('modalCategory');
  const modalProjTitle = document.getElementById('modalProjTitle');
  const modalObjective = document.getElementById('modalObjective');
  const modalOutcome = document.getElementById('modalOutcome');

  if (!modal || portfolioItems.length === 0) return;

  // Open modal
  portfolioItems.forEach(item => {
    const triggerElements = [
      item.querySelector('.portfolio-img-container'),
      item.querySelector('h3')
    ];

    triggerElements.forEach(trigger => {
      if (!trigger) return;
      trigger.addEventListener('click', (e) => {
        e.preventDefault();

        // Retrieve properties
        const imgSrc = item.querySelector('img').getAttribute('src');
        const projTitle = item.querySelector('h3').textContent;
        const category = item.querySelector('.portfolio-item-tag').textContent;
        const objective = item.getAttribute('data-objective');
        const outcome = item.getAttribute('data-outcome');

        // Populate elements
        modalImg.setAttribute('src', imgSrc);
        modalImg.setAttribute('alt', projTitle);
        modalCategory.textContent = category;
        modalProjTitle.textContent = projTitle;
        modalObjective.textContent = objective;
        modalOutcome.textContent = outcome;

        // Open modal
        modal.classList.add('open');
        document.body.classList.add('modal-active');
      });
    });
  });

  // Close modal functions
  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-active');
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close when clicking overlay backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Esc key closure
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================
   5. Scroll Animation Reveals (IntersectionObserver)
   ========================================== */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length === 0) return;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        // Once revealed, we don't need to track it anymore
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px' // triggers slightly before entering viewport fully
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
}

/* ==========================================
   6. Contact Form Validation & Success Toast
   ========================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('successToast');

  if (!form || !toast) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('formName');
    const emailInput = document.getElementById('formEmail');
    const detailsInput = document.getElementById('formDetails');

    let isValid = true;

    // Direct editorial input checking & border alerts
    [nameInput, emailInput, detailsInput].forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderBottomColor = '#ff3b30'; // soft red alert
        setTimeout(() => {
          input.style.borderBottomColor = '';
        }, 3000);
      }
    });

    if (isValid) {
      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        details: detailsInput.value.trim()
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          // Success! Clear inputs and show beautiful toast
          form.reset();
          toast.querySelector('.toast-message').textContent = 'Message sent successfully! Speak soon.';
          toast.classList.remove('error');
        } else {
          // Fallback to simulation if server API failed
          console.warn('API submission failed, falling back to local simulation...');
        }
      } catch (err) {
        console.warn('Backend offline, running contact submission locally...', err);
      }

      // Show toast visual feedback
      toast.classList.add('show');
      
      // Clear toast
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }
  });
}

/* ==========================================
   7. Smooth Active Scroll Link Highlights
   ========================================== */
function initSmoothScrollActiveStates() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (sections.length === 0 || navLinks.length === 0) return;

  window.addEventListener('scroll', () => {
    let currentActiveId = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentActiveId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentActiveId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   8. Magnetic Decal Cursor Lens Controller
   ========================================================================== */
function initCustomCursorLens() {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  // We only run custom cursor calculations on desktops supporting fine pointer hover
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasHover) return;

  // Safely trigger native cursor hiding ONLY when custom cursor fully initializes
  document.body.classList.add('custom-cursor-active');

  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  const label = cursor.querySelector('.cursor-decal-label');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // Coordinate interpolations (Lerp values) for a lag-behind physics float effect
  let dotX = mouseX;
  let dotY = mouseY;
  let ringX = mouseX;
  let ringY = mouseY;

  // Lerp follow parameters
  const dotLerp = 0.35; // fast follow dot
  const ringLerp = 0.12; // lazy drag float outer ring

  let targetX = mouseX;
  let targetY = mouseY;
  let isMagnetic = false;
  let magneticEl = null;

  // Keep track of active coordinate streams
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Dynamic animation frame loop (uses GPU-accelerated translate3d)
  function renderCursor() {
    if (isMagnetic && magneticEl) {
      // Snapping lock-on to center of hovered interactive component
      const rect = magneticEl.getBoundingClientRect();
      targetX = rect.left + rect.width / 2;
      targetY = rect.top + rect.height / 2;

      // Slight elastic spring resistance from pointer position
      dotX += (mouseX - dotX) * 0.3;
      dotY += (mouseY - dotY) * 0.3;
    } else {
      targetX = mouseX;
      targetY = mouseY;

      dotX += (targetX - dotX) * dotLerp;
      dotY += (targetY - dotY) * dotLerp;
    }

    ringX += (targetX - ringX) * ringLerp;
    ringY += (targetY - ringY) * ringLerp;

    // Apply hardware-accelerated translations with centering offsets
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    label.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // --- Dynamic Interactivity Spec Bindings ---

  // Snapping Categories
  const magneticSelectors = [
    'a', 
    'button', 
    '.filter-btn', 
    '.mobile-menu-btn', 
    '.palette-select-btn',
    '.grid-toggle-btn',
    '.theme-toggle-btn'
  ];

  function bindMagneticAttractions() {
    document.querySelectorAll(magneticSelectors.join(',')).forEach(el => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = 'true';

      el.addEventListener('mouseenter', () => {
        cursor.classList.add('magnetic-hover');
        isMagnetic = true;
        magneticEl = el;
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('magnetic-hover');
        isMagnetic = false;
        magneticEl = null;
      });
    });
  }

  // Visual Decal specs
  function bindDecalHoverMetrics() {
    // Bento Portfolio Cards
    document.querySelectorAll('.portfolio-item').forEach(el => {
      if (el.dataset.cursorDecalBound) return;
      el.dataset.cursorDecalBound = 'true';

      const category = el.getAttribute('data-category') || 'project';

      el.addEventListener('mouseenter', () => {
        cursor.classList.add('decal-hover');
        label.textContent = `view // ${category}`;
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('decal-hover');
      });
    });

    // Services cards
    document.querySelectorAll('.services-card').forEach(el => {
      if (el.dataset.cursorDecalBound) return;
      el.dataset.cursorDecalBound = 'true';

      const num = el.querySelector('.service-num')?.textContent || '00';

      el.addEventListener('mouseenter', () => {
        cursor.classList.add('decal-hover');
        label.textContent = `spec // cap.${num}`;
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('decal-hover');
      });
    });
  }

  // Initialize bindings
  bindMagneticAttractions();
  bindDecalHoverMetrics();

  // Re-bind when filters toggle to capture dynamic DOM elements
  const filterGrid = document.querySelector('.portfolio-filters');
  if (filterGrid) {
    filterGrid.addEventListener('click', () => {
      setTimeout(() => {
        bindMagneticAttractions();
        bindDecalHoverMetrics();
      }, 150);
    });
  }

  // Prevent cursor freeze on browser edge leave
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // Pressed clicked state transitions
  window.addEventListener('mousedown', () => {
    cursor.classList.add('clicked');
  });

  window.addEventListener('mouseup', () => {
    cursor.classList.remove('clicked');
  });
}

/* ==========================================================================
   9. DYNAMIC BACKEND PROJECT SYNC & FALLBACK CORE LOGIC
   ========================================================================== */

function getCategoryName(category) {
  const categories = {
    'branding': 'Branding',
    'social-media': 'Social Media',
    'print': 'Print Design',
    'advertising': 'Advertising',
    'web': 'Web Design'
  };
  return categories[category] || category;
}

async function loadDynamicProjects() {
  const gridContainer = document.querySelector('.portfolio-grid');
  if (!gridContainer) return;

  // Determine if we are rendering on the home page or catalog archive page
  const isCatalogPage = window.location.pathname.includes('projects.html');

  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('API offline');
    
    const projects = await res.json();
    if (!projects || projects.length === 0) return; // let fallback hardcoded ones stay

    // Clear loading skeletons / static placeholders
    gridContainer.innerHTML = '';

    projects.forEach(project => {
      // If we are on the homepage, only render projects flagged as featured
      if (!isCatalogPage && !project.featured) return;

      const isUploaded = project.img.startsWith('imageFile-') || project.img.includes('-');
      const imgPath = isUploaded ? `/uploads/${project.img}` : `/${project.img}`;

      const card = document.createElement('div');
      card.className = `portfolio-item ${project.layout || 'bento-featured'} reveal`;
      card.setAttribute('data-category', project.category);
      card.setAttribute('data-objective', project.objective || '');
      card.setAttribute('data-outcome', project.outcome || '');

      card.innerHTML = `
        <div class="portfolio-img-container">
          <img src="${imgPath}" alt="${project.title} Mockup">
        </div>
        <div class="portfolio-item-meta">
          <span class="portfolio-item-tag">${getCategoryName(project.category)}</span>
        </div>
        <h3>${project.title}</h3>
        <p>${project.subtitle || ''}</p>
      `;
      gridContainer.appendChild(card);
    });

  } catch (err) {
    console.warn('Backend API is offline, using pre-compiled high-fidelity static markup fallbacks.', err);
  }
}

async function loadConfigDetails() {
  try {
    const res = await fetch('/api/admin/config');
    if (!res.ok) return;

    const config = await res.json();
    
    // Update global resume download triggers if custom file is specified
    if (config.resumeUrl) {
      const resumeFabs = document.querySelectorAll('.floating-resume-fab');
      resumeFabs.forEach(fab => {
        fab.setAttribute('href', config.resumeUrl);
      });
    }

    // Update system designer name taglines dynamically
    if (config.designerName) {
      const logoElement = document.getElementById('navLogo');
      if (logoElement) {
        logoElement.innerHTML = `${config.designerName.split(' ')[0]}<span>.</span>`;
      }
    }
  } catch (err) {
    console.warn('Config fetch skipped or offline.', err);
  }
}

