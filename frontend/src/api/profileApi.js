import API from './axios';

export const getProfile = () => API.get('/profile');
export const getUserProjects = () => API.get('/profile/projects');
export const getIncomingRequests = () => API.get('/profile/collab-requests/incoming');
export const getSentRequests = () => API.get('/profile/collab-requests/sent');
export const acceptRequest = (id) => API.post(`/collab-requests/${id}/accept`);
export const rejectRequest = (id) => API.post(`/collab-requests/${id}/reject`);