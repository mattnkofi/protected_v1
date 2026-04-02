<template>
    <div ref="viewerContainer" class="space-y-5 font-poppins animate-viewer">

        <!-- ═══════════════════════════════════════════════════
             TOOLBAR BAR
             L1 layer: platinum-100 / abyss-700
             border-2 border-platinum-300 = stamped boundary
        ════════════════════════════════════════════════════ -->
        <div class="toolbar">

            <!-- File info -->
            <div class="flex items-center gap-4 min-w-0">
                <div class="ds-icon-badge ds-icon-badge--lavender shrink-0">
                    <FileTextIcon class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                    <h3 class="font-bold text-base text-abyss-800 dark:text-platinum-100 truncate leading-tight">
                        {{ fileName || 'Document Asset' }}
                    </h3>
                    <p class="field-subtext mt-0.5">{{ formatFileType(fileType) }}</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 shrink-0">

                <!-- Icon tool group: Open + Fullscreen -->
                <div class="tool-group">
                    <!-- Open file in new tab (full-size native view) -->
                    <a
                        :href="fileUrl"
                        target="_blank"
                        rel="noopener"
                        class="tool-btn"
                        title="Open in new tab"
                    >
                        <ExternalLinkIcon class="w-4 h-4" />
                    </a>

                    <!-- Fullscreen toggle -->
                    <button
                        @click="toggleFullScreen"
                        class="tool-btn"
                        :title="isFullScreen ? 'Exit fullscreen' : 'Expand fullscreen'"
                    >
                        <MaximizeIcon v-if="!isFullScreen" class="w-4 h-4" />
                        <MinimizeIcon v-else class="w-4 h-4" />
                    </button>
                </div>

                <!-- Download button — always shown.
                     PDF native toolbar is hidden (#toolbar=0) so this is
                     the only download path, and fileName is always correct. -->
                <button
                    @click="downloadFile"
                    class="btn-primary btn-3d"
                    title="Download file"
                >
                    <DownloadIcon class="w-4 h-4" />
                    <span>Download</span>
                </button>

            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════
             VIEWER FRAME
             L2 inset: platinum-200 / abyss-600
             Full-screen mode: frame removed, iframe fills viewport
        ════════════════════════════════════════════════════ -->
        <div :class="['viewer-wrap', isFullScreen && 'viewer-wrap--fullscreen']">

            <!-- Preview (iframe) -->
            <div v-if="canPreview" class="relative h-full">
                <iframe
                    :src="isPDF ? fileUrl + '#toolbar=0&navpanes=0' : getGoogleDocsViewerUrl()"
                    :class="[
                        'w-full transition-all duration-500',
                        'dark:iframe-dark',
                        isFullScreen ? 'h-screen' : 'h-[600px] md:h-[850px]'
                    ]"
                    frameborder="0"
                    @load="previewLoaded = true"
                    @error="previewError = true"
                ></iframe>

                <!-- Loading overlay -->
                <div
                    v-if="!previewLoaded && !previewError"
                    class="absolute inset-0 flex flex-col items-center justify-center gap-4
                           bg-platinum-50 dark:bg-abyss-700"
                >
                    <div class="spinner"></div>
                    <p class="loading-text">Loading document…</p>
                </div>
            </div>

            <!-- Download-only / unsupported fallback -->
            <div v-else class="flex flex-col items-center justify-center py-32 px-10 text-center
                                bg-platinum-50 dark:bg-abyss-700">
                <div class="ds-icon-badge ds-icon-badge--lavender !p-5 mb-6">
                    <FileIcon class="w-10 h-10" />
                </div>
                <h3 class="font-bold text-lg text-abyss-800 dark:text-platinum-100 mb-2 leading-snug">
                    {{ fileName }}
                </h3>
                <p class="field-subtext mb-8 max-w-xs">
                    Preview is not available for this file type. Download it to view the content.
                </p>
                <button
                    @click="downloadFile"
                    class="btn-primary btn-3d"
                >
                    <DownloadIcon class="w-4 h-4" />
                    Download File
                </button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
    FileText as FileTextIcon,
    Download as DownloadIcon,
    Maximize as MaximizeIcon,
    Minimize as MinimizeIcon,
    File as FileIcon,
    ExternalLink as ExternalLinkIcon
} from 'lucide-vue-next';

const props = defineProps({
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: 'Document_Asset' },
    fileType: { type: String, default: 'application/pdf' }
});

const viewerContainer = ref(null);
const isFullScreen = ref(false);
const previewLoaded = ref(false);
const previewError = ref(false);

const isPDF = computed(() => props.fileType === 'application/pdf' || props.fileName?.toLowerCase().endsWith('.pdf'));
const isWord = computed(() => props.fileType.includes('word') || props.fileName?.toLowerCase().match(/\.(doc|docx)$/));
const canPreview = computed(() => isPDF.value || isWord.value);

const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        viewerContainer.value?.requestFullscreen().catch(err => {
            console.error(`Fullscreen Error: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
};

const handleFullScreenChange = () => {
    isFullScreen.value = !!document.fullscreenElement;
};

// Fetch as blob so the browser always uses fileName regardless of
// cross-origin headers or Content-Disposition from the server.
const downloadFile = async () => {
    try {
        const response = await fetch(props.fileUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = props.fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    } catch (err) {
        // Fallback: plain anchor if fetch fails (e.g. CORS-restricted URL)
        const anchor = document.createElement('a');
        anchor.href = props.fileUrl;
        anchor.download = props.fileName;
        anchor.target = '_blank';
        anchor.click();
    }
};

const formatFileType = (t) => {
    const map = { 'application/pdf': 'PDF Document', 'application/msword': 'Word Document' };
    return map[t] || 'Registry Asset';
};

const getGoogleDocsViewerUrl = () => `https://docs.google.com/viewer?url=${encodeURIComponent(props.fileUrl)}&embedded=true`;

onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
});

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullScreenChange);
});
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   TOOLBAR  —  L1: platinum-100 / abyss-700
   border-2 border-platinum-300 = stamped boundary, no shadow
═══════════════════════════════════════════════════════════ */
.toolbar {
    @apply flex flex-col sm:flex-row sm:items-center justify-between gap-4;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl p-4;
}

/* ═══════════════════════════════════════════════════════════
   ICON BADGE  —  bordered stamp
═══════════════════════════════════════════════════════════ */
.ds-icon-badge {
    @apply p-2.5 rounded-xl border-2 flex items-center justify-center;
}

.ds-icon-badge--lavender {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/20;
    @apply border-calm-lavender-200 dark:border-calm-lavender-800/40;
    @apply text-calm-lavender-600 dark:text-calm-lavender-400;
}

/* ═══════════════════════════════════════════════════════════
   TOOL GROUP  —  L2 icon button cluster
   platinum-200 / abyss-600 background
═══════════════════════════════════════════════════════════ */
.tool-group {
    @apply flex items-center gap-1 p-1 rounded-xl;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
}

.tool-btn {
    @apply p-2 rounded-lg transition-all duration-150;
    @apply text-platinum-600 dark:text-platinum-400;
    @apply hover:bg-calm-lavender-100 dark:hover:bg-calm-lavender-900/30;
    @apply hover:text-calm-lavender-600 dark:hover:text-calm-lavender-400;
}

/* ═══════════════════════════════════════════════════════════
   FLAT-3D PRIMARY BUTTON MODIFIER
═══════════════════════════════════════════════════════════ */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

/* ═══════════════════════════════════════════════════════════
   VIEWER FRAME  —  L2 inset: platinum-200 / abyss-600
   border-2 stamps the frame boundary, rounded-2xl matches system
═══════════════════════════════════════════════════════════ */
.viewer-wrap {
    @apply overflow-hidden rounded-2xl;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
}

.viewer-wrap--fullscreen {
    @apply rounded-none border-0;
}

/* ═══════════════════════════════════════════════════════════
   DARK MODE IFRAME INVERT
   Keeps the PDF readable against the deep abyss background
═══════════════════════════════════════════════════════════ */
.dark .iframe-dark {
    filter: invert(0.9) hue-rotate(180deg) brightness(1.1) contrast(1.1);
    mix-blend-mode: lighten;
}

/* ═══════════════════════════════════════════════════════════
   VIEWER ENTRY ANIMATION  —  no blur filter
═══════════════════════════════════════════════════════════ */
.animate-viewer {
    animation: viewerEntry 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes viewerEntry {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════════════════════════════════════════════
   FULLSCREEN OVERRIDES
═══════════════════════════════════════════════════════════ */
:fullscreen .h-screen { height: 100vh !important; }

:fullscreen .viewer-wrap {
    border-radius: 0;
    border: none;
    background: #fdfdfd;
}

.dark :fullscreen .viewer-wrap {
    background: #111012; /* abyss-700 */
}
</style>