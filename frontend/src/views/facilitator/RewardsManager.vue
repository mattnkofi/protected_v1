<template>
    <div class="page-wrapper animate-in">

        <!-- Page Header -->
        <div class="page-header">
            <div class="space-y-1.5">
                <p class="section-eyebrow">Facilitator Panel</p>
                <h1 class="page-title">
                    Rewards <span class="brand-gradient-text">Manager</span>
                </h1>
                <p class="page-subtitle">Create and manage claimable rewards for students.</p>
            </div>

            <button @click="openCreateModal" class="btn-primary">
                <Plus class="w-4 h-4" />
                <span>Add New Reward</span>
            </button>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                <div class="flex items-center justify-between w-full mb-2">
                    <div class="card-icon-wrap">
                        <Package class="w-4 h-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                </div>
                <p class="stat-pill-label">Total Rewards</p>
                <p class="stat-pill-value text-2xl text-slate-800 dark:text-platinum-100">{{ rewards.length }}</p>
            </div>

            <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                <div class="flex items-center justify-between w-full mb-2">
                    <div class="card-icon-wrap">
                        <CheckCircle class="w-4 h-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                </div>
                <p class="stat-pill-label">Active Rewards</p>
                <p class="stat-pill-value text-2xl text-slate-800 dark:text-platinum-100">{{ activeCount }}</p>
            </div>

            <div class="stat-pill flex-col items-start gap-1.5 p-5 rounded-2xl">
                <div class="flex items-center justify-between w-full mb-2">
                    <div class="card-icon-wrap">
                        <Users class="w-4 h-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                </div>
                <p class="stat-pill-label">Total Claims</p>
                <p class="stat-pill-value text-2xl text-slate-800 dark:text-platinum-100">{{ totalClaims }}</p>
            </div>

        </div>

        <!-- Rewards Grid -->
        <div v-if="!isLoading && rewards.length > 0" class="space-y-5">

            <!-- Sort Toolbar -->
            <div class="flex items-center gap-3 flex-wrap">
                <div class="flex items-center gap-1.5 shrink-0">
                    <ArrowUpDown class="w-4 h-4 text-platinum-500" />
                    <span class="field-subtext font-medium">Sort by</span>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap">
                    <button v-for="(opt, index) in SORT_OPTIONS" :key="index"
                        @click="setSort(index)"
                        :class="['px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all',
                            activeSortIndex === index
                                ? 'bg-calm-lavender-600 dark:bg-calm-lavender-700 border-calm-lavender-700 dark:border-calm-lavender-600 text-white'
                                : 'bg-white dark:bg-abyss-700 border-platinum-200 dark:border-abyss-500 text-slate-600 dark:text-platinum-300 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400']">
                        {{ opt.label }}
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <div v-for="reward in paginatedRewards" :key="reward.id"
                    class="item-card group flex flex-col">

                    <!-- Status Badge -->
                    <div class="absolute top-2.5 right-2.5 z-20">
                        <span :class="['badge text-xs', reward.is_active ? 'badge-lavender' : 'badge-muted']">
                            {{ reward.is_active ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                    <!-- Image -->
                    <div class="item-image-wrap">
                        <img v-if="reward.image_url"
                            :src="reward.image_url"
                            class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            @error="handleImageError" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <Gift class="w-8 h-8 text-platinum-300 dark:text-abyss-500" />
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-3.5 flex flex-col flex-1 gap-3">
                        <div class="space-y-1">
                            <h3 class="font-bold text-sm text-slate-800 dark:text-platinum-100 line-clamp-2 leading-snug group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                {{ reward.title || 'Unnamed Reward' }}
                            </h3>
                            <div class="flex items-center justify-between">
                                <span class="field-subtext font-medium text-calm-lavender-600 dark:text-calm-lavender-400">
                                    {{ reward.xp_required }} XP
                                </span>
                                <span class="field-subtext">
                                    {{ reward.stock_quantity > 900 ? '∞' : reward.stock_quantity }} left
                                </span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="mt-auto pt-2.5 border-t border-platinum-200 dark:border-abyss-500 grid grid-cols-3 gap-1.5">
                            <button @click="editReward(reward)"
                                class="flex items-center justify-center py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-abyss-600 hover:bg-calm-lavender-50 dark:hover:bg-calm-lavender-900/20 text-slate-500 dark:text-platinum-400 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400 border border-slate-200 dark:border-abyss-500 transition-all"
                                title="Edit">
                                Edit
                            </button>
                            <button @click="toggleActive(reward)"
                                :class="['flex items-center justify-center py-1.5 rounded-lg text-xs font-medium border transition-all',
                                    reward.is_active
                                        ? 'bg-calm-lavender-50 dark:bg-calm-lavender-900/20 text-calm-lavender-600 dark:text-calm-lavender-400 border-calm-lavender-200 dark:border-calm-lavender-800/40'
                                        : 'bg-slate-100 dark:bg-abyss-600 text-slate-400 dark:text-platinum-500 border-slate-200 dark:border-abyss-500 hover:text-slate-600']"
                                :title="reward.is_active ? 'Deactivate' : 'Activate'">
                                <CheckCircle v-if="reward.is_active" class="w-3.5 h-3.5" />
                                <span v-else>On</span>
                            </button>
                            <!-- Delete — opens ConfirmModal instead of browser confirm() -->
                            <button @click="promptDelete(reward)"
                                class="flex items-center justify-center py-1.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/20 hover:bg-red-500 hover:text-white text-red-500 border border-red-200 dark:border-red-800/40 transition-all"
                                title="Delete">
                                <Trash2 class="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination Bar -->
            <AppPagination
                v-model="currentPage"
                :total="sortedRewards.length"
                :page-size="PAGE_SIZE"
                item-label="rewards"
            />

        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="empty-state">
            <div class="empty-state-icon">
                <Loader2 class="w-8 h-8 text-calm-lavender-400 animate-spin" />
            </div>
            <p class="empty-state-title">Loading rewards...</p>
            <p class="empty-state-desc">Fetching your reward catalogue, hang tight.</p>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && rewards.length === 0" class="empty-state">
            <div class="empty-state-icon">
                <Gift class="w-8 h-8 text-platinum-400" />
            </div>
            <p class="empty-state-title">No rewards yet</p>
            <p class="empty-state-desc">Create your first reward so students can start claiming them.</p>
            <button @click="openCreateModal" class="btn-primary mx-auto mt-5">
                <Plus class="w-4 h-4" />
                <span>Create First Reward</span>
            </button>
        </div>

        <!-- ── Create / Edit Modal ─────────────────────────── -->
        <Teleport to="body">
            <Transition name="fade">
                <div v-if="showModal" class="modal-overlay">
                    <div class="absolute inset-0 bg-slate-900/50" @click="closeModal"></div>

                    <div class="modal-panel relative max-h-[90vh] overflow-y-auto w-full max-w-lg">

                        <h3 class="modal-title text-lg font-bold">
                            {{ editingReward ? 'Edit Reward' : 'Create New Reward' }}
                        </h3>

                        <form @submit.prevent="saveReward" class="space-y-5">

                            <!-- Reward Name -->
                            <div>
                                <label class="field-label block mb-1.5">Reward Name *</label>
                                <input v-model="form.name" type="text" required
                                    class="input-field"
                                    placeholder="e.g., Free Snack Voucher" />
                            </div>

                            <!-- Description -->
                            <div>
                                <label class="field-label block mb-1.5">Description</label>
                                <textarea v-model="form.description" rows="3"
                                    class="input-field resize-none"
                                    placeholder="Describe the reward..."></textarea>
                            </div>

                            <!-- XP Cost & Total Slots (2-col) -->
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="field-label block mb-1.5">XP Cost *</label>
                                    <input v-model.number="form.cost_xp" type="number" min="0" required
                                        class="input-field"
                                        placeholder="100" />
                                </div>
                                <div>
                                    <label class="field-label block mb-1.5">Total Slots</label>
                                    <input v-model.number="form.total_slots" type="number" min="0"
                                        class="input-field"
                                        placeholder="0 = Unlimited" />
                                </div>
                            </div>

                            <!-- Image URL -->
                            <div>
                                <label class="field-label block mb-1.5">Image URL <span class="font-normal opacity-60">(optional)</span></label>
                                <input v-model="form.iconPath" type="text"
                                    class="input-field"
                                    placeholder="/uploads/rewards/image.png" />
                            </div>

                            <!-- Active Toggle -->
                            <div class="info-row">
                                <div>
                                    <p class="text-sm font-medium text-slate-700 dark:text-platinum-200">Visible to Students</p>
                                    <p class="field-subtext mt-0.5">Students can see and claim this reward.</p>
                                </div>
                                <button type="button" @click="form.is_active = !form.is_active"
                                    :class="['relative w-12 h-6 rounded-full transition-all shrink-0',
                                        form.is_active ? 'bg-calm-lavender-500' : 'bg-platinum-300 dark:bg-abyss-400']">
                                    <span :class="['absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
                                        form.is_active ? 'left-6' : 'left-0.5']"></span>
                                </button>
                            </div>

                            <!-- Form Actions -->
                            <div class="flex gap-3 pt-2">
                                <button type="button" @click="closeModal" class="btn-secondary flex-1 justify-center">
                                    Cancel
                                </button>
                                <button type="submit" :disabled="isSaving" class="btn-primary flex-1 justify-center disabled:opacity-50">
                                    {{ isSaving ? 'Saving...' : (editingReward ? 'Update Reward' : 'Create Reward') }}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- ── Delete Confirmation Modal ──────────────────────
             Global ConfirmModal from @/components/ui
             Handles its own Teleport internally
        ─────────────────────────────────────────────────────── -->
        <ConfirmModal
            :is-open="showDeleteModal"
            variant="danger"
            title="Delete Reward?"
            :message="`You are about to permanently remove &quot;${rewardToDelete?.title || rewardToDelete?.name || 'this reward'}&quot;.`"
            warning-text="This will also remove the reward from all student inventories and cannot be undone."
            confirm-label="Delete Reward"
            cancel-label="Cancel"
            :loading="isDeleting"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />

    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Gift, Plus, Package, CheckCircle, Users, Trash2, Loader2, ArrowUpDown } from 'lucide-vue-next';
import { useToast } from '@/utils/useToast';
import axios from '@/utils/api';
import AppPagination from '@/components/ui/AppPagination.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';

const toast = useToast();
const rewards = ref([]);
const isLoading = ref(true);
const isSaving = ref(false);
const showModal = ref(false);
const editingReward = ref(null);

const form = ref({
    name: '',
    description: '',
    cost_xp: 100,
    total_slots: 10,
    iconPath: '',
    is_active: true
});

// ── Delete confirm state ─────────────────────────────────────
const showDeleteModal = ref(false);
const rewardToDelete = ref(null);
const isDeleting = ref(false);

const activeCount = computed(() => rewards.value.filter(r => r.is_active).length);
const totalClaims = computed(() => rewards.value.reduce((sum, r) => sum + (r.claimed_count || 0), 0));

// ── Sorting ─────────────────────────────────────────────────
const SORT_OPTIONS = [
    { key: 'default',    dir: 'asc',  label: 'Default' },
    { key: 'xp',        dir: 'desc', label: 'XP: High → Low' },
    { key: 'xp',        dir: 'asc',  label: 'XP: Low → High' },
    { key: 'stock',     dir: 'desc', label: 'Stock: High → Low' },
    { key: 'stock',     dir: 'asc',  label: 'Stock: Low → High' },
    { key: 'active',    dir: 'desc', label: 'Active first' },
    { key: 'active',    dir: 'asc',  label: 'Inactive first' },
];
const activeSortIndex = ref(0);

const setSort = (index) => {
    activeSortIndex.value = index;
    currentPage.value = 1;
};

const sortedRewards = computed(() => {
    const opt = SORT_OPTIONS[activeSortIndex.value];
    if (opt.key === 'default') return [...rewards.value];
    return [...rewards.value].sort((a, b) => {
        let aVal, bVal;
        if (opt.key === 'xp')     { aVal = a.xp_required    ?? 0; bVal = b.xp_required    ?? 0; }
        if (opt.key === 'stock')  { aVal = a.stock_quantity  ?? 0; bVal = b.stock_quantity  ?? 0; }
        if (opt.key === 'active') { aVal = a.is_active ? 1 : 0;    bVal = b.is_active ? 1 : 0;   }
        return opt.dir === 'desc' ? bVal - aVal : aVal - bVal;
    });
});

// ── Pagination ──────────────────────────────────────────────
const PAGE_SIZE = 5;
const currentPage = ref(1);

const paginatedRewards = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return sortedRewards.value.slice(start, start + PAGE_SIZE);
});

// Reset to page 1 whenever rewards list changes
watch(() => rewards.value.length, () => { currentPage.value = 1; });

const handleImageError = (event) => {
    event.target.style.display = 'none';
};

const loadRewards = async () => {
    isLoading.value = true;
    try {
        const { data } = await axios.get('/api/rewards/all');
        rewards.value = data.rewards || [];
    } catch (err) {
        console.error('Failed to load rewards:', err);
        try {
            const { data } = await axios.get('/api/rewards/available');
            rewards.value = data || [];
        } catch {
            rewards.value = [];
        }
    } finally {
        isLoading.value = false;
    }
};

const openCreateModal = () => {
    editingReward.value = null;
    form.value = {
        name: '',
        description: '',
        cost_xp: 100,
        total_slots: 10,
        iconPath: '',
        is_active: true
    };
    showModal.value = true;
};

const editReward = (reward) => {
    editingReward.value = reward;
    form.value = {
        name: reward.title || reward.name || '',
        description: reward.description || '',
        cost_xp: reward.xp_required || reward.cost_xp || 0,
        total_slots: reward.total_slots || 0,
        iconPath: reward.iconPath || '',
        is_active: reward.is_active !== false
    };
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    editingReward.value = null;
};

const saveReward = async () => {
    isSaving.value = true;
    try {
        if (editingReward.value) {
            await axios.put(`/api/rewards/${editingReward.value.id}`, form.value);
            toast.success('Reward updated successfully!');
        } else {
            await axios.post('/api/rewards', form.value);
            toast.success('Reward created successfully!');
        }
        closeModal();
        loadRewards();
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to save reward');
    } finally {
        isSaving.value = false;
    }
};

const toggleActive = async (reward) => {
    try {
        await axios.put(`/api/rewards/${reward.id}`, {
            is_active: !reward.is_active
        });
        toast.success(reward.is_active ? 'Reward deactivated' : 'Reward activated');
        loadRewards();
    } catch (err) {
        toast.error('Failed to update reward status');
    }
};

// ── Delete flow ──────────────────────────────────────────────
// Step 1: user clicks trash icon → open modal
const promptDelete = (reward) => {
    rewardToDelete.value = reward;
    showDeleteModal.value = true;
};

// Step 2: user clicks Cancel in modal
const cancelDelete = () => {
    showDeleteModal.value = false;
    rewardToDelete.value = null;
};

// Step 3: user clicks Delete Reward in modal
const confirmDelete = async () => {
    if (!rewardToDelete.value) return;
    isDeleting.value = true;
    try {
        await axios.delete(`/api/rewards/${rewardToDelete.value.id}`);
        toast.success('Reward deleted');
        loadRewards();
    } catch (err) {
        toast.error('Failed to delete reward');
    } finally {
        isDeleting.value = false;
        showDeleteModal.value = false;
        rewardToDelete.value = null;
    }
};

onMounted(loadRewards);
</script>

<style scoped>
@reference "@/style.css";

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>