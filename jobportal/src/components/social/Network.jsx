import { useState, useEffect } from 'react';
import { networkService } from '../../services/networkService';
import './Network.css';

export default function Network({ user }) {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [networkStats, setNetworkStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [followingSet, setFollowingSet] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Network component user prop:', user);
    if (user) {
      setCurrentUser(user);
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get users data
      const usersData = await networkService.getAllUsers();
      setUsers(usersData);
      
      // Get stats and following data if user is available
      if (user?.id) {
        try {
          console.log('Loading data for user:', user);
          const [statsData, followingData] = await Promise.all([
            networkService.getFollowCounts(user.id),
            networkService.getFollowing(user.id)
          ]);
          setNetworkStats(statsData);
          const followingIds = new Set(followingData.results.map(u => u.id));
          setFollowingSet(followingIds);
        } catch (userError) {
          console.error('Error loading user-specific data:', userError);
          setNetworkStats({ followers: 0, following: 0 });
        }
      } else {
        setNetworkStats({ followers: 0, following: 0 });
      }
    } catch (error) {
      console.error('Error loading network data:', error);
      setError('Failed to load network data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFollowers = async () => {
    if (!currentUser) {
      console.log('loadFollowers: No current user');
      return;
    }
    console.log('loadFollowers: Loading followers for user', currentUser.id);
    try {
      const data = await networkService.getFollowers(currentUser.id);
      console.log('loadFollowers: API response:', data);
      setFollowers(data.results);
      console.log('loadFollowers: Set followers:', data.results);
    } catch (error) {
      console.error('Error loading followers:', error);
    }
  };

  const loadFollowing = async () => {
    if (!currentUser) {
      console.log('loadFollowing: No current user');
      return;
    }
    console.log('loadFollowing: Loading following for user', currentUser.id);
    try {
      const data = await networkService.getFollowing(currentUser.id);
      console.log('loadFollowing: API response:', data);
      setFollowing(data.results);
      console.log('loadFollowing: Set following:', data.results);
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const loadFollowRequests = async () => {
    try {
      const data = await networkService.getFollowRequests();
      setFollowRequests(data.results);
    } catch (error) {
      console.error('Error loading follow requests:', error);
    }
  };

  useEffect(() => {
    console.log('Tab changed to:', activeTab, 'Current user:', currentUser?.id);
    if (activeTab === 'followers') {
      console.log('Loading followers...');
      loadFollowers();
    } else if (activeTab === 'following') {
      console.log('Loading following...');
      loadFollowing();
    } else if (activeTab === 'suggestions') {
      console.log('Loading follow requests...');
      loadFollowRequests();
    }
  }, [activeTab, currentUser]);

  const handleAcceptRequest = async (userId) => {
    try {
      await networkService.acceptFollowRequest(userId);
      setFollowRequests(prev => prev.filter(user => user.id !== userId));
      
      // Reload stats and followers data
      const statsData = await networkService.getMyFollowCounts();
      setNetworkStats(statsData);
      
      // If on followers tab, reload followers
      if (activeTab === 'followers') {
        loadFollowers();
      }
    } catch (error) {
      console.error('Error accepting follow request:', error);
      alert(error.response?.data?.detail || 'An error occurred');
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await networkService.rejectFollowRequest(userId);
      setFollowRequests(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error rejecting follow request:', error);
      alert(error.response?.data?.detail || 'An error occurred');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await networkService.unfollowUser(userId);
      setFollowing(prev => prev.filter(user => user.id !== userId));
      setNetworkStats(prev => ({ ...prev, following: prev.following - 1 }));
      setFollowingSet(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert(error.response?.data?.detail || 'An error occurred');
    }
  };

  const getFilteredUsers = () => {
    let filtered = [];
    
    if (activeTab === 'suggestions') {
      filtered = followRequests;
    } else if (activeTab === 'following') {
      filtered = following;
    } else if (activeTab === 'followers') {
      filtered = followers;
    }
    
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const fullName = user.full_name || `${user.first_name} ${user.last_name}`;
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.job_role.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    return filtered;
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="network-container">
      {/* Network Stats Header */}
      <div className="network-header">
        <div className="network-stats">
          <div className="stat-card">
            <div className="stat-number">{formatNumber(networkStats.followers)}</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{formatNumber(networkStats.following)}</div>
            <div className="stat-label">Following</div>
          </div>

        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search people by name or title..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="network-tabs">
        <button 
          className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Requests ({followRequests.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Following ({networkStats.following})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          Followers ({networkStats.followers})
        </button>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="loading-state">
          <p>Loading users...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={loadData} className="retry-btn">Retry</button>
        </div>
      ) : (
        <div className="users-grid">
          {getFilteredUsers().map(user => {
            const fullName = user.full_name || `${user.first_name} ${user.last_name}`;
            const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();
            
            return (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {initials}
                </div>
                
                <div className="user-info">
                  <h3>{fullName}</h3>
                  <div className="user-title">{user.job_role}</div>
                </div>

                <div className="user-stats">
                  <div className="user-stat">
                    <span className="user-stat-number">{formatNumber(user.followers_count || 0)}</span>
                    <span className="user-stat-label">Followers</span>
                  </div>
                  <div className="user-stat">
                    <span className="user-stat-number">{formatNumber(user.following_count || 0)}</span>
                    <span className="user-stat-label">Following</span>
                  </div>
                  <div className="user-stat">
                    <span className="user-stat-number">{user.posts_count || 0}</span>
                    <span className="user-stat-label">Posts</span>
                  </div>
                </div>

                <div className="user-actions">
                  {activeTab === 'suggestions' && (
                    <>
                      <button 
                        className="follow-btn"
                        onClick={() => handleAcceptRequest(user.id)}
                      >
                        Accept
                      </button>
                      <button 
                        className="unfollow-btn"
                        onClick={() => handleRejectRequest(user.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {activeTab === 'following' && (
                    <button 
                      className="unfollow-btn"
                      onClick={() => handleUnfollow(user.id)}
                    >
                      Unfollow
                    </button>
                  )}
                  {activeTab === 'followers' && (
                    <button className="message-btn">
                      Message
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && getFilteredUsers().length === 0 && (
        <div className="empty-state">
          <h3>No users found</h3>
          <p>Try adjusting your search or browse different tabs</p>
        </div>
      )}
    </div>
  );
}