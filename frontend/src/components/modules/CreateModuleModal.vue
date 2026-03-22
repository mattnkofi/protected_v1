<template>
    <!-- ── Overlay ──────────────────────────────────────────────────
         No backdrop-blur. Solid scrim only.
    ─────────────────────────────────────────────────────────────── -->
    <div
        class="fixed inset-0 z-[150] bg-abyss-950/70 overflow-y-auto py-10 px-4"
        @click.self="$emit('cancel')"
    >
        <!-- ── Modal shell ─────────────────────────────────────────
             L1: platinum-100 / abyss-800
             Stamped border — no shadow blur
        ────────────────────────────────────────────────────────── -->
        <div class="modal-shell animate-modal font-poppins">

            <!-- ── HEADER ─────────────────────────────────────────── -->
            <header class="modal-header">
                <div class="flex items-center gap-4">
                    <div class="ds-icon-badge ds-icon-badge--lavender">
                        <BookOpenIcon class="w-5 h-5" />
                    </div>
                    <div>
                        <p class="section-eyebrow">Module Registry</p>
                        <h2 class="font-madimione text-2xl text-abyss-800 dark:text-platinum-100 leading-tight">
                            Create a <span class="brand-gradient-text">New Module</span>
                        </h2>
                    </div>
                </div>
                <button
                    @click="$emit('cancel')"
                    class="close-btn"
                    aria-label="Close"
                >
                    <XIcon class="w-4 h-4" />
                </button>
            </header>

            <!-- ── FORM ───────────────────────────────────────────── -->
            <form @submit.prevent="handleSubmit" class="modal-body custom-scrollbar space-y-5">

                <!-- ── Section: Assignment & Identity ──────────────── -->
                <div class="form-section">
                    <p class="form-section-label">Assignment &amp; Identity</p>

                    <!-- Classroom assignment -->
                    <div class="field-group">
                        <label class="field-label">Classroom Assignment</label>
                        <div class="custom-select-wrap">
                            <button
                                type="button"
                                @click="toggleDropdown('classroom')"
                                :ref="el => { if (el) triggerRefs['classroom'] = el }"
                                class="custom-select-trigger"
                                :class="{ 'custom-select-open': openDropdown === 'classroom' }"
                            >
                                <span>{{ form.classroom_id === null ? '🌍 Public Access (All Students)' : ('🔒 ' + (classroomStore.classrooms.find(c => c.id === form.classroom_id)?.name || '')) }}</span>
                                <ChevronDownIcon class="custom-select-chevron" :class="{ 'rotate-180': openDropdown === 'classroom' }" />
                            </button>
                            <Teleport to="#app">
                                <div v-show="openDropdown === 'classroom'" class="custom-select-panel-teleport"
                                    :style="panelStyles['classroom']">
                                    <button type="button"
                                        class="custom-select-option"
                                        :class="{ 'custom-select-option-active': form.classroom_id === null }"
                                        @click="form.classroom_id = null; openDropdown = null">
                                        🌍 Public Access (All Students)
                                    </button>
                                    <button type="button"
                                        v-for="cls in classroomStore.classrooms" :key="cls.id"
                                        class="custom-select-option"
                                        :class="{ 'custom-select-option-active': form.classroom_id === cls.id }"
                                        @click="form.classroom_id = cls.id; openDropdown = null">
                                        🔒 {{ cls.name }}
                                    </button>
                                </div>
                            </Teleport>
                        </div>
                    </div>

                    <!-- Module Title -->
                    <div class="field-group">
                        <label class="field-label">
                            Module Title <span class="text-red-400">*</span>
                        </label>
                        <input
                            v-model="form.title"
                            type="text"
                            required
                            placeholder="e.g. Introduction to GAD Awareness"
                            class="input-field placeholder:text-platinum-500 dark:placeholder:text-abyss-400"
                        />
                    </div>

                    <!-- Category + Difficulty -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="field-group">
                            <label class="field-label">Category <span class="text-red-400">*</span></label>
                            <div class="custom-select-wrap">
                                <button
                                    type="button"
                                    @click="toggleDropdown('category')"
                                    :ref="el => { if (el) triggerRefs['category'] = el }"
                                    class="custom-select-trigger"
                                    :class="{ 'custom-select-open': openDropdown === 'category' }"
                                >
                                    <span>{{ { gad: 'Institutional', sexual_health: 'Health', vawc: 'Safety', general: 'Standard' }[form.category] || 'Select category' }}</span>
                                    <ChevronDownIcon class="custom-select-chevron" :class="{ 'rotate-180': openDropdown === 'category' }" />
                                </button>
                                <Teleport to="#app">
                                    <div v-show="openDropdown === 'category'" class="custom-select-panel-teleport"
                                        :style="panelStyles['category']">
                                        <button type="button"
                                            v-for="opt in categoryOptions" :key="opt.value"
                                            class="custom-select-option"
                                            :class="{ 'custom-select-option-active': form.category === opt.value }"
                                            @click="form.category = opt.value; openDropdown = null">
                                            {{ opt.label }}
                                        </button>
                                    </div>
                                </Teleport>
                            </div>
                        </div>

                        <div class="field-group">
                            <label class="field-label">Difficulty Level</label>
                            <div class="custom-select-wrap">
                                <button
                                    type="button"
                                    @click="toggleDropdown('difficulty')"
                                    :ref="el => { if (el) triggerRefs['difficulty'] = el }"
                                    class="custom-select-trigger"
                                    :class="{ 'custom-select-open': openDropdown === 'difficulty' }"
                                >
                                    <span>{{ { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }[form.difficulty_level] || 'Select level' }}</span>
                                    <ChevronDownIcon class="custom-select-chevron" :class="{ 'rotate-180': openDropdown === 'difficulty' }" />
                                </button>
                                <Teleport to="#app">
                                    <div v-show="openDropdown === 'difficulty'" class="custom-select-panel-teleport"
                                        :style="panelStyles['difficulty']">
                                        <button type="button"
                                            v-for="opt in difficultyOptions" :key="opt.value"
                                            class="custom-select-option"
                                            :class="{ 'custom-select-option-active': form.difficulty_level === opt.value }"
                                            @click="form.difficulty_level = opt.value; openDropdown = null">
                                            {{ opt.label }}
                                        </button>
                                    </div>
                                </Teleport>
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="field-group">
                        <label class="field-label">Description</label>
                        <textarea
                            v-model="form.description"
                            rows="3"
                            placeholder="Brief overview of this module's objectives…"
                            class="input-field resize-none placeholder:text-platinum-500 dark:placeholder:text-abyss-400"
                        ></textarea>
                        <p class="field-subtext">Optional — visible to students on the module card.</p>
                    </div>
                </div>

                <!-- ── Section: Assets ─────────────────────────────── -->
                <div class="form-section">
                    <p class="form-section-label">Module Assets</p>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <!-- Module file -->
                        <div class="upload-tile">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="ds-icon-badge ds-icon-badge--lavender !p-2">
                                    <FileIcon class="w-3.5 h-3.5" />
                                </div>
                                <span class="font-bold text-sm text-abyss-800 dark:text-platinum-100">Module File</span>
                            </div>
                            <label class="upload-zone cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    @change="handleFileSelect"
                                    class="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <UploadIcon class="w-4 h-4 text-abyss-500 dark:text-abyss-400 shrink-0" />
                                <span class="field-subtext truncate">
                                    {{ moduleFile ? moduleFile.name : 'Select PDF or Word document' }}
                                </span>
                            </label>
                            <p class="field-subtext mt-2">PDF or .docx · max 25 MB</p>
                        </div>

                        <!-- Thumbnail -->
                        <div class="upload-tile">
                            <div class="flex items-center gap-2 mb-3">
                                <div class="ds-icon-badge ds-icon-badge--pink !p-2">
                                    <ImageIcon class="w-3.5 h-3.5" />
                                </div>
                                <span class="font-bold text-sm text-abyss-800 dark:text-platinum-100">Cover Thumbnail</span>
                            </div>
                            <label class="upload-zone cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    @change="handleThumbnailSelect"
                                    class="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <ImageIcon class="w-4 h-4 text-abyss-500 dark:text-abyss-400 shrink-0" />
                                <span class="field-subtext truncate">
                                    {{ thumbnail ? thumbnail.name : 'Select cover image' }}
                                </span>
                            </label>
                            <p class="field-subtext mt-2">Any image format · max 5 MB</p>
                        </div>

                    </div>
                </div>

                <!-- ── Section: Visibility ─────────────────────────── -->
                <div class="form-section">
                    <p class="form-section-label">Visibility Settings</p>

                    <div class="toggle-row">
                        <label class="toggle-item group">
                            <input
                                v-model="form.is_published"
                                type="checkbox"
                                class="toggle-checkbox"
                            />
                            <div class="toggle-track">
                                <div class="toggle-thumb"></div>
                            </div>
                            <div>
                                <p class="font-bold text-base text-abyss-800 dark:text-platinum-100
                                           group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                    Published
                                </p>
                                <p class="field-subtext">Visible to students immediately</p>
                            </div>
                        </label>

                        <div class="divider-v hidden md:block"></div>

                        <label class="toggle-item group">
                            <input
                                v-model="form.is_featured"
                                type="checkbox"
                                class="toggle-checkbox"
                            />
                            <div class="toggle-track">
                                <div class="toggle-thumb"></div>
                            </div>
                            <div>
                                <p class="font-bold text-base text-abyss-800 dark:text-platinum-100
                                           group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                    Featured
                                </p>
                                <p class="field-subtext">Highlighted in the module library</p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Inline error -->
                <div v-if="error" class="error-banner">
                    <AlertCircleIcon class="w-4 h-4 text-red-500 shrink-0" />
                    <p class="text-base font-medium text-red-600 dark:text-red-400">{{ error }}</p>
                </div>

            </form>

            <!-- ── FOOTER ──────────────────────────────────────────── -->
            <footer class="modal-footer">
                <button
                    type="button"
                    @click="$emit('cancel')"
                    class="btn-secondary btn-3d--secondary justify-center flex-1 max-w-[160px]"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    @click="handleSubmit"
                    :disabled="creating"
                    class="btn-primary btn-3d justify-center flex-1 max-w-[240px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span v-if="!creating">Create Module</span>
                    <div v-else class="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white"></div>
                </button>
            </footer>

        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import {
    X as XIcon,
    Upload as UploadIcon,
    Image as ImageIcon,
    AlertCircle as AlertCircleIcon,
    FileIcon,
    ChevronDown as ChevronDownIcon,
    BookOpen as BookOpenIcon
} from 'lucide-vue-next';
import { useModuleStore } from '@/stores/module';
import { useClassroomStore } from '@/stores/classroom';

const props = defineProps({
    defaultClassroomId: { type: Number, default: null }
});

const emit = defineEmits(['saved', 'cancel']);
const moduleStore = useModuleStore();
const classroomStore = useClassroomStore();

const openDropdown = ref(null)
const triggerRefs = {}
const panelStyles = reactive({})

const toggleDropdown = (key) => {
    if (openDropdown.value === key) {
        openDropdown.value = null
        return
    }
    const el = triggerRefs[key]
    if (el) {
        const rect = el.getBoundingClientRect()
        panelStyles[key] = {
            position: 'fixed',
            top: (rect.bottom + 4) + 'px',
            left: rect.left + 'px',
            width: rect.width + 'px',
            zIndex: 9999,
        }
    }
    openDropdown.value = key
}

const handleDocClick = (e) => {
    if (!openDropdown.value) return
    const triggers = Object.values(triggerRefs)
    const panels = document.querySelectorAll('.custom-select-panel-teleport')
    const insideTrigger = triggers.some(el => el?.contains(e.target))
    const insidePanel = [...panels].some(el => el?.contains(e.target))
    if (!insideTrigger && !insidePanel) openDropdown.value = null
}

const categoryOptions = [
    { value: 'gad',           label: 'Institutional' },
    { value: 'sexual_health', label: 'Health' },
    { value: 'vawc',          label: 'Safety' },
    { value: 'general',       label: 'Standard' },
]

const difficultyOptions = [
    { value: 'beginner',      label: 'Beginner' },
    { value: 'intermediate',  label: 'Intermediate' },
    { value: 'advanced',      label: 'Advanced' },
]

const form = reactive({
    title: '',
    description: '',
    content: '',
    category: 'general',
    difficulty_level: 'beginner',
    classroom_id: props.defaultClassroomId || null,
    order: 0,
    is_published: false,
    is_featured: false
});

const moduleFile = ref(null);
const thumbnail = ref(null);
const creating = ref(false);
const error = ref(null);

onUnmounted(() => {
    document.removeEventListener('click', handleDocClick)
})

onMounted(async () => {
    document.addEventListener('click', handleDocClick)
    if (classroomStore.classrooms.length === 0) {
        await classroomStore.fetchMyClassrooms();
    }
});

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            alert('PDF or Word docs only.');
            event.target.value = '';
            return;
        }
        if (file.size > 25 * 1024 * 1024) {
            alert('Limit: 25MB.');
            event.target.value = '';
            return;
        }
        moduleFile.value = file;
    }
};

const handleThumbnailSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Images only.');
            event.target.value = '';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Limit: 5MB.');
            event.target.value = '';
            return;
        }
        thumbnail.value = file;
    }
};

const handleSubmit = async () => {
    creating.value = true;
    error.value = null;
    try {
        const files = { moduleFile: moduleFile.value, thumbnail: thumbnail.value };
        await moduleStore.createModule(form, files);
        emit('saved');
    } catch (err) {
        error.value = err.response?.data?.message || 'Setup failed';
    } finally {
        creating.value = false;
    }
};
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   MODAL SHELL  —  L1 layer
   Light: platinum-100 on platinum-50 page
   Dark:  abyss-800 on abyss-950 scrim
═══════════════════════════════════════════════════════════ */
.modal-shell {
    @apply relative w-full max-w-3xl mx-auto flex flex-col;
    @apply bg-platinum-100 dark:bg-abyss-800;
    @apply border-2 border-platinum-300 dark:border-abyss-600;
    @apply rounded-2xl overflow-hidden;
}

/* ── Header ───────────────────────────────────────────────── */
.modal-header {
    @apply flex items-center justify-between shrink-0;
    @apply px-7 py-5;
    @apply bg-platinum-200 dark:bg-abyss-700;
    @apply border-b-2 border-platinum-300 dark:border-abyss-600;
}

/* ── Body ─────────────────────────────────────────────────── */
.modal-body {
    @apply flex-1 overflow-visible px-7 py-6;
}

/* ── Footer ───────────────────────────────────────────────── */
.modal-footer {
    @apply flex items-center justify-end gap-3 shrink-0;
    @apply px-7 py-5;
    @apply bg-platinum-200 dark:bg-abyss-700;
    @apply border-t-2 border-platinum-300 dark:border-abyss-600;
}

/* ── Close button ─────────────────────────────────────────── */
.close-btn {
    @apply p-2 rounded-xl shrink-0 transition-all duration-150;
    @apply bg-platinum-300 dark:bg-abyss-600;
    @apply border-2 border-platinum-400 dark:border-abyss-500;
    @apply text-abyss-500 dark:text-platinum-400;
    @apply hover:bg-red-50 dark:hover:bg-red-900/20;
    @apply hover:border-red-300 dark:hover:border-red-700/50;
    @apply hover:text-red-500 dark:hover:text-red-400;
}

/* ── Eyebrow label ────────────────────────────────────────── */
.section-eyebrow {
    @apply text-xs font-bold uppercase tracking-widest;
    @apply text-calm-lavender-500 dark:text-calm-lavender-400;
    @apply font-mplusrounded;
}

/* ═══════════════════════════════════════════════════════════
   FORM SECTION  —  L2 inset card: platinum-200 / abyss-700
═══════════════════════════════════════════════════════════ */
.form-section {
    @apply p-5 rounded-xl space-y-4;
    @apply bg-platinum-200 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-600;
}

.form-section-label {
    @apply block text-xs font-bold uppercase tracking-widest mb-1;
    @apply text-abyss-500 dark:text-abyss-300;
    @apply font-mplusrounded;
}

/* ═══════════════════════════════════════════════════════════
   FIELD GROUP
═══════════════════════════════════════════════════════════ */
.field-group {
    @apply space-y-1.5;
}

.field-label {
    @apply block text-sm font-bold text-abyss-700 dark:text-platinum-200;
}

.field-subtext {
    @apply text-xs font-medium text-abyss-500 dark:text-abyss-300;
    @apply font-mplusrounded;
}

/* ═══════════════════════════════════════════════════════════
   ICON BADGE
═══════════════════════════════════════════════════════════ */
.ds-icon-badge {
    @apply p-2.5 rounded-xl border-2 shrink-0 flex items-center justify-center;
}

.ds-icon-badge--lavender {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/30;
    @apply border-calm-lavender-200 dark:border-calm-lavender-800/50;
    @apply text-calm-lavender-600 dark:text-calm-lavender-400;
}

.ds-icon-badge--pink {
    @apply bg-neon-pink-50 dark:bg-neon-pink-900/20;
    @apply border-neon-pink-200 dark:border-neon-pink-800/40;
    @apply text-neon-pink-600 dark:text-neon-pink-400;
}

/* ═══════════════════════════════════════════════════════════
   UPLOAD TILE  —  L3 inset: platinum-100 / abyss-800
═══════════════════════════════════════════════════════════ */
.upload-tile {
    @apply p-4 rounded-xl;
    @apply bg-platinum-100 dark:bg-abyss-800;
    @apply border-2 border-platinum-300 dark:border-abyss-600;
}

.upload-zone {
    @apply relative flex items-center gap-3 p-3 rounded-xl transition-all duration-150;
    @apply bg-platinum-50 dark:bg-abyss-900;
    @apply border-2 border-dashed border-platinum-300 dark:border-abyss-600;
    @apply hover:border-calm-lavender-400 dark:hover:border-calm-lavender-600;
    @apply hover:bg-calm-lavender-50 dark:hover:bg-calm-lavender-900/10;
}

/* ═══════════════════════════════════════════════════════════
   TOGGLE ROW  —  L3 inset: platinum-100 / abyss-800
═══════════════════════════════════════════════════════════ */
.toggle-row {
    @apply flex flex-col md:flex-row items-start md:items-center gap-5 p-4 rounded-xl;
    @apply bg-platinum-100 dark:bg-abyss-800;
    @apply border-2 border-platinum-300 dark:border-abyss-600;
}

.toggle-item {
    @apply flex items-center gap-3 cursor-pointer flex-1;
}

.toggle-checkbox {
    @apply sr-only;
}

.toggle-track {
    @apply relative w-10 h-6 rounded-full shrink-0 transition-colors duration-200;
    @apply bg-platinum-300 dark:bg-abyss-600;
    @apply border-2 border-platinum-400 dark:border-abyss-500;
}

.toggle-checkbox:checked ~ .toggle-track {
    @apply bg-calm-lavender-500 border-calm-lavender-600;
}

.toggle-thumb {
    @apply absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-checkbox:checked ~ .toggle-track .toggle-thumb {
    @apply translate-x-4;
}

/* ── Vertical divider ─────────────────────────────────────── */
.divider-v {
    @apply w-px self-stretch bg-platinum-300 dark:bg-abyss-600;
}

/* ═══════════════════════════════════════════════════════════
   ERROR BANNER
═══════════════════════════════════════════════════════════ */
.error-banner {
    @apply flex items-center gap-3 p-4 rounded-xl;
    @apply bg-red-50 dark:bg-red-900/20;
    @apply border-2 border-red-200 dark:border-red-800/40;
}

/* ═══════════════════════════════════════════════════════════
   FLAT-3D BUTTON MODIFIERS
═══════════════════════════════════════════════════════════ */
.btn-3d {
    @apply border-b-4 border-black/15 active:border-b active:translate-y-px;
}

.btn-3d--secondary {
    @apply border-b-4 border-platinum-400 dark:border-abyss-500 active:border-b active:translate-y-px;
}

/* ═══════════════════════════════════════════════════════════
   MODAL ENTRY ANIMATION
═══════════════════════════════════════════════════════════ */
.animate-modal {
    animation: modalEntry 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalEntry {
    from { opacity: 0; transform: scale(0.97) translateY(14px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── Scrollbar ────────────────────────────────────────────── */
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply rounded-full bg-platinum-300 dark:bg-abyss-600;
}

/* ═══════════════════════════════════════════════════════════
   CUSTOM DROPDOWN
═══════════════════════════════════════════════════════════ */
.custom-select-wrap {
    @apply relative z-50;
}

.custom-select-trigger {
    @apply w-full flex items-center justify-between cursor-pointer transition-all duration-150;
    @apply bg-platinum-100 dark:bg-abyss-800;
    @apply border-2 border-platinum-300 dark:border-abyss-600;
    @apply hover:border-calm-lavender-400 dark:hover:border-calm-lavender-600;
    @apply text-abyss-800 dark:text-platinum-200;
    @apply font-medium text-base;
    @apply rounded-xl px-4 py-3;
    @apply focus:outline-none focus:ring-2 focus:ring-calm-lavender-400/40;
}

.custom-select-open {
    @apply border-calm-lavender-400 dark:border-calm-lavender-600;
    @apply ring-2 ring-calm-lavender-400/30;
}

.custom-select-chevron {
    @apply w-4 h-4 text-abyss-400 dark:text-abyss-400 shrink-0 transition-transform duration-200;
}

.custom-select-option {
    @apply w-full text-left px-4 py-3 text-base font-medium cursor-pointer transition-all duration-100;
    @apply text-abyss-800 dark:text-platinum-200;
    @apply hover:bg-calm-lavender-50 dark:hover:bg-calm-lavender-900/20;
    @apply hover:text-calm-lavender-700 dark:hover:text-calm-lavender-300;
}

.custom-select-option-active {
    @apply bg-calm-lavender-100 dark:bg-calm-lavender-900/30;
    @apply text-calm-lavender-700 dark:text-calm-lavender-300;
    @apply font-semibold;
}
</style>

<style>
/* ═══════════════════════════════════════════════════════════
   TELEPORTED DROPDOWN — global (bypasses scoped)
   Covers: panel, option default, hover, and active (selected)
   for both light mode and dark mode.
═══════════════════════════════════════════════════════════ */

/* ── Panel shell ──────────────────────────────────────────── */
.custom-select-panel-teleport {
    background-color: var(--color-platinum-100);
    border: 2px solid var(--color-platinum-300);
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}
.dark .custom-select-panel-teleport {
    background-color: var(--color-abyss-950);
    border-color: var(--color-abyss-700);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

/* ── Option: default ──────────────────────────────────────── */
.custom-select-panel-teleport .custom-select-option {
    background-color: var(--color-platinum-100);
    color: var(--color-abyss-800, #1e293b);
}
.dark .custom-select-panel-teleport .custom-select-option {
    background-color: var(--color-abyss-950);
    color: var(--color-platinum-200);
}

/* ── Option: hover ────────────────────────────────────────── */
.custom-select-panel-teleport .custom-select-option:hover {
    background-color: var(--color-calm-lavender-50, #f5f3ff);
    color: var(--color-calm-lavender-700, #6d28d9);
}
.dark .custom-select-panel-teleport .custom-select-option:hover {
    background-color: var(--color-abyss-800);
    color: var(--color-calm-lavender-300, #c4b5fd);
}

/* ── Option: active (currently selected) ─────────────────── */
.custom-select-panel-teleport .custom-select-option-active {
    background-color: var(--color-calm-lavender-100, #ede9fe);
    color: var(--color-calm-lavender-700, #6d28d9);
    font-weight: 600;
}
.dark .custom-select-panel-teleport .custom-select-option-active {
    background-color: color-mix(in srgb, var(--color-calm-lavender-900, #4c1d95) 35%, var(--color-abyss-950));
    color: var(--color-calm-lavender-300, #c4b5fd);
    font-weight: 600;
}
</style>