<template>
  <div class="page-wrapper animate-in">

    <!-- Top Nav Bar -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200 dark:border-abyss-600">
      <button @click="handleBack" class="back-btn group w-fit">
        <ArrowLeftIcon class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Library</span>
      </button>

      <div class="flex items-center gap-2">
        <button v-if="canEdit" @click="showQuizModal = true" class="btn-primary">
          <PlusIcon class="w-3.5 h-3.5" />
          <span>Add Quiz</span>
        </button>
        <button @click="toggleSidebar" class="btn-secondary hidden lg:flex">
          <InfoIcon class="w-3.5 h-3.5 text-calm-lavender-500" />
          {{ sidebarOpen ? 'Hide' : 'Show' }} Details
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="spinner"></div>
      <p class="loading-text">Loading module...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="max-w-md mx-auto text-center py-20">
      <div
        class="inline-flex p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/30 mb-4">
        <AlertCircleIcon class="w-8 h-8 text-red-500" />
      </div>
      <h3 class="font-semibold text-base text-slate-700 dark:text-platinum-200 mb-1">Something went wrong</h3>
      <p class="text-sm text-platinum-500 mb-5">{{ error }}</p>
      <button @click="handleBack" class="btn-secondary">Go back</button>
    </div>

    <!-- Main Content -->
    <main v-else-if="module" class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

      <!-- Left: Module Content -->
      <div class="lg:col-span-8 space-y-5">

        <!-- Module Header Card -->
        <div class="card">
          <div class="flex flex-col md:flex-row justify-between items-start gap-5">
            <div class="flex-1 space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="badge badge-lavender">{{ formatCategory(module.category) }}</span>
                <span v-if="module.is_featured" class="badge badge-muted">Featured</span>
              </div>

              <h1 class="font-madimione text-2xl md:text-3xl text-slate-800 dark:text-platinum-100 leading-snug">
                {{ module.title }}
              </h1>

              <p
                class="text-sm text-platinum-500 dark:text-platinum-500 leading-relaxed border-l-2 border-calm-lavender-300 dark:border-calm-lavender-700 pl-4">
                {{ module.description }}
              </p>
            </div>

            <div v-if="canEdit" class="flex gap-2 shrink-0">
              <button @click="editModule"
                class="p-2 rounded-xl bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 text-platinum-500 hover:text-calm-lavender-600 hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50 transition-all">
                <Edit2Icon class="w-4 h-4" />
              </button>
              <button @click="confirmDelete"
                class="p-2 rounded-xl bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 text-platinum-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800/40 transition-all">
                <Trash2Icon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Meta -->
          <div class="mt-5 pt-4 border-t border-slate-100 dark:border-abyss-600 flex flex-wrap items-center gap-6">
            <div class="flex items-center gap-2">
              <BarChart2Icon class="w-3.5 h-3.5 text-calm-lavender-500" />
              <div>
                <p class="text-[10px] text-platinum-500 uppercase tracking-wide">Difficulty</p>
                <p class="text-xs font-medium text-slate-700 dark:text-platinum-200 capitalize">{{
                  module.difficulty_level }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <EyeIcon class="w-3.5 h-3.5 text-calm-lavender-500" />
              <div>
                <p class="text-[10px] text-platinum-500 uppercase tracking-wide">Reads</p>
                <p class="text-xs font-medium text-slate-700 dark:text-platinum-200">{{ module.view_count || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Document Viewer -->
        <div class="card min-h-[400px] p-0 overflow-hidden">
          <DocumentViewer v-if="module.file_url" :file-url="module.file_url" :file-name="module.file_name"
            :file-type="module.file_type" />
          <div v-else
            class="h-64 flex flex-col items-center justify-center gap-2 text-platinum-400 dark:text-platinum-600">
            <FileIcon class="w-8 h-8" />
            <p class="text-sm font-medium">No document attached</p>
          </div>
        </div>
      </div>

      <!-- Right: Sidebar -->
      <div class="lg:col-span-4 space-y-5">

        <!-- Quizzes -->
        <section v-if="quizzes && quizzes.length > 0" class="space-y-3">
          <h2 class="section-eyebrow">Assessments</h2>
          <div class="space-y-2">
            <div v-for="quiz in quizzes" :key="quiz.id" @click="handleQuizClick(quiz.id)" class="quiz-row group">
              <div class="flex-1 min-w-0">
                <h3
                  class="text-sm font-medium text-slate-700 dark:text-platinum-200 leading-snug truncate group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                  {{ quiz.title }}
                </h3>
                <p class="text-xs text-platinum-500 mt-0.5 capitalize">{{ quiz.quiz_type?.replace('_', ' ') }}</p>
              </div>
              <PlayIcon v-if="isPlayer"
                class="w-4 h-4 text-calm-lavender-500 fill-calm-lavender-500 shrink-0 group-hover:scale-110 transition-transform" />
              <EyeIcon v-else class="w-4 h-4 text-platinum-400 shrink-0" />
            </div>
          </div>
        </section>

        <!-- Module Content Index -->
        <div v-if="module.content" class="card">
          <h2 class="section-eyebrow mb-3">Module Notes</h2>
          <div
            class="prose prose-slate dark:prose-invert max-w-none prose-sm text-sm leading-relaxed text-platinum-600 dark:text-platinum-400"
            v-html="module.content"></div>
        </div>

        <!-- Module Sidebar Details -->
        <Transition name="sidebar-slide">
          <aside v-if="sidebarOpen" class="card">
            <ModuleSidebar :module="module" @close="sidebarOpen = false" />
          </aside>
        </Transition>
      </div>
    </main>

    <ConfirmModal
      :is-open="showDeleteModal"
      variant="danger"
      title="Delete Module?"
      :message="deleteMessage"
      warning-text="All associated quizzes and student progress will also be deleted. This cannot be undone."
      confirm-label="Delete Module"
      cancel-label="Cancel"
      :loading="isDeleting"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
    <EditModuleModal v-if="showEditModal" :module="module" @saved="handleModuleUpdated"
      @cancel="showEditModal = false" />
    <CreateQuizModal :is-open="showQuizModal" :module-id="module?.id" @close="showQuizModal = false"
      @saved="refreshQuizzes" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeftIcon, PlusIcon, InfoIcon, Edit2Icon,
  Trash2Icon, EyeIcon, BarChart2Icon, PlayIcon,
  FileIcon, AlertCircleIcon
} from 'lucide-vue-next';

import { useModuleStore } from '@/stores/module';
import { useQuizStore } from '@/stores/quiz';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/utils/useToast';

import DocumentViewer from '@/components/modules/DocumentViewer.vue';
import ModuleSidebar from '@/components/modules/ModuleSidebar.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';
import EditModuleModal from '@/components/modules/EditModuleModal.vue';
import CreateQuizModal from '@/components/modules/CreateQuizModal.vue';

const route = useRoute();
const router = useRouter();
const moduleStore = useModuleStore();
const quizStore = useQuizStore();
const authStore = useAuthStore();
const toast = useToast();

const sidebarOpen = ref(false);
const error = ref(null);
const loading = ref(true);
const showDeleteModal = ref(false);
const isDeleting = ref(false);

const deleteMessage = computed(() =>
    module.value?.title
        ? `You are about to permanently remove "${module.value.title}".`
        : 'You are about to permanently remove this module.'
);
const showEditModal = ref(false);
const showQuizModal = ref(false);
const quizzes = ref([]);

const module = computed(() => moduleStore.currentModule);
const canEdit = computed(() => ['admin', 'educator', 'moderator'].includes(authStore.user?.role));
const isPlayer = computed(() => authStore.user?.role === 'player');

const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value; };

const formatCategory = (c) => {
  const map = { 'gad': 'Culture', 'sexual_health': 'Health', 'vawc': 'Safety', 'general': 'Standard' };
  return map[c] || c?.toUpperCase() || 'Other';
};

const refreshQuizzes = async () => {
  try {
    const result = await quizStore.fetchQuizzesByModule(route.params.id);
    quizzes.value = result || [];
  } catch (err) { console.error(err); }
};

const handleBack = () => {
router.push({ name: isPlayer.value ? 'user.modules' : 'facilitator.modules' });
};
// @TODO Fix Navigation

const handleQuizClick = (id) => {
  if (isPlayer.value) router.push({ name: 'quiz.player', params: { id } });
  else toast.info("Facilitator view: Preview only.");
};

const editModule = () => { showEditModal.value = true; };
const confirmDelete = () => { showDeleteModal.value = true; };

const handleDelete = async () => {
  isDeleting.value = true;
  try {
    await moduleStore.deleteModule(module.value.id);
    toast.success('Module removed.');
    handleBack();
  } catch (err) { toast.error('Removal failed.'); }
  finally {
    isDeleting.value = false;
    showDeleteModal.value = false;
  }
};

const handleModuleUpdated = async () => {
  showEditModal.value = false;
  toast.success('Module updated.');
  await moduleStore.fetchModuleById(route.params.id);
};

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const moduleId = route.params.id;
    if (!moduleId) throw new Error("Invalid Module ID");
    await moduleStore.fetchModuleById(moduleId);
    if (!moduleStore.currentModule) throw new Error("Module not found.");
    await refreshQuizzes();
    if (window.innerWidth >= 1024) { sidebarOpen.value = true; }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Something went wrong';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@reference "@/style.css";

.page-wrapper {
  @apply space-y-5 text-slate-900 dark:text-white;
}

.section-eyebrow {
  @apply text-xs font-semibold uppercase tracking-widest text-calm-lavender-600 dark:text-calm-lavender-400;
}

.back-btn {
  @apply flex items-center gap-2 text-xs font-medium text-platinum-500 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400 transition-colors;
}

.card {
  @apply bg-white dark:bg-abyss-600 border border-slate-200 dark:border-abyss-500 rounded-2xl p-5;
}

.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium;
}

.badge-lavender {
  @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/30 text-calm-lavender-700 dark:text-calm-lavender-400 border border-calm-lavender-200 dark:border-calm-lavender-800/40;
}

.badge-muted {
  @apply bg-slate-100 dark:bg-abyss-700 text-platinum-600 dark:text-platinum-400 border border-slate-200 dark:border-abyss-500;
}

.quiz-row {
  @apply flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-abyss-700 border border-slate-100 dark:border-abyss-500 rounded-xl hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50 transition-all cursor-pointer;
}

.btn-primary {
  @apply flex items-center gap-2 px-4 py-2 rounded-xl bg-calm-lavender-600 hover:bg-calm-lavender-700 dark:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600 text-white font-medium text-sm border border-calm-lavender-700 transition-all;
}

.btn-secondary {
  @apply flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-abyss-700 hover:bg-slate-200 dark:hover:bg-abyss-600 text-slate-600 dark:text-platinum-300 font-medium text-sm border border-slate-200 dark:border-abyss-500 transition-all;
}

.spinner {
  @apply w-7 h-7 border-2 border-slate-200 dark:border-abyss-500 border-t-calm-lavender-500 rounded-full animate-spin;
}

.loading-text {
  @apply font-mplusrounded text-sm text-platinum-500;
}

.animate-in {
  animation: fadeSlideUp 0.4s ease-out forwards;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.25s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>