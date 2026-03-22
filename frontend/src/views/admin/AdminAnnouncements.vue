<template>
    <div class="page-wrapper animate-in font-poppins">

        <!-- ═══════════════════════════════════════════════════
             HEADER
        ════════════════════════════════════════════════════ -->
        <header class="page-header">
            <div class="space-y-1.5">
                <p class="section-eyebrow">Admin Console</p>
                <h1 class="page-title tracking-wide">
                    Public <span class="brand-gradient-text">Announcements</span>
                </h1>
                <p class="page-subtitle">Create announcements visible to all users on the platform.</p>
            </div>

            <button @click="openCreateModal" class="btn-primary btn-3d shrink-0">
                <PlusIcon class="h-4 w-4" />
                <span>New Announcement</span>
            </button>
        </header>

        <!-- ═══════════════════════════════════════════════════
             LOADING
        ════════════════════════════════════════════════════ -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 gap-4">
            <div class="spinner"></div>
            <p class="loading-text">Loading announcements…</p>
        </div>

        <!-- ═══════════════════════════════════════════════════
             ANNOUNCEMENTS LIST
        ════════════════════════════════════════════════════ -->
        <div v-else class="space-y-4">

            <!-- Empty state -->
            <div v-if="announcements.length === 0" class="empty-state">
                <div class="empty-state-icon">
                    <MegaphoneIcon class="h-8 w-8 text-platinum-400" />
                </div>
                <p class="empty-state-title">No Announcements Yet</p>
                <p class="empty-state-desc">Create your first public announcement to get started.</p>
                <button @click="openCreateModal" class="btn-primary btn-3d mx-auto mt-5">
                    <PlusIcon class="h-4 w-4" />
                    Create Announcement
                </button>
            </div>

            <!-- Announcement cards — L1 layer -->
            <div
                v-for="announcement in announcements"
                :key="announcement.id"
                class="announcement-card group"
            >
                <!-- Priority + status badges -->
                <div class="absolute top-4 right-4 flex items-center gap-2">
                    <span :class="['badge', getPriorityBadgeClass(announcement.priority)]">
                        {{ announcement.priority }}
                    </span>
                    <span :class="['badge', effectiveStatus(announcement) === 'active' ? 'badge-green' : 'badge-muted']">
                        {{ effectiveStatus(announcement) === 'active' ? 'Published' : 'Unpublished' }}
                    </span>
                </div>

                <div class="space-y-3">
                    <h3 class="font-bold text-base text-abyss-800 dark:text-platinum-100 leading-snug pr-40">
                        {{ announcement.title }}
                    </h3>
                    <p class="text-sm text-platinum-700 dark:text-platinum-400 leading-relaxed">
                        {{ announcement.content }}
                    </p>

                    <!-- Footer: meta + actions -->
                    <div class="flex items-center justify-between pt-4 border-t-2 border-platinum-200 dark:border-abyss-600">
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-1.5">
                                <UserIcon class="h-3.5 w-3.5 text-platinum-500" />
                                <span class="font-mplusrounded text-xs text-platinum-600 dark:text-platinum-500">
                                    {{ announcement.author?.name || 'Admin' }}
                                </span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <CalendarIcon class="h-3.5 w-3.5 text-platinum-500" />
                                <span class="font-mplusrounded text-xs text-platinum-600 dark:text-platinum-500">
                                    {{ formatDate(announcement.createdAt) }}
                                </span>
                            </div>
                            <!-- Expiry badge -->
                            <div v-if="announcement.expires_at" class="flex items-center gap-1.5">
                                <ClockIcon class="h-3.5 w-3.5" :class="isExpired(announcement.expires_at) ? 'text-red-400' : 'text-vawc-orange-400'" />
                                <span class="font-mplusrounded text-xs" :class="isExpired(announcement.expires_at) ? 'text-red-500 dark:text-red-400' : 'text-vawc-orange-500 dark:text-vawc-orange-400'">
                                    {{ isExpired(announcement.expires_at) ? 'Expired' : 'Expires' }} {{ formatDate(announcement.expires_at) }}
                                </span>
                            </div>
                        </div>

                        <!-- Actions: always visible -->
                        <div class="flex items-center gap-2">
                            <button
                                @click="editAnnouncement(announcement)"
                                class="icon-btn icon-btn--lavender"
                                title="Edit"
                            >
                                <PencilIcon class="h-4 w-4" />
                            </button>
                            <button
                                @click="confirmDelete(announcement)"
                                class="icon-btn icon-btn--red"
                                title="Delete"
                            >
                                <TrashIcon class="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════
             CREATE / EDIT MODAL
        ════════════════════════════════════════════════════ -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div
                    v-if="showModal"
                    class="modal-scrim"
                    @click.self="closeModal"
                >
                    <div class="modal-shell">

                        <!-- Modal header -->
                        <div class="flex items-center justify-between mb-7">
                            <div class="flex items-center gap-4">
                                <div class="ds-icon-badge ds-icon-badge--lavender">
                                    <MegaphoneIcon class="h-4 w-4" />
                                </div>
                                <div>
                                    <p class="section-eyebrow">Announcements</p>
                                    <h2 class="font-madimione text-2xl text-abyss-800 dark:text-platinum-100 leading-tight">
                                        {{ isEditing ? 'Edit' : 'New' }} Announcement
                                    </h2>
                                </div>
                            </div>
                            <button @click="closeModal" class="close-btn">
                                <XIcon class="h-4 w-4" />
                            </button>
                        </div>

                        <form @submit.prevent="saveAnnouncement" class="space-y-5">

                            <div class="space-y-1.5">
                                <label class="field-label">Title <span class="text-red-400">*</span></label>
                                <input
                                    v-model="form.title"
                                    type="text"
                                    required
                                    placeholder="Announcement title…"
                                    class="input-field placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                                />
                            </div>

                            <div class="space-y-1.5">
                                <label class="field-label">Content <span class="text-red-400">*</span></label>
                                <textarea
                                    v-model="form.content"
                                    required
                                    rows="4"
                                    placeholder="Write your announcement…"
                                    class="input-field resize-none placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                                ></textarea>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-1.5">
                                    <label class="field-label">Priority</label>
                                    <div class="ds-select-wrap">
                                        <select v-model="form.priority" class="ds-select">
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                        <ChevronDownIcon class="ds-select-icon" />
                                    </div>
                                </div>

                                <div v-if="isEditing" class="space-y-1.5">
                                    <label class="field-label">Status</label>
                                    <div class="ds-select-wrap">
                                        <select v-model="form.status" class="ds-select">
                                            <option value="active">Published</option>
                                            <option value="archived">Unpublished</option>
                                        </select>
                                        <ChevronDownIcon class="ds-select-icon" />
                                    </div>
                                </div>
                            </div>

                            <!-- Expiry date — split date + time inputs (avoids native popup theming issues) -->
                            <div class="space-y-1.5">
                                <label class="field-label">
                                    Expires At
                                    <span class="font-mplusrounded text-xs text-platinum-500 dark:text-platinum-400 font-normal ml-1">(optional — leave blank to never expire)</span>
                                </label>
                                <div class="grid grid-cols-2 gap-3">
                                    <input
                                        v-model="expiryDate"
                                        type="date"
                                        :min="minExpiryDateOnly"
                                        class="date-input w-full"
                                        @change="syncExpiryDateTime"
                                    />
                                    <input
                                        v-model="expiryTime"
                                        type="time"
                                        class="date-input w-full"
                                        :disabled="!expiryDate"
                                        @change="syncExpiryDateTime"
                                    />
                                </div>
                                <div class="flex items-center justify-between">
                                    <p v-if="form.expires_at" class="font-mplusrounded text-xs text-calm-lavender-600 dark:text-calm-lavender-400">
                                        Will hide from users after {{ formatDate(form.expires_at) }}
                                    </p>
                                    <button
                                        v-if="expiryDate"
                                        type="button"
                                        @click="clearExpiry"
                                        class="font-mplusrounded text-xs text-platinum-500 dark:text-platinum-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-auto"
                                    >
                                        Clear expiry
                                    </button>
                                </div>
                            </div>

                            <div class="flex gap-3 pt-2 border-t-2 border-platinum-200 dark:border-abyss-600">
                                <button type="button" @click="closeModal"
                                    class="btn-secondary flex-1 justify-center mt-4">
                                    Cancel
                                </button>
                                <button type="submit" :disabled="isSaving"
                                    class="btn-primary btn-3d flex-1 justify-center mt-4 disabled:opacity-50">
                                    {{ isSaving ? 'Saving…' : (isEditing ? 'Update' : 'Create') }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- ═══════════════════════════════════════════════════
             DELETE CONFIRMATION — global ConfirmModal
        ════════════════════════════════════════════════════ -->
        <ConfirmModal
            :is-open="showDeleteModal"
            variant="danger"
            title="Delete Announcement?"
            :message="deleteMessage"
            warning-text="This action cannot be undone. The announcement will be permanently removed."
            confirm-label="Delete"
            cancel-label="Cancel"
            :loading="isDeleting"
            @confirm="deleteAnnouncement"
            @cancel="showDeleteModal = false"
        />

    </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import {
    PlusIcon, MegaphoneIcon, PencilIcon, TrashIcon,
    XIcon, UserIcon, CalendarIcon, Clock as ClockIcon,
    ChevronDown as ChevronDownIcon
} from 'lucide-vue-next';
import api from '@/utils/api';
import ConfirmModal from '@/components/ui/ConfirmModal.vue';

const announcements = ref([]);
const isLoading = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const isSaving = ref(false);
const isDeleting = ref(false);
const isEditing = ref(false);
const selectedAnnouncement = ref(null);
let refreshTimer = null;

// Reactive now — ticked every 60s so expired cards auto-unpublish without reload
const now = ref(new Date());

// Derive effective status: if active but expires_at is past, treat as archived
const effectiveStatus = (ann) => {
    if (ann.status === 'active' && ann.expires_at && new Date(ann.expires_at) <= now.value) {
        return 'archived';
    }
    return ann.status;
};

const form = ref({
    title: '',
    content: '',
    priority: 'normal',
    status: 'active',
    expires_at: null
});

const deleteMessage = computed(() =>
    selectedAnnouncement.value?.title
        ? `You are about to permanently remove "${selectedAnnouncement.value.title}".`
        : 'You are about to permanently remove this announcement.'
);

const getPriorityBadgeClass = (priority) => {
    const map = {
        low:    'badge-muted',
        normal: 'badge-lavender',
        high:   'badge-orange',
        urgent: 'badge-red'
    };
    return map[priority] || 'badge-lavender';
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date();

// Split date + time state for the custom expiry picker
const expiryDate = ref('');
const expiryTime = ref('00:00');
const minExpiryDateOnly = new Date().toISOString().slice(0, 10);

const syncExpiryDateTime = () => {
    if (expiryDate.value) {
        const time = expiryTime.value || '00:00';
        form.value.expires_at = `${expiryDate.value}T${time}`;
    } else {
        form.value.expires_at = null;
    }
};

const clearExpiry = () => {
    expiryDate.value = '';
    expiryTime.value = '00:00';
    form.value.expires_at = null;
};

// Seed expiryDate/expiryTime when editing an existing announcement
const seedExpiryFields = (isoString) => {
    if (isoString) {
        const d = new Date(isoString);
        expiryDate.value = d.toISOString().slice(0, 10);
        expiryTime.value = d.toTimeString().slice(0, 5);
    } else {
        expiryDate.value = '';
        expiryTime.value = '00:00';
    }
};

const fetchAnnouncements = async () => {
    isLoading.value = true;
    try {
        const res = await api.get('/api/v1/admin/announcements');
        announcements.value = res.data?.announcements || [];
    } catch (error) {
        console.error('Failed to fetch announcements:', error);
    } finally {
        isLoading.value = false;
    }
};

const openCreateModal = () => {
    isEditing.value = false;
    form.value = { title: '', content: '', priority: 'normal', status: 'active', expires_at: null };
    seedExpiryFields(null);
    showModal.value = true;
};

const editAnnouncement = (announcement) => {
    isEditing.value = true;
    selectedAnnouncement.value = announcement;
    form.value = {
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        status: announcement.status,
        expires_at: announcement.expires_at || null
    };
    seedExpiryFields(announcement.expires_at);
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedAnnouncement.value = null;
};

const saveAnnouncement = async () => {
    isSaving.value = true;
    try {
        if (isEditing.value && selectedAnnouncement.value) {
            await api.put(`/api/v1/admin/announcements/${selectedAnnouncement.value.id}`, form.value);
        } else {
            await api.post('/api/v1/admin/announcements', form.value);
        }
        closeModal();
        fetchAnnouncements();
    } catch (error) {
        console.error('Failed to save announcement:', error);
    } finally {
        isSaving.value = false;
    }
};

const confirmDelete = (announcement) => {
    selectedAnnouncement.value = announcement;
    showDeleteModal.value = true;
};

const deleteAnnouncement = async () => {
    if (!selectedAnnouncement.value) return;
    isDeleting.value = true;
    try {
        await api.delete(`/api/v1/admin/announcements/${selectedAnnouncement.value.id}`);
        showDeleteModal.value = false;
        selectedAnnouncement.value = null;
        fetchAnnouncements();
    } catch (error) {
        console.error('Failed to delete announcement:', error);
    } finally {
        isDeleting.value = false;
    }
};

import { onMounted } from 'vue';
onMounted(() => {
    fetchAnnouncements();
    refreshTimer = setInterval(() => { now.value = new Date(); }, 60_000);
});

onUnmounted(() => {
    clearInterval(refreshTimer);
});
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
   ANNOUNCEMENT CARD  —  L1: platinum-100 / abyss-700
═══════════════════════════════════════════════════════════ */
.announcement-card {
    @apply relative;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-5;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/60;
    @apply transition-all duration-200;
}

/* ═══════════════════════════════════════════════════════════
   ICON ACTION BUTTONS
═══════════════════════════════════════════════════════════ */
.icon-btn {
    @apply p-2 rounded-xl border-2 transition-all duration-150;
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
   MODAL SCRIM + SHELL
═══════════════════════════════════════════════════════════ */
.modal-scrim {
    @apply fixed inset-0 z-50 bg-abyss-950/60 backdrop-blur-sm overflow-y-auto;
    @apply flex items-start justify-center pt-16 px-6 pb-10;
}

.modal-shell {
    @apply relative w-full max-w-xl;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-7;
}

/* ═══════════════════════════════════════════════════════════
   ICON BADGE
═══════════════════════════════════════════════════════════ */
.ds-icon-badge {
    @apply p-2.5 rounded-xl border-2 flex items-center justify-center shrink-0;
}

.ds-icon-badge--lavender {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/20;
    @apply border-calm-lavender-200 dark:border-calm-lavender-800/40;
    @apply text-calm-lavender-600 dark:text-calm-lavender-400;
}

/* ── Close button ─────────────────────────────────────────── */
.close-btn {
    @apply p-2 rounded-xl shrink-0 transition-all duration-150;
    @apply bg-platinum-300 dark:bg-abyss-500;
    @apply border-2 border-platinum-300 dark:border-abyss-400;
    @apply text-platinum-600 dark:text-platinum-400;
    @apply hover:bg-red-50 dark:hover:bg-red-900/20;
    @apply hover:border-red-200 dark:hover:border-red-800/40;
    @apply hover:text-red-500 dark:hover:text-red-400;
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
   FLAT-3D BUTTON MODIFIER
═══════════════════════════════════════════════════════════ */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

/* ═══════════════════════════════════════════════════════════
   TRANSITIONS + ANIMATION
═══════════════════════════════════════════════════════════ */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; }

.animate-in {
    animation: fadeSlideUp 0.4s ease-out forwards;
}

@keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Select option colors ────────────────────────────────── */
select option {
    @apply bg-platinum-50 text-abyss-800;
}

.dark select option {
    @apply bg-abyss-600 text-platinum-100;
}

/* ═══════════════════════════════════════════════════════════
   DATE + TIME INPUTS — fully themed, no native popup
═══════════════════════════════════════════════════════════ */
.date-input {
    @apply appearance-none cursor-pointer transition-all duration-150;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply text-abyss-800 dark:text-platinum-200;
    @apply font-medium text-sm;
    @apply rounded-xl px-4 py-3;
    @apply focus:outline-none focus:ring-2 focus:ring-calm-lavender-400/40 focus:border-calm-lavender-400;
    @apply disabled:opacity-40 disabled:cursor-not-allowed;
    color-scheme: light;
    /* Force text to start from left — no internal padding offsets */
    padding-left: 1rem !important;
}

:global(.dark) .date-input {
    color-scheme: dark;
}

/* Nuke all native browser chrome on date/time inputs */
.date-input::-webkit-calendar-picker-indicator,
.date-input::-webkit-inner-spin-button,
.date-input::-webkit-outer-spin-button,
.date-input::-webkit-clear-button {
    display: none !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    width: 0 !important;
    height: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
}

/* Field segment colors */
.date-input::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
}

.date-input::-webkit-datetime-edit-text {
    @apply text-platinum-400 dark:text-platinum-500;
    padding: 0 1px;
}

.date-input::-webkit-datetime-edit-month-field,
.date-input::-webkit-datetime-edit-day-field,
.date-input::-webkit-datetime-edit-year-field,
.date-input::-webkit-datetime-edit-hour-field,
.date-input::-webkit-datetime-edit-minute-field,
.date-input::-webkit-datetime-edit-ampm-field {
    @apply rounded px-0.5;
}

.date-input::-webkit-datetime-edit-month-field:focus,
.date-input::-webkit-datetime-edit-day-field:focus,
.date-input::-webkit-datetime-edit-year-field:focus,
.date-input::-webkit-datetime-edit-hour-field:focus,
.date-input::-webkit-datetime-edit-minute-field:focus,
.date-input::-webkit-datetime-edit-ampm-field:focus {
    @apply bg-calm-lavender-100 dark:bg-calm-lavender-900/40;
    @apply text-calm-lavender-700 dark:text-calm-lavender-300;
    outline: none;
}

</style>