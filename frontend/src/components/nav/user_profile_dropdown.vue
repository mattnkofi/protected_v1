<template>
    <div class="relative custom-font-poppins">
        <!-- Trigger button -->
        <button ref="triggerRef" @click.stop="open = !open" type="button" :aria-expanded="open"
            class="flex items-center gap-2 p-1 pr-3 rounded-2xl container-bg-dark border border-platinum-200 dark:border-abyss-600 hover:border-calm-lavender-500/30 transition-all active:scale-95 group">

            <!-- Avatar -->
            <div
                class="relative w-8 h-8 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="w-full h-full object-cover" />
                <div v-else
                    class="w-full h-full bg-gradient-to-br from-calm-lavender-600 via-neon-pink-500 to-calm-lavender-700 flex items-center justify-center text-[10px] font-black text-white uppercase">
                    {{ initials }}
                </div>
            </div>

            <!-- First name -->
            <span
                class="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-abyss-700 dark:text-platinum-300 group-hover:text-calm-lavender-600 dark:group-hover:text-platinum-50 transition-colors">
                {{ firstName }}
            </span>

            <ChevronDown
                :class="['w-3 h-3 text-abyss-400 dark:text-platinum-500 transition-transform duration-300', open ? 'rotate-180 text-calm-lavender-600 dark:text-calm-lavender-400' : '']" />
        </button>

        <!-- Floating dropdown via Teleport -->
        <Teleport to="body">
            <Transition name="slide-up">
                <div v-if="open" ref="dropdownRef"
                    class="fixed z-[110] w-64 container-bg-dark border border-platinum-200 dark:border-abyss-600 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">

                    <!-- User info header -->
                    <div class="px-5 py-4 border-b border-platinum-200 dark:border-abyss-600">
                        <p
                            class="text-[8px] font-black text-abyss-400 dark:text-platinum-500 uppercase tracking-[0.3em]">
                            Account Access</p>
                        <p
                            class="text-[11px] font-black text-abyss-900 dark:text-platinum-50 truncate mt-1.5 uppercase tracking-tight">
                            {{ userName }}</p>
                        <p
                            class="text-[9px] font-bold text-calm-lavender-600 dark:text-calm-lavender-400 truncate tracking-wide">
                            {{ userEmail }}</p>
                    </div>

                    <!-- Menu items -->
                    <div class="p-2 space-y-1">
                        <button @click="goProfile" class="menu-item group/m">
                            <div
                                class="p-2 rounded-lg bg-calm-lavender-500/5 border border-calm-lavender-500/10 group-hover/m:bg-calm-lavender-500/10 transition-colors">
                                <UserIcon class="w-3.5 h-3.5 text-calm-lavender-600 dark:text-calm-lavender-400" />
                            </div>
                            <span class="flex-1 text-left">Profile</span>
                        </button>

                        <button @click="goSettings" class="menu-item group/m">
                            <div
                                class="p-2 rounded-lg bg-neon-pink-500/5 border border-neon-pink-500/10 group-hover/m:bg-neon-pink-500/10 transition-colors">
                                <SettingsIcon class="w-3.5 h-3.5 text-neon-pink-500" />
                            </div>
                            <span class="flex-1 text-left">Settings</span>
                        </button>

                        <div class="h-px bg-platinum-200 dark:bg-abyss-600 mx-2 my-1"></div>

                        <button @click="isLogoutModalOpen = true; open = false"
                            class="menu-item text-red-600 border-none hover:bg-red-50 dark:hover:bg-red-500/5 group/m">
                            <div
                                class="p-2 rounded-lg bg-red-500/5 border border-red-500/10 group-hover/m:bg-red-500/20 transition-colors">
                                <LogOut class="w-3.5 h-3.5" />
                            </div>
                            <span class="flex-1 text-left">Logout</span>
                        </button>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <ConfirmLogoutModal :is-open="isLogoutModalOpen" @close="isLogoutModalOpen = false" @confirm="executeLogout" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { computePosition, flip, shift, offset } from '@floating-ui/dom'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import ConfirmLogoutModal from '@/components/ui/ConfirmLogoutModal.vue'
import { ChevronDown, User as UserIcon, Settings as SettingsIcon, LogOut } from 'lucide-vue-next'

const open = ref(false)
const isLogoutModalOpen = ref(false)
const router = useRouter()
const auth = useAuthStore()
const profileStore = useProfileStore()

const triggerRef = ref(null)
const dropdownRef = ref(null)

/* --- Derived data --- */
const userName = computed(() => profileStore.profile?.display_name || auth.user?.name || 'User')
const firstName = computed(() => userName.value.split(' ')[0])
const userEmail = computed(() => auth.user?.email || '—')
const userAvatar = computed(() => profileStore.avatarUrl?.(80) ?? null)
const initials = computed(() =>
    userName.value.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2)
)

/* --- Floating positioning (same as sidebar profile dropdown) --- */
const reposition = async () => {
    if (!open.value) return
    await nextTick()
    if (!triggerRef.value || !dropdownRef.value) return
    const { x, y } = await computePosition(triggerRef.value, dropdownRef.value, {
        placement: 'bottom-end',
        middleware: [offset(8), flip(), shift({ padding: 8 })],
    })
    Object.assign(dropdownRef.value.style, { left: `${x}px`, top: `${y}px` })
}

watch(open, (isOpen) => { if (isOpen) reposition() })

/* --- Navigation --- */
function goProfile() { open.value = false; router.push({ name: 'profile' }) }
function goSettings() { open.value = false; router.push({ name: 'settings' }) }

async function executeLogout() {
    try {
        await auth.logout()
        profileStore.$reset?.()
    } finally {
        isLogoutModalOpen.value = false
        router.push({ name: 'login' })
    }
}

/* --- Click-away --- */
function onClickAway(e) {
    if (!open.value) return
    const insideTrigger = triggerRef.value?.contains(e.target)
    const insideDropdown = dropdownRef.value?.contains(e.target)
    if (!insideTrigger && !insideDropdown) open.value = false
}

onMounted(async () => {
    window.addEventListener('click', onClickAway)
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    if (auth.isAuthenticated && !profileStore.profile) {
        try { await profileStore.fetchProfile(auth.user.id) } catch { }
    }
})

onUnmounted(() => {
    window.removeEventListener('click', onClickAway)
    window.removeEventListener('resize', reposition)
    window.removeEventListener('scroll', reposition, true)
})
</script>

<style scoped>
@reference "@/style.css";

.custom-font-poppins {
    font-family: 'Poppins', sans-serif !important;
}

.menu-item {
    @apply w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-abyss-600 dark:text-platinum-400 hover:text-calm-lavender-600 dark:hover:text-platinum-50 hover:bg-calm-lavender-500/5 transition-all rounded-xl;
    font-family: 'Poppins', sans-serif !important;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(15px) scale(0.95);
}
</style>