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

function buildQuery(params = {}) {
  const query = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return query ? `?${query}` : '';
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
  getStats: (projectId) => request(`/projects/${projectId}/stats`, { auth: true }),
  getActivity: (projectId) => request(`/projects/${projectId}/activity`, { auth: true }),

  getTasks: (projectId, filters = {}) =>
    request(`/projects/${projectId}/tasks${buildQuery(filters)}`, { auth: true }),
  getTrash: (projectId) => request(`/projects/${projectId}/tasks/trash`, { auth: true }),
  restoreTask: (taskId) => request(`/tasks/${taskId}/restore`, { method: 'POST', auth: true }),
  createTask: (projectId, task) =>
    request(`/projects/${projectId}/tasks`, { method: 'POST', body: task, auth: true }),
  updateTask: (taskId, task) =>
    request(`/tasks/${taskId}`, { method: 'PUT', body: task, auth: true }),
  deleteTask: (taskId) => request(`/tasks/${taskId}`, { method: 'DELETE', auth: true }),

  getComments: (taskId) => request(`/tasks/${taskId}/comments`, { auth: true }),
  createComment: (taskId, content) =>
    request(`/tasks/${taskId}/comments`, { method: 'POST', body: { content }, auth: true }),

  getLabels: (projectId) => request(`/projects/${projectId}/labels`, { auth: true }),
  createLabel: (projectId, name, color) =>
    request(`/projects/${projectId}/labels`, { method: 'POST', body: { name, color }, auth: true }),
  attachLabel: (taskId, labelId) =>
    request(`/tasks/${taskId}/labels`, { method: 'POST', body: { label_id: labelId }, auth: true }),
  detachLabel: (taskId, labelId) =>
    request(`/tasks/${taskId}/labels/${labelId}`, { method: 'DELETE', auth: true }),

  getSubtasks: (taskId) => request(`/tasks/${taskId}/subtasks`, { auth: true }),
  createSubtask: (taskId, title) =>
    request(`/tasks/${taskId}/subtasks`, { method: 'POST', body: { title }, auth: true }),
  updateSubtask: (id, data) =>
    request(`/subtasks/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteSubtask: (id) => request(`/subtasks/${id}`, { method: 'DELETE', auth: true }),
};
