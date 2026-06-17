import API from './axios';

export const getProjects = (params) => API.get('/projects', { params });
export const getTrendingProjects = () => API.get('/projects/trending');
export const getProject = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateProject = (id, data) => API.put(`/projects/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const toggleLike = (id) => API.post(`/projects/${id}/like`);
export const getComments = (id) => API.get(`/projects/${id}/comments`);
export const addComment = (id, text) => API.post(`/projects/${id}/comments`, { text });
export const deleteComment = (id) => API.delete(`/comments/${id}`);
export const sendCollabRequest = (id, message) => API.post(`/projects/${id}/collab-requests`, { message });