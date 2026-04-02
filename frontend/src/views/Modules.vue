<template>
  <div class="page-wrapper animate-in">

    <!-- Page Header -->
    <div class="page-header">
      <div class="space-y-1.5">
        <p class="section-eyebrow">Knowledge Base</p>
        <h1 class="page-title">
          Learning <span class="brand-gradient-text">Library</span>
        </h1>
        <p class="page-subtitle">Explore modules curated for your growth and awareness.</p>
      </div>

      <div class="flex items-center gap-4">
        <!-- Stats -->
        <div v-if="stats"
          class="hidden md:flex items-center gap-5 pr-5 border-r border-platinum-200 dark:border-abyss-500">
          <div class="text-right">
            <p class="stat-pill-label">Total Units</p>
            <p class="stat-value">{{ stats.total_modules || 0 }}</p>
          </div>
          <div class="text-right">
            <p class="stat-pill-label">Total Reads</p>
            <p class="stat-value">{{ stats.total_views || 0 }}</p>
          </div>
        </div>

        <button v-if="canManageModules" @click="showCreateModal = true" class="btn-primary">
          <PlusIcon class="w-4 h-4" />
          <span>New Module</span>
        </button>
      </div>
    </div>

    <!-- Featured Section -->
    <section v-if="featuredModules?.length > 0" class="space-y-5">
      <h2 class="section-eyebrow">Featured</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="module in featuredModules" :key="module.id"
          @click="viewModule(module.id)"
          class="card card-hover cursor-pointer group flex flex-col justify-between gap-5">

          <div class="flex items-start justify-between">
            <div class="card-icon-wrap !p-3">
              <BookOpenIcon class="w-5 h-5 text-calm-lavender-600 dark:text-calm-lavender-400" />
            </div>
            <span class="badge badge-lavender">Featured</span>
          </div>

          <div>
            <h3 class="featured-title group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
              {{ module.title }}
            </h3>
            <p class="featured-category">{{ module.category || 'Standard' }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- All Modules Section -->
    <section class="space-y-5">
      <h2 class="section-eyebrow">All Modules</h2>
      <div class="min-h-[400px]">
        <ModuleList />
      </div>
    </section>

    <Teleport to="body"><CreateModuleModal v-if="showCreateModal" @saved="handleModuleCreated" @cancel="showCreateModal = false" /></Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useModuleStore } from '@/stores/module';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/utils/useToast';
import { PlusIcon, BookOpenIcon } from 'lucide-vue-next';
import ModuleList from '@/components/modules/ModuleList.vue';
import CreateModuleModal from '@/components/modules/CreateModuleModal.vue';

const router = useRouter();
const moduleStore = useModuleStore();
const authStore = useAuthStore();
const toast = useToast();

const showCreateModal = ref(false);
const featuredModules = computed(() => moduleStore.featuredModules);
const stats = computed(() => moduleStore.stats);

const canManageModules = computed(() => {
  return ['admin', 'educator', 'moderator'].includes(authStore.user?.role);
});

const viewModule = (id) => {
  const role = authStore.user?.role;
  const isFacilitator = ['admin', 'educator', 'moderator'].includes(role);
  router.push({
      name: isFacilitator ? 'facilitator.modules.detail' : 'ModuleDetail',
      params: { id }
  });
};

const handleModuleCreated = async () => {
  showCreateModal.value = false;
  toast.success('Module created successfully.');
  await moduleStore.fetchModules();
  await moduleStore.fetchFeaturedModules();
  if (canManageModules.value) {
    await moduleStore.fetchStats();
  }
};

onMounted(async () => {
  const promises = [moduleStore.fetchFeaturedModules()];
  if (canManageModules.value) {
    promises.push(moduleStore.fetchStats());
  }
  await Promise.all(promises).catch(err => {
    console.error("Archive Link Failure:", err);
  });
});
</script>

<style scoped>
@reference "@/style.css";

/* ── Typography scale-up ── */

/* Eyebrow labels: xs → sm */
.section-eyebrow {
  @apply text-sm font-semibold uppercase tracking-widest text-calm-lavender-600 dark:text-calm-lavender-400;
}

/* Page title: 3xl → 4xl */
.page-title {
  @apply font-madimione text-4xl text-slate-800 dark:text-platinum-100 leading-tight tracking-wide;
}

/* Subtitle: sm → base */
.page-subtitle {
  @apply font-mplusrounded text-base text-platinum-600 dark:text-platinum-500;
}

/* Stat pill label: [10px] → xs */
.stat-pill-label {
  @apply text-xs font-medium text-platinum-500 uppercase tracking-wide mb-0.5;
}

/* Stat value: xl → 2xl */
.stat-value {
  @apply text-2xl font-bold text-slate-800 dark:text-platinum-100 leading-none;
}

/* Badge text: xs → sm */
.badge {
  @apply inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium;
}

/* Featured card title: base → lg */
.featured-title {
  @apply font-semibold text-lg text-slate-700 dark:text-platinum-200 leading-snug line-clamp-2 mb-1.5;
}

/* Featured card subtext: field-subtext override → sm */
.featured-category {
  @apply font-mplusrounded text-sm text-platinum-500 dark:text-platinum-600;
}

/* Button text: sm → base */
.btn-primary {
  @apply flex items-center gap-2 px-5 py-3 rounded-xl text-base font-medium;
  @apply bg-calm-lavender-600 hover:bg-calm-lavender-700 dark:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600;
  @apply text-white border border-calm-lavender-700 transition-all shrink-0;
}
</style>