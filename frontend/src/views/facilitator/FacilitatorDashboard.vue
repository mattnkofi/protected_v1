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
        <div v-if="announcements && announcements.length > 0"
            class="card border-2 border-vawc-orange-200 dark:border-vawc-orange-800/40">
            <div class="flex items-center gap-3 mb-5">
                <div class="card-icon-wrap !bg-vawc-orange-50 dark:!bg-vawc-orange-900/20 !border-vawc-orange-100 dark:!border-vawc-orange-800/30">
                    <BellRingIcon class="w-4 h-4 text-vawc-orange-600 dark:text-vawc-orange-400" />
                </div>
                <div>
                    <h3 class="font-bold text-base text-slate-800 dark:text-platinum-100">Announcements</h3>
                    <p class="field-subtext">Recent priority notices from administrators.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="ann in announcements" :key="ann.id"
                    class="item-card group cursor-pointer p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <span :class="[
                            'badge text-xs',
                            ann.priority === 'urgent' ? 'badge-red' :
                            ann.priority === 'high' ? 'badge-orange' : 'badge-muted'
                        ]">
                            {{ ann.priority }}
                        </span>
                        <span class="field-subtext ml-auto">{{ formatTimeAgo(ann.created_at) }}</span>
                    </div>
                    <h4 class="font-bold text-sm text-slate-800 dark:text-platinum-100 leading-snug mb-1.5 group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                        {{ ann.title }}
                    </h4>
                    <p class="body-subtext line-clamp-2">{{ ann.content }}</p>
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
                    {{ moduleStore.pagination.total || moduleStore.modules.length }}
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
                <p class="stat-pill-value text-2xl text-slate-800 dark:text-platinum-100">--</p>
            </div>

            <!-- Rewards Shop Link -->
            <div class="card card-hover cursor-pointer group border-2 border-calm-lavender-200 dark:border-calm-lavender-800/40 flex flex-col justify-between"
                @click="router.push({ name: 'facilitator.rewards' })">
                <div class="flex items-center justify-between mb-3">
                    <div class="card-icon-wrap">
                        <GiftIcon class="h-4 w-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                    <ArrowUpRightIcon class="h-4 w-4 text-platinum-400 group-hover:text-calm-lavender-500 transition-colors" />
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
                    <div v-for="i in 3" :key="i"
                        class="h-16 bg-slate-100 dark:bg-abyss-700 rounded-xl animate-pulse"></div>
                </div>

                <!-- Empty State -->
                <div v-else-if="classroomStore.classrooms.length === 0" class="empty-state">
                    <div class="empty-state-icon">
                        <SchoolIcon class="w-7 h-7 text-platinum-400" />
                    </div>
                    <p class="empty-state-title">No Classrooms Yet</p>
                    <p class="empty-state-desc">You haven't created any classrooms. Start by adding one.</p>
                    <button @click="router.push({ name: 'facilitator.classrooms.create' })"
                        class="mt-4 btn-primary mx-auto">
                        Create a Classroom
                    </button>
                </div>

                <!-- Classroom List -->
                <div v-else class="space-y-2">
                    <div v-for="classroom in classroomStore.classrooms.slice(0, 4)" :key="classroom.id"
                        @click="router.push({ name: 'facilitator.classrooms.show', params: { id: classroom.id } })"
                        class="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 cursor-pointer group transition-all duration-200">

                        <div class="avatar-md !bg-calm-lavender-100 dark:!bg-calm-lavender-900/30 !text-calm-lavender-700 dark:!text-calm-lavender-300 !border-calm-lavender-200 dark:!border-calm-lavender-800/40">
                            {{ classroom.section_name?.charAt(0) || 'C' }}
                        </div>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <h4 class="font-semibold text-sm text-slate-800 dark:text-platinum-100 truncate group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                    {{ classroom.section_name }}
                                </h4>
                                <span class="badge badge-muted text-xs">{{ classroom.join_code }}</span>
                            </div>
                            <p class="field-subtext line-clamp-1 mt-0.5">
                                {{ classroom.description || 'No description provided.' }}
                            </p>
                        </div>

                        <UsersIcon class="w-4 h-4 text-platinum-400 shrink-0 group-hover:text-calm-lavender-500 transition-colors" />
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
                    <div v-for="i in 3" :key="i"
                        class="h-16 bg-slate-100 dark:bg-abyss-700 rounded-xl animate-pulse"></div>
                </div>

                <!-- Empty State -->
                <div v-else-if="moduleStore.modules.length === 0" class="empty-state">
                    <div class="empty-state-icon">
                        <BookOpenIcon class="w-7 h-7 text-platinum-400" />
                    </div>
                    <p class="empty-state-title">No Modules Found</p>
                    <p class="empty-state-desc">Create your first module to get started.</p>
                    <button @click="router.push({ name: 'facilitator.modules' })"
                        class="mt-4 btn-primary mx-auto">
                        Create Content
                    </button>
                </div>

                <!-- Module List -->
                <div v-else class="space-y-2">
                    <div v-for="mod in moduleStore.modules.slice(0, 5)" :key="mod.id"
                        @click="router.push({ name: 'facilitator.module.detail', params: { id: mod.id } })"
                        class="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 cursor-pointer group transition-all duration-200">

                        <div class="avatar-md !bg-calm-lavender-100 dark:!bg-calm-lavender-900/30 !text-calm-lavender-700 dark:!text-calm-lavender-300 !border-calm-lavender-200 dark:!border-calm-lavender-800/40">
                            <FileTextIcon class="w-4 h-4" />
                        </div>

                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <h4 class="font-semibold text-sm text-slate-800 dark:text-platinum-100 truncate group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
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

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useClassroomStore } from '@/stores/classroom';
import { useModuleStore } from '@/stores/module';
import api from '@/utils/api';
import {
    PlusIcon,
    UsersIcon,
    BookOpenIcon,
    School as SchoolIcon,
    ClockIcon,
    FileTextIcon,
    BellRing as BellRingIcon,
    GiftIcon,
    ArrowUpRightIcon
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const classroomStore = useClassroomStore();
const moduleStore = useModuleStore();

const facilitatorName = computed(() => authStore.user?.name?.split(' ')[0] || 'Facilitator');
const announcements = ref([]);

const fetchAnnouncements = async () => {
    try {
        const res = await api.get('/api/v1/notifications/announcements');
        announcements.value = res.data.announcements || [];
    } catch (err) {
        console.error('Failed to fetch announcements:', err);
    }
};

const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
};

onMounted(async () => {
    await Promise.all([
        classroomStore.fetchMyClassrooms(),
        moduleStore.fetchModules({ limit: 5 }), // Fetch recent 5 modules
        fetchAnnouncements()
    ]);
});
</script>

<style scoped>
@reference "@/style.css";
</style>