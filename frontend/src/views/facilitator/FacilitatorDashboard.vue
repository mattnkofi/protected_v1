<template>
    <div class="page-wrapper animate-in">

        <!-- HEADER -->
        <header class="page-header">
            <div class="space-y-1">
                <p class="section-eyebrow">Facilitator Console</p>
                <h1 class="page-title">
                    Welcome, <span class="brand-gradient-text">{{ facilitatorName }}</span>
                </h1>
                <p class="page-subtitle">Manage your classrooms, modules, and student progress.</p>
            </div>

            <router-link :to="{ name: 'facilitator.modules' }" class="btn-primary">
                <PlusIcon class="h-4 w-4" />
                <span>New Module</span>
            </router-link>
        </header>

        <!-- ANNOUNCEMENTS -->
        <div v-if="visibleAnnouncements.length > 0"
            class="card border-2 border-vawc-orange-200 dark:border-vawc-orange-800/40">
            <div class="flex items-center gap-3 mb-5">
                <div
                    class="card-icon-wrap !bg-vawc-orange-50 dark:!bg-vawc-orange-900/20 !border-vawc-orange-100 dark:!border-vawc-orange-800/30">
                    <BellRingIcon class="w-4 h-4 text-vawc-orange-600 dark:text-vawc-orange-400" />
                </div>
                <div>
                    <h3 class="font-bold text-base text-slate-800 dark:text-platinum-100">Announcements</h3>
                    <p class="field-subtext">Recent priority notices from administrators.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="ann in visibleAnnouncements" :key="ann.id" class="item-card group cursor-pointer p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <span :class="[
                            'badge text-xs capitalize',
                            ann.priority === 'urgent' ? 'badge-red' :
                                ann.priority === 'high' ? 'badge-orange' : 'badge-muted'
                        ]">
                            {{ ann.priority || 'Normal' }}
                        </span>
                    </div>
                    <h4
                        class="font-bold text-sm text-slate-800 dark:text-platinum-100 leading-snug mb-1.5 group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                        {{ ann.title }}
                    </h4>
                    <p class="body-subtext line-clamp-2 mb-3">{{ ann.content }}</p>

                    <!-- Date meta footer -->
                    <div class="ann-meta-footer">
                        <div class="flex items-center gap-1.5">
                            <CalendarDaysIcon class="h-3 w-3 shrink-0" />
                            <span>
                                {{ ann.updatedAt && ann.updatedAt !== ann.createdAt
                                    ? 'Updated: ' + formatFullDate(ann.updatedAt)
                                    : 'Posted: ' + formatFullDate(ann.createdAt) }}
                            </span>
                        </div>
                        <div v-if="ann.expires_at" class="flex items-center gap-1.5 ann-expiry">
                            <ClockIcon class="h-3 w-3 shrink-0" />
                            <span>Expires: {{ formatFullDate(ann.expires_at) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- STATS GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <!-- Classrooms Stat -->
            <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                <div class="flex items-center justify-between w-full mb-2">
                    <div class="card-icon-wrap">
                        <SchoolIcon class="h-4 w-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                    <span class="badge badge-lavender text-xs">Sections</span>
                </div>
                <p class="stat-pill-label">Total Classrooms</p>
                <p class="stat-pill-value text-2xl text-slate-800 dark:text-platinum-100">
                    {{ classroomStore.classrooms.length }}
                </p>
            </div>

            <!-- Modules Stat -->
            <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                <div class="flex items-center justify-between w-full mb-2">
                    <div class="card-icon-wrap">
                        <BookOpenIcon class="h-4 w-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                    <span class="badge badge-lavender text-xs">Materials</span>
                </div>
                <p class="stat-pill-label">Total Modules</p>
                <p class="stat-pill-value text-2xl text-slate-800 dark:text-platinum-100">
                    {{ dashboardStats.total_modules }}
                </p>
            </div>

            <!-- Students Stat -->
            <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                <div class="flex items-center justify-between w-full mb-2">
                    <div class="card-icon-wrap">
                        <UsersIcon class="h-4 w-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                    <span class="badge badge-lavender text-xs">Learners</span>
                </div>
                <p class="stat-pill-label">Total Students</p>
                <p class="stat-pill-value text-2xl text-slate-800 dark:text-platinum-100">{{ dashboardStats.total_students }}</p>
            </div>

            <!-- Rewards Shop Link -->
            <div class="card card-hover cursor-pointer group border-2 border-calm-lavender-200 dark:border-calm-lavender-800/40 flex flex-col justify-between"
                @click="router.push({ name: 'facilitator.rewards' })">
                <div class="flex items-center justify-between mb-3">
                    <div class="card-icon-wrap">
                        <GiftIcon class="h-4 w-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                    <ArrowUpRightIcon
                        class="h-4 w-4 text-platinum-400 group-hover:text-calm-lavender-500 transition-colors" />
                </div>
                <div>
                    <p class="stat-pill-label">Gamification</p>
                    <p class="font-bold text-base text-slate-800 dark:text-platinum-100 mt-0.5">Rewards Shop</p>
                    <p class="field-subtext mt-1">Manage points and items for students.</p>
                </div>
            </div>

        </div>

        <!-- MAIN LAYOUT: Classrooms & Modules -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            <!-- LEFT: My Classrooms -->
            <div class="card border-2 border-platinum-200 dark:border-abyss-500">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h3 class="font-bold text-base text-slate-800 dark:text-platinum-100">My Classrooms</h3>
                        <p class="field-subtext">Your currently assigned sections.</p>
                    </div>
                    <router-link :to="{ name: 'facilitator.classrooms' }" class="btn-secondary !text-xs !px-3 !py-2">
                        View All
                    </router-link>
                </div>

                <!-- Loading -->
                <div v-if="classroomStore.loading" class="space-y-3">
                    <div v-for="i in 3" :key="i" class="h-16 bg-slate-100 dark:bg-abyss-700 rounded-xl animate-pulse">
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else-if="classroomStore.classrooms.length === 0" class="empty-state">
                    <div class="empty-state-icon">
                        <SchoolIcon class="w-7 h-7 text-platinum-400" />
                    </div>
                    <p class="empty-state-title">No Classrooms Yet</p>
                    <p class="empty-state-desc">You haven't created any classrooms. Start by adding one.</p>
                    <button @click="showCreateModal = true" class="mt-4 btn-primary mx-auto">
                        Create a Classroom
                    </button>
                </div>

                <!-- Classroom List -->
                <div v-else class="space-y-2">
                    <div v-for="classroom in classroomStore.classrooms.slice(0, 4)" :key="classroom.id"
                        @click="router.push({ name: 'facilitator.classrooms.show', params: { id: classroom.id } })"
                        class="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 cursor-pointer group transition-all duration-200">

                        <div
                            class="avatar-md !bg-calm-lavender-100 dark:!bg-calm-lavender-900/30 !text-calm-lavender-700 dark:!text-calm-lavender-300 !border-calm-lavender-200 dark:!border-calm-lavender-800/40">
                            {{ classroom.section_name?.charAt(0) || 'C' }}
                        </div>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <h4
                                    class="font-semibold text-sm text-slate-800 dark:text-platinum-100 truncate group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                    {{ classroom.section_name }}
                                </h4>
                                <span class="badge badge-muted text-xs">{{ classroom.join_code }}</span>
                            </div>
                            <p class="field-subtext line-clamp-1 mt-0.5">
                                {{ classroom.description || 'No description provided.' }}
                            </p>
                        </div>

                        <UsersIcon
                            class="w-4 h-4 text-platinum-400 shrink-0 group-hover:text-calm-lavender-500 transition-colors" />
                    </div>
                </div>
            </div>

            <!-- RIGHT: Recent Modules -->
            <div class="card border-2 border-platinum-200 dark:border-abyss-500">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h3 class="font-bold text-base text-slate-800 dark:text-platinum-100">Recent Modules</h3>
                        <p class="field-subtext">Your most recently added learning materials.</p>
                    </div>
                    <router-link :to="{ name: 'facilitator.modules' }" class="btn-secondary !text-xs !px-3 !py-2">
                        Manage All
                    </router-link>
                </div>

                <!-- Loading -->
                <div v-if="moduleStore.loading" class="space-y-3">
                    <div v-for="i in 3" :key="i" class="h-16 bg-slate-100 dark:bg-abyss-700 rounded-xl animate-pulse">
                    </div>
                </div>

                <!-- Empty State -->
                <div v-else-if="moduleStore.modules.length === 0" class="empty-state">
                    <div class="empty-state-icon">
                        <BookOpenIcon class="w-7 h-7 text-platinum-400" />
                    </div>
                    <p class="empty-state-title">No Modules Found</p>
                    <p class="empty-state-desc">Create your first module to get started.</p>
                    <button @click="router.push({ name: 'facilitator.modules' })" class="mt-4 btn-primary mx-auto">
                        Create Content
                    </button>
                </div>

                <!-- Module List -->
                <div v-else class="space-y-2">
                    <div v-for="mod in moduleStore.modules.slice(0, 5)" :key="mod.id"
                        @click="router.push({ name: 'facilitator.modules.detail', params: { id: mod.id } })"
                        class="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 cursor-pointer group transition-all duration-200">

                        <div
                            class="avatar-md !bg-calm-lavender-100 dark:!bg-calm-lavender-900/30 !text-calm-lavender-700 dark:!text-calm-lavender-300 !border-calm-lavender-200 dark:!border-calm-lavender-800/40">
                            <FileTextIcon class="w-4 h-4" />
                        </div>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <h4
                                    class="font-semibold text-sm text-slate-800 dark:text-platinum-100 truncate group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                    {{ mod.title }}
                                </h4>
                                <span v-if="mod.is_published"
                                    class="w-2 h-2 rounded-full bg-safety-teal-500 shrink-0"></span>
                                <span v-else
                                    class="w-2 h-2 rounded-full bg-platinum-300 dark:bg-abyss-400 shrink-0"></span>
                            </div>
                            <p class="field-subtext line-clamp-1 mt-0.5">{{ mod.description }}</p>
                        </div>

                        <span class="badge badge-muted text-xs shrink-0 hidden sm:inline-flex">
                            {{ mod.difficulty_level || 'General' }}
                        </span>
                    </div>
                </div>
            </div>

        </div>
<CreateClassroomModal
    v-if="showCreateModal"
    :loading="isCreating"
    @close="showCreateModal = false"
    @created="handleClassroomCreated"
/>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useClassroomStore } from '@/stores/classroom';
import { useModuleStore } from '@/stores/module';
import CreateClassroomModal from '@/components/classrooms/CreateClassroomModal.vue';
import { useToast } from '@/utils/useToast';
import api from '@/utils/api';
import {
    PlusIcon,
    UsersIcon,
    BookOpenIcon,
    School as SchoolIcon,
    Clock as ClockIcon,
    CalendarDays as CalendarDaysIcon,
    FileTextIcon,
    BellRing as BellRingIcon,
    GiftIcon,
    ArrowUpRightIcon
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const classroomStore = useClassroomStore();
const moduleStore = useModuleStore();

const showCreateModal = ref(false);
const isCreating = ref(false);
const toast = useToast();

const facilitatorName = computed(() => authStore.user?.name?.split(' ')[0] || 'Facilitator');
const announcements = ref([]);

// Reactive clock — ticks every 60s so expired announcements disappear without a reload
const now = ref(new Date());
let refreshTimer = null;

// Only surface active, non-expired announcements; re-evaluates automatically via `now`
const visibleAnnouncements = computed(() =>
    announcements.value.filter(ann => {
        if (ann.status !== 'active') return false;
        if (ann.expires_at && new Date(ann.expires_at) <= now.value) return false;
        return true;
    })
);

// Dashboard stats (modules, classrooms, students)
const dashboardStats = ref({ total_modules: 0, total_classrooms: 0, total_students: 0 });

const fetchDashboardStats = async () => {
    try {
        const res = await api.get('/api/v1/facilitators/dashboard-stats');
        dashboardStats.value = res.data.stats;
    } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
    }
};

/**
 * Full absolute date — used for Posted/Updated/Expires labels
 * Matches UserDashboard's formatFullDate exactly
 */
const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
    });
};

const fetchAnnouncements = async () => {
    try {
        const res = await api.get('/api/v1/notifications/announcements');
        // Store raw — filtering is handled reactively by visibleAnnouncements computed
        announcements.value = res.data.announcements || [];
    } catch (err) {
        console.error('Failed to fetch announcements:', err);
    }
};

const handleClassroomCreated = async (formData) => {
    isCreating.value = true;
    try {
        await classroomStore.createClassroom(formData);
        showCreateModal.value = false;
        toast.success('Classroom created successfully!');
        await classroomStore.fetchMyClassrooms();
    } catch (err) {
        toast.error('Failed to create classroom.');
    } finally {
        isCreating.value = false;
    }
};

onMounted(async () => {
    await Promise.all([
        classroomStore.fetchMyClassrooms(),
        moduleStore.fetchModules({ limit: 5 }),
        fetchDashboardStats(),
        fetchAnnouncements()
    ]);
    // Tick every 60s so visibleAnnouncements re-evaluates expired items without a reload
    refreshTimer = setInterval(() => { now.value = new Date(); }, 60_000);
});

onUnmounted(() => {
    clearInterval(refreshTimer);
});
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   ANNOUNCEMENT META FOOTER
═══════════════════════════════════════════════════════════ */
.ann-meta-footer {
    @apply flex flex-col gap-1 pt-3;
    @apply border-t border-vawc-orange-200 dark:border-vawc-orange-500/20;
    @apply font-poppins text-xs text-platinum-500 dark:text-platinum-500;
}

.ann-expiry {
    @apply text-vawc-orange-500 dark:text-vawc-orange-400;
}
</style>
