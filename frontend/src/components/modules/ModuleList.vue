<template>
    <div class="space-y-6 font-poppins">

        <div class="toolbar sticky top-4 z-30">

            <!-- Search -->
            <div class="relative flex-1 min-w-0">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon class="h-4 w-4 text-platinum-500 group-focus-within:text-calm-lavender-600 transition-colors" />
                </div>
                <input
                    v-model="localFilters.search"
                    type="text"
                    placeholder="Search modules by title…"
                     class="input-field !pl-11 !py-3 !rounded-xl !border-platinum-200 dark:!border-abyss-500 !bg-platinum-50 dark:!bg-abyss-600 placeholder:!text-platinum-700 dark:placeholder:!text-platinum-400"
                    @input="debouncedSearch"
                />
            </div>

            <!-- Divider -->
            <div class="hidden md:block h-8 w-px bg-platinum-300 dark:bg-abyss-500 shrink-0"></div>

            <!-- Filter selects -->
            <div class="flex items-center gap-2 flex-wrap">

                <!-- Category -->
                <div class="filter-select-wrap">
                    <select
                        v-model="localFilters.category"
                        class="filter-select"
                        @change="applyFilters"
                    >
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
                    <select
                        v-model="localFilters.difficulty_level"
                        class="filter-select"
                        @change="applyFilters"
                    >
                        <option :value="null">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <ChevronDownIcon class="filter-select-icon" />
                </div>

                <!-- Reset -->
                <button
                    v-if="hasActiveFilters"
                    @click="resetFilters"
                    title="Clear filters"
                    class="reset-btn"
                >
                    <XIcon class="w-3.5 h-3.5" />
                    <span>Reset</span>
                </button>

            </div>
        </div>
        <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 animate-fade-in">
            <span
                v-for="(value, key) in activeFiltersDisplay"
                :key="key"
                class="badge badge-lavender !text-xs !px-3 !py-1 capitalize"
            >
                <span class="font-semibold">{{ key }}:</span>&nbsp;{{ value }}
            </span>
        </div>

        <div
            v-if="moduleStore.loading && modules.length === 0"
            class="flex flex-col items-center justify-center py-32 gap-4"
        >
            <div class="spinner"></div>
            <p class="loading-text">Loading modules…</p>
        </div>

        <div
            v-else-if="filteredModules.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
            <ModuleCard
                v-for="module in paginatedModules"
                :key="module.id"
                :module="module"
                @view="viewModule"
                class="hover:-translate-y-0.5 transition-transform duration-200"
            />
        </div>

        <div v-else class="empty-state">
            <div class="empty-state-icon">
                <BookOpenIcon class="w-7 h-7 text-platinum-400" />
            </div>
            <p class="empty-state-title">No Modules Found</p>
            <p class="empty-state-desc">
                No modules match your current filters. Try adjusting or clearing them.
            </p>
            <button
                v-if="hasActiveFilters"
                @click="resetFilters"
                class="mt-5 btn-primary btn-3d mx-auto"
            >
                <XIcon class="w-4 h-4" />
                Clear Filters
            </button>
        </div>

        <AppPagination
            v-model="currentPage"
            :total="filteredModules.length"
            :page-size="PAGE_SIZE"
            item-label="modules"
        />

    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useModuleStore } from '@/stores/module';
import { useAuthStore } from '@/stores/auth';
import ModuleCard from './ModuleCard.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import { Search as SearchIcon, ChevronDown as ChevronDownIcon, X as XIcon, BookOpen as BookOpenIcon } from 'lucide-vue-next';

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

// Client-side filter so pagination works against the full list
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

// ── Pagination ───────────────────────────────────────────────
const PAGE_SIZE = 5;
const currentPage = ref(1);

const paginatedModules = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return filteredModules.value.slice(start, start + PAGE_SIZE);
});

// Reset to page 1 whenever filters change or list length changes
watch(filteredModules, () => { currentPage.value = 1; });

const hasActiveFilters = computed(() => {
    return Object.values(localFilters.value).some(v => v !== null && v !== '');
});

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
    searchTimeout = setTimeout(() => {
        applyFilters();
    }, 500);
};

const applyFilters = () => {
};

const removeFilter = (key) => {
    localFilters.value[key] = key === 'search' ? '' : null;
};

const resetFilters = async () => {
    localFilters.value = {
        search: '',
        category: null,
        difficulty_level: null
    };
    await moduleStore.fetchModules();
};

const viewModule = (id) => {
    const role = authStore.user?.role;
    const isFacilitator = ['admin', 'educator', 'moderator'].includes(role);
    router.push({
        name: isFacilitator ? 'facilitator.modules.detail' : 'ModuleDetail',
        params: { id }
    });
};

const formatLabel = (value) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

onMounted(async () => {
    await moduleStore.fetchModules();
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

.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

.animate-fade-in {
    animation: fadeIn 0.25s ease-out forwards;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Select option colours (browser default override) ─────── */
select option {
    @apply bg-platinum-50 text-abyss-800;
}

.dark select option {
    @apply bg-abyss-600 text-platinum-100;
}
</style>