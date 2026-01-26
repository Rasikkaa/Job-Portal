# Job Portal

A full-stack job portal application built with Django REST Framework (backend) and React (frontend).

## Project Structure

```
Job Portal/
├── job_portal/          # Django Backend
│   ├── authentication/  # User authentication app
│   ├── home/           # User profiles and following system
│   ├── jobs/           # Job management app
│   ├── posts/          # Social posts and comments
│   ├── media/          # Uploaded files (images, resumes)
│   └── manage.py       # Django management script
├── jobportal/          # React Frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   └── services/   # API services
│   ├── public/         # Static assets
│   └── package.json    # Frontend dependencies
└── venv1/              # Python virtual environment (excluded from git)
```

## Features

### Backend (Django)
- User authentication (register, login, OTP verification, password reset)
- User profiles (individual and company profiles)
- Job posting and application system
- Social posts with comments and likes
- Follow/unfollow system
- File uploads (profile images, resumes, post images)

### Frontend (React)
- User authentication flow
- Home dashboard with navigation tabs
- Responsive design
- Password change functionality
- Tab-based navigation (Home, Network, Jobs, Notifications, Posts)

## Setup Instructions

### Backend Setup
1. Navigate to the `job_portal` directory
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```
3. Install dependencies:
   ```bash
   pip install django djangorestframework django-cors-headers pillow
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to the `jobportal` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/verify-otp/` - OTP verification
- `POST /api/auth/forgot-password/` - Password reset request
- `POST /api/auth/reset-password/` - Password reset

### User Management
- `GET /api/home/profile/` - Get user profile
- `PUT /api/home/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password

### Jobs
- `GET /api/jobs/` - List jobs
- `POST /api/jobs/` - Create job
- `POST /api/jobs/{id}/apply/` - Apply for job

### Posts
- `GET /api/posts/` - List posts
- `POST /api/posts/` - Create post
- `POST /api/posts/{id}/like/` - Like/unlike post
- `POST /api/posts/{id}/comment/` - Add comment

## Technologies Used

### Backend
- Django 4.x
- Django REST Framework
- PostgreSQL (Database)
- Pillow (image processing)
- CORS headers for cross-origin requests

### Frontend
- React 18
- Vite (build tool)
- CSS3 with responsive design
- Axios for API calls

## Current Status

The application includes:
- ✅ Complete authentication system
- ✅ User profile management
- ✅ Job posting and application system
- ✅ Social posts with likes and comments
- ✅ Follow/unfollow functionality
- ✅ Responsive frontend with tab navigation
- ✅ Password change functionality

## Next Steps

- Add content to empty navigation pages (Network, Jobs, Notifications, Posts)
- Implement real-time notifications
- Add search and filtering functionality
- Enhance UI/UX design
- Add more social features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
