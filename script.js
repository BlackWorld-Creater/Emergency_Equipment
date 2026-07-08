const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const contactForm = document.querySelector('[data-contact-form]');
const toastContainer = document.querySelector('.toast-container');

const closeMenu = () => {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.remove('open');
  menuToggle.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
};

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const updateHeader = () => {
  if (!navbar) return;
  navbar.classList.toggle('is-scrolled', window.scrollY > 12);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const showToast = (title, message, type = 'info') => {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  const toastTitle = document.createElement('strong');
  const toastMessage = document.createElement('span');
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toast.append(toastTitle, toastMessage);
  toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    window.setTimeout(() => toast.remove(), 180);
  }, 4600);
};

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());
    payload.name = String(payload.name || '').trim();
    payload.mobile = String(payload.mobile || '').trim();
    payload.requirement = String(payload.requirement || '').trim();

    if (!payload.name || !payload.mobile || !payload.requirement) {
      showToast('Missing details', 'Please fill name, mobile number and requirement before submitting.', 'error');
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
    }

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Could not submit the enquiry right now.');
      }

      contactForm.reset();
      showToast('Enquiry submitted', data.message || 'Thank you. Your requirement has been saved successfully.', 'success');
    } catch (error) {
      showToast('Submission failed', error.message || 'Please try again in a moment.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
}

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('visible'));
}
