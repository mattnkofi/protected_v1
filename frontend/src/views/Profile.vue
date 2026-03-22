<template>
    <div class="page-wrapper animate-in">

        <!-- Page Header -->
        <div class="pb-5 border-b border-slate-200 dark:border-abyss-600">
            <button @click="$router.back()" class="back-btn group mb-3 inline-flex">
                <ArrowLeft class="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
            </button>
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h1 class="page-title">My Profile</h1>
                    <p class="page-subtitle">Your public profile and account information.</p>
                </div>
                <router-link :to="{ name: 'settings' }" class="btn-edit shrink-0">
                    <PencilIcon class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">Edit Profile</span>
                </router-link>
            </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="profileStore.isLoading" class="animate-pulse space-y-5">
            <div class="flex items-center gap-5">
                <div class="w-20 h-20 bg-slate-200 dark:bg-abyss-600 rounded-2xl"></div>
                <div class="space-y-2 flex-1">
                    <div class="h-5 w-48 bg-slate-200 dark:bg-abyss-600 rounded-lg"></div>
                    <div class="h-4 w-32 bg-slate-200 dark:bg-abyss-600 rounded-lg"></div>
                </div>
            </div>
            <div class="h-64 bg-slate-200 dark:bg-abyss-600 rounded-2xl"></div>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <!-- ── Left column ── -->
            <div class="space-y-4">

                <!-- Avatar & identity card -->
                <div class="card text-center">
                    <div class="relative w-fit mx-auto mb-4">
                        <div
                            class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-calm-lavender-200 dark:border-calm-lavender-800/50 bg-slate-100 dark:bg-abyss-700 mx-auto">
                            <img v-if="userAvatar" :src="userAvatar" :alt="profile?.display_name"
                                class="w-full h-full object-cover" />
                            <div v-else
                                class="w-full h-full bg-gradient-to-br from-calm-lavender-600 via-neon-pink-500 to-calm-lavender-700 flex items-center justify-center text-2xl font-black text-white uppercase">
                                {{ initials }}
                            </div>
                        </div>
                    </div>

                    <h2 class="font-semibold text-base text-slate-800 dark:text-platinum-100 leading-snug">
                        {{ profile?.display_name || authStore.user?.name || 'Student' }}
                    </h2>
                    <p class="text-sm text-platinum-500 mt-0.5 flex items-center justify-center gap-1">
                        <AtSign class="w-3 h-3" />
                        {{ authStore.user?.username || authStore.user?.name || 'username' }}
                    </p>

                    <div class="flex flex-wrap gap-2 mt-4 justify-center">
                        <span class="badge badge-lavender capitalize">{{ authStore.user?.role || 'Member' }}</span>
                        <span v-if="profileStore.isProfileComplete" class="badge badge-teal flex items-center gap-1">
                            <CheckCircle class="w-3 h-3" /> Verified
                        </span>
                    </div>

                    <!-- Bio -->
                    <p v-if="profile?.bio"
                        class="mt-4 text-sm text-slate-600 dark:text-platinum-400 text-left leading-relaxed border-t border-slate-100 dark:border-abyss-500 pt-4">
                        {{ profile.bio }}
                    </p>
                    <p v-else
                        class="mt-4 text-sm text-platinum-400 italic border-t border-slate-100 dark:border-abyss-500 pt-4">
                        No bio added yet.
                    </p>
                </div>

                <!-- Gamification Stats -->
                <div v-if="profile?.gamification" class="card space-y-3">
                    <h3 class="section-eyebrow">Player Stats</h3>
                    <div class="space-y-2">
                        <div class="stat-row">
                            <div
                                class="p-2 rounded-lg bg-calm-lavender-50 dark:bg-calm-lavender-900/20 border border-calm-lavender-100 dark:border-calm-lavender-800/30">
                                <Award class="w-4 h-4 text-calm-lavender-600 dark:text-calm-lavender-400" />
                            </div>
                            <div>
                                <p class="text-[10px] text-platinum-500 uppercase tracking-wide">Current Rank</p>
                                <p class="text-sm font-medium text-slate-700 dark:text-platinum-200">{{
                                    profile.gamification.current_title || 'Novice' }}</p>
                            </div>
                        </div>
                        <div class="stat-row">
                            <div
                                class="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                                <Star class="w-4 h-4 text-amber-500 fill-amber-500" />
                            </div>
                            <div>
                                <p class="text-[10px] text-platinum-500 uppercase tracking-wide">XP Earned</p>
                                <p class="text-sm font-medium text-slate-700 dark:text-platinum-200 tabular-nums">
                                    {{ (profile.gamification.experience_points || 0).toLocaleString() }}
                                </p>
                            </div>
                        </div>
                        <div class="stat-row">
                            <div
                                class="p-2 rounded-lg bg-safety-teal-50 dark:bg-safety-teal-900/20 border border-safety-teal-100 dark:border-safety-teal-800/30">
                                <Trophy class="w-4 h-4 text-safety-teal-600 dark:text-safety-teal-400" />
                            </div>
                            <div>
                                <p class="text-[10px] text-platinum-500 uppercase tracking-wide">Total Points</p>
                                <p class="text-sm font-medium text-slate-700 dark:text-platinum-200 tabular-nums">
                                    {{ (profile.gamification.total_points || 0).toLocaleString() }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contact Info -->
                <div class="card space-y-3">
                    <h3 class="section-eyebrow">Contact Info</h3>
                    <div class="space-y-2">
                        <div class="contact-row">
                            <Mail class="w-3.5 h-3.5 text-calm-lavender-500 shrink-0 mt-0.5" />
                            <div>
                                <p class="text-[10px] text-platinum-500 uppercase tracking-wide">Email</p>
                                <p class="text-sm font-medium text-slate-700 dark:text-platinum-200 break-all">{{
                                    authStore.user?.email }}</p>
                            </div>
                        </div>
                        <div class="contact-row">
                            <Phone class="w-3.5 h-3.5 text-calm-lavender-500 shrink-0 mt-0.5" />
                            <div>
                                <p class="text-[10px] text-platinum-500 uppercase tracking-wide">Phone</p>
                                <p class="text-sm font-medium text-slate-700 dark:text-platinum-200">{{
                                    profile?.phone_number || 'Not set' }}</p>
                            </div>
                        </div>
                        <div class="contact-row">
                            <MapPin class="w-3.5 h-3.5 text-calm-lavender-500 shrink-0 mt-0.5" />
                            <div>
                                <p class="text-[10px] text-platinum-500 uppercase tracking-wide">Location</p>
                                <p class="text-sm font-medium text-slate-700 dark:text-platinum-200">
                                    {{ locationText }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── Right column ── -->
            <div class="lg:col-span-2 space-y-4">

                <!-- Personal Information -->
                <div class="card space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <h3 class="text-sm font-semibold text-slate-700 dark:text-platinum-200">Personal Information
                            </h3>
                            <p class="text-xs text-platinum-500 mt-0.5">Your basic identification details.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="info-field">
                            <p class="info-label">Display Name</p>
                            <p class="info-value">{{ profile?.display_name || '—' }}</p>
                        </div>
                        <div class="info-field">
                            <p class="info-label">Date of Birth</p>
                            <p class="info-value">{{ formattedDob }}</p>
                        </div>
                        <div class="info-field">
                            <p class="info-label">Gender</p>
                            <p class="info-value capitalize">{{ profile?.sex || '—' }}</p>
                        </div>
                        <div class="info-field">
                            <p class="info-label">Phone</p>
                            <p class="info-value">{{ profile?.phone_number || '—' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Address -->
                <div class="card space-y-4">
                    <div>
                        <h3 class="text-sm font-semibold text-slate-700 dark:text-platinum-200">Address Details</h3>
                        <p class="text-xs text-platinum-500 mt-0.5">Where can we reach you?</p>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="info-field sm:col-span-2">
                            <p class="info-label">Street Address</p>
                            <p class="info-value">{{ profile?.address_line1 || '—' }}</p>
                        </div>
                        <div class="info-field">
                            <p class="info-label">City</p>
                            <p class="info-value">{{ profile?.city || '—' }}</p>
                        </div>
                        <div class="info-field">
                            <p class="info-label">Province / State</p>
                            <p class="info-value">{{ profile?.province || '—' }}</p>
                        </div>
                        <div class="info-field">
                            <p class="info-label">Postal Code</p>
                            <p class="info-value">{{ profile?.postal_code || '—' }}</p>
                        </div>
                        <div class="info-field">
                            <p class="info-label">Country</p>
                            <p class="info-value">{{ profile?.country || '—' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Account Info -->
                <div class="card space-y-4">
                    <div>
                        <h3 class="text-sm font-semibold text-slate-700 dark:text-platinum-200">Account</h3>
                        <p class="text-xs text-platinum-500 mt-0.5">Your login credentials and identifiers.</p>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="info-field">
                            <p class="info-label">Username</p>
                            <p class="info-value flex items-center gap-1.5">
                                <AtSign class="w-3.5 h-3.5 text-calm-lavender-500" />
                                {{ authStore.user?.username || authStore.user?.name || '—' }}
                            </p>
                        </div>
                        <div class="info-field">
                            <p class="info-label">Email</p>
                            <p class="info-value flex items-center gap-1.5">
                                <Mail class="w-3.5 h-3.5 text-calm-lavender-500" />
                                {{ authStore.user?.email || '—' }}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import {
    MapPin, Mail, Phone, AtSign, CheckCircle,
    Trophy, Star, Award, ArrowLeft, Pencil as PencilIcon
} from 'lucide-vue-next';

const profileStore = useProfileStore();
const authStore = useAuthStore();

const profile = computed(() => profileStore.profile);

const initials = computed(() => {
    const name = profile.value?.display_name || authStore.user?.name || 'S'
    return name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2)
})

const userAvatar = computed(() => profileStore.avatarUrl?.(160) ?? null)

const locationText = computed(() => {
    const p = profile.value
    if (!p) return 'Not set'
    const parts = [p.city, p.country].filter(Boolean)
    return parts.length ? parts.join(', ') : 'Not set'
})

const formattedDob = computed(() => {
    const dob = profile.value?.date_of_birth
    if (!dob) return '—'
    return new Date(dob).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
})

onMounted(async () => {
    if (authStore.user?.id && !profileStore.profile) {
        try { await profileStore.fetchProfile(authStore.user.id) } catch (e) { console.error(e) }
    }
})
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

.btn-edit {
    @apply flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-calm-lavender-50 dark:bg-calm-lavender-900/30 text-calm-lavender-700 dark:text-calm-lavender-400 border border-calm-lavender-200 dark:border-calm-lavender-800/40 hover:bg-calm-lavender-100 dark:hover:bg-calm-lavender-900/50 transition-all;
}

.card {
    @apply bg-white dark:bg-abyss-600 border border-slate-200 dark:border-abyss-500 rounded-2xl p-5;
}

.section-eyebrow {
    @apply text-xs font-semibold uppercase tracking-widest text-calm-lavender-600 dark:text-calm-lavender-400;
}

.badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium;
}

.badge-lavender {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/30 text-calm-lavender-700 dark:text-calm-lavender-400 border border-calm-lavender-200 dark:border-calm-lavender-800/40;
}

.badge-teal {
    @apply bg-safety-teal-50 dark:bg-safety-teal-900/20 text-safety-teal-700 dark:text-safety-teal-400 border border-safety-teal-200 dark:border-safety-teal-800/40;
}

.stat-row {
    @apply flex items-center gap-3 p-3 bg-slate-50 dark:bg-abyss-700 border border-slate-100 dark:border-abyss-500 rounded-xl;
}

.contact-row {
    @apply flex items-start gap-3 p-3 bg-slate-50 dark:bg-abyss-700 border border-slate-100 dark:border-abyss-500 rounded-xl;
}

/* Read-only info fields */
.info-field {
    @apply px-4 py-3 bg-slate-50 dark:bg-abyss-700 border border-slate-100 dark:border-abyss-500 rounded-xl space-y-0.5;
}

.info-label {
    @apply text-[10px] font-semibold uppercase tracking-widest text-platinum-500 dark:text-platinum-500;
}

.info-value {
    @apply text-sm font-medium text-slate-700 dark:text-platinum-200;
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
</style>