<template>
  <div class="page-wrapper animate-in">      
    
    <button @click="handleBack" class="back-btn group w-fit">
        <ArrowLeftIcon class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Library</span>
      </button>
    <div class="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Sidebar -->
      <aside class="lg:col-span-4 space-y-4 lg:sticky lg:top-6 self-start">

        <!-- Classroom Info Card -->
        <div class="card">
          <div class="flex items-center gap-4 mb-5">
            <div
              class="p-3 rounded-xl bg-calm-lavender-100 dark:bg-calm-lavender-900/30 border border-calm-lavender-200 dark:border-calm-lavender-800/40 shrink-0">
              <SchoolIcon class="w-5 h-5 text-calm-lavender-600 dark:text-calm-lavender-400" />
            </div>
            <div class="min-w-0">
              <p class="section-eyebrow">Classroom</p>
              <h1 class="font-semibold text-base text-slate-800 dark:text-platinum-100 truncate leading-snug">
                {{ classroom?.name }}
              </h1>
            </div>
          </div>

          <div class="space-y-2 mb-5">
            <div class="info-row">
              <span class="info-label">Class Code</span>
              <span
                class="font-mono text-sm font-semibold text-calm-lavender-600 dark:text-calm-lavender-400 tracking-widest">
                {{ classroom?.join_code }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Members</span>
              <span class="font-semibold text-sm text-slate-700 dark:text-platinum-200">
                {{ classroom?.students?.length || 0 }}
              </span>
            </div>
          </div>

          <button @click="isFacilitator ? (showCreateModal = true) : (showJoinModal = true)"
            class="btn-primary w-full justify-center">
            {{ isFacilitator ? 'Manage Class' : 'Change Class' }}
          </button>
        </div>

        <!-- Member List Card -->
        <div class="card">
          <h3 class="section-eyebrow mb-4">Members</h3>
          <div class="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            <div v-for="student in classroom?.students" :key="student.id" class="flex items-center gap-3 group py-1.5">
              <div
                class="avatar-sm group-hover:bg-calm-lavender-100 dark:group-hover:bg-calm-lavender-900/30 transition-colors">
                {{ student.name?.[0] }}
              </div>
              <div class="min-w-0">
                <p
                  class="text-sm font-medium text-slate-700 dark:text-platinum-200 truncate group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                  {{ student.name }}
                </p>
                <p class="text-xs text-platinum-500 dark:text-platinum-600">Active</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="lg:col-span-8 space-y-5">

        <!-- Tab Nav -->
        <nav class="flex items-center gap-1 bg-slate-100 dark:bg-abyss-600 p-1 rounded-xl w-fit">
          <button v-for="tab in availableTabs" :key="tab" @click="activeTab = tab"
            :class="['tab-btn', activeTab === tab ? 'tab-btn-active' : 'tab-btn-inactive']">
            {{ tab === 'Progress' ? 'Grades' : tab }}
          </button>
        </nav>

        <!-- Content Panel -->
        <div class="card min-h-[500px]">

          <!-- Modules Tab -->
          <div v-if="activeTab === 'Modules'" class="animate-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="module in classroom?.modules" :key="module.id" @click="$router.push(`/modules/${module.id}`)"
              class="module-card group cursor-pointer">
              <div
                class="p-2.5 bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border border-calm-lavender-100 dark:border-calm-lavender-800/30 rounded-xl w-fit mb-4 group-hover:bg-calm-lavender-100 dark:group-hover:bg-calm-lavender-800/40 transition-colors">
                <BookOpenIcon class="w-4 h-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
              </div>
              <h3
                class="text-sm font-semibold text-slate-800 dark:text-platinum-100 leading-snug mb-1 group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                {{ module.title }}
              </h3>
              <p class="text-xs text-platinum-500 dark:text-platinum-600">{{ module.category || 'Standard' }}</p>
              <div class="mt-4 flex justify-end">
                <ArrowRightIcon
                  class="w-4 h-4 text-platinum-400 group-hover:text-calm-lavender-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <div v-if="isFacilitator"
              class="border-2 border-dashed border-slate-200 dark:border-abyss-500 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-50 hover:opacity-80 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 transition-all cursor-pointer min-h-[130px]">
              <PlusIcon class="w-5 h-5 text-platinum-500" />
              <span class="text-xs font-medium text-platinum-500">New Module</span>
            </div>
          </div>

          <!-- Feed Tab -->
          <div v-if="activeTab === 'Feed'" class="animate-in space-y-5">

            <!-- Create Announcement -->
            <div v-if="isFacilitator"
              class="bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 rounded-2xl p-5">
              <div class="flex items-center gap-2.5 mb-4">
                <MegaphoneIcon class="w-4 h-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                <span class="text-sm font-semibold text-slate-700 dark:text-platinum-200">Post Announcement</span>
              </div>
              <input v-model="newAnnouncement.title" placeholder="Announcement title..." class="input-field mb-3" />
              <textarea v-model="newAnnouncement.content" placeholder="Write your message..."
                class="input-field resize-none" rows="3"></textarea>
              <div class="flex items-center justify-between mt-3">
                <select v-model="newAnnouncement.priority" class="input-field w-auto text-sm">
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
                <button @click="createAnnouncement"
                  :disabled="!newAnnouncement.title || !newAnnouncement.content || isCreatingAnnouncement"
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ isCreatingAnnouncement ? 'Posting...' : 'Publish' }}
                </button>
              </div>
            </div>

            <!-- Empty Announcements -->
            <div v-if="announcements.length === 0" class="text-center py-16">
              <MegaphoneIcon class="w-10 h-10 mx-auto text-slate-200 dark:text-abyss-500 mb-3" />
              <p class="text-sm font-medium text-slate-400 dark:text-platinum-600">No announcements yet.</p>
              <p class="text-xs text-platinum-500 mt-1">
                {{ isFacilitator ? 'Create your first announcement above.' : 'Check back later for updates.' }}
              </p>
            </div>

            <!-- Announcement Cards -->
            <div v-for="announcement in announcements" :key="announcement.id" class="announcement-card"
              :class="getAnnouncementClass(announcement.priority)">
              <div class="flex items-start justify-between gap-4">
                <div class="flex items-start gap-3 flex-1">
                  <div class="shrink-0 p-2 rounded-lg" :class="getAnnouncementIconClass(announcement.priority)">
                    <MegaphoneIcon class="w-4 h-4" />
                  </div>
                  <div class="flex-1 space-y-1.5">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span :class="getPriorityBadgeClass(announcement.priority)" class="badge">
                        {{ announcement.priority }}
                      </span>
                      <span class="text-xs text-platinum-500">{{ formatDate(announcement.created_at) }}</span>
                    </div>
                    <h4 class="text-sm font-semibold text-slate-800 dark:text-platinum-100 leading-snug">
                      {{ announcement.title }}
                    </h4>
                    <p class="text-sm text-slate-600 dark:text-platinum-400 leading-relaxed">{{ announcement.content }}
                    </p>
                    <div class="flex items-center gap-2 text-xs text-platinum-500 pt-1">
                      <UserIcon class="w-3 h-3" />
                      <span>{{ announcement.author?.name || 'Facilitator' }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="isFacilitator" class="flex gap-1.5 shrink-0">
                  <button @click="editAnnouncement(announcement)"
                    class="p-1.5 rounded-lg bg-slate-100 dark:bg-abyss-600 hover:bg-calm-lavender-100 dark:hover:bg-calm-lavender-900/30 text-slate-500 hover:text-calm-lavender-600 transition-colors">
                    <PencilIcon class="w-3.5 h-3.5" />
                  </button>
                  <button @click="confirmDeleteAnnouncement(announcement)"
                    class="p-1.5 rounded-lg bg-slate-100 dark:bg-abyss-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-colors">
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- People Tab -->
          <div v-if="activeTab === 'People'" class="animate-in space-y-2">
            <div v-for="student in classroom?.students" :key="student.id"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-abyss-700 transition-colors group">
              <div
                class="avatar-sm group-hover:bg-calm-lavender-100 dark:group-hover:bg-calm-lavender-900/30 transition-colors">
                {{ student.name?.[0] }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-700 dark:text-platinum-200 truncate">{{ student.name }}</p>
                <p class="text-xs text-platinum-500">Active Member</p>
              </div>
            </div>
          </div>

          <!-- Progress Tab -->
          <div v-if="activeTab === 'Progress'" class="animate-in overflow-x-auto custom-scrollbar">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-slate-100 dark:border-abyss-600">
                  <th class="pb-3 pl-2 text-xs font-medium text-platinum-500 uppercase tracking-wider">Member</th>
                  <th class="pb-3 text-xs font-medium text-platinum-500 uppercase tracking-wider">Current Work</th>
                  <th class="pb-3 text-center text-xs font-medium text-platinum-500 uppercase tracking-wider">Score</th>
                  <th class="pb-3 text-right pr-2 text-xs font-medium text-platinum-500 uppercase tracking-wider">Status
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 dark:divide-abyss-600">
                <tr v-for="student in progressData" :key="student.id"
                  class="hover:bg-slate-50 dark:hover:bg-abyss-700 transition-colors">
                  <td class="py-3.5 pl-2 flex items-center gap-3">
                    <div class="avatar-sm">{{ student.name?.[0] }}</div>
                    <span class="text-sm font-medium text-slate-700 dark:text-platinum-200">{{ student.name }}</span>
                  </td>
                  <td class="py-3.5 text-sm text-platinum-500">
                    {{ student.quizAttempts?.[0]?.quiz?.module?.title || '—' }}
                  </td>
                  <td class="py-3.5 text-center font-semibold text-calm-lavender-600 dark:text-calm-lavender-400">
                    {{ student.quizAttempts?.length ? student.quizAttempts[0].score : '—' }}
                  </td>
                  <td class="py-3.5 text-right pr-2">
                    <span class="badge badge-default">Enrolled</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Edit Modal -->
    <Transition name="modal">
      <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal-panel">
          <h3 class="modal-title">Edit Announcement</h3>
          <input v-model="editForm.title" placeholder="Title" class="input-field mb-3" />
          <textarea v-model="editForm.content" placeholder="Content" rows="4" class="input-field mb-3"></textarea>
          <select v-model="editForm.priority" class="input-field mb-5">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <div class="flex gap-2">
            <button @click="showEditModal = false" class="btn-secondary flex-1">Cancel</button>
            <button @click="updateAnnouncement" :disabled="isUpdatingAnnouncement"
              class="btn-primary flex-1 justify-center disabled:opacity-50">
              {{ isUpdatingAnnouncement ? 'Saving...' : 'Update' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Modal -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-panel text-center max-w-sm">
          <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl w-fit mx-auto mb-4">
            <TrashIcon class="w-6 h-6 text-red-500" />
          </div>
          <h3 class="modal-title">Delete Announcement?</h3>
          <p class="text-sm text-platinum-500 mt-1 mb-5">This action cannot be undone.</p>
          <div class="flex gap-2">
            <button @click="showDeleteModal = false" class="btn-secondary flex-1">Cancel</button>
            <button @click="deleteAnnouncement" :disabled="isDeletingAnnouncement"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
              {{ isDeletingAnnouncement ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  School as SchoolIcon,
  BookOpen as BookOpenIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  Plus as PlusIcon,
  Megaphone as MegaphoneIcon,
  Pencil as PencilIcon,
  Trash as TrashIcon,
  User as UserIcon,
  Calendar as CalendarIcon
} from 'lucide-vue-next';
import api from '@/utils/api';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const classroom = ref(null);
const progressData = ref([]);
const activeTab = ref('Modules');

const announcements = ref([]);
const newAnnouncement = ref({ title: '', content: '', priority: 'normal' });
const isCreatingAnnouncement = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editForm = ref({ id: null, title: '', content: '', priority: 'normal' });
const isUpdatingAnnouncement = ref(false);
const isDeletingAnnouncement = ref(false);
const announcementToDelete = ref(null);

const isFacilitator = computed(() => auth.user?.role !== 'player' || classroom.value?.created_by === auth.user?.id);

const availableTabs = computed(() => {
  const tabs = ['Modules', 'Feed', 'People'];
  if (isFacilitator.value) tabs.push('Progress');
  return tabs;
});

const getAnnouncementClass = (priority) => {
  const classes = {
    low: 'bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500',
    normal: 'bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border border-calm-lavender-200 dark:border-calm-lavender-800/40',
    high: 'bg-vawc-orange-50 dark:bg-vawc-orange-900/20 border border-vawc-orange-200 dark:border-vawc-orange-800/40',
    urgent: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40'
  };
  return classes[priority] || classes.normal;
};

const getAnnouncementIconClass = (priority) => {
  const classes = {
    low: 'bg-slate-100 dark:bg-abyss-600 text-platinum-500',
    normal: 'bg-calm-lavender-100 dark:bg-calm-lavender-800/40 text-calm-lavender-600 dark:text-calm-lavender-400',
    high: 'bg-vawc-orange-100 dark:bg-vawc-orange-900/30 text-vawc-orange-600',
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-600'
  };
  return classes[priority] || classes.normal;
};

const getPriorityBadgeClass = (priority) => {
  const classes = {
    low: 'bg-slate-100 dark:bg-abyss-600 text-platinum-600 dark:text-platinum-400',
    normal: 'bg-calm-lavender-100 dark:bg-calm-lavender-900/30 text-calm-lavender-700 dark:text-calm-lavender-400',
    high: 'bg-vawc-orange-100 dark:bg-vawc-orange-900/30 text-vawc-orange-700',
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  };
  return classes[priority] || classes.normal;
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const fetchClassroomDetails = async () => {
  try {
    const classId = route.params.id;
    const res = await api.get(`/api/v1/classrooms/${classId}`);
    classroom.value = res.data.classroom;
  } catch (err) { console.error(err); }
};

const fetchAnnouncements = async () => {
  try {
    const classId = route.params.id;
    const res = await api.get(`/api/v1/classrooms/${classId}/announcements`);
    announcements.value = res.data?.announcements || [];
  } catch (err) { console.error(err); }
};

const createAnnouncement = async () => {
  if (!newAnnouncement.value.title || !newAnnouncement.value.content) return;
  isCreatingAnnouncement.value = true;
  try {
    const classId = route.params.id;
    await api.post(`/api/v1/classrooms/${classId}/announcements`, newAnnouncement.value);
    newAnnouncement.value = { title: '', content: '', priority: 'normal' };
    fetchAnnouncements();
  } catch (err) { console.error(err); }
  finally { isCreatingAnnouncement.value = false; }
};

const editAnnouncement = (announcement) => {
  editForm.value = {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    priority: announcement.priority
  };
  showEditModal.value = true;
};

const updateAnnouncement = async () => {
  isUpdatingAnnouncement.value = true;
  try {
    const classId = route.params.id;
    await api.put(`/api/v1/classrooms/${classId}/announcements/${editForm.value.id}`, editForm.value);
    showEditModal.value = false;
    fetchAnnouncements();
  } catch (err) { console.error(err); }
  finally { isUpdatingAnnouncement.value = false; }
};

const confirmDeleteAnnouncement = (announcement) => {
  announcementToDelete.value = announcement;
  showDeleteModal.value = true;
};

const deleteAnnouncement = async () => {
  if (!announcementToDelete.value) return;
  isDeletingAnnouncement.value = true;
  try {
    const classId = route.params.id;
    await api.delete(`/api/v1/classrooms/${classId}/announcements/${announcementToDelete.value.id}`);
    showDeleteModal.value = false;
    announcementToDelete.value = null;
    fetchAnnouncements();
  } catch (err) { console.error(err); }
  finally { isDeletingAnnouncement.value = false; }
};

const fetchProgressReport = async () => {
  try {
    const classId = route.params.id;
    const res = await api.get(`/api/v1/classrooms/${classId}/progress`);
    progressData.value = res.data.progress;
  } catch (err) { console.error(err); }
};

watch(activeTab, (newTab) => {
  if (newTab === 'Progress' && isFacilitator.value) fetchProgressReport();
  if (newTab === 'Feed') fetchAnnouncements();
});

const handleBack = () => {
router.push({ name: isFacilitator.value ? 'facilitator.classrooms' : 'classrooms.index' });
};

onMounted(() => {
  fetchClassroomDetails();
  fetchAnnouncements();
});
</script>

<style scoped>
@reference "@/style.css";

.page-wrapper {
  @apply text-slate-900 dark:text-white;
}

.card {
  @apply bg-white dark:bg-abyss-600 border border-slate-200 dark:border-abyss-500 rounded-2xl p-5;
}

.section-eyebrow {
  @apply text-xs font-semibold uppercase tracking-widest text-calm-lavender-600 dark:text-calm-lavender-400 mb-0.5;
}

.info-row {
  @apply flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-abyss-700 rounded-xl border border-slate-100 dark:border-abyss-500;
}

.info-label {
  @apply text-xs font-medium text-platinum-500 dark:text-platinum-600;
}

.avatar-sm {
  @apply w-8 h-8 rounded-lg bg-slate-100 dark:bg-abyss-500 border border-slate-200 dark:border-abyss-400 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-platinum-300 uppercase shrink-0;
}

.tab-btn {
  @apply px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150;
}

.tab-btn-active {
  @apply bg-white dark:bg-abyss-500 text-calm-lavender-600 dark:text-calm-lavender-400 border border-slate-200 dark:border-abyss-400;
}

.tab-btn-inactive {
  @apply text-platinum-500 hover:text-slate-700 dark:hover:text-platinum-300;
}

.module-card {
  @apply bg-slate-50 dark:bg-abyss-700 border border-slate-100 dark:border-abyss-500 rounded-2xl p-4 hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50 hover:-translate-y-0.5 transition-all duration-200 flex flex-col;
}

.announcement-card {
  @apply rounded-2xl p-4;
}

.badge {
  @apply px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize;
}

.badge-default {
  @apply bg-slate-100 dark:bg-abyss-600 text-platinum-500 dark:text-platinum-500;
}

.input-field {
  @apply w-full px-3.5 py-2.5 bg-white dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 rounded-xl text-sm text-slate-700 dark:text-platinum-200 placeholder-platinum-400 dark:placeholder-abyss-400 focus:outline-none focus:ring-2 focus:ring-calm-lavender-400/40 focus:border-calm-lavender-400 transition-all;
}

.btn-primary {
  @apply flex items-center gap-2 px-4 py-2.5 rounded-xl bg-calm-lavender-600 hover:bg-calm-lavender-700 dark:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600 text-white font-medium text-sm border border-calm-lavender-700 dark:border-calm-lavender-600 transition-all;
}

.btn-secondary {
  @apply px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-abyss-600 hover:bg-slate-200 dark:hover:bg-abyss-500 text-slate-600 dark:text-platinum-300 font-medium text-sm border border-slate-200 dark:border-abyss-500 transition-all;
}

.modal-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40;
}

.modal-panel {
  @apply relative w-full max-w-lg bg-white dark:bg-abyss-600 border border-slate-200 dark:border-abyss-400 rounded-2xl p-6;
}

.modal-title {
  @apply font-semibold text-base text-slate-800 dark:text-platinum-100 mb-4;
}

.animate-in {
  animation: fadeSlideUp 0.3s ease-out forwards;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply rounded-full bg-slate-200 dark:bg-abyss-500;
}
</style>