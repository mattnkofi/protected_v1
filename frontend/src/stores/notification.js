// frontend/src/stores/notification.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/utils/api';

// Notification sound URLs (base64 encoded short sounds for reliability)
const SOUNDS = {
  // Short "ding" sound
  default: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYz8t7OAAAAAAAAAAAAAAAAAAAAAP/7UGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAC3gAAAAAAAAAAAAA,',
  // Success chime
  success: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYz8t7OAAAAAAAAAAAAAAAAAAAAAP/7UGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAC3gAAAAAAAAAAAAA,',
  // Achievement unlock
  achievement: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYz8t7OAAAAAAAAAAAAAAAAAAAAAP/7UGQAD/AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABAAAAAAAAAAAAAAAAC3gAAAAAAAAAAAAA,'
};

export const useNotificationStore = defineStore('notification', () => {
  // State
  const notifications = ref([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const hasMore = ref(true);
  const total = ref(0);
  const soundEnabled = ref(true);
  const soundVolume = ref(0.5);
  const isOpen = ref(false);
  const lastFetchTime = ref(null);

  // Computed
  const hasUnread = computed(() => unreadCount.value > 0);
  const recentNotifications = computed(() => notifications.value.slice(0, 10));

  // Audio instance for playing sounds
  let audioContext = null;

  /**
   * Initialize audio context (must be called after user interaction)
   */
  const initAudio = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  /**
   * Play notification sound
   */
  const playSound = async (type = 'default') => {
    if (!soundEnabled.value) return;

    try {
      // Create audio element for simple playback
      const audio = new Audio(SOUNDS[type] || SOUNDS.default);
      audio.volume = soundVolume.value;
      await audio.play();
    } catch (error) {
      console.warn('[NotificationStore] Sound playback failed:', error);
    }
  };

  /**
   * Play a custom sound from URL
   */
  const playSoundFromUrl = async (url) => {
    if (!soundEnabled.value) return;

    try {
      const audio = new Audio(url);
      audio.volume = soundVolume.value;
      await audio.play();
    } catch (error) {
      console.warn('[NotificationStore] Custom sound playback failed:', error);
    }
  };

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = async (options = {}) => {
    const { limit = 20, offset = 0, unreadOnly = false, append = false } = options;
    
    try {
      isLoading.value = true;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        unread_only: unreadOnly.toString()
      });

      const response = await api.get(`/api/v1/notifications?${params}`);
      
      if (response.data.success) {
        if (append) {
          notifications.value = [...notifications.value, ...response.data.notifications];
        } else {
          notifications.value = response.data.notifications;
        }
        unreadCount.value = response.data.unreadCount;
        total.value = response.data.total;
        hasMore.value = response.data.hasMore;
        lastFetchTime.value = Date.now();
      }
    } catch (error) {
      console.error('[NotificationStore] fetchNotifications error:', error);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Fetch unread count only (lightweight)
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/v1/notifications/unread-count');
      if (response.data.success) {
        const previousCount = unreadCount.value;
        unreadCount.value = response.data.count;

        // Play sound if new notifications arrived
        if (response.data.count > previousCount && previousCount >= 0) {
          playSound('default');
        }
      }
    } catch (error) {
      console.error('[NotificationStore] fetchUnreadCount error:', error);
    }
  };

  /**
   * Load more notifications (pagination)
   */
  const loadMore = async () => {
    if (!hasMore.value || isLoading.value) return;
    await fetchNotifications({ offset: notifications.value.length, append: true });
  };

  /**
   * Mark a notification as read
   */
  const markAsRead = async (notificationId) => {
    try {
      const response = await api.patch(`/api/v1/notifications/${notificationId}/read`);
      if (response.data.success) {
        const notification = notifications.value.find(n => n.id === notificationId);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (error) {
      console.error('[NotificationStore] markAsRead error:', error);
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      const response = await api.patch('/api/v1/notifications/read-all');
      if (response.data.success) {
        notifications.value.forEach(n => {
          n.is_read = true;
          n.read_at = new Date().toISOString();
        });
        unreadCount.value = 0;
      }
    } catch (error) {
      console.error('[NotificationStore] markAllAsRead error:', error);
    }
  };

  /**
   * Delete a notification
   */
  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/api/v1/notifications/${notificationId}`);
      if (response.data.success) {
        const index = notifications.value.findIndex(n => n.id === notificationId);
        if (index > -1) {
          const wasUnread = !notifications.value[index].is_read;
          notifications.value.splice(index, 1);
          if (wasUnread) {
            unreadCount.value = Math.max(0, unreadCount.value - 1);
          }
        }
      }
    } catch (error) {
      console.error('[NotificationStore] deleteNotification error:', error);
    }
  };

  /**
   * Clear all notifications
   */
  const clearAll = async () => {
    try {
      const response = await api.delete('/api/v1/notifications/clear-all');
      if (response.data.success) {
        notifications.value = [];
        unreadCount.value = 0;
        total.value = 0;
      }
    } catch (error) {
      console.error('[NotificationStore] clearAll error:', error);
    }
  };

  /**
   * Add a local notification (for real-time updates)
   */
  const addLocal = (notification) => {
    notifications.value.unshift(notification);
    unreadCount.value++;
    total.value++;
    playSound(notification.type === 'achievement' ? 'achievement' : 'default');
  };

  /**
   * Toggle notification panel
   */
  const toggle = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      fetchNotifications();
    }
  };

  /**
   * Toggle sound
   */
  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value;
    localStorage.setItem('notificationSoundEnabled', soundEnabled.value.toString());
  };

  /**
   * Set volume (0-1)
   */
  const setVolume = (volume) => {
    soundVolume.value = Math.max(0, Math.min(1, volume));
    localStorage.setItem('notificationSoundVolume', soundVolume.value.toString());
  };

  /**
   * Initialize store (load saved preferences)
   */
  const init = () => {
    const savedSound = localStorage.getItem('notificationSoundEnabled');
    const savedVolume = localStorage.getItem('notificationSoundVolume');
    
    if (savedSound !== null) {
      soundEnabled.value = savedSound === 'true';
    }
    if (savedVolume !== null) {
      soundVolume.value = parseFloat(savedVolume);
    }

    // Start polling for new notifications
    startPolling();
  };

  let pollingInterval = null;

  /**
   * Start polling for new notifications
   */
  const startPolling = () => {
    if (pollingInterval) return;
    
    // Poll every 30 seconds
    pollingInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
  };

  /**
   * Stop polling
   */
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  /**
   * Reset store state
   */
  const reset = () => {
    notifications.value = [];
    unreadCount.value = 0;
    isLoading.value = false;
    hasMore.value = true;
    total.value = 0;
    isOpen.value = false;
    lastFetchTime.value = null;
    stopPolling();
  };

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    total,
    soundEnabled,
    soundVolume,
    isOpen,
    lastFetchTime,

    // Computed
    hasUnread,
    recentNotifications,

    // Actions
    init,
    initAudio,
    playSound,
    playSoundFromUrl,
    fetchNotifications,
    fetchUnreadCount,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addLocal,
    toggle,
    toggleSound,
    setVolume,
    startPolling,
    stopPolling,
    reset
  };
});
