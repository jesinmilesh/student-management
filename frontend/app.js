/**
 * StudentHub - Frontend Application Logic
 * Easy-to-explain Vanilla JavaScript communicating with Express REST API.
 */

// Detect API base URL: works on Vercel, localhost, or file://
const API_BASE = window.location.protocol.startsWith('http')
  ? '/api'
  : 'http://localhost:5000/api';

// Application State
let currentUser = null;
let currentToken = localStorage.getItem('studenthub_token') || null;
let allStudents = [];
let authMode = 'login'; // 'login' or 'register'

// ============================================================================
// Initialization on Page Load
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  restoreUserSession();
  fetchStudents();
});

// Restore saved session from localStorage
function restoreUserSession() {
  const savedUser = localStorage.getItem('studenthub_user');
  if (savedUser && currentToken) {
    try {
      currentUser = JSON.parse(savedUser);
    } catch (e) {
      currentUser = null;
    }
  }
  updateAuthUI();
}

// Update Header & Badge based on login state
function updateAuthUI() {
  const userInfo = document.getElementById('userInfo');
  const userStatusText = document.getElementById('userStatusText');
  const authBtn = document.getElementById('authBtn');
  const statUserRole = document.getElementById('statUserRole');

  if (currentUser && currentToken) {
    userInfo.className = `user-badge ${currentUser.role}`;
    userStatusText.innerHTML = `<strong>${currentUser.name}</strong> (${currentUser.role.toUpperCase()})`;
    statUserRole.textContent = currentUser.role.toUpperCase();

    authBtn.textContent = 'Logout';
    authBtn.className = 'btn btn-secondary';
    authBtn.onclick = handleLogout;
  } else {
    userInfo.className = 'user-badge guest';
    userStatusText.textContent = 'Browsing as Guest';
    statUserRole.textContent = 'Guest (View Only)';

    authBtn.textContent = 'Sign In';
    authBtn.className = 'btn btn-primary';
    authBtn.onclick = openAuthModal;
  }
}

// ============================================================================
// API Calls: Students CRUD
// ============================================================================

// Fetch Students from Backend
async function fetchStudents() {
  const search = document.getElementById('searchInput').value.trim();
  const department = document.getElementById('deptFilter').value;

  const tableBody = document.getElementById('studentsTableBody');
  const emptyState = document.getElementById('emptyState');

  tableBody.innerHTML = '<tr><td colspan="7" class="loading-cell">Loading student records...</td></tr>';
  emptyState.classList.add('hidden');

  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department && department !== 'All') params.append('department', department);

    const response = await fetch(`${API_BASE}/students?${params.toString()}`);
    const result = await response.json();

    if (result.success) {
      allStudents = result.data;
      renderStudents(allStudents);
      updateStats(allStudents);
    } else {
      showToast(result.message || 'Failed to fetch students', 'error');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Cannot connect to backend server. Make sure backend is running on port 5000.', 'error');
    tableBody.innerHTML = '<tr><td colspan="7" class="loading-cell" style="color: #ef4444;">Failed to connect to backend API server.</td></tr>';
  }
}

// Render student table rows
function renderStudents(students) {
  const tableBody = document.getElementById('studentsTableBody');
  const emptyState = document.getElementById('emptyState');

  tableBody.innerHTML = '';

  if (!students || students.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  students.forEach((student) => {
    const row = document.createElement('tr');

    // Color badge class for department
    const deptClass = getDeptBadgeClass(student.department);

    row.innerHTML = `
      <td><span class="id-badge">${escapeHtml(student.studentId)}</span></td>
      <td class="student-name-cell">${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.phone)}</td>
      <td><span class="dept-badge ${deptClass}">${escapeHtml(student.department)}</span></td>
      <td>Year ${student.year}</td>
      <td class="actions-cell">
        <button class="btn btn-secondary btn-sm" onclick="openEditModal('${student._id}')" title="Edit student">
          ✏️ Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteStudent('${student._id}', '${escapeHtml(student.name)}')" title="Delete student">
          🗑️ Delete
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Update Top Metric Cards
function updateStats(students) {
  document.getElementById('statTotalStudents').textContent = students.length;

  const uniqueDepts = new Set(students.map((s) => s.department));
  document.getElementById('statTotalDepartments').textContent = uniqueDepts.size;
}

// ============================================================================
// Student Modal & Form Actions (Create & Edit)
// ============================================================================

function openAddModal() {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('Admin privilege required. Please log in as Admin to add students.', 'info');
    openAuthModal();
    return;
  }

  document.getElementById('modalTitle').textContent = 'Add New Student';
  document.getElementById('studentForm').reset();
  document.getElementById('editStudentMongoId').value = '';
  document.getElementById('formStudentId').removeAttribute('disabled');
  document.getElementById('studentModal').classList.remove('hidden');
}

function openEditModal(mongoId) {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('Admin privilege required. Please log in as Admin to edit students.', 'info');
    openAuthModal();
    return;
  }

  const student = allStudents.find((s) => s._id === mongoId);
  if (!student) return;

  document.getElementById('modalTitle').textContent = `Edit Student (${student.studentId})`;
  document.getElementById('editStudentMongoId').value = student._id;
  document.getElementById('formStudentId').value = student.studentId;
  document.getElementById('formName').value = student.name;
  document.getElementById('formEmail').value = student.email;
  document.getElementById('formPhone').value = student.phone;
  document.getElementById('formDept').value = student.department;
  document.getElementById('formYear').value = student.year;

  document.getElementById('studentModal').classList.remove('hidden');
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.add('hidden');
}

// Save or Update Student
async function handleSaveStudent(event) {
  event.preventDefault();

  const editId = document.getElementById('editStudentMongoId').value;
  const isEditing = !!editId;

  const payload = {
    studentId: document.getElementById('formStudentId').value.trim(),
    name: document.getElementById('formName').value.trim(),
    email: document.getElementById('formEmail').value.trim(),
    phone: document.getElementById('formPhone').value.trim(),
    department: document.getElementById('formDept').value,
    year: Number(document.getElementById('formYear').value)
  };

  const url = isEditing ? `${API_BASE}/students/${editId}` : `${API_BASE}/students`;
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      showToast(isEditing ? 'Student updated successfully!' : 'Student created successfully!', 'success');
      closeStudentModal();
      fetchStudents();
    } else {
      showToast(result.message || 'Operation failed', 'error');
    }
  } catch (error) {
    showToast('Network error while saving student.', 'error');
  }
}

// Delete Student
async function handleDeleteStudent(mongoId, name) {
  if (!currentUser || currentUser.role !== 'admin') {
    showToast('Admin privilege required. Please log in as Admin to delete students.', 'info');
    openAuthModal();
    return;
  }

  const confirmDelete = confirm(`Are you sure you want to delete student "${name}"?`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE}/students/${mongoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    const result = await response.json();

    if (result.success) {
      showToast('Student deleted successfully!', 'success');
      fetchStudents();
    } else {
      showToast(result.message || 'Failed to delete student', 'error');
    }
  } catch (error) {
    showToast('Network error while deleting student.', 'error');
  }
}

// ============================================================================
// Authentication Modal & Handler
// ============================================================================

function openAuthModal() {
  switchAuthTab('login');
  document.getElementById('authModal').classList.remove('hidden');
}

function closeAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
}

function switchAuthTab(mode) {
  authMode = mode;
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const nameGroup = document.getElementById('registerNameGroup');
  const roleGroup = document.getElementById('registerRoleGroup');
  const submitBtn = document.getElementById('authSubmitBtn');
  const title = document.getElementById('authModalTitle');

  if (mode === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    nameGroup.classList.add('hidden');
    roleGroup.classList.add('hidden');
    submitBtn.textContent = 'Sign In';
    title.textContent = 'Sign In to StudentHub';
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    nameGroup.classList.remove('hidden');
    roleGroup.classList.remove('hidden');
    submitBtn.textContent = 'Create Account';
    title.textContent = 'Register New Account';
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;

  const endpoint = authMode === 'login' ? `${API_BASE}/auth/login` : `${API_BASE}/auth/register`;

  const payload = { email, password };
  if (authMode === 'register') {
    payload.name = document.getElementById('authName').value.trim() || 'User';
    payload.role = document.getElementById('authRole').value;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      currentToken = result.data.token;
      currentUser = result.data.user;

      localStorage.setItem('studenthub_token', currentToken);
      localStorage.setItem('studenthub_user', JSON.stringify(currentUser));

      showToast(`Welcome back, ${currentUser.name}!`, 'success');
      updateAuthUI();
      closeAuthModal();
      document.getElementById('authForm').reset();
    } else {
      showToast(result.message || 'Authentication failed', 'error');
    }
  } catch (error) {
    showToast('Network error during authentication.', 'error');
  }
}

function handleLogout() {
  localStorage.removeItem('studenthub_token');
  localStorage.removeItem('studenthub_user');
  currentUser = null;
  currentToken = null;

  updateAuthUI();
  showToast('You have logged out successfully.', 'info');
}

// ============================================================================
// Search & Filter Debouncing
// ============================================================================
let searchTimer = null;
function handleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    fetchStudents();
  }, 250);
}

function handleFilter() {
  fetchStudents();
}

// ============================================================================
// Helpers
// ============================================================================

function getDeptBadgeClass(department) {
  switch (department) {
    case 'Computer Science': return 'dept-cs';
    case 'Information Technology': return 'dept-it';
    case 'Electronics': return 'dept-electronics';
    case 'Mechanical': return 'dept-mech';
    case 'Civil': return 'dept-civil';
    default: return 'dept-default';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  toast.className = `toast ${type}`;
  toastMessage.textContent = message;

  if (type === 'success') toastIcon.textContent = '✅';
  else if (type === 'error') toastIcon.textContent = '❌';
  else toastIcon.textContent = 'ℹ️';

  toast.classList.remove('hidden');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
