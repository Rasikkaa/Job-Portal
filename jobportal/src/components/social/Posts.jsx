import { useState, useEffect } from "react";
import Icons from '../shared/Icons';
import { postsAPI } from '../../services/api';
import { HiHeart, HiChat, HiShare } from 'react-icons/hi';

export default function Posts({ user }) {
  const [postText, setPostText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [lightbox, setLightbox] = useState({ show: false, images: [], currentIndex: 0 });
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editingImages, setEditingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showComments, setShowComments] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePostId, setSharePostId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const postsData = await postsAPI.getPosts(true);
        setPosts(postsData.results || []);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
    fetchMyPosts();
  }, []);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: event.target.result,
          file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
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

  const handleCreatePost = async () => {
    if (!postText.trim() && selectedImages.length === 0) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', postText);
      
      selectedImages.forEach((image, index) => {
        formData.append('images', image.file);
      });
      
      await postsAPI.createPost(formData);
      
      // Refresh my posts
      const postsData = await postsAPI.getPosts(true);
      setPosts(postsData.results || []);
      
      setPostText("");
      setSelectedImages([]);
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    } finally {
      setLoading(false);
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

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditContent(post.description);
    setEditingImages(post.images || []);
    setNewImages([]);
    setImagesToDelete([]);
    setOpenMenuId(null);
  };

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: event.target.result,
          file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEditImage = (imageId, isExisting = false) => {
    if (isExisting) {
      setEditingImages(prev => prev.filter(img => img.id !== imageId));
      setImagesToDelete(prev => [...prev, imageId]);
    } else {
      setNewImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const handleUpdatePost = async () => {
    try {
      // Update description
      const formData = new FormData();
      formData.append('description', editContent);
      await postsAPI.updatePost(editingPost.id, formData);
      
      // Delete marked images
      for (const imageId of imagesToDelete) {
        await postsAPI.deletePostImage(editingPost.id, imageId);
      }
      
      // Add new images if any
      if (newImages.length > 0) {
        await postsAPI.addImagesToPost(editingPost.id, newImages.map(img => img.file));
      }
      
      // Refresh posts
      const postsData = await postsAPI.getPosts(true);
      setPosts(postsData.results || []);
      
      setEditingPost(null);
      setEditContent('');
      setEditingImages([]);
      setNewImages([]);
      setImagesToDelete([]);
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

  const handleMenuToggle = (postId) => {
    setOpenMenuId(openMenuId === postId ? null : postId);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent('');
    setEditingImages([]);
    setNewImages([]);
    setImagesToDelete([]);
  };

  const deleteImageFromPost = async (postId, imageId) => {
    try {
      await postsAPI.deletePostImage(postId, imageId);
      // Refresh posts
      const postsData = await postsAPI.getPosts(true);
      setPosts(postsData.results || []);
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image');
    }
  };

  const handleAddImagesToPost = async (postId, files) => {
    if (!files || files.length === 0) return;
    
    try {
      const imageFiles = Array.from(files);
      await postsAPI.addImagesToPost(postId, imageFiles);
      
      // Refresh posts
      const postsData = await postsAPI.getPosts(true);
      setPosts(postsData.results || []);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Failed to add images:', error);
      alert('Failed to add images');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      if (likedPosts.has(postId)) {
        await postsAPI.unlikePost(postId);
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        await postsAPI.likePost(postId);
        setLikedPosts(prev => new Set([...prev, postId]));
      }
      
      // Refresh posts to get updated counts
      const postsData = await postsAPI.getPosts(true);
      setPosts(postsData.results || []);
    } catch (error) {
      console.error('Failed to like/unlike post:', error);
    }
  };

  const loadComments = async (postId) => {
    try {
      const commentsData = await postsAPI.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: commentsData.results || [] }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const toggleComments = async (postId) => {
    console.log('Toggle comments clicked for post:', postId);
    const isShowing = showComments[postId];
    console.log('Currently showing:', isShowing);
    setShowComments(prev => ({ ...prev, [postId]: !isShowing }));
    
    if (!isShowing && !comments[postId]) {
      console.log('Loading comments for post:', postId);
      await loadComments(postId);
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;
    
    try {
      await postsAPI.addComment(postId, commentText);
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      
      // Reload comments and refresh posts
      await loadComments(postId);
      const postsData = await postsAPI.getPosts(true);
      setPosts(postsData.results || []);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    try {
      await postsAPI.deleteComment(commentId);
      await loadComments(postId);
      
      // Refresh posts to update comment count
      const postsData = await postsAPI.getPosts(true);
      setPosts(postsData.results || []);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleSharePost = async (postId) => {
    console.log('Share button clicked for post:', postId);
    try {
      console.log('Fetching users...');
      const usersData = await postsAPI.getUsers();
      console.log('Users data:', usersData);
      setUsers(usersData);
      setSharePostId(postId);
      setShowShareModal(true);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users: ' + error.message);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmitShare = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await postsAPI.sharePost(sharePostId, selectedUsers);
      setShowShareModal(false);
      setSharePostId(null);
      setSelectedUsers([]);
      alert('Post shared successfully!');
    } catch (error) {
      console.error('Failed to share post:', error);
      alert('Failed to share post');
    }
  };

  return (
    <div className="posts-page">
      <div className="create-post-section">
        <div className="create-post-card">
          <div className="create-post-header">
            <div className="user-avatar">
              {(user?.profile_image || user?.company_logo) ? (
                <img src={user?.profile_image || user?.company_logo} alt="Profile" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
              ) : (
                user?.job_role === 'company' ? (user?.company_name?.[0] || 'C') : (user?.first_name?.[0] || 'U')
              )}
            </div>
            <textarea 
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind?"
              className="post-textarea"
            />
          </div>
          {selectedImages.length > 0 && (
            <div className="image-preview">
              {selectedImages.map(image => (
                <div key={image.id} className="preview-image">
                  <img src={image.url} alt="Preview" />
                  <button 
                    className="remove-image" 
                    onClick={() => removeImage(image.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="post-actions">
            <div className="post-options">
              {/* <button className="post-option">📝 Text</button> */}
              <label className="post-option photo-upload">
                📷 Photo
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{display: 'none'}}
                />
              </label>
            </div>
            <button 
              onClick={handleCreatePost} 
              className="post-btn"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="posts-feed">
        {posts.map(post => {
          const authorName = `${post.author?.first_name || ''} ${post.author?.last_name || ''}`.trim();
          const authorInitial = authorName ? authorName[0].toUpperCase() : 'U';
          const imageUrls = post.images?.map(img => `http://localhost:8000${img.url}`) || [];
          
          return (
            <div key={post.id} className="feed-post">
              <div className="post-header">
                <div className="post-avatar">
                  {(user?.profile_image || user?.company_logo) ? (
                          <img src={user?.profile_image || user?.company_logo} alt="Profile" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                        ) : (
                          user?.job_role === 'company' ? (user?.company_name?.[0] || 'C') : (user?.first_name?.[0] || 'U')
                        )}
                </div>
                <div className="post-user-info">
                  <h4>{authorName}</h4>
                  <p>{post.author?.job_role || 'Job Portal User'}</p>
                  <span>{formatTimeAgo(post.created_at)}</span>
                </div>
                <div className="post-menu">
                  <button 
                    className="menu-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuToggle(post.id);
                    }}
                  >
                    ⋮
                  </button>
                  {openMenuId === post.id && (
                    <div className="menu-dropdown">
                      <button 
                        className="menu-item" 
                        onClick={() => handleEditPost(post)}
                      >
                        ✏ Edit
                      </button>

                      <button 
                        className="menu-item delete" 
                        onClick={() => handleDeletePost(post.id)}
                      >
                        ✖ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="post-content">
                <p>{post.description}</p>
                {imageUrls.length > 0 && (
                  <div className="post-images">
                    {imageUrls.length === 1 ? (
                      <div className="single-image-container">
                        <img 
                          src={imageUrls[0]} 
                          alt="Post" 
                          className="single-image" 
                          onClick={() => openLightbox(imageUrls, 0)}
                        />
                        <button 
                          className="delete-image-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImageFromPost(post.id, post.images[0].id);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className={`image-grid grid-${Math.min(imageUrls.length, 4)}`}>
                        {imageUrls.slice(0, 4).map((image, index) => (
                          <div 
                            key={index} 
                            className="image-container"
                            onClick={() => openLightbox(imageUrls, index)}
                          >
                            <img src={image} alt={`Post ${index + 1}`} />
                            <button 
                              className="delete-image-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteImageFromPost(post.id, post.images[index].id);
                              }}
                            >
                              ×
                            </button>
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
                  className={`action-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
                  onClick={() => handleLikePost(post.id)}
                >
                  <HiHeart className={likedPosts.has(post.id) ? 'liked-icon' : ''} /> 
                  <span>Like ({post.likes_count})</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => toggleComments(post.id)}
                  style={{ backgroundColor: showComments[post.id] ? '#e3f2fd' : 'transparent' }}
                >
                  <HiChat /> 
                  <span>Comment ({post.comments_count})</span>
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleSharePost(post.id)}
                >
                  <HiShare /> 
                  <span>Share</span>
                </button>
              </div>
              
              {showComments[post.id] && (
                <div className="comments-section">
                  <div className="add-comment">
                    <div className="comment-avatar">
                      {post.author?.avatar_url ? (
                        <img
                          src={`http://localhost:8000${post.author.avatar_url}`}
                          alt={authorName}
                          style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
                        />
                      ) : (
                        <span>{post.author?.job_role === 'company' ? (post.author?.company_name?.[0] || 'C') : authorInitial}</span>
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
                          <div className="comment-avatar">
                             {comment.author?.avatar_url ? (
                                <img
                                    src={`http://localhost:8000${comment.author.avatar_url}`}
                                    alt={commentAuthor}
                                    style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
                                />
                              ) : (
                                <span>{comment.author?.job_role === 'company' ? (comment.author?.company_name?.[0] || 'C') : commentInitial}</span>
                            )}
                          </div>
                          <div className="comment-content">
                            <div className="comment-author">{commentAuthor}</div>
                            <div className="comment-text">{comment.content}</div>
                            <div className="comment-time">{formatTimeAgo(comment.created_at)}</div>
                          </div>
                          {(comment.author?.id === user?.id || post.author?.id === user?.id) && (
                            <button 
                              className="delete-comment-btn hover-delete"
                              onClick={() => handleDeleteComment(comment.id, post.id)}
                              title="Delete comment"
                            >
                              🗑️
                            </button>
                          )}
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
              
              {/* Existing Images */}
              {editingImages.length > 0 && (
                <div className="edit-images-section">
                  <h4>Current Images</h4>
                  <div className="edit-image-preview">
                    {editingImages.map(image => (
                      <div key={image.id} className="edit-preview-image">
                        <img src={`http://localhost:8000${image.url}`} alt="Current" />
                        <button 
                          className="remove-image" 
                          onClick={() => removeEditImage(image.id, true)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Images */}
              {newImages.length > 0 && (
                <div className="edit-images-section">
                  <h4>New Images</h4>
                  <div className="edit-image-preview">
                    {newImages.map(image => (
                      <div key={image.id} className="edit-preview-image">
                        <img src={image.url} alt="New" />
                        <button 
                          className="remove-image" 
                          onClick={() => removeEditImage(image.id, false)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add Images */}
              <div className="edit-add-images">
                <label className="add-images-btn">
                  📷 Add Images
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleEditImageUpload}
                    style={{display: 'none'}}
                  />
                </label>
              </div>
              
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
              ×
            </button>
            {lightbox.images.length > 1 && (
              <>
                <button className="lightbox-nav prev" onClick={prevImage}>
                  ←
                </button>
                <button className="lightbox-nav next" onClick={nextImage}>
                  →
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
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay">
          <div className="share-modal">
            <div className="share-modal-header">
              <h3>Share Post</h3>
              <button className="close-btn" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <div className="share-modal-body">
              <div className="users-list">
                {users.map(user => (
                  <div key={user.id} className="user-item">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                    />
                    <span className="user-name">{user.full_name}</span>
                    <span className="user-role">({user.job_role})</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="share-modal-footer">
              <button className="cancel-btn" onClick={() => setShowShareModal(false)}>Cancel</button>
              <button 
                className="share-btn" 
                onClick={handleSubmitShare}
                disabled={selectedUsers.length === 0}
              >
                Share ({selectedUsers.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}