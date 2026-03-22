<template>
    <div class="max-w-4xl mx-auto space-y-10">

        <!-- Deletion Pending Alert -->
        <div v-if="deletionStatus?.has_pending_deletion" class="p-5 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div class="flex items-start gap-3">
                <AlertTriangle class="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                    <h3 class="text-xs font-black uppercase tracking-wider text-orange-800 dark:text-orange-200">Account Deletion Scheduled</h3>
                    <p class="text-[11px] text-orange-700 dark:text-orange-300 mt-1">
                        Your account will be permanently deleted on <strong>{{ formatDate(deletionStatus.scheduled_deletion_date) }}</strong>.
                    </p>
                </div>
            </div>
            <button @click="cancelDeletion" :disabled="isCancelling"
                class="px-4 py-2.5 bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-200 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-orange-200 dark:hover:bg-orange-500/30 transition-colors shrink-0">
                {{ isCancelling ? 'Processing...' : 'Cancel Deletion' }}
            </button>
        </div>
        
        <!-- Password Change -->
        <section class="space-y-6">
            <div>
                <h3 class="text-sm font-black uppercase tracking-wider text-black dark:text-white">Change Password</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Update your password to keep your account secure.</p>
            </div>

            <div class="grid gap-6">
                <div class="grid gap-2">
                    <label class="text-[10px] font-black uppercase tracking-wider text-slate-500">Current Password</label>
                    <input v-model="passwordData.current_password" type="password" 
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="grid gap-2">
                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500">New Password</label>
                        <input v-model="passwordData.password" type="password" 
                            class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                        <p class="text-[10px] text-slate-500">Minimum 8 characters</p>
                    </div>
                    <div class="grid gap-2">
                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500">Confirm New Password</label>
                        <input v-model="passwordData.password_confirmation" type="password" 
                            class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                    </div>
                </div>

                <div class="flex justify-end">
                    <button @click="changePassword" :disabled="!isPasswordFormValid || isChangingPassword"
                        class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                        <div v-if="isChangingPassword" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        {{ isChangingPassword ? 'Updating...' : 'Update Password' }}
                    </button>
                </div>
            </div>
        </section>

        <!-- Active Sessions -->
        <section class="space-y-6 pt-8 border-t border-slate-200 dark:border-white/5">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-sm font-black uppercase tracking-wider text-black dark:text-white">Active Sessions</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Manage devices where you're currently logged in.</p>
                </div>
                <button @click="logoutAllDevices" :disabled="isLoggingOut"
                    class="text-[10px] font-black uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
                    <LogOut class="w-4 h-4" />
                    Sign out all
                </button>
            </div>

            <div v-if="isLoadingSessions" class="flex justify-center py-8">
                <div class="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <div v-else class="space-y-3">
                <div v-for="session in sessions" :key="session.id" 
                    class="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
                    <div class="flex items-center gap-4">
                        <div class="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl">
                            <Monitor class="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-black dark:text-white">{{ session.device_name || 'Unknown Device' }}</span>
                                <span v-if="session.is_current" class="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-wider">Current</span>
                            </div>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{{ session.ip_address }} • Last active {{ formatDateTime(session.last_activity) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Danger Zone -->
        <section class="space-y-6 pt-8 border-t border-slate-200 dark:border-white/5">
            <div>
                <h3 class="text-sm font-black uppercase tracking-wider text-red-600">Danger Zone</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Irreversible actions for your account.</p>
            </div>

            <div class="space-y-4">
                <!-- Deactivate -->
                <div class="p-5 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white">Deactivate Account</h4>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Temporarily hide your profile and activity.</p>
                    </div>
                    <button @click="confirmDeactivation" :disabled="isDeactivating"
                        class="px-4 py-2.5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors whitespace-nowrap">
                        Deactivate
                    </button>
                </div>

                <!-- Delete -->
                <div class="p-5 border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h4 class="text-xs font-black uppercase tracking-wider text-red-900 dark:text-red-200">Delete Account</h4>
                        <p class="text-[11px] text-red-700 dark:text-red-300/80 mt-1">Permanently delete your account and all data.</p>
                    </div>
                    <button @click="showDeleteForm = true"
                        class="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors whitespace-nowrap shadow-lg shadow-red-500/25">
                        Delete Account
                    </button>
                </div>
            </div>
        </section>

        <!-- Delete Modal -->
        <div v-if="showDeleteForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white dark:bg-[#0d0d12] border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
                <div class="space-y-2 text-center">
                    <div class="mx-auto w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle class="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 class="text-sm font-black uppercase tracking-wider text-black dark:text-white">Delete Account?</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                        This action cannot be undone. All your data will be permanently removed.
                    </p>
                </div>

                <div class="space-y-4">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500">Enter Password</label>
                        <input v-model="deleteForm.password" type="password" 
                            class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 text-sm px-4 py-3" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500">Type <span class="font-mono text-red-600 font-bold">DELETE MY ACCOUNT</span></label>
                        <input v-model="deleteForm.confirm_text" type="text" placeholder="DELETE MY ACCOUNT"
                            class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 text-sm px-4 py-3" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black uppercase tracking-wider text-slate-500">Reason (Optional)</label>
                        <textarea v-model="deleteForm.reason" rows="3"
                            class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-black dark:text-white shadow-sm focus:border-red-500 focus:ring-red-500 text-sm px-4 py-3 resize-none"></textarea>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button @click="cancelDeleteForm" class="flex-1 px-4 py-3 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors">
                        Cancel
                    </button>
                    <button @click="requestDeletion" :disabled="!isDeleteFormValid || isDeleting"
                        class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/25 disabled:opacity-50 transition-colors">
                        {{ isDeleting ? 'Deleting...' : 'Confirm Delete' }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    AlertTriangle,
    Monitor,
    LogOut,
    PauseCircle, // Keep imports if needed, though PauseCircle wasn't used in template
    Trash2 // Keep imports if needed, though Trash2 wasn't used in template
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { useToast } from '@/utils/useToast';

const router = useRouter();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const toast = useToast();

// State
const showDeleteForm = ref(false);
const isDeleting = ref(false);
const isDeactivating = ref(false);
const isChangingPassword = ref(false);
const isLoggingOut = ref(false);
const isCancelling = ref(false);
const isLoadingSessions = ref(false);

const deleteForm = ref({
    password: '',
    confirm_text: '',
    reason: ''
});

const deletionStatus = ref(null);
const sessions = ref([]);

// Password change state
const passwordData = ref({
    current_password: '',
    password: '',
    password_confirmation: ''
});

// Computed
const isDeleteFormValid = computed(() => {
    return deleteForm.value.confirm_text === 'DELETE MY ACCOUNT' &&
        deleteForm.value.password.length > 0;
});

const isPasswordFormValid = computed(() => {
    return passwordData.value.current_password &&
        passwordData.value.password &&
        passwordData.value.password_confirmation &&
        passwordData.value.password === passwordData.value.password_confirmation &&
        passwordData.value.password.length >= 8;
});

// Methods
const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const changePassword = async () => {
    isChangingPassword.value = true;
    try {
        const result = await authStore.changePassword(passwordData.value);
        if (result.ok) {
            passwordData.value = {
                current_password: '',
                password: '',
                password_confirmation: ''
            };
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }
    } catch (error) {
        // Error toast handled by store
    } finally {
        isChangingPassword.value = false;
    }
};

const loadSessions = async () => {
    isLoadingSessions.value = true;
    try {
        const sessionList = await authStore.fetchSessions();
        sessions.value = sessionList || [];
    } catch (error) {
        toast.error('Failed to load sessions');
    } finally {
        isLoadingSessions.value = false;
    }
};

const logoutAllDevices = async () => {
    if (!confirm('This will log you out of all devices including this one. You will need to log in again. Continue?')) {
        return;
    }
    isLoggingOut.value = true;
    try {
        await authStore.logoutAll();
        toast.success('Logged out of all devices');
        router.push('/login');
    } catch (error) {
        toast.error('Failed to logout');
    } finally {
        isLoggingOut.value = false;
    }
};

const confirmDeactivation = async () => {
    if (!confirm('Are you sure you want to deactivate your account? Your profile will be hidden and you can reactivate within 30 days by logging in again.')) {
        return;
    }
    isDeactivating.value = true;
    try {
        const success = await profileStore.deactivateAccount();
        if (success) {
            router.push('/login');
        }
    } catch (error) {
    } finally {
        isDeactivating.value = false;
    }
};

const requestDeletion = async () => {
    isDeleting.value = true;
    try {
        const success = await profileStore.requestAccountDeletion(
            deleteForm.value.password,
            deleteForm.value.reason
        );
        if (success) {
            await loadDeletionStatus();
            showDeleteForm.value = false;
            deleteForm.value = {
                password: '',
                confirm_text: '',
                reason: ''
            };
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    } catch (error) {
    } finally {
        isDeleting.value = false;
    }
};

const cancelDeletion = async () => {
    if (!confirm('Are you sure you want to cancel the account deletion? Your account will be reactivated.')) {
        return;
    }
    isCancelling.value = true;
    try {
        const success = await profileStore.cancelAccountDeletion();
        if (success) {
            deletionStatus.value = null;
        }
    } catch (error) {
    } finally {
        isCancelling.value = false;
    }
};

const cancelDeleteForm = () => {
    showDeleteForm.value = false;
    deleteForm.value = {
        password: '',
        confirm_text: '',
        reason: ''
    };
};

const loadDeletionStatus = async () => {
    try {
        const status = await profileStore.getDeletionStatus();
        deletionStatus.value = status;
    } catch (error) {
        console.error('Failed to load deletion status:', error);
    }
};

onMounted(async () => {
    await Promise.all([
        loadSessions(),
        loadDeletionStatus()
    ]);
});
</script>

<style scoped>
/* Removed custom transitions for simpler Tailwind classes */
</style>