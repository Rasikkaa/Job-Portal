const API_BASE_URL = 'http://localhost:8000/api/auth';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
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

  getUserProfile: () => {
    const token = localStorage.getItem('access_token');
    return apiCall('/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
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