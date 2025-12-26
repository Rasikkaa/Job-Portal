import { useState, useEffect } from "react";
import "./Home.css";
import Header from "./Header";
import ChangePasswordForm from "../profile/ChangePasswordForm";
import Network from "../social/Network";
import Jobs from "../jobs/Jobs";
import Notifications from "./Notifications";
import Posts from "../social/Posts";
import Profile from "../profile/Profile";
import { authAPI, postsAPI } from "../../services/api";
import { networkService } from "../../services/networkService";
import { MdMoreVert, MdEdit, MdDelete, MdClose, MdArrowBack, MdArrowForward } from 'react-icons/md';

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [lightbox, setLightbox] = useState({ show: false, images: [], currentIndex: 0 });
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [followingSet, setFollowingSet] = useState(new Set());
  const [pendingRequests, setPendingRequests] = useState(new Set());
  const [userStats, setUserStats] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, postsData] = await Promise.all([
          authAPI.getUserProfile(),
          postsAPI.getPosts()
        ]);
        setUser(userData);
        setPosts(postsData.results || []);
        
        // Load following data and stats
        if (userData.id) {
          try {
            const [followingData, statsData] = await Promise.all([
              networkService.getFollowing(userData.id),
              networkService.getFollowCounts(userData.id)
            ]);
            const followingIds = new Set(followingData.results.map(u => u.id));
            setFollowingSet(followingIds);
            setUserStats(statsData);
          } catch (error) {
            console.error('Error loading following data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        localStorage.clear();
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const userData = await authAPI.getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleLikePost = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post.liked) {
        await postsAPI.unlikePost(postId);
      } else {
        await postsAPI.likePost(postId);
      }
      
      setPosts(posts.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              liked: !p.liked, 
              likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 
            }
          : p
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const toggleComments = async (postId) => {
    const isShowing = showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: !isShowing }));
    
    if (!isShowing && !comments[postId]) {
      try {
        const commentsData = await postsAPI.getComments(postId);
        setComments(prev => ({ ...prev, [postId]: commentsData.results || [] }));
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;
    
    try {
      await postsAPI.addComment(postId, commentText);
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      
      const commentsData = await postsAPI.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: commentsData.results || [] }));
      
      const postsData = await postsAPI.getPosts();
      setPosts(postsData.results || []);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleChangePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setChangePasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const validateChangePassword = () => {
    const errs = {};
    if (!changePasswordForm.oldPassword) errs.oldPassword = "Current password is required";
    if (changePasswordForm.newPassword.length < 6) errs.newPassword = "Password must be at least 6 characters";
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validateChangePassword()) return;
    
    setChangePasswordLoading(true);
    try {
      await authAPI.changePassword(changePasswordForm.oldPassword, changePasswordForm.newPassword);
      alert("Password changed successfully!");
      setShowChangePassword(false);
      setChangePasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (error) {
      console.error('Change password error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleBackFromChangePassword = () => {
    setShowChangePassword(false);
    setChangePasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setShowPassword(false);
  };

  const handleMenuToggle = (postId) => {
    setOpenMenuId(openMenuId === postId ? null : postId);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditContent(post.description);
    setOpenMenuId(null);
  };

  const handleUpdatePost = async () => {
    try {
      const formData = new FormData();
      formData.append('description', editContent);
      
      await postsAPI.updatePost(editingPost.id, formData);
      setPosts(posts.map(post => 
        post.id === editingPost.id 
          ? { ...post, description: editContent }
          : post
      ));
      setEditingPost(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await postsAPI.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent('');
  };

  const handleFollowUser = async (userId) => {
    try {
      await networkService.followUser(userId);
      setPendingRequests(prev => new Set([...prev, userId]));
    } catch (error) {
      console.error('Error sending follow request:', error);
      alert(error.response?.data?.detail || 'An error occurred');
    }
  };

  const refreshFollowingData = async () => {
    if (user?.id) {
      try {
        const followingData = await networkService.getFollowing(user.id);
        const followingIds = new Set(followingData.results.map(u => u.id));
        setFollowingSet(followingIds);
        setPendingRequests(new Set()); // Clear pending requests
      } catch (error) {
        console.error('Error refreshing following data:', error);
      }
    }
  };

  // Add effect to refresh data when tab becomes active
  useEffect(() => {
    if (activeTab === 'home') {
      refreshFollowingData();
    }
  }, [activeTab, user?.id]);

  const getFollowButtonText = (authorId) => {
    if (followingSet.has(authorId)) return 'Following';
    if (pendingRequests.has(authorId)) return 'Requested';
    return '+ Follow';
  };

  const getFollowButtonClass = (authorId) => {
    if (followingSet.has(authorId)) return 'follow-btn following';
    if (pendingRequests.has(authorId)) return 'follow-btn requested';
    return 'follow-btn';
  };

  const openLightbox = (images, index) => {
    setLightbox({ show: true, images, currentIndex: index });
  };

  const closeLightbox = () => {
    setLightbox({ show: false, images: [], currentIndex: 0 });
  };

  const nextImage = () => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const prevImage = () => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
    }));
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="home-screen">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onChangePassword={handleChangePassword}
      />
      
      <main className="home-body">
        {activeTab === "jobs" ? (
          <Jobs user={user} />
        ) : (
          <div className="home-container">
            <div className="content-area">
              {activeTab === "home" && (
                <div className="linkedin-home">
                  <div className="left-profile">
                    <div className="profile-card">
                      <div className="profile-avatar">
                        {(user?.profile_image || user?.company_logo) ? (
                          <img src={user?.profile_image || user?.company_logo} alt="Profile" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                        ) : (
                          user?.job_role === 'company' ? (user?.company_name?.[0] || 'C') : (user?.first_name?.[0] || 'U')
                        )}
                      </div>
                      <div className="profile-info">
                        <h3>{user?.full_name}</h3>
                        <p>{user?.bio || user?.company_description}</p>
                      </div>
                      <div className="profile-stats">
                        {[
                          { key: 'followers', value: userStats.followers, label: 'Followers' },
                          { key: 'following', value: userStats.following, label: 'Following' }
                        ].map(stat => (
                          <div key={stat.key} className="stat-item">
                            <strong>{stat.value}</strong>
                            <span>{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="center-feed">
                    {/* <div className="create-post-card">
                      <div className="create-post-header">
                        <div className="user-avatar">E</div>
                        <input type="text" placeholder="Start a post..." className="post-input" />
                      </div>
                      <div className="post-options">
                        <button className="post-option">📝 Text post</button>
                        <button className="post-option">📷 Image post</button>
                      </div>
                    </div> */}
                    <div><h1 style={{color:"#000000ff"}}>Suggested posts</h1></div>
                    
                    

                      {posts.map((post) => {
                        const authorName = `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim();
                        const authorInitial = authorName ? authorName[0].toUpperCase() : 'U';
                        const imageUrls = post.images?.map(img => `http://localhost:8000${img.url}`) || [];
                        
                        return (
                          <div key={post.id} className="feed-post">
                            <div className="post-header">
                              <div className="post-avatar">{authorInitial}</div>

                              <div className="post-user-info">
                                <h4>{authorName}</h4>
                                <p>{post.author?.job_role || 'Job Portal User'}</p>
                                <span>{formatTimeAgo(post.created_at)}</span>
                              </div>

                              {post.is_owner ? (
                                <div className="post-menu">
                                  <button 
                                    className="menu-btn" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMenuToggle(post.id);
                                    }}
                                  >
                                    <MdMoreVert />
                                  </button>
                                  {openMenuId === post.id && (
                                    <div className="menu-dropdown">
                                      <button 
                                        className="menu-item" 
                                        onClick={() => handleEditPost(post)}
                                      >
                                        <MdEdit /> Edit
                                      </button>
                                      <button 
                                        className="menu-item delete" 
                                        onClick={() => handleDeletePost(post.id)}
                                      >
                                        <MdDelete /> Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button 
                                  className={getFollowButtonClass(post.author.id)}
                                  onClick={() => handleFollowUser(post.author.id)}
                                  disabled={followingSet.has(post.author.id) || pendingRequests.has(post.author.id)}
                                >
                                  {getFollowButtonText(post.author.id)}
                                </button>
                              )}
                            </div>

                            <div className="post-content">
                              <p>{post.description}</p>
                              {imageUrls.length > 0 && (
                                <div className="post-images">
                                  {imageUrls.length === 1 ? (
                                    <img 
                                      src={imageUrls[0]} 
                                      alt="Post" 
                                      className="single-image" 
                                      onClick={() => openLightbox(imageUrls, 0)}
                                    />
                                  ) : (
                                    <div className={`image-grid grid-${Math.min(imageUrls.length, 4)}`}>
                                      {imageUrls.slice(0, 4).map((image, index) => (
                                        <div 
                                          key={index} 
                                          className="image-container"
                                          onClick={() => openLightbox(imageUrls, index)}
                                        >
                                          <img src={image} alt={`Post ${index + 1}`} />
                                          {index === 3 && imageUrls.length > 4 && (
                                            <div className="more-images-overlay">
                                              +{imageUrls.length - 4}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="post-actions">
                              <button 
                                className={`action-btn ${post.liked ? 'liked' : ''}`}
                                onClick={() => handleLikePost(post.id)}
                              >
                                👍 Like ({post.likes_count})
                              </button>
                              <button 
                                className="action-btn"
                                onClick={() => toggleComments(post.id)}
                              >
                                💬 Comment ({post.comments_count})
                              </button>
                            </div>
                            
                            {showComments[post.id] && (
                              <div className="comments-section">
                                <div className="add-comment">
                                  <div className="comment-avatar">
                                    {(user?.profile_image || user?.company_logo) ? (
                                      <img src={user?.profile_image || user?.company_logo} alt="Profile" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                                    ) : (
                                      user?.job_role === 'company' ? (user?.company_name?.[0] || 'C') : (user?.first_name?.[0] || 'U')
                                    )}
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={newComment[post.id] || ''}
                                    onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddComment(post.id);
                                      }
                                    }}
                                  />
                                  <button onClick={() => handleAddComment(post.id)}>Post</button>
                                </div>
                                
                                <div className="comments-list">
                                  {(comments[post.id] || []).map(comment => {
                                    const commentAuthor = `${comment.author?.first_name || ''} ${comment.author?.last_name || ''}`.trim();
                                    const commentInitial = commentAuthor ? commentAuthor[0].toUpperCase() : 'U';
                                    
                                    return (
                                      <div key={comment.id} className="comment">
                                        <div className="comment-avatar">{commentInitial}</div>
                                        <div className="comment-content">
                                          <div className="comment-author">{commentAuthor}</div>
                                          <div className="comment-text">{comment.text}</div>
                                          <div className="comment-time">{formatTimeAgo(comment.created_at)}</div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}



                  </div>
                  
                  <div className="right-sidebar">
                    <div className="trending-card">
                      <h4>Trending</h4>
                      <div className="trending-item">
                        <span>React Development</span>
                        <small>1,234 posts</small>
                      </div>
                      <div className="trending-item">
                        <span>Remote Work</span>
                        <small>892 posts</small>
                      </div>
                      <div className="trending-item">
                        <span>Tech Jobs</span>
                        <small>567 posts</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "network" && <Network user={user} />}
              {activeTab === "notifications" && <Notifications />}
              {activeTab === "posts" && <Posts user={user} />}
              {activeTab === "profile" && <Profile user={user} onProfileUpdate={handleProfileUpdate} />}
            </div>
          </div>
        )}
      </main>
      
      {showChangePassword && (
        <ChangePasswordForm
          oldPassword={changePasswordForm.oldPassword}
          newPassword={changePasswordForm.newPassword}
          confirmPassword={changePasswordForm.confirmPassword}
          errors={errors}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          handleChange={handleChangePasswordFormChange}
          handleSubmit={handleChangePasswordSubmit}
          onBack={handleBackFromChangePassword}
          loading={changePasswordLoading}
        />
      )}
      
      {editingPost && (
        <div className="edit-post-overlay">
          <div className="edit-post-modal">
            <div className="edit-post-header">
              <h3>Edit post</h3>
            </div>
            <div className="edit-post-body">
              <textarea
                className="edit-post-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
              />
              <div className="edit-post-actions">
                <button className="cancel-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="update-btn" onClick={handleUpdatePost}>
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {lightbox.show && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <MdClose />
            </button>
            {lightbox.images.length > 1 && (
              <>
                <button className="lightbox-nav prev" onClick={prevImage}>
                  <MdArrowBack />
                </button>
                <button className="lightbox-nav next" onClick={nextImage}>
                  <MdArrowForward />
                </button>
              </>
            )}
            <img 
              src={lightbox.images[lightbox.currentIndex]} 
              alt={`Image ${lightbox.currentIndex + 1}`}
              className="lightbox-image"
            />
            {lightbox.images.length > 1 && (
              <div className="lightbox-counter">
                {lightbox.currentIndex + 1} / {lightbox.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}