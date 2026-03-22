<template>
  <div class="relative" ref="containerRef">
    <!-- Notification Bell Button -->
    <button
      @click="handleBellClick"
      :class="['relative p-2.5 rounded-xl border transition-all duration-200 group',
        isDark 
          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
          : 'bg-slate-100 border-slate-200 hover:bg-slate-200',
        isOpen && (isDark ? 'bg-white/15' : 'bg-slate-300')]"
      :aria-label="`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`"
    >
      <BellIcon :class="['w-5 h-5 transition-transform', hasUnread && 'animate-wiggle', isDark ? 'text-white' : 'text-slate-700']" />
      
      <!-- Unread Badge -->
      <Transition name="badge-pop">
        <span v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-lg">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Transition>
    </button>

    <!-- Notification Panel -->
    <Transition name="dropdown">
      <div v-if="isOpen"
        :class="['absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-2xl overflow-hidden z-50',
          isDark ? 'bg-[#0a0a0f] border-white/10' : 'bg-white border-slate-200']">
        
        <!-- Header -->
        <div :class="['px-4 py-3 border-b flex items-center justify-between',
          isDark ? 'border-white/10' : 'border-slate-200']">
          <div>
            <h3 :class="['font-bold text-lg', isDark ? 'text-white' : 'text-slate-900']">Notifications</h3>
            <p :class="['text-xs', isDark ? 'text-white/50' : 'text-slate-500']">
              {{ unreadCount }} unread
            </p>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Sound Toggle -->
            <button
              @click.stop="toggleSound"
              :class="['p-2 rounded-lg transition-colors', isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100']"
              :title="soundEnabled ? 'Mute notifications' : 'Unmute notifications'"
            >
              <Volume2Icon v-if="soundEnabled" :class="['w-4 h-4', isDark ? 'text-purple-400' : 'text-purple-600']" />
              <VolumeXIcon v-else :class="['w-4 h-4', isDark ? 'text-white/40' : 'text-slate-400']" />
            </button>

            <!-- Mark All Read -->
            <button
              v-if="unreadCount > 0"
              @click.stop="handleMarkAllRead"
              :class="['px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                isDark ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200']"
            >
              Mark all read
            </button>
          </div>
        </div>

        <!-- Notification List -->
        <div class="max-h-[400px] overflow-y-auto overscroll-contain">
          <!-- Loading State -->
          <div v-if="isLoading && notifications.length === 0" class="p-8 text-center">
            <LoaderIcon :class="['w-8 h-8 mx-auto animate-spin', isDark ? 'text-purple-400' : 'text-purple-600']" />
            <p :class="['mt-2 text-sm', isDark ? 'text-white/50' : 'text-slate-500']">Loading...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="notifications.length === 0" class="p-8 text-center">
            <BellOffIcon :class="['w-12 h-12 mx-auto mb-3', isDark ? 'text-white/20' : 'text-slate-300']" />
            <p :class="['font-medium', isDark ? 'text-white/70' : 'text-slate-600']">No notifications</p>
            <p :class="['text-sm', isDark ? 'text-white/40' : 'text-slate-400']">You're all caught up!</p>
          </div>

          <!-- Notifications -->
          <div v-else>
            <TransitionGroup name="notification-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                @click="handleNotificationClick(notification)"
                :class="['relative px-4 py-3 border-b cursor-pointer transition-colors',
                  isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50',
                  !notification.is_read && (isDark ? 'bg-purple-500/10' : 'bg-purple-50')]"
              >
                <div class="flex gap-3">
                  <!-- Icon -->
                  <div :class="['flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                    getNotificationIconBg(notification.type)]">
                    <component :is="getNotificationIcon(notification.type)" class="w-5 h-5 text-white" />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <p :class="['font-semibold text-sm leading-tight', isDark ? 'text-white' : 'text-slate-900']">
                      {{ notification.title }}
                    </p>
                    <p :class="['text-sm mt-0.5 line-clamp-2', isDark ? 'text-white/60' : 'text-slate-600']">
                      {{ notification.message }}
                    </p>
                    <p :class="['text-xs mt-1', isDark ? 'text-white/40' : 'text-slate-400']">
                      {{ formatTime(notification.created_at) }}
                    </p>
                  </div>

                  <!-- Unread Dot -->
                  <div v-if="!notification.is_read" class="flex-shrink-0">
                    <div class="w-2.5 h-2.5 rounded-full bg-purple-500 mt-1"></div>
                  </div>

                  <!-- Delete Button -->
                  <button
                    @click.stop="handleDelete(notification.id)"
                    :class="['flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all',
                      isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200']"
                  >
                    <XIcon :class="['w-4 h-4', isDark ? 'text-white/40' : 'text-slate-400']" />
                  </button>
                </div>

                <!-- Hover effect marker -->
                <div class="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div :class="['absolute left-0 top-0 bottom-0 w-1', 
                    notification.is_read ? '' : 'bg-purple-500']"></div>
                </div>
              </div>
            </TransitionGroup>

            <!-- Load More -->
            <div v-if="hasMore" class="p-4 text-center">
              <button
                @click="loadMore"
                :disabled="isLoading"
                :class="['px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                  isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  isLoading && 'opacity-50 cursor-not-allowed']"
              >
                <LoaderIcon v-if="isLoading" class="w-4 h-4 animate-spin inline mr-2" />
                {{ isLoading ? 'Loading...' : 'Load more' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div :class="['px-4 py-3 border-t flex items-center justify-between',
          isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50']">
          <button
            v-if="notifications.length > 0"
            @click.stop="handleClearAll"
            :class="['text-xs font-medium transition-colors',
              isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600']"
          >
            Clear all
          </button>
          <RouterLink
            to="/settings"
            @click="close"
            :class="['text-xs font-medium transition-colors',
              isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700']"
          >
            Settings
          </RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import {
  Bell as BellIcon,
  BellOff as BellOffIcon,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  X as XIcon,
  Loader as LoaderIcon,
  Award as AwardIcon,
  BookOpen as BookOpenIcon,
  Play as PlayIcon,
  Users as UsersIcon,
  Gift as GiftIcon,
  Info as InfoIcon,
  Clock as ClockIcon
} from 'lucide-vue-next';

const router = useRouter();
const notificationStore = useNotificationStore();
const containerRef = ref(null);

const {
  notifications,
  unreadCount,
  isLoading,
  hasMore,
  soundEnabled,
  isOpen,
  hasUnread
} = storeToRefs(notificationStore);

// Theme detection
const isDark = ref(true);
const checkTheme = () => { isDark.value = document.documentElement.classList.contains('dark'); };
let themeObserver = null;

// Get notification icon based on type
const getNotificationIcon = (type) => {
  const icons = {
    achievement: AwardIcon,
    quiz: PlayIcon,
    module: BookOpenIcon,
    classroom: UsersIcon,
    reward: GiftIcon,
    system: InfoIcon,
    reminder: ClockIcon
  };
  return icons[type] || BellIcon;
};

// Get notification icon background color
const getNotificationIconBg = (type) => {
  const colors = {
    achievement: 'bg-gradient-to-br from-amber-400 to-purple-500',
    quiz: 'bg-gradient-to-br from-purple-500 to-violet-600',
    module: 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
    classroom: 'bg-gradient-to-br from-purple-500 to-violet-500',
    reward: 'bg-gradient-to-br from-fuchsia-500 to-purple-500',
    system: 'bg-gradient-to-br from-slate-500 to-slate-600',
    reminder: 'bg-gradient-to-br from-violet-500 to-purple-600'
  };
  return colors[type] || 'bg-gradient-to-br from-purple-500 to-violet-600';
};

// Format time relative to now
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Handle bell click
const handleBellClick = () => {
  notificationStore.initAudio();
  notificationStore.toggle();
};

// Handle notification click
const handleNotificationClick = (notification) => {
  if (!notification.is_read) {
    notificationStore.markAsRead(notification.id);
  }
  
  if (notification.action_url) {
    router.push(notification.action_url);
    close();
  }
};

// Handle mark all read
const handleMarkAllRead = () => {
  notificationStore.markAllAsRead();
};

// Handle delete
const handleDelete = (id) => {
  notificationStore.deleteNotification(id);
};

// Handle clear all
const handleClearAll = () => {
  if (confirm('Clear all notifications?')) {
    notificationStore.clearAll();
  }
};

// Toggle sound
const toggleSound = () => {
  notificationStore.toggleSound();
};

// Load more
const loadMore = () => {
  notificationStore.loadMore();
};

// Close panel
const close = () => {
  notificationStore.isOpen = false;
};

// Click outside to close
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    close();
  }
};

// Escape key to close
const handleEscape = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    close();
  }
};

onMounted(() => {
  checkTheme();
  themeObserver = new MutationObserver(checkTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  
  notificationStore.init();
  notificationStore.fetchUnreadCount();
  
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  if (themeObserver) themeObserver.disconnect();
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
/* Bell wiggle animation */
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-5deg); }
}
.animate-wiggle {
  animation: wiggle 0.5s ease-in-out;
  animation-iteration-count: 2;
}

/* Badge pop animation */
.badge-pop-enter-active {
  animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-pop-leave-active {
  animation: badge-pop 0.2s ease reverse;
}
@keyframes badge-pop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Dropdown animation */
.dropdown-enter-active {
  animation: dropdown-in 0.2s ease-out;
}
.dropdown-leave-active {
  animation: dropdown-in 0.15s ease-in reverse;
}
@keyframes dropdown-in {
  0% { opacity: 0; transform: translateY(-10px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Notification list animation */
.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}
.notification-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}
.notification-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.notification-list-move {
  transition: transform 0.3s ease;
}
</style>
