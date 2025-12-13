from django.urls import path
from .views import UserProfileView, CompanyProfileView
from .follow_views import FollowUserView, UnfollowUserView, FollowersListView, FollowingListView, FollowCountsView
from .user_list_views import AllUsersListView

urlpatterns = [
    path('user-profile/', UserProfileView.as_view(), name='user_profile'),
    path('company-profile/', CompanyProfileView.as_view(), name='company_profile'),
    path('users/', AllUsersListView.as_view(), name='all_users'),
    path('users/<int:user_id>/follow/', FollowUserView.as_view(), name='follow_user'),
    path('users/<int:user_id>/unfollow/', UnfollowUserView.as_view(), name='unfollow_user'),
    path('users/<int:user_id>/followers/', FollowersListView.as_view(), name='user_followers'),
    path('users/<int:user_id>/following/', FollowingListView.as_view(), name='user_following'),
    path('users/<int:user_id>/follow_counts/', FollowCountsView.as_view(), name='follow_counts'),
]