<template>
    <div class="page-wrapper animate-in font-poppins">

        <!-- ═══════════════════════════════════════════════════
             HEADER
        ════════════════════════════════════════════════════ -->
        <header class="page-header">
            <div class="space-y-1.5">
                <p class="section-eyebrow">User Directory</p>
                <h1 class="page-title tracking-wide">
                    Facilitator <span class="brand-gradient-text">Management</span>
                </h1>
                <p class="page-subtitle">Create and manage your team of educators and moderators.</p>
            </div>

            <button @click="showCreateModal = true" class="btn-primary btn-3d shrink-0">
                <PlusIcon class="w-4 h-4" />
                <span>Add Facilitator</span>
            </button>
        </header>

        <!-- ═══════════════════════════════════════════════════
             FILTER / SEARCH TOOLBAR
             L1 layer: platinum-100 / abyss-700
        ════════════════════════════════════════════════════ -->
        <div class="toolbar">

            <!-- Role filter -->
            <div class="space-y-1.5">
                <label class="field-label">Filter Role</label>
                <div class="ds-select-wrap">
                    <select v-model="filters.role" @change="resetAndFetch" class="ds-select">
                        <option value="">All Roles</option>
                        <option value="educator">Educator</option>
                        <option value="moderator">Moderator</option>
                    </select>
                    <ChevronDownIcon class="ds-select-icon" />
                </div>
            </div>

            <!-- Status filter -->
            <div class="space-y-1.5">
                <label class="field-label">Filter Status</label>
                <div class="ds-select-wrap">
                    <select v-model="filters.status" @change="resetAndFetch" class="ds-select">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="deactivated">Deactivated</option>
                    </select>
                    <ChevronDownIcon class="ds-select-icon" />
                </div>
            </div>

            <!-- Search -->
            <div class="space-y-1.5 md:col-span-2">
                <label class="field-label">Search Team</label>
                <div class="relative">
                    <input
                        v-model="searchQuery"
                        @input="debouncedSearch"
                        type="text"
                        placeholder="Search by name or email…"
                        class="input-field !pl-10
                               placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                    />
                    <SearchIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                       text-platinum-500 dark:text-platinum-400 pointer-events-none" />
                </div>
            </div>

        </div>

        <!-- ═══════════════════════════════════════════════════
             TABLE PANEL
             L1 layer: platinum-100 / abyss-700
        ════════════════════════════════════════════════════ -->
        <div class="table-panel">

            <!-- Loading -->
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 gap-4">
                <div class="spinner"></div>
                <p class="loading-text">Loading directory…</p>
            </div>

            <!-- Empty state -->
            <div v-else-if="facilitators.length === 0" class="empty-state">
                <div class="empty-state-icon">
                    <UsersIcon class="w-8 h-8 text-platinum-400" />
                </div>
                <p class="empty-state-title">No facilitators found</p>
                <p class="empty-state-desc">
                    No results match your current filters, or none have been added yet.
                </p>
                <button @click="showCreateModal = true" class="btn-primary btn-3d mx-auto mt-5">
                    <PlusIcon class="w-4 h-4" />
                    Add Facilitator
                </button>
            </div>

            <!-- Table -->
            <div v-else class="overflow-x-auto">
                <table class="w-full text-left border-collapse">

                    <thead>
                        <tr class="border-b-2 border-platinum-200 dark:border-abyss-600">
                            <th class="th-cell pl-6">Team Member</th>
                            <th class="th-cell">Role</th>
                            <th class="th-cell">Status</th>
                            <th class="th-cell">Last Active</th>
                            <th class="th-cell text-right pr-6">Actions</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y divide-platinum-200 dark:divide-abyss-600">
                        <tr
                            v-for="facilitator in facilitators"
                            :key="facilitator.id"
                            class="group hover:bg-platinum-200 dark:hover:bg-abyss-600 transition-colors duration-150"
                        >
                            <!-- Name + avatar -->
                            <td class="td-cell pl-6">
                                <div class="flex items-center gap-3">
                                    <img
                                        class="h-10 w-10 rounded-xl object-cover shrink-0
                                               border-2 border-platinum-300 dark:border-abyss-500
                                               group-hover:border-calm-lavender-200 dark:group-hover:border-calm-lavender-800/50
                                               transition-colors"
                                        :src="facilitator.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(facilitator.name) + '&background=9333ea&color=fff'"
                                        :alt="facilitator.name"
                                    />
                                    <div class="min-w-0">
                                        <p class="font-semibold text-sm text-abyss-800 dark:text-platinum-100 truncate
                                                   group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                            {{ facilitator.name }}
                                        </p>
                                        <p class="font-mplusrounded text-xs text-platinum-600 dark:text-platinum-500 truncate">
                                            {{ facilitator.email }}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <!-- Role badge -->
                            <td class="td-cell">
                                <span :class="['badge capitalize', getRoleBadgeClass(facilitator.role)]">
                                    {{ facilitator.role }}
                                </span>
                            </td>

                            <!-- Status -->
                            <td class="td-cell">
                                <div class="flex flex-col gap-1">
                                    <span :class="['badge capitalize', getStatusBadgeClass(facilitator.account_status)]">
                                        {{ facilitator.account_status }}
                                    </span>
                                    <span
                                        v-if="facilitator.requires_password_change"
                                        class="font-mplusrounded text-xs text-vawc-orange-600 dark:text-vawc-orange-400"
                                    >
                                        Pending setup
                                    </span>
                                </div>
                            </td>

                            <!-- Last active -->
                            <td class="td-cell">
                                <span class="font-mplusrounded text-sm text-platinum-600 dark:text-platinum-500">
                                    {{ facilitator.last_login_at ? formatDate(facilitator.last_login_at) : 'Never logged in' }}
                                </span>
                            </td>

                            <!-- Actions -->
                            <td class="td-cell text-right pr-6">
                                <div class="flex items-center justify-end gap-1.5">
                                    <button
                                        @click="resendWelcome(facilitator)"
                                        class="icon-btn icon-btn--lavender"
                                        title="Resend welcome email"
                                    >
                                        <MailIcon class="w-4 h-4" />
                                    </button>
                                    <button
                                        @click="editFacilitator(facilitator)"
                                        class="icon-btn icon-btn--lavender"
                                        title="Edit facilitator"
                                    >
                                        <Edit2Icon class="w-4 h-4" />
                                    </button>
                                    <button
                                        @click="promptDelete(facilitator)"
                                        class="icon-btn icon-btn--red"
                                        title="Delete facilitator"
                                    >
                                        <Trash2Icon class="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>

                </table>
            </div>
        </div>

        <!-- Pagination -->
        <AppPagination
            v-model="currentPage"
            :total="pagination.total"
            :page-size="PAGE_SIZE"
            item-label="facilitators"
        />

        <!-- Create facilitator modal -->
         <Teleport to="body">
        <CreateFacilitatorModal
            v-if="showCreateModal"
            @close="showCreateModal = false"
            @created="handleFacilitatorCreated"
        /></Teleport>

        <!-- ── Delete confirmation — global ConfirmModal ───── -->
        <ConfirmModal
            :is-open="showDeleteModal"
            variant="danger"
            title="Delete Facilitator?"
            :message="deleteMessage"
            warning-text="All classrooms and modules assigned to this facilitator will be unlinked. This cannot be undone."
            confirm-label="Delete"
            cancel-label="Cancel"
            :loading="isDeleting"
            @confirm="executeDelete"
            @cancel="showDeleteModal = false"
        />

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import {
    UsersIcon,
    PlusIcon,
    SearchIcon,
    MailIcon,
    Edit2Icon,
    Trash2Icon,
    ChevronDown as ChevronDownIcon
} from 'lucide-vue-next';
import { useToast } from '@/utils/useToast';
import api from '@/utils/api';
import CreateFacilitatorModal from './CreateFacilitatorModal.vue';
import AppPagination from '@/components/ui/AppPagination.vue';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';

const toast = useToast();
const facilitators = ref([]);
const isLoading = ref(false);
const showCreateModal = ref(false);
const searchQuery = ref('');
const filters = ref({ role: '', status: '' });

const PAGE_SIZE = 5;
const currentPage = ref(1);
const pagination = ref({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });

// ── Delete confirm state ─────────────────────────────────────
const showDeleteModal = ref(false);
const facilitatorToDelete = ref(null);
const isDeleting = ref(false);

const deleteMessage = computed(() =>
    facilitatorToDelete.value?.name
        ? `You are about to permanently remove "${facilitatorToDelete.value.name}" from the system.`
        : 'You are about to permanently remove this facilitator.'
);

const fetchFacilitators = async () => {
    isLoading.value = true;
    try {
        const params = { page: currentPage.value, limit: PAGE_SIZE, ...filters.value, search: searchQuery.value };
        const { data } = await api.get('/api/v1/facilitators', { params });
        facilitators.value = data.facilitators;
        pagination.value = data.pagination;
    } catch (error) {
        toast.error('Failed to sync facilitator directory');
    } finally {
        isLoading.value = false;
    }
};

// Re-fetch whenever the page changes via AppPagination
watch(currentPage, () => fetchFacilitators());

// Reset to page 1 when filters or search change
const resetAndFetch = () => { currentPage.value = 1; fetchFacilitators(); };

const resendWelcome = async (f) => {
    try {
        await api.post(`/api/v1/facilitators/${f.id}/resend-welcome`);
        toast.success(`Welcome email sent to ${f.email}`);
    } catch (error) {
        toast.error('Failed to send welcome email');
    }
};

const editFacilitator = (f) => toast.info('Edit coming soon');

// ── Delete flow ──────────────────────────────────────────────
const promptDelete = (f) => {
    facilitatorToDelete.value = f;
    showDeleteModal.value = true;
};

const executeDelete = async () => {
    if (!facilitatorToDelete.value) return;
    isDeleting.value = true;
    try {
        await api.delete(`/api/v1/facilitators/${facilitatorToDelete.value.id}`);
        toast.success('Facilitator removed successfully');
        fetchFacilitators();
    } catch (error) {
        toast.error('Delete request failed');
    } finally {
        isDeleting.value = false;
        showDeleteModal.value = false;
        facilitatorToDelete.value = null;
    }
};

let searchTimeout;
const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => resetAndFetch(), 500);
};

const handleFacilitatorCreated = () => { showCreateModal.value = false; fetchFacilitators(); };

const getRoleBadgeClass = (role) => {
    return role === 'educator' ? 'badge-lavender' : 'badge-pink';
};

const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'badge-teal' : 'badge-muted';
};

const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

onMounted(() => fetchFacilitators());
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   PAGE WRAPPER
═══════════════════════════════════════════════════════════ */
.page-wrapper {
    @apply space-y-6 text-abyss-800 dark:text-platinum-100;
}

/* ═══════════════════════════════════════════════════════════
   TOOLBAR  —  L1: platinum-100 / abyss-700
   Filter + search bar
═══════════════════════════════════════════════════════════ */
.toolbar {
    @apply grid grid-cols-1 md:grid-cols-4 gap-4;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-5;
}

/* ═══════════════════════════════════════════════════════════
   SELECT  —  L2 inset: platinum-200 / abyss-600
═══════════════════════════════════════════════════════════ */
.ds-select-wrap {
    @apply relative;
}

.ds-select {
    @apply w-full appearance-none cursor-pointer transition-all duration-150;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply text-abyss-800 dark:text-platinum-200;
    @apply font-medium text-sm;
    @apply rounded-xl px-4 py-3 pr-10;
    @apply focus:outline-none focus:ring-2 focus:ring-calm-lavender-400/40 focus:border-calm-lavender-400;
}

.ds-select-icon {
    @apply absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none;
    @apply w-4 h-4 text-platinum-500 dark:text-platinum-400;
}

/* ═══════════════════════════════════════════════════════════
   TABLE PANEL  —  L1: platinum-100 / abyss-700
═══════════════════════════════════════════════════════════ */
.table-panel {
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl overflow-hidden;
}

/* ── Table header cell ───────────────────────────────────── */
.th-cell {
    @apply px-5 py-4 text-xs font-semibold uppercase tracking-wide;
    @apply text-platinum-600 dark:text-platinum-500;
}

/* ── Table data cell ─────────────────────────────────────── */
.td-cell {
    @apply px-5 py-4 whitespace-nowrap;
}

/* ═══════════════════════════════════════════════════════════
   ICON ACTION BUTTONS
═══════════════════════════════════════════════════════════ */
.icon-btn {
    @apply p-2 rounded-lg transition-all duration-150;
    @apply border-2;
}

.icon-btn--lavender {
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-platinum-300 dark:border-abyss-500;
    @apply text-platinum-600 dark:text-platinum-400;
    @apply hover:bg-calm-lavender-50 dark:hover:bg-calm-lavender-900/20;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/40;
    @apply hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400;
}

.icon-btn--red {
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-platinum-300 dark:border-abyss-500;
    @apply text-platinum-600 dark:text-platinum-400;
    @apply hover:bg-red-50 dark:hover:bg-red-900/20;
    @apply hover:border-red-200 dark:hover:border-red-800/40;
    @apply hover:text-red-500 dark:hover:text-red-400;
}

/* ═══════════════════════════════════════════════════════════
   FLAT-3D BUTTON MODIFIER
═══════════════════════════════════════════════════════════ */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

/* ═══════════════════════════════════════════════════════════
   ENTRY ANIMATION
═══════════════════════════════════════════════════════════ */
.animate-in {
    animation: fadeSlideUp 0.4s ease-out forwards;
}

@keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Select option colors (browser override) ─────────────── */
select option {
    @apply bg-platinum-50 text-abyss-800;
}

.dark select option {
    @apply bg-abyss-600 text-platinum-100;
}
</style>