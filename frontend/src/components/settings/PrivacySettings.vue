<template>
    <div class="max-w-4xl mx-auto space-y-8">
        
        <!-- Header -->
        <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-black dark:text-white">Privacy & Visibility</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Control who can see your profile and activity.</p>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12">
            <div class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else class="space-y-6">
            
            <!-- Profile Visibility -->
            <div class="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="space-y-1">
                        <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                            <component :is="settings.profile_visibility === 'public' ? Globe : Lock" class="w-4 h-4 text-purple-600" />
                            Profile Visibility
                        </h4>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">
                            {{ settings.profile_visibility === 'public' 
                               ? 'Your profile is visible to other ProtectEd users.' 
                               : 'Your profile is hidden and only visible to you.' }}
                        </p>
                    </div>
                    <select v-model="settings.profile_visibility" 
                        class="block w-full sm:w-40 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white text-xs font-bold shadow-sm focus:ring-purple-500 focus:border-purple-500 py-3 px-4">
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                    </select>
                </div>
            </div>

            <!-- Toggles Grid -->
            <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
                
                <!-- Messages Toggle -->
                <div class="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
                    <div class="space-y-1">
                        <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                            <MessageSquare class="w-4 h-4 text-purple-600" />
                            Direct Messages
                        </h4>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Allow other users to send you messages.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.allow_messages" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                </div>

                <!-- Achievements Toggle -->
                <div class="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl"
                    :class="{ 'opacity-50 pointer-events-none': settings.profile_visibility !== 'public' }">
                    <div class="space-y-1">
                        <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                            <Trophy class="w-4 h-4 text-purple-600" />
                            Show Achievements
                        </h4>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Display your badges on your public profile.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.show_achievements" :disabled="settings.profile_visibility !== 'public'" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                </div>

                <!-- Learning Progress Toggle -->
                <div class="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl"
                    :class="{ 'opacity-50 pointer-events-none': settings.profile_visibility !== 'public' }">
                    <div class="space-y-1">
                        <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                            <Activity class="w-4 h-4 text-purple-600" />
                            Show Learning Progress
                        </h4>
                        <p class="text-[11px] text-slate-500 dark:text-slate-400">Display your module completion stats.</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="settings.show_progress" :disabled="settings.profile_visibility !== 'public'" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                </div>
            </div>

            <!-- Info Box -->
            <div class="rounded-2xl bg-purple-50 dark:bg-purple-500/10 p-5 border border-purple-100 dark:border-purple-500/20">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <ShieldCheck class="h-5 w-5 text-purple-600" aria-hidden="true" />
                    </div>
                    <div class="ml-3">
                        <h3 class="text-xs font-black uppercase tracking-wider text-purple-800 dark:text-purple-300">Privacy Information</h3>
                        <div class="mt-2 text-[11px] text-purple-700 dark:text-purple-300/80">
                            <p>Private personal information (like your exact address, phone number, and emergency contacts) is never shared publicly, regardless of your profile visibility settings.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pt-6 border-t border-slate-200 dark:border-white/5 flex justify-end">
                <button @click="saveSettings" :disabled="isSaving || isLoading"
                    class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all flex items-center gap-2">
                    <div v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {{ isSaving ? 'Saving...' : 'Save Preferences' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import {
    ShieldCheck,
    Globe,
    Lock,
    Trophy,
    Activity,
    MessageSquare
} from 'lucide-vue-next';
import { useProfileStore } from '@/stores/profile';
import { useToast } from '@/utils/useToast';

const profileStore = useProfileStore();
const toast = useToast();

const isLoading = ref(false);
const isSaving = ref(false);

const settings = ref({
    profile_visibility: 'private',
    show_achievements: true,
    show_progress: false,
    allow_messages: false
});

const loadSettings = async () => {
    isLoading.value = true;
    try {
        await profileStore.fetchPrivacySettings();
        if (profileStore.privacySettings) {
            settings.value = { ...profileStore.privacySettings };
        }
    } catch (error) {
        toast.error('Failed to load settings');
    } finally {
        isLoading.value = false;
    }
};

const saveSettings = async () => {
    isSaving.value = true;
    try {
        const success = await profileStore.updatePrivacySettings(settings.value);
        if (success) {
            toast.success('Privacy preferences updated');
        }
    } catch (error) {
        console.error('Save settings error:', error);
    } finally {
        isSaving.value = false;
    }
};

watch(() => settings.value.profile_visibility, (newValue) => {
    if (newValue !== 'public') {
        settings.value.show_achievements = false;
        settings.value.show_progress = false;
    }
});

onMounted(() => loadSettings());
</script>