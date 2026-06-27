/* =========================================
   HABIBULLO-HILOLA — Main JavaScript
   ========================================= */

// ---- Smooth Scrolling (Lenis) ----
const lenisScript = document.createElement('script');
lenisScript.src = "https://unpkg.com/lenis@1.1.9/dist/lenis.min.js";
document.head.appendChild(lenisScript);

lenisScript.onload = () => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
};

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll effect ----
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ---- Active nav link on scroll ----
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const observerOptions = { rootMargin: '-40% 0px -55% 0px' };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);
  sections.forEach(sec => sectionObserver.observe(sec));

  // ---- Hamburger menu ----
  const hamburger = document.getElementById('hamburger');
  const navLinksMenu = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    navLinksMenu.classList.toggle('open');
    const isOpen = navLinksMenu.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    // Animate hamburger to X
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu on link click
  navLinksMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinksMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    });
  });

  // ---- Scroll reveal animation ----
  const animElements = document.querySelectorAll(
    '.hero-text, .hero-image, .sanctuary-text, .sanctuary-visual, ' +
    '.feature-card, .service-item, .testimonial-card, ' +
    '.booking-text, .booking-form, .section-header'
  );
  animElements.forEach(el => el.setAttribute('data-animate', ''));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 0);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Stagger children within grids
  document.querySelectorAll('.features-grid, .services-grid, .testimonials-track').forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.setAttribute('data-animate', '');
      child.style.transitionDelay = `${i * 0.12}s`;
    });
  });

  animElements.forEach(el => revealObserver.observe(el));
  document.querySelectorAll('[data-animate]').forEach(el => revealObserver.observe(el));

  // ---- Testimonial navigation (basic scroll) ----
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  if (track && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.testimonial-card');
    let currentIdx = 0;

    function updateCarousel() {
      if (window.innerWidth <= 768) {
        cards.forEach((card, i) => {
          card.style.display = i === currentIdx ? 'block' : 'none';
        });
      } else {
        cards.forEach(card => card.style.display = '');
      }
    }

    nextBtn.addEventListener('click', () => {
      currentIdx = (currentIdx + 1) % cards.length;
      updateCarousel();
    });
    prevBtn.addEventListener('click', () => {
      currentIdx = (currentIdx - 1 + cards.length) % cards.length;
      updateCarousel();
    });
    window.addEventListener('resize', updateCarousel);
    updateCarousel();
  }

  // ---- Form submission ----
  const form = document.getElementById('booking-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('submit-booking');
      const originalText = btn.innerHTML;

      // Validate
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      if (!name || !phone) {
        showToast('Iltimos, ism va telefon raqamingizni kiriting!', 'error');
        return;
      }

      // Simulate sending
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Yuborilmoqda...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '✓ Muvaffaqiyatli Yuborildi!';
        btn.style.background = '#22c55e';
        showToast("Tez orada siz bilan bog'lanamiz!", 'success');
        form.reset();
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1800);
    });
  }

  // ---- Toast notification ----
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      background: ${type === 'success' ? '#22c55e' : '#ef4444'};
      color: white; padding: 14px 22px; border-radius: 12px;
      font-size: 0.875rem; font-weight: 600; font-family: Inter, sans-serif;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      transform: translateY(20px); opacity: 0;
      transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ---- Spinning animation for loader ----
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);

  // ---- Universal Phone number formatting (+998 xx xxx xx xx) ----
  function applyPhoneFormatter(input) {
    if (!input) return;
    const prefix = '+998 ';

    const formatValue = (val) => {
      // Strip everything except digits
      let digits = val.replace(/\D/g, '');
      // Remove the 998 if it's already there at the start
      if (digits.startsWith('998')) {
        digits = digits.slice(3);
      }
      // Limit to 9 digits (Uzbekistan mobile format)
      digits = digits.slice(0, 9);

      let formatted = prefix;
      if (digits.length > 0) {
        formatted += digits.slice(0, 2);
        if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
        if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
        if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
      }
      return formatted;
    };

    input.addEventListener('keydown', (e) => {
      // Prevent deleting the prefix
      if (e.key === 'Backspace' && input.selectionStart <= prefix.length && input.selectionEnd <= prefix.length) {
        e.preventDefault();
      }
      if (e.key === 'Delete' && input.selectionStart < prefix.length) {
        e.preventDefault();
      }
      
      // Allow control keys
      if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter'].includes(e.key)) {
        return;
      }
      
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, etc.
      if (e.ctrlKey || e.metaKey) return;

      // Block if already reached max length (prefix + 9 digits + 3 spaces = 17)
      if (input.value.length >= 17 && input.selectionStart === input.selectionEnd) {
        e.preventDefault();
        return;
      }

      // Block non-numeric
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener('input', (e) => {
      let cursor = input.selectionStart;
      const oldLen = input.value.length;
      const formatted = formatValue(input.value);
      
      input.value = formatted;
      
      // Fix cursor position after formatting
      if (formatted.length > oldLen && (formatted[cursor - 1] === ' ')) {
        cursor++;
      }
      // Don't let cursor go into the prefix
      if (cursor < prefix.length) cursor = prefix.length;
      
      input.setSelectionRange(cursor, cursor);
    });

    input.addEventListener('focus', () => {
      if (input.value.length < prefix.length) {
        input.value = prefix;
      }
      // Move cursor to end on focus if it's just the prefix
      if (input.value === prefix) {
        setTimeout(() => input.setSelectionRange(prefix.length, prefix.length), 1);
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text');
      input.value = formatValue(pasteData);
    });
    
    // Prevent dragging text into the field
    input.addEventListener('drop', (e) => e.preventDefault());
  }

  document.querySelectorAll('input[type="tel"]').forEach(applyPhoneFormatter);

  // ---- User Profile & Dynamic Nav in Navbar ----
  const navContainer = document.querySelector('.nav-container');
  const navLinksList = document.getElementById('nav-links');
  
  if (navContainer) {
    // Prevent duplicates
    const existingWidget = navContainer.querySelector('.nav-profile-widget');
    if (existingWidget) existingWidget.remove();

    const adminToken = localStorage.getItem('admin_token');
    const receptionToken = localStorage.getItem('reception_token');
    const patientId = localStorage.getItem('patientId');
    const fFirst = localStorage.getItem('fFirst');
    const fLast = localStorage.getItem('fLast');
    
    // 2. Profile Widget
    const profileWrap = document.createElement('div');
    profileWrap.className = 'nav-profile-widget';
    profileWrap.style.cssText = 'display:flex;align-items:center;gap:12px;margin-left:auto;margin-right:15px;font-size:0.85rem;font-weight:600;color:var(--navy);';
    
    const insertBeforeEl = navContainer.querySelector('.btn-primary') || document.getElementById('hamburger');
    
    if (adminToken || receptionToken || patientId) {
      // Logged in
      let nameText = (fFirst || fLast) ? `${fFirst || ''} ${fLast || ''}`.trim() : 'Mijoz';
      let badges = '';
      
      if (adminToken) {
        badges += `<a href="admin.html" style="background:#fee2e2;color:#b91c1c;padding:4px 10px;border-radius:12px;font-size:0.75rem;text-decoration:none;">🛡 Admin</a>`;
      }
      if (receptionToken && !adminToken) {
        badges += `<a href="reception.html" style="background:#e0f2fe;color:#0369a1;padding:4px 10px;border-radius:12px;font-size:0.75rem;text-decoration:none;">📋 Resepshn</a>`;
      }

      profileWrap.innerHTML = `
        ${badges}
        <a href="profile.html" style="background:var(--teal-light);padding:6px 12px;border-radius:20px;color:var(--teal-dark);display:flex;align-items:center;gap:6px;text-decoration:none;transition:opacity 0.2s" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          ${nameText}
        </a>
      `;
    } else {
      // Not logged in
      profileWrap.innerHTML = `
        <a href="login.html" style="color:var(--teal-dark);text-decoration:none;display:flex;align-items:center;gap:4px;white-space:nowrap;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Kirish
        </a>
      `;
    }
    
    if (insertBeforeEl) {
      navContainer.insertBefore(profileWrap, insertBeforeEl);
    } else {
      navContainer.appendChild(profileWrap);
    }
  }

});

window.toggleServiceCard = function(btn) {
  const content = btn.closest('.sd-content');
  const isExpanded = content.classList.contains('expanded');
  
  if (isExpanded) {
    content.classList.remove('expanded');
    btn.innerHTML = `Batafsil <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>`;
  } else {
    content.classList.add('expanded');
    btn.innerHTML = `Yopish <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>`;
  }
};
