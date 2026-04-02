<template>
    <!-- ══════════════════════════════════════════════════════════
         TRIGGER BUTTON
    ═══════════════════════════════════════════════════════════ -->
    <button
        @click="open = true"
        :disabled="downloadStatus === 'loading'"
        class="btn-primary btn-3d disabled:opacity-50 inline-flex items-center gap-2"
    >
        <DownloadIcon :class="['h-4 w-4', downloadStatus === 'loading' && 'animate-bounce']" />
        <span>{{ downloadStatus === 'loading' ? 'Generating…' : triggerLabel }}</span>
    </button>

    <!-- ══════════════════════════════════════════════════════════
         MODAL
    ═══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
        <Transition name="backdrop">
            <div
                v-if="open"
                class="fixed inset-0 z-50 bg-abyss-950/60 backdrop-blur-sm
                       flex items-center justify-center p-4"
                @mousedown.self="close"
            >
                <Transition name="modal" appear>
                    <div
                        v-if="open"
                        class="relative w-full max-w-md rounded-2xl overflow-hidden
                               bg-platinum-100 dark:bg-abyss-700
                               border-2 border-platinum-300 dark:border-abyss-500"
                    >
                        <!-- Top accent stripe -->
                        <div class="h-1 w-full bg-gradient-to-r from-calm-lavender-600 to-neon-pink-500" />

                        <!-- ── Header ──────────────────────────────── -->
                        <div class="flex items-start justify-between px-6 pt-5 pb-4
                                    border-b-2 border-platinum-300 dark:border-abyss-500
                                    bg-platinum-200 dark:bg-abyss-600">
                            <div class="flex items-center gap-3">
                                <!-- Icon badge -->
                                <div class="p-2.5 rounded-xl border-2 shrink-0
                                            bg-calm-lavender-50 dark:bg-calm-lavender-900/20
                                            border-calm-lavender-200 dark:border-calm-lavender-800/40
                                            text-calm-lavender-600 dark:text-calm-lavender-400">
                                    <FileBarChart2Icon class="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 class="font-madimione text-xl text-abyss-800 dark:text-platinum-100 leading-tight">
                                        {{ title }}
                                    </h2>
                                    <p class="font-mplusrounded text-xs text-platinum-600 dark:text-platinum-400 mt-0.5">
                                        {{ description }}
                                    </p>
                                </div>
                            </div>

                            <!-- Close button -->
                            <button
                                @click="close"
                                :disabled="downloadStatus === 'loading'"
                                class="p-1.5 rounded-lg transition-colors disabled:opacity-40
                                       text-platinum-500 dark:text-platinum-400
                                       hover:bg-platinum-300 dark:hover:bg-abyss-500
                                       hover:text-red-500 dark:hover:text-red-400"
                                aria-label="Close"
                            >
                                <XIcon class="h-4 w-4" />
                            </button>
                        </div>

                        <!-- ── Body ────────────────────────────────── -->
                        <div class="px-6 py-5 space-y-4">

                            <!-- File info + included checklist — L2 inset -->
                            <div class="rounded-xl border-2 p-4 space-y-3
                                        bg-platinum-200 dark:bg-abyss-600
                                        border-platinum-300 dark:border-abyss-500">

                                <!-- Filename preview -->
                                <div class="flex items-center gap-2.5">
                                    <div class="p-2 rounded-lg shrink-0
                                                bg-red-50 dark:bg-red-900/20
                                                border border-red-100 dark:border-red-800/30
                                                text-red-500 dark:text-red-400">
                                        <FileTextIcon class="h-4 w-4" />
                                    </div>
                                    <div class="min-w-0">
                                        <p class="text-sm font-semibold font-mono truncate
                                                   text-abyss-800 dark:text-platinum-200">
                                            {{ previewFilename }}
                                        </p>
                                        <p class="font-mplusrounded text-xs
                                                   text-platinum-500 dark:text-platinum-500">
                                            PDF Document · A4
                                        </p>
                                    </div>
                                </div>

                                <!-- Divider -->
                                <div class="border-t border-platinum-300 dark:border-abyss-500" />

                                <!-- Included sections checklist -->
                                <div class="grid grid-cols-2 gap-y-1.5 gap-x-4">
                                    <div
                                        v-for="item in includes"
                                        :key="item"
                                        class="flex items-center gap-1.5 text-xs
                                               text-platinum-700 dark:text-platinum-400"
                                    >
                                        <CheckCircleIcon class="h-3.5 w-3.5 shrink-0 text-safety-teal-500 dark:text-safety-teal-400" />
                                        {{ item }}
                                    </div>
                                </div>
                            </div>

                            <!-- Info note — lavender inset -->
                            <div class="flex items-start gap-2.5 rounded-xl border-2 px-4 py-3
                                        bg-calm-lavender-50 dark:bg-calm-lavender-900/10
                                        border-calm-lavender-200 dark:border-calm-lavender-800/30
                                        text-calm-lavender-700 dark:text-calm-lavender-400">
                                <InfoIcon class="h-4 w-4 shrink-0 mt-0.5" />
                                <p class="font-mplusrounded text-xs leading-relaxed">{{ note }}</p>
                            </div>

                        </div>

                        <!-- ── Footer ──────────────────────────────── -->
                        <div class="px-6 py-4 flex items-center justify-between gap-3
                                    border-t-2 border-platinum-300 dark:border-abyss-500
                                    bg-platinum-200 dark:bg-abyss-600">

                            <!-- Status hint -->
                            <p
                                class="font-mplusrounded text-xs flex-1 min-w-0 truncate"
                                :class="{
                                    'text-red-500 dark:text-red-400':              downloadStatus === 'error',
                                    'text-safety-teal-600 dark:text-safety-teal-400': downloadStatus === 'success',
                                    'text-platinum-500 dark:text-platinum-500':    downloadStatus === 'idle' || downloadStatus === 'loading',
                                }"
                                :role="downloadStatus === 'error' ? 'alert' : 'status'"
                            >
                                {{ statusHint }}
                            </p>

                            <div class="flex items-center gap-2 shrink-0">

                                <!-- Cancel -->
                                <button
                                    @click="close"
                                    :disabled="downloadStatus === 'loading'"
                                    class="px-4 py-2 text-sm font-medium rounded-xl transition-all disabled:opacity-40
                                           bg-platinum-100 dark:bg-abyss-700
                                           text-platinum-600 dark:text-platinum-400
                                           border-2 border-platinum-300 dark:border-abyss-500
                                           border-b-4 border-b-platinum-400 dark:border-b-abyss-400
                                           hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50
                                           active:border-b-2 active:translate-y-px"
                                >
                                    Cancel
                                </button>

                                <!-- Export PDF — flat-3D primary -->
                                <button
                                    @click="handleDownload"
                                    :disabled="downloadStatus === 'loading'"
                                    class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl
                                           text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed
                                           bg-calm-lavender-600 dark:bg-calm-lavender-700
                                           border-2 border-calm-lavender-700 dark:border-calm-lavender-600
                                           border-b-4 border-b-calm-lavender-800 dark:border-b-calm-lavender-900
                                           hover:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600
                                           active:border-b-2 active:translate-y-px"
                                >
                                    <div v-if="downloadStatus === 'loading'" class="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"></div>
                                    <DownloadIcon v-else class="h-3.5 w-3.5" />
                                    {{ downloadStatus === 'loading' ? 'Generating…' : 'Export PDF' }}
                                </button>

                            </div>
                        </div>

                        <!-- ── Success flash overlay ───────────────── -->
                        <Transition name="success-flash">
                            <div
                                v-if="downloadStatus === 'success'"
                                class="absolute inset-0 flex flex-col items-center justify-center gap-3
                                       rounded-2xl pointer-events-none
                                       bg-safety-teal-50/90 dark:bg-safety-teal-900/20"
                            >
                                <div class="p-4 rounded-2xl
                                            bg-safety-teal-500 dark:bg-safety-teal-600
                                            border-2 border-safety-teal-600 dark:border-safety-teal-500
                                            text-white">
                                    <CheckIcon class="h-8 w-8" />
                                </div>
                                <p class="font-semibold text-sm
                                          text-safety-teal-700 dark:text-safety-teal-300">
                                    Report saved to Downloads!
                                </p>
                            </div>
                        </Transition>

                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '@/utils/api'
import {
    DownloadIcon,
    XIcon,
    CheckIcon,
    CheckCircleIcon,
    FileBarChart2Icon,
    FileTextIcon,
    InfoIcon,
} from 'lucide-vue-next'

// ── Props — everything page-specific is passed in from the parent ─────────────
const props = defineProps({
    /**
     * Text shown on the trigger button.
     * @example 'Download Report'
     */
    triggerLabel: {
        type: String,
        default: 'Download Report',
    },

    /**
     * Modal heading.
     * @example 'Download Analytics Report'
     */
    title: {
        type: String,
        default: 'Download Report',
    },

    /**
     * One-line subtitle under the modal heading.
     * @example 'Generates a full PDF — users, modules & more'
     */
    description: {
        type: String,
        default: 'Generates a PDF report for this section.',
    },

    /**
     * The API endpoint to call (relative, no base URL).
     * Your api.js baseURL + token interceptor handle the rest.
     * @example '/api/v1/admin/reports/download'
     * @example '/api/v1/admin/students/export'
     */
    endpoint: {
        type: String,
        required: true,
    },

    /**
     * Downloaded filename (without extension — .pdf is appended automatically).
     * Supports the token {date} which is replaced with today's date (YYYY-MM-DD).
     * @example 'ProtectEd_Report_{date}'
     * @example 'ProtectEd_Students_{date}'
     */
    filename: {
        type: String,
        default: 'ProtectEd_Report_{date}',
    },

    /**
     * List of items shown in the "What's included" checklist inside the modal.
     * @example ['Executive Summary', 'Key Metrics', 'Users by Role']
     */
    includes: {
        type: Array,
        default: () => [],
    },

    /**
     * Small info note shown at the bottom of the modal body.
     */
    note: {
        type: String,
        default: 'Report reflects all data currently in the system.',
    },

    /**
     * Optional extra query params to append to the endpoint.
     * @example { type: 'gad' }
     * @example { classroomId: 12 }
     */
    params: {
        type: Object,
        default: () => ({}),
    },
})

// ── State ─────────────────────────────────────────────────────────────────────
const open           = ref(false)
const downloadStatus = ref('idle') // idle | loading | success | error
const errorMsg       = ref('')

// ── Computed filename preview ─────────────────────────────────────────────────
const today           = new Date().toISOString().split('T')[0]
const previewFilename = computed(() =>
    props.filename.replace('{date}', today) + '.pdf'
)

// ── Status hint text ──────────────────────────────────────────────────────────
const statusHint = computed(() => ({
    idle:    'Ready to export. Click Export PDF to download.',
    loading: 'Building your PDF, please wait…',
    success: 'Saved to your Downloads folder.',
    error:   errorMsg.value || 'Something went wrong. Please try again.',
}[downloadStatus.value]))

// ── Close / reset ─────────────────────────────────────────────────────────────
function close() {
    if (downloadStatus.value === 'loading') return
    open.value = false
    setTimeout(() => {
        downloadStatus.value = 'idle'
        errorMsg.value = ''
    }, 300)
}

// ── Download handler ──────────────────────────────────────────────────────────
async function handleDownload() {
    if (downloadStatus.value === 'loading') return

    downloadStatus.value = 'loading'
    errorMsg.value = ''

    try {
        // Merge any extra params the parent passed in
        const query    = new URLSearchParams(props.params).toString()
        const url      = query ? `${props.endpoint}?${query}` : props.endpoint

        const response = await api.get(url, {
            responseType: 'blob',
            headers: { Accept: 'application/pdf' },
        })

        // Guard: backend accidentally returned JSON instead of PDF
        const contentType = response.headers['content-type'] || ''
        if (contentType.includes('application/json')) {
            const text = await response.data.text()
            const json = JSON.parse(text)
            throw new Error(json.message || 'Report generation failed.')
        }

        // Trigger browser download
        const resolvedFilename = props.filename.replace('{date}', today) + '.pdf'
        const objectUrl        = window.URL.createObjectURL(
            new Blob([response.data], { type: 'application/pdf' })
        )
        const link = document.createElement('a')
        link.href  = objectUrl
        link.setAttribute('download', resolvedFilename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(objectUrl)

        downloadStatus.value = 'success'
        setTimeout(close, 1800)

    } catch (err) {
        if (err.response?.data instanceof Blob) {
            try {
                const text = await err.response.data.text()
                const json = JSON.parse(text)
                errorMsg.value = json.message || 'Report generation failed.'
            } catch {
                errorMsg.value = 'Report generation failed.'
            }
        } else {
            errorMsg.value = err.message || 'An unexpected error occurred.'
        }
        downloadStatus.value = 'error'
        setTimeout(() => { downloadStatus.value = 'idle' }, 5000)
    }
}
</script>

<style scoped>
@reference "@/style.css";

/* ── Flat-3D trigger button modifier ─────────────────────── */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

/* ── Backdrop transition ──────────────────────────────────── */
.backdrop-enter-active,
.backdrop-leave-active  { transition: opacity 0.2s ease; }
.backdrop-enter-from,
.backdrop-leave-to      { opacity: 0; }

/* ── Modal panel transition ───────────────────────────────── */
.modal-enter-active {
    transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-leave-active {
    transition: opacity 0.15s ease, transform 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
    transform: scale(0.94) translateY(8px);
}

/* ── Success flash overlay transition ────────────────────── */
.success-flash-enter-active { transition: opacity 0.2s ease; }
.success-flash-leave-active { transition: opacity 0.4s ease 1.2s; }
.success-flash-enter-from,
.success-flash-leave-to     { opacity: 0; }
</style>