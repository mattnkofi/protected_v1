<template>
  <div class="h-full flex flex-col bg-gradient-to-b from-white via-white to-slate-50 dark:from-abyss-900 dark:via-abyss-850 dark:to-abyss-900 text-slate-700 dark:text-platinum-100">
    <div class="border-b border-slate-200/80 dark:border-abyss-600/70 bg-white/90 dark:bg-abyss-850/90 px-4 py-3 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm shadow-[0_8px_24px_-18px_rgba(15,23,42,0.6)]">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full border border-calm-lavender-400/40 bg-gradient-to-br from-calm-lavender-500/20 to-cyan-400/20 text-calm-lavender-600 dark:text-calm-lavender-300">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"></path>
            <path d="M6 11a1 1 0 11-2 0 1 1 0 012 0z"></path>
            <path d="M11 11a1 1 0 11-2 0 1 1 0 012 0z"></path>
            <path d="M16 11a1 1 0 11-2 0 1 1 0 012 0z"></path>
          </svg>
        </div>
        <div>
          <p class="text-[11px] uppercase tracking-[0.35em] text-slate-500 dark:text-platinum-400">WGAD Office Feedback</p>
          <h3 class="text-base font-semibold text-slate-900 dark:text-platinum-100">
            Comments
            <span v-if="comments.length > 0" class="ml-2 inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-200">
              {{ comments.length }} {{ comments.length === 1 ? 'comment' : 'comments' }}
            </span>
          </h3>
        </div>
      </div>
      <button
        @click="loadComments"
        :disabled="loading"
        class="btn-secondary text-xs px-3 py-1.5 disabled:opacity-60 shadow-sm"
      >
        <svg class="w-4 h-4" :class="{'animate-spin': loading}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        {{ loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <transition name="slide-down">
        <div v-if="notificationMessage" :class="['mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold animate-pulse shadow-sm', notificationClass]">
          {{ notificationMessage }}
        </div>
      </transition>

      <div v-if="loading && comments.length === 0" class="flex items-center justify-center h-32">
        <div class="text-center">
          <svg class="w-8 h-8 text-calm-lavender-500 animate-spin mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <p class="text-slate-500 dark:text-platinum-400 text-sm font-semibold">Loading feedback...</p>
        </div>
      </div>

      <div v-else-if="comments.length > 0" class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          :class="['rounded-2xl border overflow-hidden transition-all duration-300',
                   newCommentIds.includes(comment.id)
                     ? 'border-amber-400/70 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.35)] animate-pulse'
                     : 'border-slate-200 dark:border-abyss-600 bg-white/90 dark:bg-abyss-700 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700/60 hover:shadow-[0_18px_40px_-30px_rgba(15,23,42,0.7)]']"
        >
          <div class="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-abyss-600 bg-white/70 dark:bg-abyss-800/70 px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-semibold text-slate-950 shadow-sm">
                {{ (comment.admin?.name || 'Admin').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-slate-800 dark:text-platinum-100 truncate">{{ comment.admin?.name || 'Admin' }}</p>
                <p class="text-xs text-slate-500 dark:text-platinum-400">{{ formatDate(comment.created_at) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="newCommentIds.includes(comment.id)" class="rounded-full bg-amber-500/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-950">
                New
              </span>
              <span :class="['rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase', getCommentTypeClass(comment.comment_type)]">
                {{ comment.comment_type }}
              </span>
              <button
                v-if="canDeleteComment(comment.admin?.id)"
                @click="openDeleteModal(comment)"
                class="rounded-full border border-rose-500/40 px-2.5 py-1 text-xs text-rose-600 dark:text-rose-300 transition hover:border-rose-400/70 hover:bg-rose-500/10"
                title="Delete comment"
              >
                Delete
              </button>
            </div>
          </div>

          <div class="px-4 py-4">
            <p class="text-sm text-slate-700 dark:text-platinum-100 whitespace-pre-wrap leading-relaxed">{{ comment.comment_text }}</p>
          </div>
        </div>
      </div>

      <div v-else class="h-full flex flex-col items-center justify-center text-center py-12">
        <svg class="w-16 h-16 text-slate-400 dark:text-platinum-500 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2h-3l-4 4z"></path>
        </svg>
        <p class="text-slate-700 dark:text-platinum-200 font-semibold text-base mb-2">No feedback yet</p>
        <p class="text-slate-500 dark:text-platinum-400 text-sm max-w-xs">
          {{ isAdmin ? 'No comments on this proposal yet. You can add feedback below.' : 'Administrators will review and leave feedback on your proposal here.' }}
        </p>
      </div>
    </div>

    <div v-if="isAdmin" class="border-t border-slate-200 dark:border-abyss-600 bg-white/90 dark:bg-abyss-850 p-4 mt-auto">
      <label class="block text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-platinum-400 mb-3">Add feedback</label>

      <select
        v-model="newCommentType"
        class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 mb-3 outline-none transition focus:border-calm-lavender-500 shadow-sm"
      >
        <option value="feedback" class="bg-white dark:bg-abyss-700">Feedback - General comments</option>
        <option value="question" class="bg-white dark:bg-abyss-700">Question - Need clarification</option>
        <option value="suggestion" class="bg-white dark:bg-abyss-700">Suggestion - Improvement ideas</option>
        <option value="issue" class="bg-white dark:bg-abyss-700">Issue - Problem found</option>
      </select>

      <textarea
        v-model="newCommentText"
        placeholder="Write your feedback here..."
        class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-sm text-slate-700 dark:text-platinum-100 mb-3 min-h-24 resize-none placeholder-slate-400 dark:placeholder-platinum-500 outline-none transition focus:border-calm-lavender-500 shadow-sm"
      ></textarea>

      <div class="flex gap-2">
        <button
          @click="addComment"
          :disabled="!newCommentText.trim() || posting"
          class="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_18px_40px_-24px_rgba(76,29,149,0.6)]"
        >
          <span v-if="!posting">Post Feedback</span>
          <span v-else>Posting...</span>
        </button>
      </div>

      <p v-if="errorMessage" class="text-rose-600 dark:text-rose-300 text-sm mt-2 font-semibold">{{ errorMessage }}</p>
    </div>

    <div v-else class="border-t border-slate-200 dark:border-abyss-600 bg-white/90 dark:bg-abyss-850 p-4 mt-auto text-center">
      <div class="flex items-center justify-center gap-2 text-slate-600 dark:text-platinum-300 mb-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-sm font-semibold">You are viewing feedback</span>
      </div>
      <p class="text-slate-500 dark:text-platinum-400 text-xs">Only admins can add feedback. Check back regularly for updates.</p>
    </div>

    <transition name="fade-modal">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" @click="closeDeleteModal"></div>
        <transition name="scale-modal">
          <div class="relative w-full max-w-md rounded-3xl border border-slate-200/70 dark:border-abyss-600 bg-white/95 dark:bg-abyss-800/95 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m1 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z"></path>
                </svg>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-platinum-400">Delete Comment</p>
                <h4 class="text-lg font-semibold text-slate-900 dark:text-platinum-100">Confirm deletion</h4>
              </div>
            </div>

            <div class="mt-4 rounded-2xl border border-slate-200/70 dark:border-abyss-600 bg-slate-50/80 dark:bg-abyss-700/80 p-4">
              <p class="text-sm text-slate-600 dark:text-platinum-200">This action cannot be undone. The comment will be permanently removed.</p>
              <p v-if="pendingDeleteComment" class="mt-3 text-sm text-slate-700 dark:text-platinum-100 line-clamp-3">“{{ pendingDeleteComment.comment_text }}”</p>
            </div>

            <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                @click="closeDeleteModal"
                class="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                @click="confirmDelete"
                class="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(244,63,94,0.8)] transition hover:bg-rose-600"
              >
                Delete comment
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '@/utils/api';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  proposal_id: {
    type: Number,
    required: true
  }
});

const authStore = useAuthStore();

const comments = ref([]);
const newCommentText = ref('');
const newCommentType = ref('feedback');
const posting = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const notificationMessage = ref('');
const notificationClass = ref('');
const newCommentIds = ref([]); // Track newly added comments for visual feedback
const showDeleteModal = ref(false);
const pendingDeleteComment = ref(null);

const isAdmin = computed(() => {
  return authStore.user?.role === 'admin' || authStore.user?.role === 'moderator';
});

// Load comments
const loadComments = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`/api/v1/gad/proposals/${props.proposal_id}/comments`);
    if (response.data.success) {
      comments.value = response.data.comments || [];
    }
  } catch (error) {
    console.error('Failed to load comments:', error);
  } finally {
    loading.value = false;
  }
};

// Add comment
const addComment = async () => {
  if (!newCommentText.value.trim()) return;

  try {
    posting.value = true;
    errorMessage.value = '';

    const response = await axios.post(
      `/api/v1/gad/proposals/${props.proposal_id}/comments`,
      {
        comment_text: newCommentText.value,
        comment_type: newCommentType.value
      }
    );

    if (response.data.success) {
      // Add new comment to list
      const newComment = response.data.comment;
      comments.value.push(newComment);
      newCommentIds.value.push(newComment.id);
      
      // Show notification
      showNotification(`Comment added successfully as "${newCommentType.value}"!`, 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300');
      
      // Clear form
      newCommentText.value = '';
      newCommentType.value = 'feedback';
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        newCommentIds.value = newCommentIds.value.filter(id => id !== newComment.id);
      }, 3000);
    }
  } catch (error) {
    console.error('Failed to post comment:', error);
    errorMessage.value = error.response?.data?.message || 'Failed to post comment';
    showNotification('Failed to post comment', 'bg-red-600/20 border-red-500/50 text-red-300');
  } finally {
    posting.value = false;
  }
};

// Delete comment
const deleteComment = async (commentId) => {
  try {
    const response = await axios.delete(`/api/v1/gad/comments/${commentId}`);
    if (response.data.success) {
      comments.value = comments.value.filter(c => c.id !== commentId);
      showNotification('Comment deleted successfully', 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300');
    }
  } catch (error) {
    console.error('Failed to delete comment:', error);
    errorMessage.value = error.response?.data?.message || 'Failed to delete comment';
    showNotification('Failed to delete comment', 'bg-red-600/20 border-red-500/50 text-red-300');
  }
};

const openDeleteModal = (comment) => {
  pendingDeleteComment.value = comment;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  pendingDeleteComment.value = null;
};

const confirmDelete = async () => {
  if (!pendingDeleteComment.value) return;
  const commentId = pendingDeleteComment.value.id;
  closeDeleteModal();
  await deleteComment(commentId);
};

// Check if user can delete this comment
const canDeleteComment = (adminId) => {
  return isAdmin.value && authStore.user?.id === adminId;
};

// Show notification message
const showNotification = (message, classString) => {
  notificationMessage.value = message;
  notificationClass.value = classString;
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    notificationMessage.value = '';
  }, 4000);
};

// Get comment type styling
const getCommentTypeClass = (type) => {
  const classes = {
    'feedback': 'bg-blue-600 text-white border border-blue-400',
    'question': 'bg-purple-600 text-white border border-purple-400',
    'suggestion': 'bg-emerald-600 text-white border border-emerald-400',
    'issue': 'bg-red-600 text-white border border-red-400'
  };
  return classes[type] || 'bg-gray-600 text-white border border-gray-400';
};

// Format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  loadComments();
});
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.2s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.scale-modal-enter-active,
.scale-modal-leave-active {
  transition: all 0.25s ease;
}

.scale-modal-enter-from,
.scale-modal-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce {
  animation: bounce 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
