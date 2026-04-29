/* ============================================
   auth.js - Authentication & Session Management
   Uses backend API for login, sessionStorage for session
   ============================================ */

/**
 * Authenticate user via API
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object|null>}
 */
async function authenticateUser(username, password) {
  try {
    return await apiPost('/auth/login', { username, password });
  } catch (err) {
    return null;
  }
}

/**
 * Register new user via API
 * @param {string} username
 * @param {string} password
 * @param {string} full_name
 * @returns {Promise<Object|null>}
 */
async function registerUser(username, password, full_name) {
  try {
    return await apiPost('/auth/register', { username, password, full_name });
  } catch (err) {
    // Return null to signify error (apiPost should have already shown toast)
    return null;
  }
}

/**
 * Store user session in sessionStorage
 */
function setSession(user) {
  sessionStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Get the current logged-in user from session
 */
function getCurrentUser() {
  const data = sessionStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Check if current user is admin
 */
function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

/**
 * Check if current user is customer
 */
function isCustomer() {
  const user = getCurrentUser();
  return user && user.role === 'customer';
}

/**
 * Log out the current user
 */
function logout() {
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('selectedVehicleType');
  window.location.href = 'index.html';
}

/**
 * Require authentication - redirect if not logged in
 */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

/**
 * Get the selected vehicle type from session
 */
function getSelectedVehicleType() {
  return sessionStorage.getItem('selectedVehicleType');
}

/**
 * Set the selected vehicle type in session
 */
function setSelectedVehicleType(type) {
  sessionStorage.setItem('selectedVehicleType', type);
}

/**
 * Handle login form submission (async)
 */
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('loginError');
  const selectedPortal = sessionStorage.getItem('selectedPortal');

  if (!username || !password) {
    errorEl.textContent = 'Please enter both username and password.';
    return;
  }

  const user = await authenticateUser(username, password);

  if (!user) {
    errorEl.textContent = 'Invalid username or password.';
    return;
  }

  // Check if user role matches the selected portal
  if (selectedPortal && user.role !== selectedPortal) {
    const portalLabel = selectedPortal === 'admin' ? 'Admin' : 'Customer';
    errorEl.textContent = `This account does not have ${portalLabel} access. Please choose the correct portal.`;
    return;
  }

  setSession(user);
  showToast(`Welcome, ${user.full_name}!`, 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 500);
}
