/**
 * LA ESVASTICA PRIVATE LIMITED - MODAL DIALOG CONTROLLER
 * Uses native HTML5 <dialog> API with accessible keyboard handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initModals();
});

function initModals() {
  const openTriggers = document.querySelectorAll('[data-open-modal]');

  openTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetKey = trigger.getAttribute('data-open-modal');
      let targetModal = null;
      if (targetKey === 'partnership-modal') {
        targetModal = document.getElementById('partnershipModal');
      } else if (targetKey === 'privacy-terms-modal') {
        targetModal = document.getElementById('privacyTermsModal');
      } else {
        targetModal = document.getElementById(targetKey);
      }

      if (!targetModal) return;

      if (typeof targetModal.showModal === 'function') {
        targetModal.showModal();
      } else {
        targetModal.setAttribute('open', '');
      }
      document.body.style.overflow = 'hidden';
      const focusable = targetModal.querySelector('input, select, textarea, button.modal-close, button');
      if (focusable) focusable.focus();
    });
  });

  // Attach close listeners to all dialogs
  const allModals = document.querySelectorAll('dialog.modal-dialog, dialog');
  allModals.forEach(modal => {
    const closeTriggers = modal.querySelectorAll('.modal-close, [data-close-modal]');
    closeTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(modal);
      });
    });

    // Native backdrop click light dismiss
    modal.addEventListener('click', (e) => {
      const dialogDimensions = modal.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        closeModal(modal);
      }
    });

    // Handle cancel event (Esc key)
    modal.addEventListener('cancel', () => {
      document.body.style.overflow = '';
    });
  });
}

function closeModal(modal) {
  if (!modal) return;
  if (typeof modal.close === 'function') {
    modal.close();
  } else {
    modal.removeAttribute('open');
  }
  document.body.style.overflow = '';
}
