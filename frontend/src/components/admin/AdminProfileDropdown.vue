<template>
    <div class="relative profile-node custom-font-poppins" ref="dropdownRef">
        <button @click.stop="isOpen = !isOpen" type="button" :aria-expanded="isOpen" 
            class="w-full flex items-center gap-4 p-2.5 pr-6 rounded-[2rem] bg-white/60 dark:bg-[#0d0d15]/60 backdrop-blur-3xl border border-white dark:border-white/10 hover:border-purple-500/50 dark:hover:border-fuchsia-500/50 transition-all active:scale-95 group shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] relative overflow-hidden">
            
            <div class="relative flex-shrink-0 z-10">
                <div class="relative w-12 h-12 rounded-2xl overflow-hidden p-[3px] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-500">
                    <img :src="authStore.user?.avatar_url || defaultAvatar" alt="Admin Avatar" 
                        class="w-full h-full object-cover rounded-[0.9rem] border-2 border-white dark:border-[#0d0d15]" />
                </div>
                <div class="absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 bg-purple-500 border-[3.5px] border-white dark:border-[#0d0d15] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div>
            </div>

            <transition name="fade">
                <div v-if="expanded" class="flex-1 text-left overflow-hidden z-10">
                    <p class="text-[15px] font-[900] text-black dark:text-white uppercase tracking-tight truncate leading-none italic">
                        {{ (authStore.user?.name || 'Admin User').split(' ')[0] }}
                    </p>
                    <p class="text-[10px] font-black text-purple-600 dark:text-fuchsia-400 uppercase tracking-widest leading-none mt-1.5 italic">
                        Administrator
                    </p>
                </div>
            </transition>

            <ChevronDownIcon v-if="expanded" :class="['w-5 h-5 text-black/40 dark:text-slate-400 transition-transform duration-700 z-10', isOpen ? 'rotate-180 text-purple-600 dark:text-fuchsia-500' : '']" />
            
            <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        <Transition name="slide-up">
            <div v-if="isOpen" class="absolute bottom-full left-0 right-0 mb-5 w-72 bg-white/95 dark:bg-[#0f0f18]/95 backdrop-blur-3xl border border-white dark:border-white/10 rounded-[2.8rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)] overflow-hidden z-[110] p-3">
                <div class="px-6 py-8 bg-slate-50 dark:bg-white/[0.03] rounded-[2.2rem] mb-2 border border-slate-100 dark:border-white/5 relative overflow-hidden">
                    <div class="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/10 dark:bg-fuchsia-600/10 rounded-full blur-3xl animate-pulse"></div>
                    
                    <p class="text-[10px] font-black text-black/50 dark:text-slate-400 uppercase tracking-[0.3em] italic">Admin Account</p>
                    <p class="text-[17px] font-[900] text-black dark:text-white truncate mt-2 uppercase tracking-tight italic leading-none">{{ authStore.user?.name || 'Admin User' }}</p>
                    <p class="text-[12px] font-medium text-black/70 dark:text-slate-400 truncate tracking-wide mt-2">{{ authStore.user?.email || 'Administrator' }}</p>
                </div>
                
                <div class="space-y-1.5 p-1">
                    <button @click="goProfile" class="menu-item group/m">
                        <div class="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 transition-all group-hover/m:scale-110 shadow-inner border border-purple-500/10">
                            <UserIcon class="w-5 h-5" />
                        </div>
                        <span class="flex-1 text-left text-[13px] font-black uppercase tracking-widest text-black/80 dark:text-slate-300 group-hover/m:text-purple-600 dark:group-hover/m:text-fuchsia-400 transition-colors">My Profile</span>
                    </button>
                    
                    <button @click="goSettings" class="menu-item group/m">
                        <div class="p-3 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 transition-all group-hover/m:scale-110 shadow-inner border border-fuchsia-500/10">
                            <SettingsIcon class="w-5 h-5" />
                        </div>
                        <span class="flex-1 text-left text-[13px] font-black uppercase tracking-widest text-black/80 dark:text-slate-300 group-hover/m:text-fuchsia-600 dark:group-hover/m:text-fuchsia-400 transition-colors">Settings</span>
                    </button>
                    
                    <div class="h-px bg-slate-200/50 dark:bg-white/5 my-2 mx-5"></div>
                    
                    <button @click="triggerLogout" class="menu-item group/m">
                        <div class="p-3 rounded-xl bg-red-500/10 text-red-500 transition-all group-hover/m:scale-110 shadow-inner border border-red-500/10">
                            <LogOutIcon class="w-5 h-5" />
                        </div>
                        <span class="flex-1 text-left text-[13px] font-black uppercase tracking-widest text-red-600">Sign Out</span>
                    </button>
                </div>
            </div>
        </Transition>

        <Teleport to="body">
            <Transition name="fade">
                <div v-if="showModal" class="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl custom-font-poppins">
                    <div class="absolute inset-0" @click="showModal = false"></div>
                    
                    <div class="relative bg-white dark:bg-[#0f0f18] border border-slate-200 dark:border-white/10 rounded-[4rem] p-12 max-w-sm w-full text-center shadow-[0_60px_150px_rgba(0,0,0,0.5)] flex flex-col items-center animate-vessel overflow-hidden">
                        <div class="absolute -top-16 -right-16 w-48 h-48 bg-red-600/15 rounded-full blur-3xl animate-pulse"></div>

                        <div class="w-24 h-24 bg-gradient-to-br from-red-500 to-red-800 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(239,68,68,0.4),inset_0_2px_8px_rgba(255,255,255,0.3)] mb-10 transition-transform hover:rotate-12 duration-700">
                            <LogOutIcon class="w-12 h-12" />
                        </div>
                        
                        <div class="space-y-4 mb-12">
                            <h3 class="text-4xl font-[900] uppercase tracking-tighter text-black dark:text-white leading-none italic">Terminate?</h3>
                            <p class="text-[15px] font-medium text-black/60 dark:text-slate-400 leading-relaxed italic uppercase tracking-widest text-center">End admin session?</p>
                        </div>

                        <div class="grid grid-cols-2 gap-5 w-full">
                            <button @click="showModal = false" 
                                class="px-6 py-5 bg-slate-100 dark:bg-white/5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest text-black/50 hover:text-black dark:hover:text-white transition-all shadow-inner border border-transparent hover:border-slate-300 dark:hover:border-white/10">
                                Cancel
                            </button>
                            <button @click="confirmLogout" 
                                class="px-6 py-5 bg-gradient-to-br from-red-600 to-red-800 text-white rounded-[1.5rem] text-[12px] font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
    ChevronDownIcon,
    UserIcon,
    SettingsIcon,
    LogOutIcon
} from 'lucide-vue-next';

const props = defineProps({
    expanded: Boolean
});

const router = useRouter();
const authStore = useAuthStore();
const isOpen = ref(false);
const showModal = ref(false);
const dropdownRef = ref(null);

const defaultAvatar = 'https://ui-avatars.com/api/?name=Admin&background=0d0d12&color=2563eb&bold=true';

const goProfile = () => {
    isOpen.value = false;
    router.push({ name: 'profile' });
}

const goSettings = () => {
    isOpen.value = false;
    router.push({ name: 'settings' });
};

const triggerLogout = () => {
    isOpen.value = false;
    showModal.value = true;
};

const confirmLogout = async () => {
    showModal.value = false;
    try {
        await authStore.logout();
        
        router.push({ name: 'login' }); 
        
    } catch (error) {
        console.error('Logout error:', error);
    }
};

const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');

.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}

.menu-item {
    @apply w-full flex items-center gap-5 px-5 py-4 transition-all rounded-[2rem] border border-transparent;
}

.menu-item:hover {
    @apply bg-slate-100/50 dark:bg-white/[0.04] border-slate-200 dark:border-white/10 shadow-sm;
}

/* Entry Physics */
.animate-vessel {
    animation: vesselSlide 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes vesselSlide {
    from { opacity: 0; transform: translateY(40px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

.slide-up-enter-active, .slide-up-leave-active { 
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); 
}
.slide-up-enter-from, .slide-up-leave-to { 
    opacity: 0; 
    transform: translateY(20px) scale(0.95); 
}

.fade-enter-active, .fade-leave-active { 
    transition: opacity 0.4s ease; 
}
.fade-enter-from, .fade-leave-to { 
    opacity: 0; 
}
</style>