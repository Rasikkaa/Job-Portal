from django.urls import path
from .views import UserProfileView, CompanyProfileView, ProfileView
from .follow_views import FollowUserView, UnfollowUserView, FollowersListView, FollowingListView, FollowCountsView, FollowRequestsView, AcceptFollowRequestView, RejectFollowRequestView
from .user_list_views import AllUsersListView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('user-profile/', UserProfileView.as_view(), name='user_profile'),
    path('company-profile/', CompanyProfileView.as_view(), name='company_profile'),
    path('users/', AllUsersListView.as_view(), name='all_users'),
    path('users/<int:user_id>/follow/', FollowUserView.as_view(), name='follow_user'),
    path('users/<int:user_id>/unfollow/', UnfollowUserView.as_view(), name='unfollow_user'),
    path('users/<int:user_id>/followers/', FollowersListView.as_view(), name='user_followers'),
    path('users/<int:user_id>/following/', FollowingListView.as_view(), name='user_following'),
    path('users/<int:user_id>/follow_counts/', FollowCountsView.as_view(), name='follow_counts'),
    path('follow-requests/', FollowRequestsView.as_view(), name='follow_requests'),
    path('follow-requests/<int:user_id>/accept/', AcceptFollowRequestView.as_view(), name='accept_follow_request'),
    path('follow-requests/<int:user_id>/reject/', RejectFollowRequestView.as_view(), name='reject_follow_request'),
]