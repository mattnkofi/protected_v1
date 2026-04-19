<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 bg-slate-950/70 dark:bg-black/80 backdrop-blur-sm">
    <div class="h-full w-full flex flex-col bg-white dark:bg-abyss-900 text-slate-700 dark:text-platinum-100">
      <div class="border-b border-slate-200/70 dark:border-abyss-700/70 bg-white/95 dark:bg-abyss-900/95 p-4 flex flex-wrap items-center gap-3 justify-between sticky top-0 z-10">
        <div class="min-w-0 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-calm-lavender-200 dark:border-abyss-600 bg-calm-lavender-50 dark:bg-abyss-800 text-calm-lavender-600 dark:text-calm-lavender-300">
            <FileTextIcon class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <h2 class="text-base sm:text-lg font-semibold text-slate-800 dark:text-platinum-100 truncate">{{ documentName }}</h2>
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-platinum-400">
              <span class="uppercase tracking-[0.2em]">{{ documentType }}</span>
              <span v-if="isPdf">Page {{ currentPage }} / {{ totalPages }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <div v-if="isPdf" class="flex items-center gap-1 rounded-full border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800 px-2 py-1">
            <button
              @click="previousPage"
              :disabled="currentPage <= 1"
              class="p-2 hover:bg-slate-100 dark:hover:bg-abyss-700 disabled:opacity-50 rounded-full transition-colors"
              title="Previous page"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <input
              v-model.number="currentPage"
              type="number"
              :min="1"
              :max="totalPages"
              @change="goToPage"
              class="w-14 text-center bg-slate-50 dark:bg-abyss-700 text-slate-700 dark:text-platinum-100 text-sm border border-slate-200 dark:border-abyss-600 rounded-lg px-2 py-1"
            />
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="p-2 hover:bg-slate-100 dark:hover:bg-abyss-700 disabled:opacity-50 rounded-full transition-colors"
              title="Next page"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>

          <div v-if="isPdf" class="flex items-center gap-1 rounded-full border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800 px-2 py-1">
            <button
              @click="zoomOut"
              :disabled="scale <= 0.5"
              class="p-2 hover:bg-slate-100 dark:hover:bg-abyss-700 disabled:opacity-50 rounded-full transition-colors"
              title="Zoom out"
            >
              <ZoomOutIcon class="w-4 h-4" />
            </button>
            <span class="text-xs text-slate-500 dark:text-platinum-400 w-12 text-center">{{ Math.round(scale * 100) }}%</span>
            <button
              @click="zoomIn"
              :disabled="scale >= 2"
              class="p-2 hover:bg-slate-100 dark:hover:bg-abyss-700 disabled:opacity-50 rounded-full transition-colors"
              title="Zoom in"
            >
              <ZoomInIcon class="w-4 h-4" />
            </button>
          </div>

          <button
            v-if="proposalId"
            @click="showComments = !showComments"
            class="px-3 py-2 text-xs font-semibold rounded-full border border-slate-200 dark:border-abyss-600 bg-white dark:bg-abyss-800 hover:border-calm-lavender-400 transition-colors flex items-center gap-2"
            title="Toggle comments"
          >
            <MessageSquareIcon class="w-4 h-4" />
            {{ showComments ? 'Hide Comments' : 'Show Comments' }}
          </button>

          <button
            @click="downloadDocument"
            class="p-2 hover:bg-slate-100 dark:hover:bg-abyss-700 rounded-full transition-colors"
            title="Download"
          >
            <DownloadIcon class="w-5 h-5" />
          </button>

          <button
            @click="close"
            class="p-2 hover:bg-slate-100 dark:hover:bg-abyss-700 rounded-full transition-colors"
            title="Close"
          >
            <XIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-hidden flex">
        <div class="flex-1 overflow-auto bg-slate-50 dark:bg-abyss-800">
          <div v-if="isPdf" class="flex flex-col items-center justify-center p-6">
            <div v-if="loading" class="text-center py-20">
              <div class="animate-spin mb-4">
                <div class="w-12 h-12 border-4 border-calm-lavender-400/30 border-t-calm-lavender-500 rounded-full mx-auto"></div>
              </div>
              <p class="text-slate-500 dark:text-platinum-400">Loading PDF...</p>
            </div>
            <div v-else-if="pdfError" class="text-center py-20 text-rose-600 dark:text-rose-300">
              <p class="font-semibold mb-2">Failed to load PDF</p>
              <p class="text-sm text-slate-500 dark:text-platinum-400">{{ pdfError }}</p>
              <button
                @click="downloadDocument"
                class="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Download File Instead
              </button>
            </div>
            <canvas
              v-else
              id="pdf-canvas"
              class="max-w-full border border-slate-200 dark:border-abyss-600 rounded-xl shadow-lg bg-white"
            ></canvas>
          </div>

          <div v-else class="p-8">
            <div class="bg-white dark:bg-abyss-800 border border-slate-200 dark:border-abyss-600 rounded-xl p-8 text-center shadow-sm">
              <FileTextIcon class="w-16 h-16 text-calm-lavender-500 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-slate-800 dark:text-platinum-100 mb-2">{{ documentName }}</h3>
              <p class="text-slate-500 dark:text-platinum-400 mb-6">
                {{ documentType === 'DOCX' ? 'Microsoft Word Document' : 'Document File' }}
              </p>
              <p class="text-sm text-slate-500 dark:text-platinum-500 mb-6">
                Preview for this document type is not available in-browser.
              </p>
              <div class="flex gap-3 justify-center">
                <button
                  @click="downloadDocument"
                  class="btn-primary"
                >
                  <DownloadIcon class="w-4 h-4" />
                  Download to View
                </button>
                <button
                  @click="close"
                  class="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="proposalId && showComments"
          class="w-full max-w-[420px] min-w-[280px] border-l border-slate-200 dark:border-abyss-700 bg-white dark:bg-abyss-900"
        >
          <div class="h-full flex flex-col">
            <div v-if="adminFeedback" class="p-4 border-b border-slate-200 dark:border-abyss-700 bg-slate-50 dark:bg-abyss-800">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-platinum-400 mb-2">Admin Comments</p>
              <p class="text-sm text-slate-700 dark:text-platinum-200 whitespace-pre-wrap">{{ adminFeedback }}</p>
            </div>
            <div class="flex-1 min-h-0">
              <ProposalComments :proposal_id="proposalId" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted, watch } from 'vue';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  XIcon,
  FileTextIcon,
  MessageSquareIcon
} from 'lucide-vue-next';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min?url';
import ProposalComments from '@/components/gad/ProposalComments.vue';

// Set up PDF.js worker using local package
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  documentUrl: {
    type: String,
    required: true
  },
  documentName: {
    type: String,
    default: 'Document'
  },
  proposalId: {
    type: Number,
    default: null
  },
  adminFeedback: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close']);

// State
const loading = ref(false);
const pdfError = ref(null);
const pdfDoc = shallowRef(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1.2);
const showComments = ref(true);

// Computed
const documentType = computed(() => {
  if (!props.documentName) return 'File';
  const ext = props.documentName.split('.').pop()?.toUpperCase() || 'FILE';
  return ext;
});

const isPdf = computed(() => {
  return props.documentName.toLowerCase().endsWith('.pdf');
});

// Methods
const loadPdf = async () => {
  try {
    loading.value = true;
    pdfError.value = null;

    const pdf = await pdfjsLib.getDocument(props.documentUrl).promise;
    pdfDoc.value = pdf;
    totalPages.value = pdf.numPages;
    currentPage.value = 1;

    await renderPage(1);
  } catch (error) {
    console.error('Failed to load PDF:', error);
    pdfError.value = error.message || 'Failed to load PDF. Please try downloading instead.';
  } finally {
    loading.value = false;
  }
};

const renderPage = async (pageNumber) => {
  if (!pdfDoc.value) return;

  try {
    const page = await pdfDoc.value.getPage(pageNumber);
    const canvas = document.getElementById('pdf-canvas');
    if (!canvas) return;

    const context = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: scale.value });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
  } catch (error) {
    console.error('Failed to render page:', error);
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    renderPage(currentPage.value);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    renderPage(currentPage.value);
  }
};

const goToPage = async () => {
  if (currentPage.value >= 1 && currentPage.value <= totalPages.value) {
    await renderPage(currentPage.value);
  }
};

const zoomIn = async () => {
  if (scale.value < 2) {
    scale.value += 0.1;
    await renderPage(currentPage.value);
  }
};

const zoomOut = async () => {
  if (scale.value > 0.5) {
    scale.value -= 0.1;
    await renderPage(currentPage.value);
  }
};

const downloadDocument = () => {
  const link = document.createElement('a');
  link.href = props.documentUrl;
  link.download = props.documentName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const close = () => {
  emit('close');
};

// Lifecycle
onMounted(async () => {
  if (props.isOpen && isPdf.value) {
    await loadPdf();
  }
});

watch(
  () => [props.isOpen, props.documentUrl],
  async ([isOpen]) => {
    if (isOpen && isPdf.value) {
      await loadPdf();
    }
  }
);

onUnmounted(() => {
  if (pdfDoc.value) {
    pdfDoc.value.destroy();
  }
});
</script>

<style scoped>
#pdf-canvas {
  display: block;
  margin: 0 auto;
  max-height: calc(100vh - 220px);
  width: auto;
}
</style>
