import api from './apiClient';

export const networkService = {
  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/home/users/');
    return response.data;
  },

  // Get user's followers
  getFollowers: async (userId) => {
    const response = await api.get(`/home/users/${userId}/followers/`);
    return response.data;
  },

  // Get user's following
  getFollowing: async (userId) => {
    const response = await api.get(`/home/users/${userId}/following/`);
    return response.data;
  },

  // Get follow counts
  getFollowCounts: async (userId) => {
    const response = await api.get(`/home/users/${userId}/follow_counts/`);
    return response.data;
  },

  // Follow a user
  followUser: async (userId) => {
    const response = await api.post(`/home/users/${userId}/follow/`);
    return response.data;
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    const response = await api.post(`/home/users/${userId}/unfollow/`);
    return response.data;
  },

  // Get current user's follow counts
  getMyFollowCounts: async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return { followers: 0, following: 0 };
    
    try {
      const user = JSON.parse(userStr);
      if (!user.id) return { followers: 0, following: 0 };
      return await networkService.getFollowCounts(user.id);
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      return { followers: 0, following: 0 };
    }
  },

  // Get follow requests (pending requests to current user)
  getFollowRequests: async () => {
    const response = await api.get('/home/follow-requests/');
    return response.data;
  },

  // Accept follow request
  acceptFollowRequest: async (userId) => {
    const response = await api.post(`/home/follow-requests/${userId}/accept/`);
    return response.data;
  },

  // Reject follow request
  rejectFollowRequest: async (userId) => {
    const response = await api.post(`/home/follow-requests/${userId}/reject/`);
    return response.data;
  }
};