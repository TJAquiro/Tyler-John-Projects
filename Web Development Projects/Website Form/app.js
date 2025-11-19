// app.js — minimal, modular form handling
const form = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const formMsg = document.getElementById('formMsg');

const validators = {
  fullName: v => v.trim().length >= 2 || "Please enter your name",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email",
  role: v => v !== "" || "Choose an option"
};

function showError(name, message){
  const p = document.getElementById(`err-${name}`);
  p.textContent = message || '';
  const input = document.getElementById(name);
  if(message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

function validateField(name){
  const el = document.getElementById(name);
  const value = el.value;
  const res = validators[name](value);
  if(res === true) { showError(name, ''); return true; }
  showError(name, res);
  return false;
}

function validateAll(){
  let ok = true;
  Object.keys(validators).forEach(k => {
    const v = validateField(k);
    if(!v) ok = false;
  });
  return ok;
}

form.addEventListener('input', (e) => {
  // live-validate on input
  if(validators[e.target.id]) validateField(e.target.id);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formMsg.textContent = '';
  if(!validateAll()) {
    formMsg.textContent = 'Please fix the errors above.';
    return;
  }
  // simulate network submit
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  const payload = {
    fullName: form.fullName.value,
    email: form.email.value,
    role: form.role.value
  };

  // Simulate API
  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Join';
    formMsg.textContent = 'Thanks — your submission was received.';
    form.reset();
  }, 900);
});
