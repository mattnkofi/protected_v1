<!-- frontend\src\components\nav\home_sidebar.vue -->
<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/api'
import { useAuthStore } from '@/stores/auth' // Added for dynamic user name
import {
    ClipboardList,
    UserPlus,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight,
    SquareArrowUpRight,
    Share2,
    BookOpen,
    LogOut,
    User,
    Users2,
    AlertCircle,
    Heart,
    Handshake,
    Trophy,
    MoreVertical,
    Gift
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore() // Access auth store

/** Props */
const props = defineProps({
    isMobileOpen: { type: Boolean, default: false },
    userId: { type: [String, Number, null], default: null },
})
const emit = defineEmits(['close-mobile-sidebar', 'expanded-change'])

/* ------- responsive + mode ------- */
const expanded = ref(false)
const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => width.value < 768)

const mode = computed(() => {
    if (isMobile.value) return props.isMobileOpen ? 'mobile-full' : 'hidden'
    return expanded.value ? 'full' : 'icon'
})
const isHidden = computed(() => mode.value === 'hidden')
const isMobileShown = computed(() => mode.value === 'mobile-full')
const isIcon = computed(() => mode.value === 'icon')
const isFull = computed(() => mode.value === 'full')

watchEffect(() => emit('expanded-change', isFull.value))

/* ------- learning modules data (Contents preserved) ------- */
const modules = ref([
    { id: 1, name: 'Gender & Power', icon: '👥', progress: 65, status: 'in-progress' },
    { id: 2, name: 'Recognizing VAWC', icon: '🚨', progress: 100, status: 'completed' },
    { id: 3, name: 'Sexual Health 101', icon: '💚', progress: 40, status: 'in-progress' },
    { id: 4, name: 'Support Resources', icon: '🤝', progress: 0, status: 'not-started' },
])

const myLearningPaths = ref([
    { id: 1, name: 'VAWC Prevention', progress: 65, modules: 4 },
    { id: 2, name: 'Sexual Health', progress: 40, modules: 5 },
    { id: 3, name: 'GAD Management', progress: 25, modules: 6 },
])

/* ------- helpers (Functions preserved) ------- */
function goModule(moduleId) { router.push({ name: 'module', params: { id: moduleId } }) }
function goPath(pathId) { router.push({ name: 'learning-path', params: { id: pathId } }) }
function goLeaderboard() { router.push({ name: 'leaderboard' }) }
function goSettings() { router.push({ name: 'settings' }) }


/* ------- organizations data (Contents preserved) ------- */
const mine = ref([])
const all = ref([])
const reqs = ref([])
const loading = ref({ mine: false, all: false, req: false })

async function loadMine() {
    loading.value.mine = true
    try {
        const { data } = await axios.get('/api/organizations/my')
        mine.value = data || []
    } finally { loading.value.mine = false }
}

async function loadAll() {
    loading.value.all = true
    try {
        const { data } = await axios.get('/api/organizations', { params: { scope: 'others' } })
        all.value = data || []
    } finally { loading.value.all = false }
}

async function loadReqs() {
    loading.value.req = true
    try {
        const { data } = await axios.get('/api/organizations/my-requests')
        reqs.value = data || []
    } finally { loading.value.req = false }
}

const R2_WORKER_ENDPOINT = import.meta.env.VITE_R2_WORKER_ENDPOINT || ''

function getOrgLogoUrl(org) {
    if (!org || !org.logo) return ''
    const path = org.logo
    if (typeof path !== 'string') return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (!R2_WORKER_ENDPOINT) return ''
    const cleanEndpoint = R2_WORKER_ENDPOINT.replace(/\/$/, '')
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    return `${cleanEndpoint}/${cleanPath}`
}

function getOrgInitials(org) {
    const name = org?.name || auth.user?.name || '?'
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '?'
    const first = parts[0]?.[0] || ''
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase()
}

function goSharedDocuments() {
    if (currentId.value) {
        router.push({ name: 'org.shared-documents', params: { id: currentId.value } })
    } else {
        router.push({ name: 'home.shared-documents' })
    }
}

const currentId = computed(() => props.orgId ?? route.params.id ?? null)

if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => (width.value = window.innerWidth))
}

onMounted(() => {
    loadMine()
    loadAll()
    loadReqs()
})
</script>

<template>
    <div class="sidebar-container">
        <Transition 
            enter-active-class="transition-opacity duration-300" 
            leave-active-class="transition-opacity duration-200" 
            enter-from-class="opacity-0" 
            leave-to-class="opacity-0"
        >
            <div v-if="isMobileShown" class="fixed inset-0 z-40 md:hidden bg-[#020203]/90 backdrop-blur-md" @click="$emit('close-mobile-sidebar')" />
        </Transition>

        <aside :class="[
            'fixed top-16 left-0 bottom-0 z-[60] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] font-[\'Poppins\']',
            'bg-white dark:bg-[#060608] text-black dark:text-white border-r border-slate-200 dark:border-white/5',
            isHidden && 'hidden md:block translate-x-[-100%]',
            isIcon && 'w-20 md:block',
            isFull && 'w-64 md:block',
            isMobileShown && 'w-72 md:hidden shadow-2xl'
        ]">
        <div class="h-full flex flex-col relative overflow-hidden">
            <!-- Background Glow -->
            <div class="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none"></div>

            <!-- COLLAPSE HEADER -->
            <div v-if="!isMobileShown" class="hidden md:flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
                <span v-if="isFull" class="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Navigation Node</span>
                <button @click="expanded = !expanded"
                    class="p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-500 transition-all shadow-sm">
                    <ChevronLeft v-if="isFull" class="h-3.5 w-3.5 text-purple-600" />
                    <ChevronRight v-else class="h-3.5 w-3.5 text-purple-600" />
                </button>
            </div>

            <nav class="flex-1 px-3 py-6 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
                <!-- ACTIVE MODULES SECTION -->
                <section class="space-y-2">
                    <div v-if="isFull || isMobileShown" class="px-4 mb-4 text-[9px] font-black uppercase tracking-[0.25em] text-purple-600 italic opacity-80">
                        Active Protocols
                    </div>
                    <div class="space-y-1">
                        <button v-for="module in modules" :key="'module-' + module.id" @click="goModule(module.id)"
                            :title="module.name"
                            class="sidebar-btn group"
                            :class="[isIcon ? 'justify-center' : '', route.params.id == module.id ? 'active-util' : '']">
                                <div :class="['icon-container', route.params.id == module.id ? 'text-purple-600' : 'text-slate-400']">
                                <span class="text-lg">{{ module.icon }}</span>
                            </div>
                            <div v-if="!isIcon" class="flex-1 min-w-0 text-left">
                                <p :class="['truncate text-xs tracking-wide uppercase', route.params.id == module.id ? 'font-black text-black dark:text-white' : 'font-bold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300']">{{ module.name }}</p>
                                <div v-if="module.progress > 0" class="flex items-center gap-2 mt-1">
                                    <div class="flex-1 h-0.5 bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden text-[0px]">.
                                        <div class="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500" :style="{ width: module.progress + '%' }"></div>
                                    </div>
                                    <span class="text-[8px] font-black text-purple-500/70">{{ module.progress }}%</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                <!-- JOURNEYS SECTION -->
                <section class="space-y-4">
                    <div v-if="isFull || isMobileShown" class="px-4 text-[9px] font-black uppercase tracking-[0.25em] text-purple-600 italic opacity-80">
                        Your Journeys
                    </div>
                    <div v-if="!isIcon" class="space-y-4 px-4">
                        <button v-for="path in myLearningPaths" :key="'path-' + path.id" @click="goPath(path.id)" class="sidebar-btn group">
                            <div class="flex flex-col w-full">
                                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-purple-600 transition-colors">{{ path.name }}</p>
                                <div class="relative h-1 w-full bg-slate-200 dark:bg-black/40 rounded-full overflow-hidden">
                                    <div class="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-[0_0_8px_rgba(236,72,153,0.3)] transition-all duration-1000" :style="{ width: path.progress + '%' }"></div>
                                </div>
                            </div>
                        </button>
                    </div>
                    <div v-else class="flex flex-col items-center gap-3">
                        <div v-for="path in myLearningPaths" :key="'p-icon-' + path.id" class="w-1.5 h-1.5 rounded-full bg-pink-500/20 border border-pink-500/50"></div>
                    </div>
                </section>

                <!-- UTILITIES SECTION -->
                <section class="pt-6 border-t border-slate-100 dark:border-white/5 space-y-1">
                    <button @click="goLeaderboard()" class="sidebar-btn group">
                        <div :class="['flex items-center gap-3 w-full', isIcon ? 'justify-center' : '']">
                            <div class="icon-container">
                                <Trophy class="h-4.5 w-4.5" />
                            </div>
                            <span v-if="!isIcon" class="nav-text">Leaderboards</span>
                        </div>
                    </button>

                    <button @click="router.push({ name: 'user.rewards-shop' })" class="sidebar-btn group" :class="{ 'active-util': route.name === 'user.rewards-shop' }">
                        <div :class="['flex items-center gap-3 w-full', isIcon ? 'justify-center' : '']">
                            <div class="icon-container">
                                <Gift class="h-4.5 w-4.5" />
                            </div>
                            <span v-if="!isIcon" class="nav-text">Rewards Shop</span>
                        </div>
                    </button>

                    <button @click="goSettings()" class="sidebar-btn group">
                        <div :class="['flex items-center gap-3 w-full', isIcon ? 'justify-center' : '']">
                            <div class="icon-container">
                                <Settings class="h-4.5 w-4.5" />
                            </div>
                            <span v-if="!isIcon" class="nav-text">Settings</span>
                        </div>
                    </button>
                </section>
            </nav>

            <!-- PROFILE FOOTER: Dynamic User Name applied here -->
            <div class="mt-auto border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01]">
                <div v-if="isFull" class="p-4 flex items-center gap-3">
                    <div class="relative group/avatar cursor-pointer">
                        <div class="absolute -inset-1 bg-gradient-to-tr from-purple-600 to-fuchsia-600 rounded-full blur opacity-20 group-hover/avatar:opacity-60 transition duration-500"></div>
                        <div class="relative w-10 h-10 rounded-full bg-[#0d0d12] border border-white/10 flex items-center justify-center text-xs font-black text-purple-400 shadow-xl uppercase">
                            {{ getOrgInitials(mine[0]) || 'U' }}
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <!-- CHANGED: Static "You" replaced with Dynamic User Name -->
                        <p class="text-[11px] font-black uppercase tracking-tight text-black dark:text-white truncate">{{ auth.user?.name || 'Authenticated User' }}</p>
                        <p class="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none mt-1">Registry Sync Active</p>
                    </div>
                </div>
                <div v-else class="p-4 flex justify-center">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                        {{ getOrgInitials(mine[0]) || 'U' }}
                    </div>
                </div>
            </div>
        </div>
    </aside>
    </div>
</template>

<style scoped>
@reference "@/style.css";

/* wrapper is mostly structural, no extra styles needed but available if future tweaks required */
.sidebar-container { }

/* base button used throughout sidebar */
.sidebar-btn { 
    @apply w-full rounded-full transition-all duration-300 px-4 py-3 text-left flex items-center text-black/70 dark:text-slate-500 hover:bg-purple-500/5 hover:text-purple-600; 
}

/* active pill state */
.active-util { 
    @apply relative overflow-hidden scale-[1.03] !text-white;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    box-shadow: 
        0 12px 24px -8px rgba(139, 92, 246, 0.6),
        inset 0 2px 4px rgba(255, 255, 255, 0.35),
        inset 0 -2px 4px rgba(0, 0, 0, 0.15);
}
.active-util::before {
    content: '';
    @apply absolute inset-0 opacity-30 pointer-events-none;
    background: linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, transparent 60%);
}

/* icon container wrapper */
.icon-container {
    @apply p-2 rounded-full bg-slate-100 dark:bg-white/5 transition-all duration-300;
}
.active-util .icon-container { 
    @apply bg-white/20 shadow-none !text-white;
}

/* text label inside button */
.nav-text {
    @apply text-[11px] font-black uppercase tracking-[0.15em] relative z-10;
    font-family: 'Poppins', sans-serif !important;
}

/* profile/other menu item style (if used anywhere) */
.menu-item { 
    @apply w-full flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase hover:text-purple-600 hover:bg-purple-500/5 transition-all border-b border-slate-100 dark:border-white/5 last:border-none; 
    font-family: 'Poppins', sans-serif !important;
}

/* scrollbar customization (re‑use from facilitator) */
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-white/10 rounded-full; }

/* transitions from facilitator, may already exist elsewhere */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(15px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>