import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import './Notifications.css';

export default function Notifications({ onNavigateToPost }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log('Notification clicked:', notification);
    console.log('Notification type:', notification.notification_type);
    console.log('Object ID:', notification.object_id);
    console.log('onNavigateToPost function:', onNavigateToPost);
    
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to post for both read and unread notifications
    if (notification.notification_type === 'post' && notification.object_id && onNavigateToPost) {
      console.log('Calling onNavigateToPost with:', notification.object_id);
      onNavigateToPost(notification.object_id);
    } else {
      console.log('Navigation conditions not met');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow': return '👥';
      case 'job': return '💼';
      case 'like': return '👍';
      case 'comment': return '💬';
      case 'post': return '📝';
      default: return '🔔';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notifDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return notifDate.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading-container">
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      <div className="notifications-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications." 
                : filter === 'read'
                ? "No read notifications yet."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.notification_type)}
              </div>
              <div className="notification-content">
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatTimeAgo(notification.created_at)}
                  </span>
                  <span className="notification-type">
                    {notification.notification_type}
                  </span>
                </div>
              </div>
              {!notification.is_read && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}