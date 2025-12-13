from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import *

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('register/verify/', VerifyRegistrationAPI.as_view(), name='verify_registration'),
    path('resend-otp/', ResendOTPAPI.as_view(), name='resend_otp'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('forgot-password/request/', ForgotPasswordRequestAPI.as_view(), name='forgot_password_request'),
    path('forgot-password/verify/', ForgotPasswordVerifyAPI.as_view(), name='forgot_password_verify'),
    path('forgot-password/reset/', ForgotPasswordResetAPI.as_view(), name='forgot_password_reset'),
    path('change-password/', ChangePasswordAPI.as_view(), name='change_password'),
    path('profile/', UserProfileAPI.as_view(), name='user_profile'),
]