# Posts and Home Page Backend Integration

## Overview
Successfully integrated the frontend posts and home page with the Django backend, removing sample data and connecting to real database operations.

## What Was Integrated

### 1. Posts API Service (`src/services/api.js`)
- **getPosts()** - Fetch all posts from backend
- **createPost(postData)** - Create new post with images
- **updatePost(postId, postData)** - Update existing post
- **deletePost(postId)** - Delete post
- **likePost(postId)** - Like a post
- **unlikePost(postId)** - Unlike a post
- **getComments(postId)** - Get comments for a post
- **addComment(postId, text)** - Add comment to a post
- **deleteComment(commentId)** - Delete a comment

### 2. Home Page (`src/components/dashboard/Home.jsx`)
- Removed sample data generation
- Integrated real API calls to fetch posts and user data
- Added like/unlike functionality with real-time updates
- Added proper time formatting for post timestamps
- Updated post rendering to use backend data structure
- Added error handling for API operations

### 3. Posts Page (`src/components/social/Posts.jsx`)
- Integrated post creation with image upload
- Added real-time like/unlike functionality
- Implemented comments system with add/view functionality
- Added loading states for better UX
- Updated post rendering to match backend data structure

### 4. CSS Enhancements (`src/components/dashboard/Home.css`)
- Added styles for liked posts (highlighted state)
- Added complete comments section styling
- Added responsive design for comments
- Enhanced visual feedback for interactions

## Backend Data Structure

### Post Object
```json
{
  "id": 1,
  "author": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "job_role": "Software Engineer",
    "avatar_url": null
  },
  "description": "Post content here...",
  "images": [
    {
      "id": 1,
      "url": "/media/posts/2024/01/01/image.jpg"
    }
  ],
  "likes_count": 5,
  "comments_count": 3,
  "liked": false,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "is_owner": true
}
```

### Comment Object
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "text": "Great post!",
  "created_at": "2024-01-01T12:30:00Z",
  "updated_at": "2024-01-01T12:30:00Z",
  "is_owner": false
}
```

## Features Implemented

### ✅ Post Management
- Create posts with text and multiple images (up to 10)
- Edit post descriptions
- Delete posts (owner only)
- Real-time post updates

### ✅ Like System
- Like/unlike posts with visual feedback
- Real-time like count updates
- Proper state management

### ✅ Comments System
- View comments for each post
- Add new comments
- Real-time comment count updates
- Proper comment threading display

### ✅ Image Handling
- Multiple image upload support
- Image preview before posting
- Lightbox for viewing images
- Responsive image grids (1, 2, 3, 4+ images)

### ✅ User Experience
- Loading states for all operations
- Error handling with user feedback
- Responsive design for mobile/desktop
- Real-time updates without page refresh

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/posts/` | Fetch all posts |
| POST | `/api/posts/` | Create new post |
| PATCH | `/api/posts/{id}/` | Update post |
| DELETE | `/api/posts/{id}/` | Delete post |
| POST | `/api/posts/{id}/like/` | Like post |
| POST | `/api/posts/{id}/unlike/` | Unlike post |
| GET | `/api/posts/{id}/comments/` | Get comments |
| POST | `/api/posts/{id}/comments/` | Add comment |
| DELETE | `/api/comments/{id}/` | Delete comment |

## Setup Instructions

### 1. Backend Setup
```bash
cd "job_portal"
python manage.py runserver
```

### 2. Frontend Setup
```bash
cd "jobportal"
npm run dev
```

### 3. Test the Integration
1. Register/Login to the application
2. Navigate to Home tab to see posts feed
3. Navigate to Posts tab to create new posts
4. Test like/unlike functionality
5. Test comments system
6. Test post creation with images

## Key Changes Made

### Removed Sample Data
- Eliminated `generatePosts()` function
- Removed hardcoded post arrays
- Replaced with real API calls

### Added Real-time Features
- Like/unlike with immediate UI updates
- Comment system with real-time counts
- Post creation with immediate feed refresh

### Enhanced Error Handling
- API error messages displayed to users
- Loading states for better UX
- Graceful fallbacks for missing data

### Improved Data Flow
- Proper state management between components
- Consistent data structure usage
- Optimistic UI updates

## Next Steps

1. **Add Real-time Notifications** - WebSocket integration for live updates
2. **Implement Search** - Search posts by content or author
3. **Add Pagination** - Handle large numbers of posts efficiently
4. **Enhanced Comments** - Reply to comments, edit/delete comments
5. **User Profiles** - Click on user names to view profiles
6. **Post Analytics** - View detailed post statistics

## Troubleshooting

### Common Issues
1. **CORS Errors** - Ensure Django CORS settings are configured
2. **Authentication Errors** - Check if user is logged in and token is valid
3. **Image Upload Issues** - Verify media settings in Django
4. **API Connection** - Ensure Django server is running on localhost:8000

### Debug Tips
- Check browser console for API errors
- Verify Django server logs for backend issues
- Test API endpoints directly using tools like Postman
- Check network tab for failed requests