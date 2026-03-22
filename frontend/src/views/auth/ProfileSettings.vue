<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@stores/auth'
import {
    User, Mail, Phone, MapPin, Save, Upload, X, Lock, Eye, EyeOff, Settings, Camera, Lightbulb, ShieldCheck
} from 'lucide-vue-next'
import { useToast } from '@/utils/useToast';

// --- Component: ToggleSwitch ---
const ToggleSwitch = {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    template: `
        <div class="flex items-center justify-between py-3 group">
            <label v-if="label" class="text-slate-500 dark:text-slate-400 font-semibold text-xs cursor-pointer group-hover:text-purple-500 transition-colors">{{ label }}</label>
            <button @click="$emit('update:modelValue', !modelValue)"
                :class="modelValue ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/20' : 'bg-slate-200 dark:bg-white/10'"
                class="relative inline-flex flex-shrink-0 h-6 w-11 rounded-full cursor-pointer transition-all duration-300 focus:outline-none">
                <span :class="modelValue ? 'translate-x-5' : 'translate-x-1'"
                    class="mt-1 pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-300">
                </span>
            </button>
        </div>
    `,
}

const auth = useAuthStore()
const toast = useToast()

const isSaving = ref(false)
const avatarFile = ref(null)

const form = reactive({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: '',
})
const initialForm = ref({})

const preferences = reactive({
    emailNotifications: true,
    darkMode: true,
    publicProfile: false,
})

onMounted(async () => {
    if (!auth.user) await auth.restoreSession()
    const u = auth.user || {}
    Object.assign(form, {
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        bio: u.bio || '',
        avatar_url: u.avatar_url || ''
    })
    initialForm.value = JSON.parse(JSON.stringify(form))
})

const hasChanges = computed(() => JSON.stringify(form) !== JSON.stringify(initialForm.value))

function handleAvatarInput(e) {
    const file = e.target.files?.[0]
    if (!file) return
    avatarFile.value = file
    form.avatar_url = URL.createObjectURL(file)
}

function removeAvatar() {
    avatarFile.value = null
    form.avatar_url = ''
}

async function onUploadAvatar() {
    if (!avatarFile.value) return
    isSaving.value = true
    try {
        await auth.uploadAvatar(avatarFile.value)
        toast.success('Photo updated!');
        initialForm.value.avatar_url = form.avatar_url
    } catch (e) {
        toast.error('Could not update photo');
    } finally {
        isSaving.value = false
    }
}

async function onSaveProfile() {
    isSaving.value = true
    try {
        await auth.updateProfile({ ...form })
        initialForm.value = JSON.parse(JSON.stringify(form))
        toast.success('Profile saved!');
    } catch (e) {
        toast.error('Could not save profile');
    } finally {
        isSaving.value = false
    }
}

/* -------- Password Logic ---------- */
const pwd = reactive({ current_password: '', password: '', password_confirmation: '' })
const pwdSaving = ref(false)
const show = reactive({ current: false, new: false, confirm: false })

const pwdHints = computed(() => ({
    min8: pwd.password.length >= 8,
    mixed: /[a-z]/.test(pwd.password) && /[A-Z]/.test(pwd.password),
    num: /\d/.test(pwd.password),
    match: !!pwd.password && pwd.password === pwd.password_confirmation,
}))

const strengthWidth = computed(() => {
    const count = Object.values(pwdHints.value).filter(Boolean).length
    return ['0%', '25%', '50%', '75%', '100%'][count]
})

const strengthColor = computed(() => {
    const count = Object.values(pwdHints.value).filter(Boolean).length
    return ['bg-slate-500', 'bg-rose-500', 'bg-fuchsia-500', 'bg-violet-500', 'bg-purple-500'][count]
})

async function onChangePassword() {
    if (!Object.values(pwdHints.value).every(Boolean)) {
        toast.error('Please fix all password rules');
        return
    }
    pwdSaving.value = true
    try {
        await auth.changePassword({ ...pwd })
        toast.success('Password changed!');
        Object.assign(pwd, { current_password: '', password: '', password_confirmation: '' })
    } catch (e) {
        toast.error('Could not change password');
    } finally {
        pwdSaving.value = false
    }
}
</script>

<template>
    <div class="space-y-8 custom-font-poppins animate-in fade-in duration-700 text-black dark:text-white transition-all selection:bg-purple-500/30 pb-20">
        
        <!-- Header -->
        <header class="border-b border-slate-200 dark:border-white/5 pb-8">
            <div class="flex items-center gap-4 mb-4">
                <div class="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/20">
                    <Settings class="w-6 h-6 text-white" />
                </div>
                <div>
                    <div class="flex items-center gap-2.5">
                        <div class="h-1 w-8 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-full"></div>
                        <span class="text-[10px] font-extrabold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Account</span>
                    </div>
                    <h1 class="text-3xl md:text-4xl font-[900] text-black dark:text-white uppercase tracking-tighter leading-tight">
                        My <span class="bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">Settings</span>
                    </h1>
                </div>
            </div>
            <p class="text-xs font-medium text-black/50 dark:text-slate-400 tracking-tight">Change your profile, photo, and password here.</p>
        </header>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left Column - Main Forms -->
            <div class="lg:col-span-8 space-y-8">
                
                <!-- Profile Photo Section -->
                <section class="bg-white/90 dark:bg-[#0d0d15]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden">
                    <div class="h-12 border-b border-slate-200 dark:border-white/5 flex items-center px-8 bg-slate-50/50 dark:bg-white/[0.02]">
                        <Camera class="w-4 h-4 text-purple-500 mr-3" />
                        <span class="text-[10px] font-[900] text-purple-600 dark:text-purple-400 uppercase tracking-widest">Profile Photo</span>
                    </div>
                    
                    <div class="p-8">
                        <div class="flex flex-col sm:flex-row items-center gap-8">
                            <div class="relative group">
                                <div class="w-28 h-28 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/10 shadow-xl">
                                    <img :src="form.avatar_url || '/placeholder.svg'" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                </div>
                                <div class="absolute -inset-2 bg-purple-500/10 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            <div class="flex-1 space-y-4 w-full text-center sm:text-left">
                                <div @click="$refs.avatarInput?.click()" class="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-purple-500/5 hover:border-purple-500/50 transition-all group/upload">
                                    <Upload class="w-6 h-6 text-slate-400 group-hover/upload:text-purple-500 mx-auto mb-2 transition-all group-hover/upload:-translate-y-1" />
                                    <p class="text-slate-600 dark:text-white text-xs font-semibold">Click to upload new photo</p>
                                </div>
                                <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarInput" />
                                
                                <div class="flex flex-wrap gap-3 justify-center sm:justify-start">
                                    <button :disabled="!avatarFile || isSaving" @click="onUploadAvatar" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-[10px] font-[900] uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-30">
                                        Save Photo
                                    </button>
                                    <button @click="removeAvatar" class="px-6 py-3 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-[900] uppercase tracking-widest rounded-xl hover:text-red-500 transition-all border border-transparent hover:border-red-500/20">Remove</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Profile Info Section -->
                <section class="bg-white/90 dark:bg-[#0d0d15]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden">
                    <div class="h-12 border-b border-slate-200 dark:border-white/5 flex items-center px-8 bg-slate-50/50 dark:bg-white/[0.02]">
                        <User class="w-4 h-4 text-purple-500 mr-3" />
                        <span class="text-[10px] font-[900] text-purple-600 dark:text-purple-400 uppercase tracking-widest">My Info</span>
                    </div>
                    
                    <div class="p-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div class="space-y-2">
                                <label class="text-[10px] font-[900] uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                <input v-model="form.name" type="text" class="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all outline-none text-sm" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] font-[900] uppercase tracking-widest text-slate-400 ml-1">Email (cannot change)</label>
                                <div class="relative">
                                    <input :value="form.email" disabled class="w-full px-5 py-3.5 rounded-xl bg-slate-100/50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 text-slate-400 cursor-not-allowed outline-none text-sm" />
                                    <Lock class="absolute right-4 top-3.5 w-4 h-4 text-slate-300 dark:text-slate-700" />
                                </div>
                            </div>
                        </div>
                        <div class="space-y-2 mb-8">
                            <label class="text-[10px] font-[900] uppercase tracking-widest text-slate-400 ml-1">About Me</label>
                            <textarea v-model="form.bio" rows="3" class="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all outline-none resize-none text-sm font-medium"></textarea>
                        </div>
                        <div class="flex justify-end gap-4 border-t border-slate-100 dark:border-white/5 pt-6">
                            <button @click="() => Object.assign(form, initialForm)" :disabled="!hasChanges || isSaving" class="text-xs font-semibold text-slate-400 hover:text-purple-600 transition-all">Undo Changes</button>
                            <button @click="onSaveProfile" :disabled="!hasChanges || isSaving" class="px-8 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-[10px] font-[900] uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-30">Save</button>
                        </div>
                    </div>
                </section>
            </div>

            <!-- Right Column - Sidebar -->
            <div class="lg:col-span-4 space-y-6">
                
                <!-- Preferences Section -->
                <section class="bg-white/90 dark:bg-[#0d0d15]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl lg:sticky lg:top-8">
                    <div class="flex items-center gap-3 mb-6">
                        <Lightbulb class="w-4 h-4 text-fuchsia-500" />
                        <span class="text-[10px] font-[900] text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-widest">Preferences</span>
                    </div>
                    <div class="space-y-2 border-b border-slate-100 dark:border-white/5 pb-4">
                        <ToggleSwitch v-model="preferences.emailNotifications" label="Email Alerts" />
                        <ToggleSwitch v-model="preferences.darkMode" label="Dark Mode" />
                        <ToggleSwitch v-model="preferences.publicProfile" label="Public Profile" />
                    </div>
                </section>

                <!-- Password Section -->
                <section class="bg-white/90 dark:bg-[#0d0d15]/40 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-xl">
                    <div class="flex items-center gap-3 mb-6">
                        <ShieldCheck class="w-4 h-4 text-fuchsia-500" />
                        <span class="text-[10px] font-[900] text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-widest">Password</span>
                    </div>
                    <div class="space-y-4">
                        <div class="relative">
                            <input :type="show.current ? 'text' : 'password'" v-model="pwd.current_password" placeholder="Current password" class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none focus:border-purple-500/50 transition-all" />
                            <button @click="show.current = !show.current" class="absolute right-4 top-3 text-slate-400 hover:text-purple-500"><Eye v-if="!show.current" class="w-4 h-4"/><EyeOff v-else class="w-4 h-4"/></button>
                        </div>
                        <div class="relative">
                            <input :type="show.new ? 'text' : 'password'" v-model="pwd.password" placeholder="New password" class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none focus:border-purple-500/50 transition-all" />
                            <button @click="show.new = !show.new" class="absolute right-4 top-3 text-slate-400 hover:text-purple-500"><Eye v-if="!show.new" class="w-4 h-4"/><EyeOff v-else class="w-4 h-4"/></button>
                        </div>

                        <div v-if="pwd.password" class="space-y-2 px-1 animate-in fade-in">
                            <div class="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1 overflow-hidden">
                                <div class="h-full transition-all duration-500" :class="strengthColor" :style="{ width: strengthWidth }"></div>
                            </div>
                            <div class="grid grid-cols-2 gap-1.5">
                                <div v-for="(hint, key) in { min8: '8+ letters', mixed: 'Upper & lower', num: 'Has number', match: 'Match' }" :key="key" 
                                    :class="pwdHints[key] ? 'text-purple-500' : 'text-slate-300 dark:text-slate-600'" class="text-[9px] font-semibold flex items-center gap-1.5 transition-colors">
                                    <div class="w-1 h-1 rounded-full bg-current"></div> {{ hint }}
                                </div>
                            </div>
                        </div>

                        <button @click="onChangePassword" :disabled="pwdSaving" class="w-full py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-[10px] font-[900] uppercase tracking-widest rounded-xl shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-2">
                           Change Password
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');

.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}

.animate-in {
    animation: fadeSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

input, textarea {
    transition: all 0.3s ease;
}

input:focus, textarea:focus {
    transform: scale(1.01);
}
</style>