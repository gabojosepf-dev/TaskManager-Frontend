const API_URL = 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
  return data;
}

export const api = {
  register: (name, email, phone, password) =>
    request('/auth/register', { method: 'POST', body: { name, email, phone, password } }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  getProfile: () => request('/users/me', { auth: true }),
  updateProfile: (name, phone) =>
    request('/users/me', { method: 'PUT', body: { name, phone }, auth: true }),

  getProjects: () => request('/projects', { auth: true }),
  getProject: (id) => request(`/projects/${id}`, { auth: true }),
  createProject: (name, description) =>
    request('/projects', { method: 'POST', body: { name, description }, auth: true }),
  addMember: (projectId, email) =>
    request(`/projects/${projectId}/members`, { method: 'POST', body: { email }, auth: true }),
  removeMember: (projectId, userId) =>
    request(`/projects/${projectId}/members/${userId}`, { method: 'DELETE', auth: true }),

  getTasks: (projectId) => request(`/projects/${projectId}/tasks`, { auth: true }),
  createTask: (projectId, task) =>
    request(`/projects/${projectId}/tasks`, { method: 'POST', body: task, auth: true }),
  updateTask: (taskId, task) =>
    request(`/tasks/${taskId}`, { method: 'PUT', body: task, auth: true }),
  deleteTask: (taskId) => request(`/tasks/${taskId}`, { method: 'DELETE', auth: true }),

  getComments: (taskId) => request(`/tasks/${taskId}/comments`, { auth: true }),
  createComment: (taskId, content) =>
    request(`/tasks/${taskId}/comments`, { method: 'POST', body: { content }, auth: true }),
};
