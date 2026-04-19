<template>
    <div class="space-y-6 font-poppins">

        <div class="toolbar sticky top-4 z-30">

            <!-- Search -->
            <div class="relative flex-1 min-w-0">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon
                        class="h-4 w-4 text-platinum-500 group-focus-within:text-calm-lavender-600 transition-colors" />
                </div>
                <input v-model="localFilters.search" type="text" placeholder="Search modules by title…"
                    class="input-field !pl-11 !py-3 !rounded-xl !border-platinum-200 dark:!border-abyss-500 !bg-platinum-50 dark:!bg-abyss-600 placeholder:!text-platinum-700 dark:placeholder:!text-platinum-400"
                    @input="debouncedSearch" />
            </div>

            <!-- Divider -->
            <div class="hidden md:block h-8 w-px bg-platinum-300 dark:bg-abyss-500 shrink-0"></div>

            <!-- Filter selects -->
            <div class="flex items-center gap-2 flex-wrap">

                <!-- Category -->
                <div class="filter-select-wrap">
                    <select v-model="localFilters.category" class="filter-select" @change="applyFilters">
                        <option :value="null">All Types</option>
                        <option value="gad">Institutional</option>
                        <option value="sexual_health">Health</option>
                        <option value="vawc">Safety</option>
                        <option value="general">Standard</option>
                    </select>
                    <ChevronDownIcon class="filter-select-icon" />
                </div>

                <!-- Difficulty -->
                <div class="filter-select-wrap">
                    <select v-model="localFilters.difficulty_level" class="filter-select" @change="applyFilters">
                        <option :value="null">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <ChevronDownIcon class="filter-select-icon" />
                </div>

                <!-- Reset -->
                <button v-if="hasActiveFilters" @click="resetFilters" title="Clear filters" class="reset-btn">
                    <XIcon class="w-3.5 h-3.5" />
                    <span>Reset</span>
                </button>

            </div>
        </div>

        <!-- Active filter badges -->
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 animate-fade-in">
            <span v-for="(value, key) in activeFiltersDisplay" :key="key"
                class="badge badge-lavender !text-xs !px-3 !py-1 capitalize">
                <span class="font-semibold">{{ key }}:</span>&nbsp;{{ value }}
            </span>
        </div>

        <!-- Loading state -->
        <div v-if="moduleStore.loading && modules.length === 0"
            class="flex flex-col items-center justify-center py-32 gap-4">
            <div class="spinner"></div>
            <p class="loading-text">Loading modules…</p>
        </div>

        <div v-else-if="filteredModules.length > 0" class="space-y-8">

            <!-- Public Modules Section -->
            <section v-if="publicModules.length > 0">
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-safety-teal-50 dark:bg-safety-teal-900/20 border-2 border-safety-teal-200 dark:border-safety-teal-800/40">
                        <GlobeIcon class="w-3.5 h-3.5 text-safety-teal-600 dark:text-safety-teal-400" />
                        <span
                            class="text-xs font-bold uppercase tracking-widest text-safety-teal-700 dark:text-safety-teal-400">Public
                            Access</span>
                    </div>
                    <span class="text-xs font-medium text-platinum-500">
                        {{ publicModules.length }} module{{ publicModules.length !== 1 ? 's' : '' }}
                    </span>
                    <div class="flex-1 h-px bg-platinum-200 dark:bg-abyss-600"></div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    <ModuleCard v-for="module in visibleModules(publicModules, 'public')" :key="module.id"
                        :module="module" @view="viewModule"
                        class="hover:-translate-y-0.5 transition-transform duration-200" />
                </div>

                <!-- Show more / Show less -->
                <div class="flex justify-end">
                    <button v-if="publicModules.length > SECTION_LIMIT" @click="toggleExpand('public')"
                        class="show-more-btn">
                        <span v-if="isExpanded('public')">
                            <ChevronUpIcon class="w-3.5 h-3.5" />
                            Show less
                        </span>
                        <span v-else>
                            <ChevronDownIcon class="w-3.5 h-3.5" />
                            Show all {{ publicModules.length }} modules
                        </span>
                    </button>
                </div>
            </section>

            <!-- Classroom Modules — grouped per classroom, collapsible -->
            <section v-for="group in classroomGroups" :key="group.classroomName">

                <!-- Clickable group header -->
                <button type="button" @click="toggleGroup(group.classroomName)"
                    class="group/header flex items-center gap-3 mb-4 w-full text-left focus:outline-none">
                    <!-- Chevron rotates when expanded -->
                    <ChevronRightIcon
                        class="w-4 h-4 text-calm-lavender-500 dark:text-calm-lavender-400 shrink-0 transition-transform duration-200"
                        :class="{ 'rotate-90': !isCollapsed(group.classroomName) }" />

                    <!-- Classroom badge -->
                    <div
                        class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border-2 border-calm-lavender-200 dark:border-calm-lavender-800/40 group-hover/header:border-calm-lavender-400 dark:group-hover/header:border-calm-lavender-600 transition-colors">
                        <LockIcon class="w-3.5 h-3.5 text-calm-lavender-600 dark:text-calm-lavender-400" />
                        <span
                            class="text-xs font-bold uppercase tracking-widest text-calm-lavender-700 dark:text-calm-lavender-400">
                            {{ group.classroomName }}
                        </span>
                        <span
                            class="font-mono text-xs font-semibold text-calm-lavender-500 dark:text-calm-lavender-500 tracking-widest border border-calm-lavender-200 dark:border-calm-lavender-800/40 px-1.5 py-0.5 rounded-lg">
                            {{ group.joinCode }}
                        </span>
                    </div>

                    <span class="text-xs font-medium text-platinum-500">
                        {{ group.modules.length }} module{{ group.modules.length !== 1 ? 's' : '' }}
                    </span>

                    <!-- Hint shown only while collapsed -->
                    <span v-if="isCollapsed(group.classroomName)"
                        class="text-xs text-platinum-400 dark:text-platinum-600 italic">
                        — click to expand
                    </span>

                    <div class="flex-1 h-px bg-platinum-200 dark:bg-abyss-600"></div>
                </button>

                <!-- Collapsible grid with CSS height transition -->
                <Transition name="group-collapse" @enter="onGroupEnter" @after-enter="onGroupAfterEnter"
                    @leave="onGroupLeave">
                    <div v-show="!isCollapsed(group.classroomName)" class="overflow-hidden">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-2">
                            <ModuleCard v-for="module in visibleModules(group.modules, group.classroomName)"
                                :key="module.id" :module="module" @view="viewModule"
                                class="hover:-translate-y-0.5 transition-transform duration-200" />
                        </div>

                        <!-- Show more / Show less -->
                        <div class="flex justify-end">
                            <button v-if="group.modules.length > SECTION_LIMIT"
                                @click.stop="toggleExpand(group.classroomName)" class="show-more-btn">
                                <span v-if="isExpanded(group.classroomName)" class="flex items-center gap-1.5">
                                    <ChevronUpIcon class="w-3.5 h-3.5" />
                                    Show less
                                </span>
                                <span v-else class="flex items-center gap-1.5">
                                    <ChevronDownIcon class="w-3.5 h-3.5" />
                                    Show all {{ group.modules.length }} modules
                                </span>
                            </button>
                        </div>
                    </div>
                </Transition>

            </section>

        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
            <div class="empty-state-icon">
                <BookOpenIcon class="w-7 h-7 text-platinum-400" />
            </div>
            <p class="empty-state-title">No Modules Found</p>
            <p class="empty-state-desc">
                No modules match your current filters. Try adjusting or clearing them.
            </p>
            <button v-if="hasActiveFilters" @click="resetFilters" class="mt-5 btn-primary btn-3d mx-auto">
                <XIcon class="w-4 h-4" />
                Clear Filters
            </button>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useModuleStore } from '@/stores/module';
import { useAuthStore } from '@/stores/auth';
import ModuleCard from './ModuleCard.vue';
import {
    Search as SearchIcon,
    ChevronDown as ChevronDownIcon,
    ChevronUp as ChevronUpIcon,
    ChevronRight as ChevronRightIcon,
    X as XIcon,
    BookOpen as BookOpenIcon,
    Globe as GlobeIcon,
    Lock as LockIcon
} from 'lucide-vue-next';

const router = useRouter();
const moduleStore = useModuleStore();
const authStore = useAuthStore();

const localFilters = ref({
    search: '',
    category: null,
    difficulty_level: null
});

// ── All modules from store ───────────────────────────────────
const modules = computed(() => moduleStore.modules);

// Client-side filtering
const filteredModules = computed(() => {
    let list = modules.value;
    const { search, category, difficulty_level } = localFilters.value;
    if (search) {
        const q = search.toLowerCase();
        list = list.filter(m => m.title?.toLowerCase().includes(q));
    }
    if (category) list = list.filter(m => m.category === category);
    if (difficulty_level) list = list.filter(m => m.difficulty_level === difficulty_level);
    return list;
});

// ── Grouped by classroom ─────────────────────────────────────
const publicModules = computed(() =>
    filteredModules.value.filter(m => !m.classroom_id)
);

const classroomGroups = computed(() => {
    const classroomModules = filteredModules.value.filter(m => m.classroom_id);
    const map = new Map();
    for (const mod of classroomModules) {
        const cid = mod.classroom_id;
        if (!map.has(cid)) {
            map.set(cid, {
                classroom_id: cid,
                classroomName: mod.classroom?.name || mod.classroom?.section_name || `Classroom ${cid}`,
                joinCode: mod.classroom?.join_code || '',
                modules: []
            });
        }
        map.get(cid).modules.push(mod);
    }
    return [...map.values()];
});

// ── Collapsible classroom groups ─────────────────────────────
const collapsedGroups = ref(new Set());

const toggleGroup = (classroomName) => {
    const next = new Set(collapsedGroups.value);
    if (next.has(classroomName)) next.delete(classroomName);
    else next.add(classroomName);
    collapsedGroups.value = next;
};

const isCollapsed = (classroomName) => collapsedGroups.value.has(classroomName);

// ── Transition hooks ─────────────────────────────────────────
const onGroupEnter = (el) => { el.style.height = el.scrollHeight + 'px'; };
const onGroupAfterEnter = (el) => { el.style.height = 'auto'; };
const onGroupLeave = (el) => {
    el.style.height = el.scrollHeight + 'px';
    window.requestAnimationFrame(() => { el.style.height = '0'; });
};

// ── Per-section Show More ────────────────────────────────────
const SECTION_LIMIT = 3;
const expandedSections = ref(new Set());

const toggleExpand = (key) => {
    const next = new Set(expandedSections.value);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    expandedSections.value = next;
};

const isExpanded = (key) => expandedSections.value.has(key);

const visibleModules = (moduleList, key) =>
    isExpanded(key) ? moduleList : moduleList.slice(0, SECTION_LIMIT);

// ── Filters ──────────────────────────────────────────────────
const hasActiveFilters = computed(() =>
    Object.values(localFilters.value).some(v => v !== null && v !== '')
);

const activeFiltersDisplay = computed(() => {
    const display = {};
    if (localFilters.value.search) display.search = `Query: "${localFilters.value.search}"`;
    if (localFilters.value.category) display.category = `Type: ${formatLabel(localFilters.value.category)}`;
    if (localFilters.value.difficulty_level) display.difficulty_level = `Level: ${formatLabel(localFilters.value.difficulty_level)}`;
    return display;
});

let searchTimeout;
const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => applyFilters(), 500);
};

const applyFilters = () => { };

const resetFilters = () => {
    localFilters.value = { search: '', category: null, difficulty_level: null };
};

// ── Navigation ───────────────────────────────────────────────
const viewModule = (id) => {
    const role = authStore.user?.role;
    const isFacilitator = ['facilitator', 'educator', 'moderator', 'admin'].includes(role);
    router.push({
        name: isFacilitator ? 'facilitator.modules.detail' : 'user.module.detail',
        params: { id }
    });
};

const formatLabel = (value) =>
    value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// ── Init ─────────────────────────────────────────────────────
onMounted(async () => {
    await moduleStore.fetchModules({ all_accessible: true, include_classroom: true, limit: 100 });
});
</script>

<style scoped>
@reference "@/style.css";

.toolbar {
    @apply flex flex-col md:flex-row items-stretch md:items-center gap-3;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl px-4 py-3;
}

.filter-select-wrap {
    @apply relative shrink-0;
}

.filter-select {
    @apply appearance-none cursor-pointer transition-all duration-150;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply text-abyss-800 dark:text-platinum-200;
    @apply font-medium text-sm;
    @apply rounded-xl py-2.5 pl-4 pr-9;
    @apply focus:outline-none focus:ring-2 focus:ring-calm-lavender-400/40 focus:border-calm-lavender-400;
}

.filter-select-icon {
    @apply absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none;
    @apply w-3.5 h-3.5 text-platinum-500 dark:text-platinum-400;
}

.reset-btn {
    @apply inline-flex items-center gap-1.5 shrink-0;
    @apply px-3 py-2.5 rounded-xl;
    @apply font-medium text-sm;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply text-platinum-700 dark:text-platinum-300;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply border-b-4 border-b-platinum-400 dark:border-b-abyss-400;
    @apply hover:bg-calm-lavender-50 dark:hover:bg-calm-lavender-900/20;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply hover:text-calm-lavender-700 dark:hover:text-calm-lavender-400;
    @apply active:border-b-2 active:translate-y-px;
    @apply transition-all duration-150;
}

.show-more-btn {
    @apply mt-4 flex items-center gap-1.5;
    @apply text-sm font-semibold;
    @apply text-calm-lavender-500 dark:text-calm-lavender-400;
    @apply hover:text-calm-lavender-400 dark:hover:text-calm-lavender-300;
    @apply transition-colors duration-150;
}

.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

.animate-fade-in {
    animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(6px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

select option {
    @apply bg-platinum-50 text-abyss-800;
}

.dark select option {
    @apply bg-abyss-600 text-platinum-100;
}

/* ── Classroom group collapse transition ──────────────────── */
.group-collapse-enter-active,
.group-collapse-leave-active {
    transition: height 0.25s ease, opacity 0.25s ease;
    overflow: hidden;
}

.group-collapse-enter-from,
.group-collapse-leave-to {
    height: 0 !important;
    opacity: 0;
}
</style>
