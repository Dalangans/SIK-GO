// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function untuk get token
const getToken = () => localStorage.getItem('token');

// Helper function untuk API requests
const apiRequest = async (endpoint, method = 'GET', data = null, isFormData = false) => {
  const headers = {
    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers: isFormData ? {} : headers, // FormData akan set headers otomatis
  };

  if (data) {
    if (isFormData) {
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  register: (email, password, name) =>
    apiRequest('/api/auth/register', 'POST', { email, password, name }),
  
  login: (email, password) =>
    apiRequest('/api/auth/login', 'POST', { email, password }),
  
  getMe: () => apiRequest('/api/auth/me', 'GET'),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (bookingData) =>
    apiRequest('/api/bookings', 'POST', bookingData),
  
  getMyBookings: () =>
    apiRequest('/api/bookings/my-bookings', 'GET'),
  
  getBookingById: (id) =>
    apiRequest(`/api/bookings/${id}`, 'GET'),
  
  updateBooking: (id, updateData) =>
    apiRequest(`/api/bookings/${id}`, 'PUT', updateData),
  
  deleteBooking: (id) =>
    apiRequest(`/api/bookings/${id}`, 'DELETE'),
  
  checkAvailability: (roomId, startDate, endDate) =>
    apiRequest('/api/bookings/check-availability', 'POST', { roomId, startDate, endDate }),
  
  getAIRecommendations: (bookingDetails) =>
    apiRequest('/api/bookings/recommendations', 'POST', bookingDetails),
  
  getBookingsByRoom: (roomId) =>
    apiRequest(`/api/bookings/room/${roomId}`, 'GET'),
  
  getPendingBookings: () =>
    apiRequest('/api/bookings/status/pending', 'GET'),
  
  approveBooking: (id, notes = '') =>
    apiRequest(`/api/bookings/${id}/approve`, 'PUT', { notes }),
  
  rejectBooking: (id, notes = '') =>
    apiRequest(`/api/bookings/${id}/reject`, 'PUT', { notes }),
};

// Proposal APIs
export const proposalAPI = {
  createProposal: (proposalData, file = null) => {
    const formData = new FormData();
    formData.append('title', proposalData.title);
    formData.append('category', proposalData.category);
    formData.append('description', proposalData.description);
    formData.append('content', proposalData.content);
    if (file) formData.append('file', file);
    
    return apiRequest('/api/proposals', 'POST', formData, true);
  },
  
  getMyProposals: () =>
    apiRequest('/api/proposals/my-proposals', 'GET'),
  
  getProposalById: (id) =>
    apiRequest(`/api/proposals/${id}`, 'GET'),
  
  updateProposal: (id, proposalData, file = null) => {
    const formData = new FormData();
    if (proposalData.title) formData.append('title', proposalData.title);
    if (proposalData.category) formData.append('category', proposalData.category);
    if (proposalData.description) formData.append('description', proposalData.description);
    if (proposalData.content) formData.append('content', proposalData.content);
    if (file) formData.append('file', file);
    
    return apiRequest(`/api/proposals/${id}`, 'PUT', formData, true);
  },
  
  deleteProposal: (id) =>
    apiRequest(`/api/proposals/${id}`, 'DELETE'),
  
  submitProposal: (id) =>
    apiRequest(`/api/proposals/${id}/submit`, 'PUT', {}),
  
  generateAIReview: (id) =>
    apiRequest(`/api/proposals/${id}/ai-review`, 'POST', {}),
  
  submitManualReview: (id, comments, status) =>
    apiRequest(`/api/proposals/${id}/manual-review`, 'POST', { comments, status }),
  
  getAllProposals: (status = null) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/api/proposals${query}`, 'GET');
  },
  
  getProposalsNeedingReview: () =>
    apiRequest('/api/proposals/review/pending', 'GET'),
};

// Room APIs
export const roomAPI = {
  getAllRooms: () =>
    apiRequest('/api/rooms', 'GET'),
  
  getRoomById: (id) =>
    apiRequest(`/api/rooms/${id}`, 'GET'),
  
  createRoom: (roomData) =>
    apiRequest('/api/rooms', 'POST', roomData),
  
  updateRoom: (id, updateData) =>
    apiRequest(`/api/rooms/${id}`, 'PUT', updateData),
  
  deleteRoom: (id) =>
    apiRequest(`/api/rooms/${id}`, 'DELETE'),
};

// User APIs
export const userAPI = {
  getAllUsers: () =>
    apiRequest('/api/users', 'GET'),
  
  getUserById: (id) =>
    apiRequest(`/api/users/${id}`, 'GET'),
  
  updateUser: (id, updateData) =>
    apiRequest(`/api/users/${id}`, 'PUT', updateData),
  
  deleteUser: (id) =>
    apiRequest(`/api/users/${id}`, 'DELETE'),
};

// Proposal Analysis APIs (AI-powered file checking)
export const proposalAnalysisAPI = {
  analyzeProposal: (file, title = '', type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);
    return apiRequest('/api/proposals-analysis/analyze', 'POST', formData, true);
  },

  checkPlagiarism: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/api/proposals-analysis/check-plagiarism', 'POST', formData, true);
  },

  getImprovementSuggestions: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return apiRequest('/api/proposals-analysis/suggestions', 'POST', formData, true);
  },

  performCompleteAudit: (file, title = '', type = 'general', author = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);
    formData.append('author', author);
    return apiRequest('/api/proposals-analysis/audit', 'POST', formData, true);
  }
};

// Proposal Evaluation APIs (Summary & Evaluation)
export const proposalEvaluationAPI = {
  generateSummary: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/api/proposals-evaluation/summary', 'POST', formData, true);
  },

  evaluateProposal: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/api/proposals-evaluation/evaluate', 'POST', formData, true);
  }
};
