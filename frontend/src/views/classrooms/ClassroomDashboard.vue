<template>
    <div class="page-wrapper animate-in">

        <!-- Page Header -->
        <div class="page-header">
            <div class="space-y-1.5">
                <p class="section-eyebrow">Academy Hub</p>
                <h1 class="page-title">
                    My <span class="brand-gradient-text">Classrooms</span>
                </h1>
                <p class="page-subtitle">Your learning spaces, all in one place.</p>
            </div>

            <button @click="isFacilitator ? showCreateModal = true : showJoinModal = true" class="btn-primary">
                <PlusIcon class="w-4 h-4" />
                <span>{{ isFacilitator ? 'Create Classroom' : 'Join Classroom' }}</span>
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="classroomStore.loading" class="loading-center">
            <div class="spinner"></div>
            <p class="loading-text">Loading classrooms...</p>
        </div>

        <!-- Classrooms Grid -->
        <div v-else-if="classroomStore.classrooms.length > 0" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div v-for="classroom in paginatedClassrooms" :key="classroom.id"
                @click="enterClassroom(classroom.id)" class="card card-hover cursor-pointer group">
                <div class="flex items-start gap-4 mb-5">
                    <div
                        class="card-icon-wrap group-hover:bg-calm-lavender-100 dark:group-hover:bg-calm-lavender-900/30 group-hover:border-calm-lavender-300 dark:group-hover:border-calm-lavender-700/50 transition-colors">
                        <SchoolIcon class="w-5 h-5 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                    <div class="flex-1 min-w-0 pt-0.5">
                        <h3
                            class="font-semibold text-sm text-slate-800 dark:text-platinum-100 truncate leading-snug group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                            {{ classroom.name }}
                        </h3>
                        <p class="text-xs text-platinum-600 dark:text-platinum-500 mt-0.5">Active</p>
                    </div>
                </div>

                <div
                    class="mt-auto pt-3 border-t border-slate-100 dark:border-abyss-600 flex items-center justify-between">
                    <span class="text-xs font-medium text-calm-lavender-600 dark:text-calm-lavender-400 truncate">
                        {{ isFacilitator ? classroom.join_code : (classroom.facilitator?.name || 'Authorized Faculty')
                        }}
                    </span>
                    <ArrowRightIcon
                        class="w-4 h-4 text-platinum-400 group-hover:text-calm-lavender-500 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </div>
            </div>
            </div>

            <AppPagination
                v-model="currentPage"
                :total="classroomStore.classrooms.length"
                :page-size="PAGE_SIZE"
                item-label="classrooms"
            />
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
            <div class="empty-state-icon">
                <SchoolIcon class="w-8 h-8 text-platinum-400 dark:text-platinum-600" />
            </div>
            <h3 class="empty-state-title">No classrooms yet</h3>
            <p class="empty-state-desc">
                {{ isFacilitator ? 'Create your first classroom to get started.' :
                'Join a classroom using a code from your teacher.' }}
            </p>
        </div>

        <Teleport to="body"><CreateClassroomModal v-if="showCreateModal" @close="showCreateModal = false" @created="handleCreated" /></Teleport>
        
        <JoinClassroomModal v-if="showJoinModal" @close="showJoinModal = false" @join="handleJoin" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useClassroomStore } from '@/stores/classroom';
import { ArrowRight as ArrowRightIcon, School as SchoolIcon, Plus as PlusIcon } from 'lucide-vue-next';
import CreateClassroomModal from '@/components/classrooms/CreateClassroomModal.vue';
import JoinClassroomModal from '@/components/classrooms/JoinClassroomModal.vue';
import AppPagination from '@/components/ui/AppPagination.vue';

const router = useRouter();
const authStore = useAuthStore();
const classroomStore = useClassroomStore();

const showCreateModal = ref(false);
const showJoinModal = ref(false);

const PAGE_SIZE = 5;
const currentPage = ref(1);

const paginatedClassrooms = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return classroomStore.classrooms.slice(start, start + PAGE_SIZE);
});

watch(() => classroomStore.classrooms.length, () => { currentPage.value = 1; });

const isFacilitator = computed(() => ['admin', 'educator', 'moderator'].includes(authStore.user?.role));

onMounted(async () => {
    await classroomStore.fetchMyClassrooms();
});

const handleCreated = async (formData) => {
    try {
        await classroomStore.createClassroom(formData);
        showCreateModal.value = false;
    } catch (error) { console.error(error); }
};

const handleJoin = async (code) => {
    try {
        await classroomStore.joinClassroom(code);
        showJoinModal.value = false;
    } catch (error) { console.error(error); }
};

const enterClassroom = (id) => {
    const routeName = isFacilitator.value ? 'facilitator.classrooms.show' : 'classrooms.show';
    router.push({ name: routeName, params: { id } });
};
</script>

<style scoped>
@reference "@/style.css";

.page-wrapper {
    @apply space-y-6 text-slate-900 dark:text-white;
}

.page-header {
    @apply flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-6 border-b border-slate-200 dark:border-abyss-600;
}

.page-title {
    @apply font-madimione text-3xl text-slate-800 dark:text-platinum-100 leading-tight;
}

.page-subtitle {
    @apply font-mplusrounded text-sm text-platinum-600 dark:text-platinum-500;
}

.section-eyebrow {
    @apply text-xs font-semibold uppercase tracking-widest text-calm-lavender-600 dark:text-calm-lavender-400;
}

.brand-gradient-text {
    @apply bg-gradient-to-r from-calm-lavender-600 to-neon-pink-500 bg-clip-text text-transparent;
}

.btn-primary {
    @apply flex items-center gap-2 px-5 py-2.5 rounded-xl;
    @apply bg-calm-lavender-600 hover:bg-calm-lavender-700 dark:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600;
    @apply text-white font-medium text-sm;
    @apply border border-calm-lavender-700 dark:border-calm-lavender-600;
    @apply transition-all duration-200 shrink-0;
}

.card {
    @apply bg-white dark:bg-abyss-600 border border-slate-200 dark:border-abyss-500 rounded-2xl p-5;
    @apply flex flex-col;
}

.card-hover {
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/60 hover:-translate-y-0.5 transition-all duration-200;
}

.card-icon-wrap {
    @apply p-2.5 rounded-xl bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border border-calm-lavender-100 dark:border-calm-lavender-800/30 shrink-0;
}

.loading-center {
    @apply flex flex-col items-center justify-center py-32 gap-4;
}

.spinner {
    @apply w-8 h-8 border-2 border-slate-200 dark:border-abyss-500 border-t-calm-lavender-500 rounded-full animate-spin;
}

.loading-text {
    @apply font-mplusrounded text-sm text-platinum-500;
}

.empty-state {
    @apply text-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-abyss-600;
}

.empty-state-icon {
    @apply inline-flex p-4 bg-slate-50 dark:bg-abyss-600 rounded-2xl border border-slate-100 dark:border-abyss-500 mb-4;
}

.empty-state-title {
    @apply font-semibold text-base text-slate-500 dark:text-platinum-500;
}

.empty-state-desc {
    @apply font-mplusrounded text-sm text-platinum-500 dark:text-platinum-600 mt-1.5 max-w-xs mx-auto;
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
</style>