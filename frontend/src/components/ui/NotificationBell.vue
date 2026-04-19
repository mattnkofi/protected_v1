<template>
  <div class="relative" ref="containerRef">

    <!-- ─── Bell Button ─── -->
    <button
      @click="handleBellClick"
      :class="['relative p-2.5 rounded-xl border-2 transition-all duration-200 font-poppins',
        isDark
          ? 'bg-abyss-700 border-abyss-600 hover:bg-abyss-600'
          : 'bg-platinum-100 border-platinum-300 border-b-4 border-b-black/10 hover:bg-platinum-200',
        isOpen && (isDark ? 'bg-abyss-600 border-abyss-500' : 'bg-platinum-200 border-platinum-400')]"
      :aria-label="'Notifications' + (unreadCount > 0 ? ' (' + unreadCount + ' unread)' : '')"
    >
      <BellIcon
        :class="['w-5 h-5 transition-transform',
          unreadCount > 0 && 'animate-wiggle',
          isDark ? 'text-platinum-100' : 'text-abyss-800']"
      />

      <!-- Unread Badge -->
      <Transition name="badge-pop">
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-red-500 border-2 border-white dark:border-abyss-800 text-white text-[10px] font-bold font-poppins"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Transition>
    </button>

    <!-- ─── Notification Panel ─── -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :class="['absolute right-0 top-full mt-3 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border-2 overflow-hidden z-50',
          isDark
            ? 'bg-abyss-800 border-abyss-600 shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
            : 'bg-white border-platinum-300 shadow-[0_4px_0px_0px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]']"
      >

        <!-- ─── Header ─── -->
        <div
          :class="['px-5 py-4 border-b-2 flex items-center justify-between',
            isDark
              ? 'bg-abyss-700 border-abyss-600'
              : 'bg-platinum-100 border-platinum-200']"
        >
          <div>
            <h3
              :class="['font-bold text-lg leading-tight font-poppins',
                isDark ? 'text-platinum-50' : 'text-abyss-800']"
            >
              Notifications
            </h3>
            <p
              :class="['text-xs font-medium font-poppins mt-0.5',
                isDark ? 'text-abyss-300' : 'text-abyss-500']"
            >
              {{ unreadCount }} unread
            </p>
          </div>

          <!-- Right-side controls -->
          <div class="flex items-center gap-2">

            <!-- Sound toggle — wired to store.toggleSound + store.soundEnabled -->
            <button
              @click.stop="toggleSound"
              :class="['p-2 rounded-xl border-2 transition-all duration-150',
                isDark
                  ? 'bg-abyss-600 border-abyss-500 hover:bg-abyss-500'
                  : 'bg-platinum-200 border-platinum-300 border-b-4 border-b-black/10 hover:bg-platinum-300']"
              :title="soundEnabled ? 'Mute notifications' : 'Unmute notifications'"
            >
              <Volume2Icon
                v-if="soundEnabled"
                :class="['w-4 h-4', isDark ? 'text-calm-lavender-300' : 'text-calm-lavender-600']"
              />
              <VolumeXIcon
                v-else
                :class="['w-4 h-4', isDark ? 'text-abyss-400' : 'text-abyss-400']"
              />
            </button>

            <!-- Unread pill -->
            <span
              v-if="unreadCount > 0"
              :class="['px-3 py-1 rounded-full text-xs font-bold font-poppins border',
                isDark
                  ? 'bg-calm-lavender-900/50 text-calm-lavender-300 border-calm-lavender-700'
                  : 'bg-calm-lavender-50 text-calm-lavender-700 border-calm-lavender-200']"
            >
              {{ unreadCount }} New
            </span>

          </div>
        </div>

        <!-- ─── Notification List ─── -->
        <div
          v-if="notifications.length > 0"
          :class="['max-h-[420px] overflow-y-auto overscroll-contain divide-y',
            isDark ? 'divide-abyss-600' : 'divide-platinum-200']"
        >
          <div
            v-for="notif in notifications"
            :key="notif.id"
            @click="handleNotifClick(notif)"
            :class="['px-5 py-4 cursor-pointer transition-colors duration-150',
              isDark ? 'hover:bg-abyss-700' : 'hover:bg-platinum-50',
              !notif.is_read
                ? (isDark ? 'bg-calm-lavender-900/30' : 'bg-calm-lavender-50/60')
                : (isDark ? 'bg-abyss-800' : 'bg-white')]"
          >
            <div class="flex gap-3 items-start">

              <!-- Unread accent bar -->
              <div
                :class="['w-1 self-stretch rounded-full flex-shrink-0 mt-1',
                  !notif.is_read
                    ? (isDark ? 'bg-calm-lavender-400' : 'bg-calm-lavender-500')
                    : 'bg-transparent']"
              ></div>

              <div class="flex-1 min-w-0">
                <p
                  :class="['font-bold leading-snug font-poppins',
                    !notif.is_read ? 'text-base' : 'text-sm',
                    isDark ? 'text-platinum-100' : 'text-abyss-800']"
                >
                  {{ notif.title }}
                </p>
                <p
                  :class="['font-medium mt-1 line-clamp-2 font-poppins text-sm',
                    isDark ? 'text-abyss-300' : 'text-abyss-600']"
                >
                  {{ notif.message }}
                </p>
                <p
                  :class="['text-xs font-poppins mt-2',
                    isDark ? 'text-abyss-400' : 'text-abyss-400']"
                >
                  {{ new Date(notif.created_at).toLocaleString() }}
                </p>
              </div>

              <!-- Unread dot -->
              <div v-if="!notif.is_read" class="flex-shrink-0 pt-1.5">
                <div
                  :class="['w-2.5 h-2.5 rounded-full border-2',
                    isDark
                      ? 'bg-calm-lavender-400 border-calm-lavender-700'
                      : 'bg-calm-lavender-500 border-calm-lavender-200']"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Empty State ─── -->
        <div
          v-else
          :class="['py-14 px-6 text-center',
            isDark ? 'bg-abyss-800' : 'bg-white']"
        >
          <div
            :class="['w-16 h-16 rounded-2xl border-2 flex items-center justify-center mx-auto mb-4',
              isDark
                ? 'bg-abyss-700 border-abyss-600'
                : 'bg-platinum-100 border-platinum-200']"
          >
            <BellOffIcon
              :class="['w-8 h-8', isDark ? 'text-abyss-400' : 'text-abyss-400']"
            />
          </div>
          <p
            :class="['font-bold text-base font-poppins',
              isDark ? 'text-platinum-100' : 'text-abyss-800']"
          >
            No notifications
          </p>
          <p
            :class="['text-sm font-medium font-poppins mt-1',
              isDark ? 'text-abyss-400' : 'text-abyss-500']"
          >
            You're all caught up!
          </p>
        </div>

        <!-- ─── Footer ─── -->
        <div
          :class="['px-5 py-3 border-t-2',
            isDark
              ? 'bg-abyss-700 border-abyss-600'
              : 'bg-platinum-100 border-platinum-200']"
        >
          <p
            :class="['text-xs font-medium font-poppins text-center',
              isDark ? 'text-abyss-400' : 'text-abyss-400']"
          >
            ProtectED · Notification Center
          </p>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification';
import { storeToRefs } from 'pinia';
import { BellIcon, BellOff as BellOffIcon, Volume2 as Volume2Icon, VolumeX as VolumeXIcon } from 'lucide-vue-next';

const containerRef = ref(null);
const notificationStore = useNotificationStore();
const router = useRouter();

// Using storeToRefs ensures the template re-renders when these change
// soundEnabled is pulled from the store — persisted to localStorage by store.toggleSound
const { notifications, unreadCount, isOpen, soundEnabled } = storeToRefs(notificationStore);

// Theme detection
const isDark = ref(document.documentElement.classList.contains('dark'));
let themeObserver = null;

// Sound toggle — delegates to store so it persists and affects playback
const toggleSound = () => notificationStore.toggleSound();

const handleBellClick = () => {
  // initAudio unlocks the AudioContext — must be called on every user gesture
  // so that sounds triggered by SSE (which arrive without a gesture) can still play
  notificationStore.initAudio();
  notificationStore.isOpen = !notificationStore.isOpen;
  if (notificationStore.isOpen) {
    notificationStore.fetchNotifications();
  }
};

const handleNotifClick = async (notif) => {
  try {
    // Mark as read in the store/backend
    if (!notif.is_read) {
      await notificationStore.markAsRead(notif.id);
    }

    // 3. Use the router instance to navigate
    if (notif.action_url) {
      // Close the notification dropdown first
      isOpen.value = false;

      // Navigate to the URL
      router.push(notif.action_url);
    }
  } catch (error) {
    console.error('Failed to handle notification click:', error);
  }
};

// Close dropdown if clicking outside
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    notificationStore.isOpen = false;
  }
};

// Unlock AudioContext on ANY user gesture anywhere on the page (once only).
// This ensures sound plays even when the first notification arrives via SSE
// before the user has clicked the bell button.
const unlockAudioOnce = () => {
  notificationStore.initAudio();
  document.removeEventListener('click', unlockAudioOnce);
  document.removeEventListener('keydown', unlockAudioOnce);
};

onMounted(() => {
  // Theme observer
  themeObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains('dark');
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // Register the audio unlock listener before anything else
  document.addEventListener('click', unlockAudioOnce);
  document.addEventListener('keydown', unlockAudioOnce);

  // init() loads persisted sound prefs, starts SSE + polling
  // Only call if SSE hasn't already been started elsewhere in the app.
  // If your app already calls notificationStore.init() in App.vue or a router guard,
  // you can remove this line to avoid double-connecting.
  notificationStore.init();

  notificationStore.fetchUnreadCount();
  notificationStore.fetchNotifications(); // Fetch immediately on load
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (themeObserver) themeObserver.disconnect();
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* ── Bell wiggle animation ── */
@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25%       { transform: rotate(-10deg); }
  50%       { transform: rotate(10deg); }
  75%       { transform: rotate(-5deg); }
}
.animate-wiggle {
  animation: wiggle 0.5s ease-in-out 2;
}

/* ── Badge pop ── */
.badge-pop-enter-active {
  animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-pop-leave-active {
  animation: badge-pop 0.2s ease reverse;
}
@keyframes badge-pop {
  0%   { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* ── Dropdown slide-in ── */
.dropdown-enter-active {
  animation: dropdown-in 0.2s ease-out;
}
.dropdown-leave-active {
  animation: dropdown-in 0.15s ease-in reverse;
}
@keyframes dropdown-in {
  0%   { opacity: 0; transform: translateY(-8px) scale(0.97); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Custom scrollbar ── */
.overflow-y-auto::-webkit-scrollbar       { width: 5px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb { background: #d1cfc8; border-radius: 99px; }
.dark .overflow-y-auto::-webkit-scrollbar-thumb { background: #2d3748; }
</style>
