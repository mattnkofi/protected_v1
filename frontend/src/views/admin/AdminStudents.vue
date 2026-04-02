<template>
    <span class="contents">
    <div class="page-wrapper animate-in font-poppins">

        <!-- ═══════════════════════════════════════════════════
             HEADER
        ════════════════════════════════════════════════════ -->
        <header class="page-header">
            <div class="space-y-1.5">
                <p class="section-eyebrow">Student Management</p>
                <h1 class="page-title tracking-wide">
                    Students <span class="brand-gradient-text">Directory</span>
                </h1>
                <p class="page-subtitle">Monitor and manage student accounts and progress.</p>
            </div>

            <div class="flex items-center gap-3 flex-wrap shrink-0">
                <!-- Bulk action bar (shown when students are selected) -->
                <div v-if="selectedStudents.length > 0" class="flex items-center gap-2">
                    <span class="font-mplusrounded text-sm text-platinum-600 dark:text-platinum-400">
                        {{ selectedStudents.length }} selected
                    </span>
                    <button
                        @click="showBulkActionModal = true"
                        class="btn-primary btn-3d !bg-vawc-orange-500 !border-vawc-orange-600 !border-b-vawc-orange-700 hover:!bg-vawc-orange-600"
                    >
                        <ZapIcon class="h-4 w-4" />
                        Bulk Actions
                    </button>
                    <button
                        @click="selectedStudents = []"
                        class="p-2 rounded-xl bg-platinum-200 dark:bg-abyss-600 border-2 border-platinum-300 dark:border-abyss-500 text-platinum-600 hover:text-red-500 transition-colors"
                    >
                        <XIcon class="h-4 w-4" />
                    </button>
                </div>

                <GenerateReport
                    endpoint="/api/v1/admin/students/export"
                    filename="ProtectEd_Students_{date}"
                    title="Download Students Report"
                    description="Exports all student records as a PDF"
                    trigger-label="Export PDF"
                    :includes="[
                        'Student List',
                        'Account Status',
                        'Gamification Level',
                        'Experience Points',
                        'Current Title',
                        'Quiz Attempts',
                        'Badges Earned',
                        'Join Date',
                    ]"
                    note="Report reflects all students currently in the system regardless of current filters or search."
                />

                <button @click="refreshStudents" class="btn-secondary btn-3d--secondary">
                    <RefreshCwIcon class="h-4 w-4" />
                    <span>Refresh</span>
                </button>
            </div>
        </header>

        <!-- ═══════════════════════════════════════════════════
             STATS ROW
             L1 layer: platinum-100 / abyss-700
        ════════════════════════════════════════════════════ -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">

            <div class="stat-tile">
                <div class="ds-icon-badge ds-icon-badge--lavender mb-3">
                    <UsersIcon class="h-4 w-4" />
                </div>
                <p class="stat-tile__label">Total</p>
                <p class="stat-tile__value">{{ studentStats.total }}</p>
            </div>

            <div class="stat-tile">
                <div class="ds-icon-badge ds-icon-badge--teal mb-3">
                    <CheckCircleIcon class="h-4 w-4" />
                </div>
                <p class="stat-tile__label">Active</p>
                <p class="stat-tile__value">{{ studentStats.active }}</p>
            </div>

            <div class="stat-tile">
                <div class="ds-icon-badge ds-icon-badge--orange mb-3">
                    <PauseCircleIcon class="h-4 w-4" />
                </div>
                <p class="stat-tile__label">Suspended</p>
                <p class="stat-tile__value">{{ studentStats.suspended }}</p>
            </div>

            <div class="stat-tile">
                <div class="ds-icon-badge ds-icon-badge--red mb-3">
                    <BanIcon class="h-4 w-4" />
                </div>
                <p class="stat-tile__label">Banned</p>
                <p class="stat-tile__value">{{ studentStats.banned }}</p>
            </div>

            <div class="stat-tile">
                <div class="ds-icon-badge ds-icon-badge--pink mb-3">
                    <TrendingUpIcon class="h-4 w-4" />
                </div>
                <p class="stat-tile__label">Avg XP</p>
                <p class="stat-tile__value">{{ studentStats.avgXp.toLocaleString() }}</p>
            </div>

        </div>

        <!-- ═══════════════════════════════════════════════════
             TABLE PANEL
             L1 layer: platinum-100 / abyss-700
        ════════════════════════════════════════════════════ -->
        <div class="table-panel">

            <!-- Panel header: title + search + filter -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div class="flex items-center gap-3">
                    <h3 class="font-bold text-base text-abyss-800 dark:text-platinum-100">All Students</h3>
                    <span class="badge badge-lavender">{{ pagination.total }} Total</span>
                </div>

                <div class="flex items-center gap-3 w-full md:w-auto">
                    <!-- Search -->
                    <div class="relative flex-1 md:flex-initial">
                        <input
                            v-model="searchQuery"
                            @input="searchStudentsDebounced"
                            type="text"
                            placeholder="Search by name or email…"
                            class="input-field !pl-10 !py-2.5 w-full md:w-72
                                   placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                        />
                        <SearchIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4
                                           text-platinum-500 pointer-events-none" />
                    </div>

                    <!-- Status filter -->
                    <div class="ds-select-wrap shrink-0">
                        <select v-model="filterStatus" @change="resetAndFetch" class="ds-select !py-2.5">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="banned">Banned</option>
                            <option value="deactivated">Deactivated</option>
                        </select>
                        <ChevronDownIcon class="ds-select-icon" />
                    </div>
                </div>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-4">
                <div class="spinner"></div>
                <p class="loading-text">Loading students…</p>
            </div>

            <!-- Empty -->
            <div v-else-if="students.length === 0" class="empty-state">
                <div class="empty-state-icon">
                    <UsersIcon class="w-8 h-8 text-platinum-400" />
                </div>
                <p class="empty-state-title">No Students Found</p>
                <p class="empty-state-desc">
                    {{ searchQuery ? 'Try adjusting your search terms.' : 'No students have registered yet.' }}
                </p>
            </div>

            <!-- Table -->
            <div v-else class="overflow-x-auto" :class="{ 'overflow-visible': activeActionMenu !== null }">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b-2 border-platinum-200 dark:border-abyss-600">
                            <!-- Select all -->
                            <th class="th-cell w-10">
                                <input
                                    type="checkbox"
                                    :checked="selectedStudents.length === students.length && students.length > 0"
                                    @change="toggleSelectAll"
                                    class="rounded border-platinum-400 dark:border-abyss-400
                                           text-calm-lavender-600 focus:ring-calm-lavender-400"
                                />
                            </th>
                            <th class="th-cell">Student</th>
                            <th class="th-cell">Title</th>
                            <th class="th-cell text-center">Level</th>
                            <th class="th-cell text-right">XP</th>
                            <th class="th-cell text-center">Status</th>
                            <th class="th-cell text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-platinum-200 dark:divide-abyss-600">
                        <tr
                            v-for="student in students"
                            :key="student.id"
                            class="group transition-colors duration-150"
                            :class="selectedStudents.includes(student.id)
                                ? 'bg-calm-lavender-50 dark:bg-calm-lavender-900/10'
                                : 'hover:bg-platinum-200 dark:hover:bg-abyss-600'"
                        >
                            <!-- Checkbox -->
                            <td class="td-cell">
                                <input
                                    type="checkbox"
                                    :checked="selectedStudents.includes(student.id)"
                                    @change="toggleSelectStudent(student.id)"
                                    class="rounded border-platinum-400 dark:border-abyss-400
                                           text-calm-lavender-600 focus:ring-calm-lavender-400"
                                />
                            </td>

                            <!-- Student -->
                            <td class="td-cell">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-xl bg-calm-lavender-100 dark:bg-calm-lavender-900/30
                                                border-2 border-calm-lavender-200 dark:border-calm-lavender-800/40
                                                flex items-center justify-center shrink-0
                                                text-calm-lavender-700 dark:text-calm-lavender-300
                                                text-xs font-semibold uppercase">
                                        {{ getInitials(student.name) }}
                                    </div>
                                    <div class="min-w-0">
                                        <p class="font-semibold text-sm text-abyss-800 dark:text-platinum-100 truncate
                                                   group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                            {{ student.name }}
                                        </p>
                                        <p class="font-mplusrounded text-xs text-platinum-600 dark:text-platinum-500 truncate">
                                            {{ student.email }}
                                        </p>
                                    </div>
                                </div>
                            </td>

                            <!-- Title -->
                            <td class="td-cell">
                                <span class="badge badge-lavender text-xs">{{ student.title }}</span>
                            </td>

                            <!-- Level -->
                            <td class="td-cell text-center">
                                <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl
                                             bg-platinum-200 dark:bg-abyss-600
                                             border-2 border-platinum-300 dark:border-abyss-500
                                             text-sm font-semibold text-abyss-800 dark:text-platinum-200">
                                    {{ student.level }}
                                </span>
                            </td>

                            <!-- XP -->
                            <td class="td-cell text-right">
                                <span class="font-semibold text-sm text-vawc-orange-600 dark:text-vawc-orange-400">
                                    {{ student.xp.toLocaleString() }} XP
                                </span>
                            </td>

                            <!-- Status -->
                            <td class="td-cell text-center">
                                <span :class="['badge capitalize', getAccountStatusBadgeClass(student.account_status)]">
                                    {{ formatAccountStatus(student.account_status) }}
                                </span>
                            </td>

                            <!-- Actions menu trigger -->
                            <td class="td-cell text-center">
                                <button
                                    @click.stop="toggleActionMenu(student.id, $event)"
                                    data-action-button
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                           bg-platinum-200 dark:bg-abyss-600
                                           border-2 border-platinum-300 dark:border-abyss-500
                                           text-sm font-medium text-abyss-800 dark:text-platinum-200
                                           hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50
                                           hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400
                                           transition-all duration-150"
                                >
                                    <span class="text-xs">Actions</span>
                                    <MoreVerticalIcon class="h-3.5 w-3.5" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div class="mt-6">
                <AppPagination
                    v-model="currentPage"
                    :total="pagination.total"
                    :page-size="PAGE_SIZE"
                    item-label="students"
                />
            </div>

        </div>

        <!-- ═══════════════════════════════════════════════════
             STATUS CHANGE MODAL
        ════════════════════════════════════════════════════ -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div
                    v-if="showStatusModal"
                    class="modal-scrim"
                    @click.self="closeModals"
                >
                    <div class="modal-shell">
                        <!-- Icon + title -->
                        <div class="flex flex-col items-center text-center mb-6">
                            <div :class="['ds-icon-badge mb-4', getStatusIconBadgeClass()]">
                                <component :is="getStatusModalIcon()" class="h-7 w-7" />
                            </div>
                            <h3 class="font-madimione text-2xl text-abyss-800 dark:text-platinum-100">
                                {{ getStatusModalTitle() }}
                            </h3>
                            <p class="font-poppins text-base text-platinum-700 dark:text-platinum-400 mt-2 max-w-xs">
                                {{ getStatusModalMessage() }}
                            </p>
                        </div>

                        <!-- Ban warning notice -->
                        <div v-if="targetStatus === 'banned'" class="warning-notice mb-5">
                            <AlertTriangleIcon class="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p class="text-sm text-red-600 dark:text-red-400">
                                This action is permanent and will prevent the user from accessing their account.
                            </p>
                        </div>

                        <!-- Reason textarea -->
                        <div class="space-y-1.5 mb-6">
                            <label class="field-label">Reason (Optional)</label>
                            <textarea
                                v-model="statusReason"
                                rows="3"
                                placeholder="Enter reason for this action…"
                                class="input-field resize-none
                                       placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                            ></textarea>
                        </div>

                        <div class="flex gap-3">
                            <button @click="closeModals" class="btn-secondary flex-1 justify-center">Cancel</button>
                            <button
                                @click="confirmStatusChange"
                                :disabled="isUpdating"
                                :class="['flex-1 justify-center', getStatusActionBtnClass()]"
                            >
                                <div v-if="isUpdating" class="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white"></div>
                                <span>{{ isUpdating ? 'Processing…' : 'Confirm' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- ═══════════════════════════════════════════════════
             SUSPEND MODAL
        ════════════════════════════════════════════════════ -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div
                    v-if="showSuspendModal"
                    class="modal-scrim"
                    @click.self="closeModals"
                >
                    <div class="modal-shell">
                        <div class="flex flex-col items-center text-center mb-6">
                            <div class="ds-icon-badge ds-icon-badge--orange mb-4">
                                <PauseCircleIcon class="h-7 w-7" />
                            </div>
                            <h3 class="font-madimione text-2xl text-abyss-800 dark:text-platinum-100">
                                Suspend Account
                            </h3>
                            <p class="font-poppins text-base text-platinum-700 dark:text-platinum-400 mt-2">
                                Temporarily suspend
                                <span class="font-semibold text-vawc-orange-600 dark:text-vawc-orange-400">
                                    {{ selectedStudent?.name }}
                                </span>'s account.
                            </p>
                        </div>

                        <div class="space-y-4 mb-6">
                            <div class="space-y-1.5">
                                <label class="field-label">Suspension End Date <span class="text-red-400">*</span></label>
                                <input
                                    type="date"
                                    v-model="suspendUntilDate"
                                    :min="minSuspendDate"
                                    class="input-field"
                                />
                            </div>
                            <div class="space-y-1.5">
                                <label class="field-label">Reason</label>
                                <textarea
                                    v-model="statusReason"
                                    rows="3"
                                    placeholder="Enter reason for suspension…"
                                    class="input-field resize-none
                                           placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                                ></textarea>
                            </div>
                        </div>

                        <div class="flex gap-3">
                            <button @click="closeModals" class="btn-secondary flex-1 justify-center">Cancel</button>
                            <button
                                @click="confirmSuspend"
                                :disabled="isUpdating || !suspendUntilDate"
                                class="btn-primary flex-1 justify-center
                                       !bg-vawc-orange-500 !border-vawc-orange-600 !border-b-4 !border-b-vawc-orange-700
                                       hover:!bg-vawc-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div v-if="isUpdating" class="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white"></div>
                                <span>{{ isUpdating ? 'Processing…' : 'Suspend Account' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- ═══════════════════════════════════════════════════
             BULK ACTION MODAL
        ════════════════════════════════════════════════════ -->
        <Teleport to="body">
            <Transition name="modal-fade">
                <div
                    v-if="showBulkActionModal"
                    class="modal-scrim"
                    @click.self="closeModals"
                >
                    <div class="modal-shell">
                        <div class="flex flex-col items-center text-center mb-6">
                            <div class="ds-icon-badge ds-icon-badge--lavender mb-4">
                                <ZapIcon class="h-7 w-7" />
                            </div>
                            <h3 class="font-madimione text-2xl text-abyss-800 dark:text-platinum-100">
                                Bulk Actions
                            </h3>
                            <p class="font-poppins text-base text-platinum-700 dark:text-platinum-400 mt-2">
                                Apply action to
                                <span class="font-semibold text-calm-lavender-600 dark:text-calm-lavender-400">
                                    {{ selectedStudents.length }}
                                </span> selected students.
                            </p>
                        </div>

                        <div class="space-y-4 mb-6">
                            <div class="space-y-1.5">
                                <label class="field-label">Action</label>
                                <div class="ds-select-wrap">
                                    <select v-model="bulkAction" class="ds-select">
                                        <option value="">Select action…</option>
                                        <option value="active">Reactivate Accounts</option>
                                        <option value="deactivated">Deactivate Accounts</option>
                                        <option value="suspended">Suspend Accounts</option>
                                        <option value="banned">Ban Accounts</option>
                                    </select>
                                    <ChevronDownIcon class="ds-select-icon" />
                                </div>
                            </div>
                            <div v-if="bulkAction === 'suspended'" class="space-y-1.5">
                                <label class="field-label">Suspension End Date <span class="text-red-400">*</span></label>
                                <input
                                    type="date"
                                    v-model="suspendUntilDate"
                                    :min="minSuspendDate"
                                    class="input-field"
                                />
                            </div>
                            <div class="space-y-1.5">
                                <label class="field-label">Reason (Optional)</label>
                                <textarea
                                    v-model="statusReason"
                                    rows="2"
                                    placeholder="Enter reason…"
                                    class="input-field resize-none
                                           placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                                ></textarea>
                            </div>
                        </div>

                        <!-- Ban warning -->
                        <div v-if="bulkAction === 'banned'" class="warning-notice mb-5">
                            <AlertTriangleIcon class="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p class="text-sm text-red-600 dark:text-red-400">
                                You are about to ban {{ selectedStudents.length }} accounts. This action is permanent.
                            </p>
                        </div>

                        <div class="flex gap-3">
                            <button @click="closeModals" class="btn-secondary flex-1 justify-center">Cancel</button>
                            <button
                                @click="confirmBulkAction"
                                :disabled="isUpdating || !bulkAction || (bulkAction === 'suspended' && !suspendUntilDate)"
                                class="btn-primary btn-3d flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div v-if="isUpdating" class="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white"></div>
                                <span>{{ isUpdating ? 'Processing…' : 'Apply Action' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

    </div>

    <!-- ═══════════════════════════════════════════════════
         TELEPORTED ACTION MENU DROPDOWN
    ════════════════════════════════════════════════════ -->
    <Teleport to="body">
        <Transition name="dropdown-fade">
            <div
                v-if="activeActionMenu && activeMenuStudent"
                data-action-dropdown
                class="action-dropdown"
                :style="dropdownPosition"
                style="z-index: 99999;"
            >
                <!-- Dropdown header -->
                <div class="px-4 py-2.5 border-b-2 border-platinum-200 dark:border-abyss-600">
                    <p class="font-mplusrounded text-xs text-platinum-600 dark:text-platinum-500 font-medium">
                        Account Actions
                    </p>
                </div>

                <div class="p-2 space-y-1">
                    <!-- Reactivate -->
                    <button
                        v-if="activeMenuStudent.account_status !== 'active'"
                        @click="openStatusModal(activeMenuStudent, 'active')"
                        class="dropdown-item dropdown-item--teal"
                    >
                        <div class="ds-icon-badge ds-icon-badge--teal !p-1.5">
                            <ShieldCheckIcon class="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p class="font-semibold text-sm text-safety-teal-700 dark:text-safety-teal-400">Reactivate</p>
                            <p class="font-mplusrounded text-xs text-safety-teal-600/70 dark:text-safety-teal-500/70">Restore account access</p>
                        </div>
                    </button>

                    <!-- Deactivate -->
                    <button
                        v-if="activeMenuStudent.account_status === 'active'"
                        @click="openStatusModal(activeMenuStudent, 'deactivated')"
                        class="dropdown-item dropdown-item--muted"
                    >
                        <div class="ds-icon-badge !p-1.5 bg-platinum-200 dark:bg-abyss-600 border-platinum-300 dark:border-abyss-500 text-platinum-600 dark:text-platinum-400">
                            <PowerOffIcon class="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p class="font-semibold text-sm text-abyss-700 dark:text-platinum-300">Deactivate</p>
                            <p class="font-mplusrounded text-xs text-platinum-500">Disable account temporarily</p>
                        </div>
                    </button>

                    <!-- Suspend -->
                    <button
                        v-if="activeMenuStudent.account_status !== 'suspended'"
                        @click="openSuspendModal(activeMenuStudent)"
                        class="dropdown-item dropdown-item--orange"
                    >
                        <div class="ds-icon-badge ds-icon-badge--orange !p-1.5">
                            <PauseCircleIcon class="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p class="font-semibold text-sm text-vawc-orange-700 dark:text-vawc-orange-400">Suspend</p>
                            <p class="font-mplusrounded text-xs text-vawc-orange-600/70 dark:text-vawc-orange-500/70">Temporary restriction</p>
                        </div>
                    </button>

                    <!-- Ban -->
                    <button
                        v-if="activeMenuStudent.account_status !== 'banned'"
                        @click="openStatusModal(activeMenuStudent, 'banned')"
                        class="dropdown-item dropdown-item--red"
                    >
                        <div class="ds-icon-badge ds-icon-badge--red !p-1.5">
                            <ShieldOffIcon class="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <p class="font-semibold text-sm text-red-700 dark:text-red-400">Ban Account</p>
                            <p class="font-mplusrounded text-xs text-red-600/70 dark:text-red-500/70">Permanent restriction</p>
                        </div>
                    </button>
                </div>
            </div>
        </Transition>
    </Teleport>
    </span>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import {
    UsersIcon,
    SearchIcon,
    RefreshCwIcon,
    CheckCircleIcon,
    ClockIcon,
    TrendingUpIcon,
    MoreVerticalIcon,
    BanIcon,
    PauseCircleIcon,
    PowerOffIcon,
    ZapIcon,
    XIcon,
    LoaderIcon,
    AlertTriangleIcon,
    ShieldOffIcon,
    ShieldCheckIcon,
    ChevronDown as ChevronDownIcon
} from 'lucide-vue-next';
import api from '@/utils/api';
import { useToastStore } from '@/stores/toast';
import GenerateReport from '@/components/ui/GenerateReport.vue';
import AppPagination from '@/components/ui/AppPagination.vue';

const toast = useToastStore();

const isLoading = ref(false);
const isUpdating = ref(false);
const students = ref([]);
const searchQuery = ref('');
const filterStatus = ref('all');
const PAGE_SIZE = 3;
const currentPage = ref(1);
const pagination = ref({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0
});

// Selection state
const selectedStudents = ref([]);
const activeActionMenu = ref(null);

// Modal state
const showStatusModal = ref(false);
const showSuspendModal = ref(false);
const showBulkActionModal = ref(false);
const selectedStudent = ref(null);
const targetStatus = ref('');
const statusReason = ref('');
const suspendUntilDate = ref('');
const bulkAction = ref('');
const dropdownPosition = ref({});

let searchDebounceTimer = null;

// Get the student whose action menu is currently open
const activeMenuStudent = computed(() => {
    if (!activeActionMenu.value) return null;
    return students.value.find(s => s.id === activeActionMenu.value);
});

const minSuspendDate = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
});

const studentStats = computed(() => {
    const active = students.value.filter(s => s.account_status === 'active').length;
    const suspended = students.value.filter(s => s.account_status === 'suspended').length;
    const banned = students.value.filter(s => s.account_status === 'banned').length;
    const totalXp = students.value.reduce((sum, s) => sum + (s.xp || 0), 0);
    return {
        total: pagination.value.total,
        active,
        suspended,
        banned,
        avgXp: students.value.length > 0 ? Math.round(totalXp / students.value.length) : 0
    };
});

const fetchStudents = async (page = currentPage.value) => {
    isLoading.value = true;
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: PAGE_SIZE.toString()
        });
        if (searchQuery.value.trim()) params.append('search', searchQuery.value.trim());
        if (filterStatus.value !== 'all') params.append('status', filterStatus.value);
        const response = await api.get(`/api/v1/admin/students?${params}`);
        if (response.data?.students) {
            students.value = response.data.students;
            pagination.value = response.data.pagination;
            currentPage.value = response.data.pagination.page;
        }
    } catch (error) {
        console.error('Failed to fetch students:', error);
        students.value = [];
    } finally {
        isLoading.value = false;
    }
};

// Re-fetch when AppPagination changes the page
watch(currentPage, (page) => fetchStudents(page));

// Reset to page 1 on search/filter, then fetch
const resetAndFetch = () => { currentPage.value = 1; fetchStudents(1); };

const searchStudentsDebounced = () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => resetAndFetch(), 300);
};

const refreshStudents = () => fetchStudents(currentPage.value);

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
};

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Selection methods
const toggleSelectAll = () => {
    if (selectedStudents.value.length === students.value.length) {
        selectedStudents.value = [];
    } else {
        selectedStudents.value = students.value.map(s => s.id);
    }
};

const toggleSelectStudent = (id) => {
    const index = selectedStudents.value.indexOf(id);
    if (index > -1) {
        selectedStudents.value.splice(index, 1);
    } else {
        selectedStudents.value.push(id);
    }
};

// Action menu
const toggleActionMenu = (studentId, event) => {
    if (activeActionMenu.value === studentId) {
        activeActionMenu.value = null;
        return;
    }
    const button = event?.currentTarget || event?.target;
    if (button) {
        const rect = button.getBoundingClientRect();
        const dropdownWidth = 224;
        const dropdownHeight = 280;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        let left = rect.left;
        if (left + dropdownWidth > viewportWidth) left = rect.right - dropdownWidth;
        let top = rect.bottom + 8;
        if (top + dropdownHeight > viewportHeight) top = rect.top - dropdownHeight - 8;
        dropdownPosition.value = { top: `${top}px`, left: `${left}px` };
    }
    activeActionMenu.value = studentId;
};

const closeActionMenu = () => { activeActionMenu.value = null; };

const handleClickOutside = (event) => {
    const isDropdown = event.target.closest('[data-action-dropdown]');
    const isActionButton = event.target.closest('[data-action-button]');
    if (!isDropdown && !isActionButton) activeActionMenu.value = null;
};

const handleScroll = () => {
    if (activeActionMenu.value !== null) activeActionMenu.value = null;
};

// Account status helpers — return design system badge classes
const getAccountStatusBadgeClass = (status) => {
    switch (status) {
        case 'active':      return 'badge-teal';
        case 'suspended':   return 'badge-orange';
        case 'banned':      return 'badge-red';
        case 'deactivated': return 'badge-muted';
        default:            return 'badge-muted';
    }
};

const formatAccountStatus = (status) => {
    if (!status) return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

// Modal methods
const openStatusModal = (student, status) => {
    selectedStudent.value = student;
    targetStatus.value = status;
    statusReason.value = '';
    showStatusModal.value = true;
    closeActionMenu();
};

const openSuspendModal = (student) => {
    selectedStudent.value = student;
    statusReason.value = '';
    suspendUntilDate.value = '';
    showSuspendModal.value = true;
    closeActionMenu();
};

const closeModals = () => {
    showStatusModal.value = false;
    showSuspendModal.value = false;
    showBulkActionModal.value = false;
    selectedStudent.value = null;
    targetStatus.value = '';
    statusReason.value = '';
    suspendUntilDate.value = '';
    bulkAction.value = '';
};

const getStatusModalIcon = () => {
    switch (targetStatus.value) {
        case 'active':      return CheckCircleIcon;
        case 'banned':      return BanIcon;
        case 'deactivated': return PowerOffIcon;
        default:            return CheckCircleIcon;
    }
};

// Returns design system icon badge class for the status modal
const getStatusIconBadgeClass = () => {
    switch (targetStatus.value) {
        case 'active':      return 'ds-icon-badge--teal';
        case 'banned':      return 'ds-icon-badge--red';
        case 'deactivated': return 'bg-platinum-200 dark:bg-abyss-600 border-platinum-300 dark:border-abyss-500 text-platinum-600 dark:text-platinum-400';
        default:            return 'ds-icon-badge--lavender';
    }
};

// Returns Tailwind classes for the confirm button in the status modal
const getStatusActionBtnClass = () => {
    const base = 'btn-primary flex-1 flex items-center gap-2 justify-center disabled:opacity-50';
    switch (targetStatus.value) {
        case 'active':      return `${base} border-b-4 border-safety-teal-700 !bg-safety-teal-600 hover:!bg-safety-teal-700`;
        case 'banned':      return `${base} border-b-4 border-red-700 !bg-red-500 hover:!bg-red-600`;
        case 'deactivated': return `${base} border-b-4 border-platinum-500 !bg-platinum-400 dark:!bg-abyss-500 !text-abyss-800 dark:!text-platinum-200`;
        default:            return `${base} btn-3d`;
    }
};

const getStatusModalTitle = () => {
    switch (targetStatus.value) {
        case 'active':      return 'Reactivate Account';
        case 'banned':      return 'Ban Account';
        case 'deactivated': return 'Deactivate Account';
        default:            return 'Update Account Status';
    }
};

const getStatusModalMessage = () => {
    const name = selectedStudent.value?.name || 'this user';
    switch (targetStatus.value) {
        case 'active':      return `Are you sure you want to reactivate ${name}'s account? They will regain full access to the platform.`;
        case 'banned':      return `Are you sure you want to permanently ban ${name}'s account? This action will prevent them from accessing the platform.`;
        case 'deactivated': return `Are you sure you want to deactivate ${name}'s account? They will lose access until reactivated.`;
        default:            return `Update ${name}'s account status?`;
    }
};

// API calls for status changes
const confirmStatusChange = async () => {
    if (!selectedStudent.value || !targetStatus.value) return;
    isUpdating.value = true;
    try {
        await api.put(`/api/v1/admin/users/${selectedStudent.value.id}/status`, {
            status: targetStatus.value,
            reason: statusReason.value || undefined
        });
        const index = students.value.findIndex(s => s.id === selectedStudent.value.id);
        if (index > -1) students.value[index].account_status = targetStatus.value;
        const statusLabels = { active: 'reactivated', banned: 'banned', deactivated: 'deactivated', suspended: 'suspended' };
        const statusMessage = statusLabels[targetStatus.value] || targetStatus.value;
        closeModals();
        toast.addToast(`Account ${statusMessage} successfully!`, 'success', 4000);
    } catch (error) {
        console.error('Failed to update user status:', error);
        toast.addToast(error.response?.data?.message || 'Failed to update status. Please try again.', 'error', 5000);
    } finally {
        isUpdating.value = false;
    }
};

const confirmSuspend = async () => {
    if (!selectedStudent.value || !suspendUntilDate.value) return;
    isUpdating.value = true;
    try {
        await api.put(`/api/v1/admin/users/${selectedStudent.value.id}/status`, {
            status: 'suspended',
            reason: statusReason.value || undefined,
            suspended_until: suspendUntilDate.value
        });
        const index = students.value.findIndex(s => s.id === selectedStudent.value.id);
        if (index > -1) students.value[index].account_status = 'suspended';
        const suspendDate = new Date(suspendUntilDate.value).toLocaleDateString();
        closeModals();
        toast.addToast(`Account suspended until ${suspendDate}!`, 'warning', 4000);
    } catch (error) {
        console.error('Failed to suspend user:', error);
        toast.addToast(error.response?.data?.message || 'Failed to suspend account. Please try again.', 'error', 5000);
    } finally {
        isUpdating.value = false;
    }
};

const confirmBulkAction = async () => {
    if (!bulkAction.value || selectedStudents.value.length === 0) return;
    if (bulkAction.value === 'suspended' && !suspendUntilDate.value) return;
    const count = selectedStudents.value.length;
    isUpdating.value = true;
    try {
        await api.post('/api/v1/admin/users/bulk-status', {
            userIds: selectedStudents.value,
            status: bulkAction.value,
            reason: statusReason.value || undefined,
            suspended_until: bulkAction.value === 'suspended' ? suspendUntilDate.value : undefined
        });
        students.value.forEach(student => {
            if (selectedStudents.value.includes(student.id)) student.account_status = bulkAction.value;
        });
        const actionLabels = { active: 'reactivated', banned: 'banned', deactivated: 'deactivated', suspended: 'suspended' };
        const actionMessage = actionLabels[bulkAction.value] || bulkAction.value;
        selectedStudents.value = [];
        closeModals();
        toast.addToast(`${count} account(s) ${actionMessage} successfully!`, 'success', 4000);
    } catch (error) {
        console.error('Failed to update users:', error);
        toast.addToast(error.response?.data?.message || 'Failed to update accounts. Please try again.', 'error', 5000);
    } finally {
        isUpdating.value = false;
    }
};

onMounted(() => {
    fetchStudents();
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('scroll', handleScroll, true);
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
   STAT TILE  —  L1: platinum-100 / abyss-700
═══════════════════════════════════════════════════════════ */
.stat-tile {
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-5;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/60;
    @apply transition-colors duration-200;
}

.stat-tile__label {
    @apply text-xs font-medium uppercase tracking-wide;
    @apply text-platinum-600 dark:text-platinum-500;
}

.stat-tile__value {
    @apply text-2xl font-bold leading-none mt-1;
    @apply text-abyss-800 dark:text-platinum-100;
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

.ds-icon-badge--pink {
    @apply bg-neon-pink-50 dark:bg-neon-pink-900/20;
    @apply border-neon-pink-200 dark:border-neon-pink-800/40;
    @apply text-neon-pink-600 dark:text-neon-pink-400;
}

.ds-icon-badge--teal {
    @apply bg-safety-teal-50 dark:bg-safety-teal-900/20;
    @apply border-safety-teal-200 dark:border-safety-teal-800/40;
    @apply text-safety-teal-600 dark:text-safety-teal-400;
}

.ds-icon-badge--orange {
    @apply bg-vawc-orange-50 dark:bg-vawc-orange-900/20;
    @apply border-vawc-orange-200 dark:border-vawc-orange-800/30;
    @apply text-vawc-orange-600 dark:text-vawc-orange-400;
}

.ds-icon-badge--red {
    @apply bg-red-50 dark:bg-red-900/20;
    @apply border-red-200 dark:border-red-800/40;
    @apply text-red-500 dark:text-red-400;
}

/* ═══════════════════════════════════════════════════════════
   TABLE PANEL  —  L1: platinum-100 / abyss-700
═══════════════════════════════════════════════════════════ */
.table-panel {
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-5;
}

.th-cell {
    @apply px-4 py-3 text-xs font-semibold uppercase tracking-wide;
    @apply text-platinum-600 dark:text-platinum-500;
}

.td-cell {
    @apply px-4 py-3.5 whitespace-nowrap;
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
   PAGINATION BUTTONS
═══════════════════════════════════════════════════════════ */
.pag-btn {
    @apply inline-flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply text-abyss-800 dark:text-platinum-200;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50;
    @apply disabled:opacity-40 disabled:cursor-not-allowed;
}

.pag-btn--active {
    @apply bg-calm-lavender-600 dark:bg-calm-lavender-700 text-white;
    @apply border-calm-lavender-700 dark:border-calm-lavender-600;
    @apply border-b-4 border-b-calm-lavender-800;
    @apply hover:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600;
}

/* ═══════════════════════════════════════════════════════════
   MODAL SCRIM + SHELL  —  consistent with all other modals
═══════════════════════════════════════════════════════════ */
.modal-scrim {
    @apply fixed inset-0 z-50 bg-abyss-950/60 backdrop-blur-sm overflow-y-auto;
    @apply flex items-start justify-center pt-24 px-6 pb-6;
}

.modal-shell {
    @apply relative w-full max-w-md;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-7;
}

/* ── Warning notice inside modals ────────────────────────── */
.warning-notice {
    @apply flex items-start gap-3 px-4 py-3 rounded-xl;
    @apply bg-red-50 dark:bg-red-900/10;
    @apply border-2 border-red-200 dark:border-red-800/30;
}

/* ═══════════════════════════════════════════════════════════
   ACTION DROPDOWN  —  L1 elevated above table
═══════════════════════════════════════════════════════════ */
.action-dropdown {
    @apply fixed w-56;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl overflow-hidden;
}

.dropdown-item {
    @apply w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-left;
    @apply border-2 border-transparent;
}

.dropdown-item--teal {
    @apply hover:bg-safety-teal-50 dark:hover:bg-safety-teal-900/20;
    @apply hover:border-safety-teal-200 dark:hover:border-safety-teal-800/40;
}

.dropdown-item--muted {
    @apply hover:bg-platinum-200 dark:hover:bg-abyss-600;
    @apply hover:border-platinum-300 dark:hover:border-abyss-500;
}

.dropdown-item--orange {
    @apply hover:bg-vawc-orange-50 dark:hover:bg-vawc-orange-900/20;
    @apply hover:border-vawc-orange-200 dark:hover:border-vawc-orange-800/30;
}

.dropdown-item--red {
    @apply hover:bg-red-50 dark:hover:bg-red-900/20;
    @apply hover:border-red-200 dark:hover:border-red-800/40;
}

/* ═══════════════════════════════════════════════════════════
   FLAT-3D BUTTON MODIFIERS
═══════════════════════════════════════════════════════════ */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

.btn-3d--secondary {
    @apply border-b-4 border-platinum-400 dark:border-abyss-400
           active:border-b active:translate-y-px;
}

/* ═══════════════════════════════════════════════════════════
   TRANSITIONS
═══════════════════════════════════════════════════════════ */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; }

.dropdown-fade-enter-active { transition: all 0.15s ease-out; }
.dropdown-fade-leave-active { transition: all 0.1s ease-in; }
.dropdown-fade-enter-from, .dropdown-fade-leave-to { opacity: 0; transform: scale(0.97) translateY(-4px); }

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

/* ── Select option colors ────────────────────────────────── */
select option {
    @apply bg-platinum-50 text-abyss-800;
}

.dark select option {
    @apply bg-abyss-600 text-platinum-100;
}
</style>