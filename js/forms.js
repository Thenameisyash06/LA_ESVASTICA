/**
 * LA ESVASTICA PRIVATE LIMITED - FORMS & INQUIRY CONTROLLER
 * Validation, dynamic institutional fields, spam honeypot, and direct company email dispatch
 */

const COMPANY_EMAIL = 'la.esvastica1@gmail.com';
const SECONDARY_EMAIL = 'jeelsoni2462002@gmail.com';

document.addEventListener('DOMContentLoaded', () => {
  initEnquiryForms();
  initCategorySwitchers();
});

function initCategorySwitchers() {
  document.querySelectorAll('select[name="service_category"]').forEach(select => {
    select.addEventListener('change', (e) => {
      const form = e.target.closest('form');
      if (!form) return;
      const branchField = form.querySelector('.institutional-only-field');
      if (branchField) {
        if (e.target.value === 'gold-testing' || e.target.value === 'equipment-amc' || e.target.value === 'banking-partnership') {
          branchField.style.display = 'block';
        } else {
          branchField.style.display = 'none';
        }
      }
    });
  });
}

function initEnquiryForms() {
  document.querySelectorAll('.js-enquiry-form').forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  // 1. Honeypot Anti-Spam Check
  const honeypot = form.querySelector('input[name="_website_honey"]');
  if (honeypot && honeypot.value.trim() !== '') {
    console.warn('Spam submission detected and blocked.');
    return;
  }

  // 2. Extract Values
  const name = form.querySelector('[name="full_name"]')?.value.trim() || '';
  const company = form.querySelector('[name="company_name"]')?.value.trim() || 'Individual / Private';
  const email = form.querySelector('[name="email_address"]')?.value.trim() || '';
  const phone = form.querySelector('[name="phone_number"]')?.value.trim() || '';
  const category = form.querySelector('[name="service_category"]')?.value || 'general';
  const branches = form.querySelector('[name="branch_count"]')?.value.trim() || '';
  const message = form.querySelector('[name="message"]')?.value.trim() || '';

  // 3. Validation
  if (name.length < 2) {
    alert('Please enter your full name.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // Indian Phone validation (10 digits)
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    alert('Please enter a valid 10-digit mobile number.');
    return;
  }

  if (message.length < 10) {
    alert('Please describe your requirement in at least 10 characters.');
    return;
  }

  // 4. Construct Formatted Email Subject & Body
  const categoryLabels = {
    'gold-testing': 'Institutional Gold Testing (Banks / NBFCs)',
    'equipment-amc': 'Equipment Supply & 5-Year AMC',
    'banking-partnership': 'Institutional Banking Partnership',
    'digital': 'Digital Marketing & Business Analytics',
    'watches': 'Watch Sales & Precision Repair',
    'general': 'General Corporate Enquiry'
  };

  const formattedCategory = categoryLabels[category] || category;

  const emailSubject = `Official Corporate Enquiry: ${formattedCategory} - ${name} (${company})`;

  const emailBody = 
`To: La Esvastica Private Limited Management Team,

NEW CORPORATE ENQUIRY SUBMISSION
------------------------------------------------------------
Full Name:         ${name}
Organisation/Bank: ${company}
Service Category:  ${formattedCategory}
Sender Email:      ${email}
Contact Phone:     +91 ${cleanPhone}
${branches ? `Branches / Scope:  ${branches}\n` : ''}
Enquiry / Requirement Details:
${message}

------------------------------------------------------------
Sent from: La Esvastica Corporate Portal (https://laesvastica.com)
Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;

  // 5. Construct mailto link
  const mailtoUrl = `mailto:${COMPANY_EMAIL}?cc=${encodeURIComponent(SECONDARY_EMAIL)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Show confirmation toast
  if (typeof window.showToast === 'function') {
    window.showToast('Preparing your official email inquiry to la.esvastica1@gmail.com...', 'success');
  }

  // Trigger default email client directly
  window.location.href = mailtoUrl;

  // Close modal if form is inside modal
  const parentModal = form.closest('dialog');
  if (parentModal && typeof parentModal.close === 'function') {
    parentModal.close();
  }

  // Reset form
  form.reset();
}
