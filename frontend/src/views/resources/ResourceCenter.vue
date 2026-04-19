<template>
    <div class="page-wrapper animate-in font-mplusrounded">
            <header class="page-header">
                <div class="space-y-2">
                    <p class="section-eyebrow">Learning Hub</p>
                    <h1 class="page-title">Resource Center</h1>
                    <p class="page-subtitle max-w-2xl">Talks, training materials, and seminars you can revisit anytime.</p>
                </div>
                <div class="stat-pill">
                    <span class="stat-pill-label">Items</span>
                    <span class="stat-pill-value">{{ resources.length }}</span>
                </div>
            </header>

            <section class="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-6">
                <div class="space-y-4">
                    <div class="card">
                        <div class="flex flex-wrap items-center gap-3 justify-between">
                            <div>
                                <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Browse Resources</p>
                                <p class="mt-1 text-sm text-slate-600 dark:text-platinum-300">Filter by campus or type.</p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <select v-model="filters.campus_id" class="rounded-lg border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-xs text-slate-700 dark:text-platinum-100">
                                    <option value="">All campuses</option>
                                    <option v-for="campus in campuses" :key="campus.id" :value="campus.id">
                                        {{ campus.name }}
                                    </option>
                                </select>
                                <select v-model="filters.type" class="rounded-lg border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-xs text-slate-700 dark:text-platinum-100">
                                    <option value="">All types</option>
                                    <option value="talk">Talk</option>
                                    <option value="training">Training</option>
                                    <option value="seminar">Seminar</option>
                                    <option value="guide">Guide</option>
                                    <option value="policy">Policy</option>
                                    <option value="other">Other</option>
                                </select>
                                <input
                                    v-model="filters.search"
                                    type="text"
                                    placeholder="Search title..."
                                    class="rounded-lg border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-2 text-xs text-slate-700 dark:text-platinum-100"
                                />
                            </div>
                        </div>

                        <div v-if="isLoading" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div v-for="i in 4" :key="i" class="h-28 rounded-xl bg-slate-100 dark:bg-abyss-700 animate-pulse" />
                        </div>

                        <div v-else-if="resources.length === 0" class="mt-4 rounded-xl border border-dashed border-slate-200 dark:border-abyss-500 bg-slate-50 dark:bg-abyss-800 p-6 text-center text-sm text-slate-500 dark:text-platinum-400">
                            No resources found for the selected filters.
                        </div>

                        <div v-else class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <a v-for="item in resources" :key="item.id" :href="item.link_url" target="_blank" rel="noopener" class="item-card !p-5 hover:border-teal-300/60 dark:hover:border-teal-500/60">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <p class="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400">{{ item.type }}</p>
                                        <h3 class="mt-1 text-base font-semibold text-slate-800 dark:text-platinum-100 line-clamp-2">{{ item.title }}</h3>
                                    </div>
                                    <span class="rounded-full border border-teal-400/50 bg-teal-500/10 px-3 py-1 text-[10px] font-semibold uppercase text-teal-700 dark:text-teal-200">
                                        {{ item.campus?.name || 'All Campus' }}
                                    </span>
                                </div>
                                <p class="mt-3 text-xs text-slate-600 dark:text-platinum-300 line-clamp-2">{{ item.description || 'No description provided.' }}</p>
                                <div class="mt-4 flex items-center justify-between text-[10px] text-slate-500 dark:text-platinum-400">
                                    <span>Added by {{ item.creator?.name || 'Staff' }}</span>
                                    <span>{{ formatDate(item.created_at) }}</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div v-if="canCreate" class="card">
                        <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Add Resource</p>
                        <p class="mt-2 text-sm text-slate-600 dark:text-platinum-300">Share a new talk, training, or guide.</p>

                        <div class="mt-4 space-y-3">
                            <input v-model="form.title" type="text" placeholder="Resource title" class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-teal-500" />
                            <textarea v-model="form.description" rows="3" placeholder="Short description" class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-teal-500 resize-none" />
                            <div class="grid grid-cols-2 gap-2">
                                <select v-model="form.type" class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-3 text-sm text-slate-700 dark:text-platinum-100">
                                    <option value="">Type</option>
                                    <option value="talk">Talk</option>
                                    <option value="training">Training</option>
                                    <option value="seminar">Seminar</option>
                                    <option value="guide">Guide</option>
                                    <option value="policy">Policy</option>
                                    <option value="other">Other</option>
                                </select>
                                <select v-model="form.campus_id" class="rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-3 py-3 text-sm text-slate-700 dark:text-platinum-100">
                                    <option value="">All campuses</option>
                                    <option v-for="campus in campuses" :key="campus.id" :value="campus.id">{{ campus.name }}</option>
                                </select>
                            </div>
                            <input v-model="form.link_url" type="text" placeholder="Link URL" class="w-full rounded-xl border border-slate-200 dark:border-abyss-500 bg-white dark:bg-abyss-700 px-4 py-3 text-sm text-slate-700 dark:text-platinum-100 outline-none transition focus:border-teal-500" />

                            <button @click="createResource" :disabled="!form.title || !form.link_url || isCreating" class="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                {{ isCreating ? 'Saving...' : 'Add Resource' }}
                            </button>
                            <p v-if="createMessage" class="text-xs text-emerald-600 dark:text-emerald-200">{{ createMessage }}</p>
                        </div>
                    </div>

                    <div class="card">
                        <p class="text-xs uppercase tracking-[0.25em] text-slate-600 dark:text-platinum-300">Quick Tips</p>
                        <ul class="mt-3 space-y-2 text-xs text-slate-600 dark:text-platinum-300">
                            <li>Use short titles for easy scanning.</li>
                            <li>Link to official campus sources when possible.</li>
                            <li>Update training links every semester.</li>
                        </ul>
                    </div>
                </div>
            </section>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/utils/api';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const campuses = ref([]);
const resources = ref([]);
const isLoading = ref(false);
const isCreating = ref(false);
const createMessage = ref('');

const filters = ref({
    campus_id: '',
    type: '',
    search: ''
});

const form = ref({
    title: '',
    description: '',
    type: '',
    link_url: '',
    campus_id: ''
});

const canCreate = computed(() => ['admin', 'educator', 'moderator'].includes(auth.user?.role));

const fetchCampuses = async () => {
    try {
        const { data } = await api.get('/api/v1/gad/campuses');
        campuses.value = data.campuses || [];
    } catch (error) {
        campuses.value = [];
    }
};

const fetchResources = async () => {
    try {
        isLoading.value = true;
        const params = {};
        if (filters.value.campus_id) params.campus_id = filters.value.campus_id;
        if (filters.value.type) params.type = filters.value.type;
        if (filters.value.search) params.search = filters.value.search;
        const { data } = await api.get('/api/v1/resources', { params });
        resources.value = data.resources || [];
    } catch (error) {
        resources.value = [];
    } finally {
        isLoading.value = false;
    }
};

const createResource = async () => {
    try {
        isCreating.value = true;
        createMessage.value = '';
        const payload = {
            title: form.value.title,
            description: form.value.description,
            type: form.value.type || 'other',
            link_url: form.value.link_url,
            campus_id: form.value.campus_id || null
        };
        await api.post('/api/v1/resources', payload);
        createMessage.value = 'Resource saved.';
        form.value = { title: '', description: '', type: '', link_url: '', campus_id: '' };
        await fetchResources();
    } catch (error) {
        createMessage.value = error.response?.data?.message || 'Failed to add resource.';
    } finally {
        isCreating.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
};

watch(filters, fetchResources, { deep: true });

onMounted(async () => {
    await fetchCampuses();
    await fetchResources();
});
</script>
