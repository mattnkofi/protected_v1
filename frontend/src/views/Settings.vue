<template>
    <div class="page-wrapper animate-in">

        <!-- Page Header -->
        <div class="pb-5 border-b border-slate-200 dark:border-abyss-600">
            <button @click="router.back()" class="back-btn group mb-3 inline-flex">
                <ArrowLeftIcon class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
            </button>
            <h1 class="page-title">
                App <span class="brand-gradient-text">Settings</span>
            </h1>
            <p class="page-subtitle">Manage your account, privacy, and notification preferences.</p>
        </div>

        <div class="flex flex-col lg:flex-row gap-5">

            <!-- ── Sidebar nav ── -->
            <aside class="w-full lg:w-56 shrink-0">
                <nav class="card p-2 space-y-1">
                    <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                        class="settings-nav-btn group w-full"
                        :class="activeTab === tab.id ? 'settings-nav-active' : 'settings-nav-inactive'">

                        <!-- Icon wrapper -->
                        <div class="p-1.5 rounded-lg transition-colors"
                            :class="activeTab === tab.id
                                ? 'bg-calm-lavender-500/10 border border-calm-lavender-500/20'
                                : 'bg-slate-100 dark:bg-abyss-700 border border-slate-200 dark:border-abyss-500 group-hover:border-calm-lavender-500/20'">
                            <component :is="tab.icon" class="w-3.5 h-3.5 shrink-0" />
                        </div>

                        <span class="text-left flex-1">{{ tab.name }}</span>

                        <!-- Active indicator dot -->
                        <div v-if="activeTab === tab.id" class="w-1.5 h-1.5 rounded-full bg-calm-lavender-500 shrink-0">
                        </div>
                    </button>
                </nav>

                <!-- Quick hint -->
                <div
                    class="mt-3 px-3 py-3 bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border border-calm-lavender-200 dark:border-calm-lavender-800/30 rounded-2xl">
                    <p
                        class="text-[10px] font-semibold uppercase tracking-widest text-calm-lavender-600 dark:text-calm-lavender-400 mb-1">
                        Tip</p>
                    <p class="text-[11px] text-slate-600 dark:text-platinum-400 leading-relaxed">
                        Changes are saved per-section. Look for the <strong
                            class="text-calm-lavender-600 dark:text-calm-lavender-400">Save</strong> button inside each
                        panel.
                    </p>
                </div>
            </aside>

            <!-- ── Main panel ── -->
            <main class="flex-1 min-w-0">
                <!-- Panel label strip -->
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="p-2 rounded-xl bg-calm-lavender-50 dark:bg-calm-lavender-900/30 border border-calm-lavender-200 dark:border-calm-lavender-800/40">
                        <component :is="activeTabMeta.icon"
                            class="w-4 h-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                    </div>
                    <div>
                        <h2 class="text-sm font-semibold text-slate-700 dark:text-platinum-200">{{ activeTabMeta.name }}
                        </h2>
                        <p class="text-xs text-platinum-500">{{ activeTabMeta.description }}</p>
                    </div>
                </div>

                <div class="card overflow-hidden p-0">
                    <Transition mode="out-in" name="fade">
                        <component :is="currentComponent" :key="activeTab" class="p-6" />
                    </Transition>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
    User, Shield, Bell, Settings as SettingsIcon, ArrowLeft as ArrowLeftIcon
} from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import ProfileSettings from '@/components/settings/ProfileSettings.vue';
import PrivacySettings from '@/components/settings/PrivacySettings.vue';
import NotificationSettings from '@/components/settings/NotificationSettings.vue';
import AccountManagement from '@/components/settings/AccountManagement.vue';

const router = useRouter();
const auth = useAuthStore();
const profileStore = useProfileStore();

const activeTab = ref('profile');

const tabs = [
    {
        id: 'profile',
        name: 'Profile',
        description: 'Update your display name, bio, and personal details.',
        icon: User,
        component: ProfileSettings
    },
    {
        id: 'privacy',
        name: 'Privacy & Security',
        description: 'Manage your password and account security.',
        icon: Shield,
        component: PrivacySettings
    },
    {
        id: 'notifications',
        name: 'Notifications',
        description: 'Control what alerts and emails you receive.',
        icon: Bell,
        component: NotificationSettings
    },
    {
        id: 'account',
        name: 'Account',
        description: 'Username, email, and danger zone options.',
        icon: SettingsIcon,
        component: AccountManagement
    },
];

const activeTabMeta = computed(() => tabs.find(t => t.id === activeTab.value) ?? tabs[0]);
const currentComponent = computed(() => activeTabMeta.value.component);

onMounted(async () => {
    if (auth.user) await profileStore.fetchProfile(auth.user.id);
});
</script>

<style scoped>
@reference "@/style.css";

.page-wrapper {
    @apply space-y-5 text-slate-900 dark:text-white;
}

.page-title {
    @apply font-madimione text-2xl text-slate-800 dark:text-platinum-100 leading-tight;
}

.page-subtitle {
    @apply font-mplusrounded text-sm text-platinum-600 dark:text-platinum-500 mt-0.5;
}

.back-btn {
    @apply flex items-center gap-2 text-xs font-medium text-platinum-500 hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400 transition-colors;
}

.brand-gradient-text {
    @apply bg-gradient-to-r from-calm-lavender-600 to-neon-pink-500 bg-clip-text text-transparent;
}

.card {
    @apply bg-white dark:bg-abyss-600 border border-slate-200 dark:border-abyss-500 rounded-2xl p-5;
}

.settings-nav-btn {
    @apply flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all text-left;
}

.settings-nav-active {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/30 text-calm-lavender-700 dark:text-calm-lavender-400;
}

.settings-nav-inactive {
    @apply text-platinum-600 dark:text-platinum-400 hover:bg-slate-50 dark:hover:bg-abyss-700 hover:text-slate-700 dark:hover:text-platinum-200;
}

.animate-in {
    animation: fadeSlideUp 0.4s ease-out forwards;
}

@keyframes fadeSlideUp {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>