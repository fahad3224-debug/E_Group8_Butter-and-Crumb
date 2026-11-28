/* ==========================================================================
   Crumbery Home Bakery — Account Page Logic (Member 5)
   Handles Login, Signup, Logout, email/field validation, password visibility,
   and browser-only localStorage demo session management.
   ========================================================================== */

function isValidEmailFormat(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

function showAccountFeedback(message, type) {
  const box = document.getElementById('account-feedback');
  if (!box) {
    return;
  }
  box.textContent = message;
  box.className = 'status-message status-message--' + type;
  box.hidden = false;
}

function clearAccountFeedback() {
  const box = document.getElementById('account-feedback');
  if (box) {
    box.hidden = true;
    box.textContent = '';
  }
}

function switchAuthTab(targetTab) {
  const loginTabBtn = document.getElementById('tab-login-btn');
  const signupTabBtn = document.getElementById('tab-signup-btn');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  clearAccountFeedback();

  if (targetTab === 'signup') {
    loginTabBtn.classList.remove('is-active');
    loginTabBtn.setAttribute('aria-selected', 'false');
    signupTabBtn.classList.add('is-active');
    signupTabBtn.setAttribute('aria-selected', 'true');
    loginForm.hidden = true;
    signupForm.hidden = false;
  } else {
    signupTabBtn.classList.remove('is-active');
    signupTabBtn.setAttribute('aria-selected', 'false');
    loginTabBtn.classList.add('is-active');
    loginTabBtn.setAttribute('aria-selected', 'true');
    signupForm.hidden = true;
    loginForm.hidden = false;
  }
}

function setupPasswordToggles() {
  const buttons = document.querySelectorAll('.toggle-password-btn');
  for (let i = 0; i < buttons.length; i += 1) {
    buttons[i].addEventListener('click', function () {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) {
        return;
      }

      if (input.type === 'password') {
        input.type = 'text';
        this.textContent = 'Hide';
        this.setAttribute('aria-pressed', 'true');
      } else {
        input.type = 'password';
        this.textContent = 'Show';
        this.setAttribute('aria-pressed', 'false');
      }
    });
  }
}

function handleSignupSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('signup-name');
  const emailInput = document.getElementById('signup-email');
  const passwordInput = document.getElementById('signup-password');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (name.length < 2) {
    showAccountFeedback('Please enter your full name (at least 2 characters).', 'error');
    nameInput.focus();
    return;
  }

  if (!isValidEmailFormat(email)) {
    showAccountFeedback('Please enter a valid email address (for example, name@example.com).', 'error');
    emailInput.focus();
    return;
  }

  if (password.length < 6) {
    showAccountFeedback('Please choose a demo password with at least 6 characters.', 'error');
    passwordInput.focus();
    return;
  }

  const users = getRegisteredUsers();
  for (let i = 0; i < users.length; i += 1) {
    if (users[i].email.toLowerCase() === email) {
      showAccountFeedback('An account with this email already exists. Please log in instead.', 'error');
      return;
    }
  }

  const newUser = {
    name: name,
    email: email,
    password: password
  };

  users.push(newUser);
  saveRegisteredUsers(users);
  setCurrentUser({ name: newUser.name, email: newUser.email });

  document.getElementById('signup-form').reset();
  renderAccountView();
  showAccountFeedback('Welcome to Crumbery, ' + newUser.name + '! Your demo account is signed in.', 'success');
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!isValidEmailFormat(email)) {
    showAccountFeedback('Please enter a valid email address to log in.', 'error');
    emailInput.focus();
    return;
  }

  if (!password) {
    showAccountFeedback('Please enter your password.', 'error');
    passwordInput.focus();
    return;
  }

  const users = getRegisteredUsers();
  let matchedUser = null;

  for (let i = 0; i < users.length; i += 1) {
    if (users[i].email.toLowerCase() === email && users[i].password === password) {
      matchedUser = users[i];
      break;
    }
  }

  if (!matchedUser) {
    showAccountFeedback('Invalid email or password. Try the demo account or create a new account.', 'error');
    return;
  }

  setCurrentUser({ name: matchedUser.name, email: matchedUser.email });
  document.getElementById('login-form').reset();
  renderAccountView();
  showAccountFeedback('Logged in successfully as ' + matchedUser.name + '.', 'success');
}

function handleLogout() {
  logoutCurrentUser();
  renderAccountView();
  showAccountFeedback('You have been logged out safely.', 'success');
}

function renderAccountView() {
  const authPanel = document.getElementById('auth-forms-panel');
  const loggedInPanel = document.getElementById('logged-in-panel');
  const profileNameEl = document.getElementById('profile-name');
  const profileEmailEl = document.getElementById('profile-email');

  if (!authPanel || !loggedInPanel) {
    return;
  }

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.name) {
    authPanel.hidden = true;
    loggedInPanel.hidden = false;
    profileNameEl.textContent = currentUser.name;
    profileEmailEl.textContent = currentUser.email;
  } else {
    loggedInPanel.hidden = true;
    authPanel.hidden = false;
  }
}

function initAccountPage() {
  renderAccountView();
  setupPasswordToggles();

  const loginTabBtn = document.getElementById('tab-login-btn');
  const signupTabBtn = document.getElementById('tab-signup-btn');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const logoutBtn = document.getElementById('account-logout-btn');

  if (loginTabBtn) {
    loginTabBtn.addEventListener('click', function () {
      switchAuthTab('login');
    });
  }

  if (signupTabBtn) {
    signupTabBtn.addEventListener('click', function () {
      switchAuthTab('signup');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignupSubmit);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('account-page-root')) {
    initAccountPage();
  }
});
