// frontend/src/stores/notification.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/utils/api';

let eventSource = null;
let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_DELAY_MS = 3000;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const hasMore = ref(true);
  const total = ref(0);
  const soundEnabled = ref(true);
  const soundVolume = ref(0.5);
  const isOpen = ref(false);
  const lastFetchTime = ref(null);

  const hasUnread = computed(() => unreadCount.value > 0);
  const recentNotifications = computed(() => notifications.value.slice(0, 10));

  // ── Audio ────────────────────────────────────────────────────────────────
  //
  // FIX: The old SOUNDS object held truncated/invalid base64 MP3 stubs that
  // produced no audible output. Replaced with Web Audio API tone synthesis:
  //
  // - "default"     → short two-tone "ding" (E5 → G5), 0.18s, friendly
  // - "achievement" → ascending three-tone fanfare (C5 → E5 → G5), 0.4s
  //
  // This approach requires no external files, works offline, and respects
  // soundVolume. AudioContext is created lazily on the first user gesture
  // (initAudio) to comply with browser autoplay policy — calling playSound
  // before any user interaction will be silently skipped if the context is
  // still suspended.

  let audioContext = null;

  const initAudio = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (e.g. tab was backgrounded)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  };

  /**
   * Play a synthesized notification tone.
   * @param {'default'|'achievement'} type
   */
  const playSound = (type = 'default') => {
    if (!soundEnabled.value) return;
    if (!audioContext) return; // not yet unlocked by a user gesture

    // Resume suspended context (background tab)
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => _playTone(type));
      return;
    }
    _playTone(type);
  };

  const _playTone = (type) => {
    const ctx = audioContext;
    const vol = soundVolume.value;
    const now = ctx.currentTime;

    // Master gain
    const master = ctx.createGain();
    master.gain.setValueAtTime(vol, now);
    master.connect(ctx.destination);

    if (type === 'achievement') {
      // Ascending fanfare: C5 (523Hz) → E5 (659Hz) → G5 (784Hz)
      const notes = [
        { freq: 523.25, start: 0,    dur: 0.12 },
        { freq: 659.25, start: 0.11, dur: 0.12 },
        { freq: 784.00, start: 0.22, dur: 0.20 },
      ];
      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.8, now + start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });
    } else {
      // Default "ding": E5 (659Hz) → G5 (784Hz), quick soft pop
      const notes = [
        { freq: 659.25, start: 0,    dur: 0.10 },
        { freq: 784.00, start: 0.09, dur: 0.14 },
      ];
      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.6, now + start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });
    }
  };

  // Kept for backward-compat — plays from an external URL if provided
  const playSoundFromUrl = async (url) => {
    if (!soundEnabled.value) return;
    try {
      const audio = new Audio(url);
      audio.volume = soundVolume.value;
      await audio.play();
    } catch (_) {}
  };

  // ── API ──────────────────────────────────────────────────────────────────
  const fetchNotifications = async (append = false) => {
    if (isLoading.value) return;
    isLoading.value = true;
    try {
      const response = await api.get('/api/v1/notifications', {
        params: {
          limit: 10,
          offset: append ? notifications.value.length : 0
        }
      });
      if (response.data.success) {
        notifications.value = append
          ? [...notifications.value, ...response.data.notifications]
          : response.data.notifications;
        unreadCount.value = response.data.unreadCount;
        total.value = response.data.total;
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/v1/notifications/unread-count');
      if (response.data.success) {
        unreadCount.value = response.data.unreadCount;
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || isLoading.value) return;
    await fetchNotifications({ offset: notifications.value.length, append: true });
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.patch(`/api/v1/notifications/${notificationId}/read`);
      if (response.data.success) {
        const notification = notifications.value.find((n) => n.id === notificationId);
        if (notification && !notification.is_read) {
          notification.is_read = true;
          notification.read_at = new Date().toISOString();
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (_) {}
  };

  const markAllAsRead = async () => {
    try {
      const response = await api.patch('/api/v1/notifications/read-all');
      if (response.data.success) {
        notifications.value.forEach((n) => {
          n.is_read = true;
          n.read_at = new Date().toISOString();
        });
        unreadCount.value = 0;
      }
    } catch (_) {}
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.delete(`/api/v1/notifications/${notificationId}`);
      if (response.data.success) {
        const index = notifications.value.findIndex((n) => n.id === notificationId);
        if (index > -1) {
          const wasUnread = !notifications.value[index].is_read;
          notifications.value.splice(index, 1);
          if (wasUnread) unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
      }
    } catch (_) {}
  };

  const clearAll = async () => {
    try {
      const response = await api.delete('/api/v1/notifications/clear-all');
      if (response.data.success) {
        notifications.value = [];
        unreadCount.value = 0;
        total.value = 0;
      }
    } catch (_) {}
  };

  // ── Local helpers ────────────────────────────────────────────────────────
  const addLocal = (notification) => {
    // Deduplicate — SSE may fire twice if the component remounts
    if (notifications.value.some(n => n.id === notification.id)) return;
    notifications.value.unshift(notification);
    unreadCount.value++;
    total.value++;
    playSound(notification.type === 'achievement' ? 'achievement' : 'default');
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) fetchNotifications();
  };

  const toggleSound = () => {
    soundEnabled.value = !soundEnabled.value;
    localStorage.setItem('notificationSoundEnabled', soundEnabled.value.toString());
  };

  const setVolume = (volume) => {
    soundVolume.value = Math.max(0, Math.min(1, volume));
    localStorage.setItem('notificationSoundVolume', soundVolume.value.toString());
  };

  // ── SSE with exponential-backoff reconnect ───────────────────────────────
  const connectSSE = () => {
    if (eventSource && eventSource.readyState !== EventSource.CLOSED) return;

    const token = localStorage.getItem('jwt');
    if (!token) return;

    const baseURL = api.defaults?.baseURL ?? '';
    const url = `${baseURL}/api/v1/notifications/stream?token=${token}`;

    eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onopen = () => {
      reconnectAttempts = 0;
    };

    eventSource.onmessage = (e) => {
      try {
        const { type, data } = JSON.parse(e.data);
        if (type === 'notification') addLocal(data);
      } catch (_) {}
    };

    eventSource.onerror = () => {
      if (!eventSource || eventSource.readyState === EventSource.CONNECTING) return;

      eventSource.close();
      eventSource = null;

      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts = 0;
        return;
      }

      const delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttempts);
      reconnectAttempts++;

      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        connectSSE();
      }, delay);
    };
  };

  // ── Web Push ─────────────────────────────────────────────────────────────
  const subscribeToPush = async () => {
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
    if (!window.isSecureContext || isLocalhost) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');

      if (!reg.active) {
        await new Promise((resolve, reject) => {
          const worker = reg.installing || reg.waiting;
          if (!worker) { reject(new Error('No SW found')); return; }
          const timer = setTimeout(() => reject(new Error('SW timeout')), 10000);
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') { clearTimeout(timer); resolve(); }
            if (worker.state === 'redundant') { clearTimeout(timer); reject(new Error('SW redundant')); }
          });
        });
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        await api.post('/api/v1/notifications/push-subscribe', existing.toJSON());
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
      await api.post('/api/v1/notifications/push-subscribe', sub.toJSON());
    } catch (_) {}
  };

  // ── Polling ──────────────────────────────────────────────────────────────
  let pollingInterval = null;

  const startPolling = () => {
    if (pollingInterval) return;
    pollingInterval = setInterval(() => fetchUnreadCount(), 30000);
  };

  const stopPolling = () => {
    if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; }
  };

  // ── Init / Reset ─────────────────────────────────────────────────────────
  const init = () => {
    const savedSound = localStorage.getItem('notificationSoundEnabled');
    const savedVolume = localStorage.getItem('notificationSoundVolume');
    if (savedSound !== null) soundEnabled.value = savedSound === 'true';
    if (savedVolume !== null) soundVolume.value = parseFloat(savedVolume);

    connectSSE();
    startPolling();
    fetchUnreadCount();
    subscribeToPush();
  };

  const reset = () => {
    clearTimeout(reconnectTimer);
    eventSource?.close();
    eventSource = null;
    reconnectAttempts = 0;
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
    notifications, unreadCount, isLoading, hasMore, total,
    soundEnabled, soundVolume, isOpen, lastFetchTime,
    hasUnread, recentNotifications,
    init, initAudio, playSound, playSoundFromUrl,
    fetchNotifications, fetchUnreadCount, loadMore,
    markAsRead, markAllAsRead, deleteNotification, clearAll,
    addLocal, toggle, toggleSound, setVolume,
    connectSSE, subscribeToPush, startPolling, stopPolling, reset
  };
});