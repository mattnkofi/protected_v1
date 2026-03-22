<template>
  <div class="max-w-4xl mx-auto space-y-8">
    
    <!-- Header -->
    <div>
        <h3 class="text-sm font-black uppercase tracking-wider text-black dark:text-white">Notification Preferences</h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Manage your email and platform notifications.</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="space-y-6">
        
        <!-- Safety Alerts (Always On) -->
        <div class="p-5 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-2xl flex justify-between items-center">
             <div class="space-y-1">
                <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <ShieldAlert class="w-4 h-4 text-purple-600" />
                    Safety Alerts
                </h4>
                <p class="text-[11px] text-purple-700 dark:text-purple-300/80">Critical security notifications. Cannot be disabled.</p>
            </div>
            <div class="flex items-center text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/20 px-3 py-1.5 rounded-full">
                Always On
            </div>
        </div>

        <!-- Master Email Toggle -->
        <div class="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex justify-between items-center">
            <div class="space-y-1">
                <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                    <Mail class="w-4 h-4 text-purple-600" />
                    Email Notifications
                </h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Receive summaries and updates via email.</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="preferences.email_notifications" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
        </div>

        <!-- Sub-settings Grid -->
        <div class="grid gap-4 pl-0 md:pl-6" :class="{ 'opacity-50 pointer-events-none': !preferences.email_notifications }">
            
            <!-- Learning Reminders -->
            <div class="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex justify-between items-center">
                <div class="space-y-1">
                    <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                        <Activity class="w-4 h-4 text-purple-600" />
                        Learning Reminders
                    </h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">Get notified about your course progress.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="preferences.module_reminders" :disabled="!preferences.email_notifications" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
            </div>

            <!-- Achievement Alerts -->
            <div class="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex justify-between items-center">
                <div class="space-y-1">
                    <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                        <Trophy class="w-4 h-4 text-purple-600" />
                        Achievement Alerts
                    </h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">Notifications for earning badges and rewards.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="preferences.achievement_alerts" :disabled="!preferences.email_notifications" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
            </div>

            <!-- Platform Updates -->
            <div class="p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl flex justify-between items-center">
                <div class="space-y-1">
                    <h4 class="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                        <Globe class="w-4 h-4 text-purple-600" />
                        Platform Updates
                    </h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">Occasional news about new features.</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="preferences.platform_updates" :disabled="!preferences.email_notifications" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
            </div>
        </div>

        <!-- Action Button -->
        <div class="pt-6 border-t border-slate-200 dark:border-white/5 flex justify-end">
            <button @click="savePreferences" :disabled="isSaving || isLoading"
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
  ShieldAlert, 
  Bell, 
  Mail, 
  Activity, 
  Trophy, 
  Globe 
} from 'lucide-vue-next';
import { useProfileStore } from '@/stores/profile';
import { useToast } from '@/utils/useToast';

const profileStore = useProfileStore();
const toast = useToast();

const isLoading = ref(false);
const isSaving = ref(false);

const preferences = ref({
  email_notifications: true,
  module_reminders: true,
  achievement_alerts: true,
  safety_alerts: true,
  platform_updates: false
});

const loadPreferences = async () => {
  isLoading.value = true;
  try {
    await profileStore.fetchNotificationSettings();
    if (profileStore.notificationSettings) {
      preferences.value = {
        ...profileStore.notificationSettings,
        safety_alerts: true 
      };
    }
  } catch (error) {
    toast.error('Failed to load preferences');
  } finally {
    isLoading.value = false;
  }
};

const savePreferences = async () => {
  isSaving.value = true;
  try {
    const dataToSave = { ...preferences.value, safety_alerts: true };
    const success = await profileStore.updateNotificationSettings(dataToSave);
    if (success) {
      toast.success('Preferences updated successfully');
    }
  } catch (error) {
    console.error('Save preferences error:', error);
  } finally {
    isSaving.value = false;
  }
};

watch(() => preferences.value.email_notifications, (newValue) => {
  if (!newValue) {
    preferences.value.module_reminders = false;
    preferences.value.achievement_alerts = false;
    preferences.value.platform_updates = false;
  }
});

onMounted(() => loadPreferences());
</script>