const API_BASE_URL = 'http://localhost:8000/api';
const AUTH_BASE_URL = 'http://localhost:8000/api/auth';

const apiCall = async (endpoint, options = {}, baseUrl = AUTH_BASE_URL) => {
  const url = `${baseUrl}${endpoint}`;
  const config = {
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = 'Something went wrong';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Make sure Django server is running on http://localhost:8000');
    }
    throw error;
  }
};

export const jobsAPI = {
  getJobs: (params = {}) => {
    const token = localStorage.getItem('access_token');
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/jobs/${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  getJobDetail: (jobId) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/jobs/${jobId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  applyJob: (jobId, applicationData) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/jobs/${jobId}/apply/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: applicationData,
    }, API_BASE_URL);
  },

  getMyApplications: () => {
    const token = localStorage.getItem('access_token');
    return apiCall('/jobs/my-applications/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  createJob: (jobData) => {
    const token = localStorage.getItem('access_token');
    return apiCall('/jobs/create/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: jobData,
    }, API_BASE_URL);
  },

  getMyJobs: () => {
    const token = localStorage.getItem('access_token');
    return apiCall('/jobs/my-jobs/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  updateJob: (jobId, jobData) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/jobs/${jobId}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: jobData,
    }, API_BASE_URL);
  },

  deleteJob: (jobId) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/jobs/${jobId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  getJobStats: () => {
    const token = localStorage.getItem('access_token');
    return apiCall('/jobs/stats/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  getJobApplications: (jobId) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/jobs/${jobId}/applications/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  updateApplicationStatus: (applicationId, data) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('status', data.status);
    return apiCall(`/jobs/applications/${applicationId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }, API_BASE_URL);
  },
};

export const postsAPI = {
  getPosts: (myPostsOnly = false) => {
    const token = localStorage.getItem('access_token');
    const url = myPostsOnly ? '/posts/?my_posts=true' : '/posts/';
    return apiCall(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  createPost: (postData) => {
    const token = localStorage.getItem('access_token');
    return apiCall('/posts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: postData,
    }, API_BASE_URL);
  },

  updatePost: (postId, postData) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/posts/${postId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: postData,
    }, API_BASE_URL);
  },

  deletePost: (postId) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/posts/${postId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  likePost: (postId) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/posts/${postId}/like/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  unlikePost: (postId) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/posts/${postId}/unlike/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  getComments: (postId) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/posts/${postId}/comments/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  addComment: (postId, text) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/posts/${postId}/comments/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    }, API_BASE_URL);
  },

  deleteComment: (commentId) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/comments/${commentId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },

  addImagesToPost: (postId, images) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));
    return apiCall(`/posts/${postId}/images/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    }, API_BASE_URL);
  },

  deletePostImage: (postId, imageId) => {
    const token = localStorage.getItem('access_token');
    return apiCall(`/posts/${postId}/images/${imageId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, API_BASE_URL);
  },
};

export const authAPI = {
  register: (userData) => apiCall('/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  verifyRegistration: (email, otp) => apiCall('/register/verify/', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),

  login: (email, password) => apiCall('/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  resendOTP: (email) => apiCall('/resend-otp/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  forgotPasswordRequest: (email) => apiCall('/forgot-password/request/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  forgotPasswordVerify: (email, otp) => apiCall('/forgot-password/verify/', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),

  forgotPasswordReset: (resetToken, newPassword) => apiCall('/forgot-password/reset/', {
    method: 'POST',
    body: JSON.stringify({ reset_token: resetToken, new_password: newPassword, new_password2: newPassword }),
  }),

  updateUserProfile: (profileData) => {
    const token = localStorage.getItem('access_token');
    return apiCall('/profile/', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: profileData,
    }, 'http://localhost:8000/api/home');
  },

  getUserProfile: () => {
    const token = localStorage.getItem('access_token');
    return apiCall('/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }, 'http://localhost:8000/api/home');
  },

  changePassword: (oldPassword, newPassword) => {
    const token = localStorage.getItem('access_token');
    return apiCall('/change-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        old_password: oldPassword, 
        new_password: newPassword, 
        confirm_password: newPassword 
      }),
    });
  },
};