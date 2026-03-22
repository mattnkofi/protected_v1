<template>
    <!-- ── Overlay ──────────────────────────────────────────────────
         Block scroll container — modal never cropped on short screens
    ─────────────────────────────────────────────────────────────── -->
    <div
        class="fixed inset-0 z-[150] bg-abyss-950/60 backdrop-blur-sm overflow-y-auto py-10 px-4"
        @click.self="$emit('cancel')"
    >
        <!-- ── Modal shell ──────────────────────────────────────
             L1 layer: platinum-100 / abyss-700
             border-2 border-platinum-300 = stamped boundary
        ─────────────────────────────────────────────────────── -->
        <div class="modal-shell animate-modal font-poppins">

            <!-- ── HEADER ─────────────────────────────────────── -->
            <header class="modal-header">
                <div class="flex items-center gap-4">
                    <div class="ds-icon-badge ds-icon-badge--lavender">
                        <PencilIcon class="w-4 h-4" />
                    </div>
                    <div>
                        <p class="section-eyebrow">Module Registry</p>
                        <h2 class="font-madimione text-2xl text-abyss-800 dark:text-platinum-100 leading-tight">
                            Edit <span class="brand-gradient-text">Module</span>
                        </h2>
                    </div>
                </div>
                <button @click="$emit('cancel')" class="close-btn" aria-label="Close">
                    <XIcon class="w-4 h-4" />
                </button>
            </header>

            <!-- ── FORM ───────────────────────────────────────── -->
            <form @submit.prevent="handleSubmit" class="modal-body custom-scrollbar space-y-5">

                <!-- Title -->
                <div class="field-group">
                    <label class="field-label">
                        Module Title <span class="text-red-400">*</span>
                    </label>
                    <input
                        v-model="form.title"
                        type="text"
                        required
                        placeholder="Enter module title"
                        class="input-field placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                    />
                </div>

                <!-- Description -->
                <div class="field-group">
                    <label class="field-label">Description</label>
                    <textarea
                        v-model="form.description"
                        rows="3"
                        placeholder="Brief overview of this module's objectives…"
                        class="input-field resize-none placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                    ></textarea>
                </div>

                <!-- Category + Level + Order row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div class="field-group">
                        <label class="field-label">Category <span class="text-red-400">*</span></label>
                        <div class="ds-select-wrap">
                            <select v-model="form.category" required class="ds-select">
                                <option value="gad">Institutional</option>
                                <option value="sexual_health">Health</option>
                                <option value="vawc">Safety</option>
                                <option value="general">Standard</option>
                            </select>
                            <ChevronDownIcon class="ds-select-icon" />
                        </div>
                    </div>

                    <div class="field-group">
                        <label class="field-label">Difficulty Level</label>
                        <div class="ds-select-wrap">
                            <select v-model="form.difficulty_level" class="ds-select">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                            <ChevronDownIcon class="ds-select-icon" />
                        </div>
                    </div>

                    <div class="field-group">
                        <label class="field-label">Sort Order</label>
                        <input
                            v-model.number="form.order"
                            type="number"
                            min="0"
                            class="input-field placeholder:text-platinum-700 dark:placeholder:text-platinum-400"
                        />
                    </div>

                </div>

                <!-- File uploads row ──────────────────────────── -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <!-- Module document -->
                    <div class="upload-tile">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="ds-icon-badge ds-icon-badge--lavender !p-1.5">
                                <FileIcon class="w-3.5 h-3.5" />
                            </div>
                            <span class="font-semibold text-sm text-abyss-800 dark:text-platinum-100">Module Document</span>
                        </div>

                        <!-- Existing file chip -->
                        <div
                            v-if="props.module.file_name"
                            class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg mb-3
                                   bg-platinum-50 dark:bg-abyss-700
                                   border-2 border-platinum-300 dark:border-abyss-500"
                        >
                            <span class="field-subtext !text-sm truncate">{{ props.module.file_name }}</span>
                            <button
                                v-if="newFile"
                                @click="clearFile"
                                type="button"
                                class="shrink-0 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        <label class="upload-zone cursor-pointer">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                @change="handleFileSelect"
                                ref="fileInput"
                                class="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <UploadIcon class="w-4 h-4 text-platinum-500 dark:text-platinum-400 shrink-0" />
                            <span class="field-subtext truncate !text-sm">
                                {{ newFile ? newFile.name : 'Replace document (PDF or .docx)' }}
                            </span>
                        </label>
                        <p class="field-subtext mt-2">Max 25 MB</p>
                    </div>

                    <!-- Thumbnail -->
                    <div class="upload-tile">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="ds-icon-badge ds-icon-badge--pink !p-1.5">
                                <ImageIcon class="w-3.5 h-3.5" />
                            </div>
                            <span class="font-semibold text-sm text-abyss-800 dark:text-platinum-100">Cover Thumbnail</span>
                        </div>

                        <!-- Existing thumbnail preview -->
                        <div
                            v-if="props.module.thumbnail_url && !newThumbnail"
                            class="flex items-center gap-3 mb-3"
                        >
                            <img
                                :src="props.module.thumbnail_url"
                                class="w-14 h-10 object-cover rounded-lg shrink-0
                                       border-2 border-platinum-300 dark:border-abyss-500"
                            />
                            <span class="field-subtext !text-sm">Current thumbnail</span>
                        </div>

                        <label class="upload-zone cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                @change="handleThumbnailSelect"
                                ref="thumbnailInput"
                                class="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <ImageIcon class="w-4 h-4 text-platinum-500 dark:text-platinum-400 shrink-0" />
                            <span class="field-subtext truncate !text-sm">
                                {{ newThumbnail ? newThumbnail.name : 'Replace cover image' }}
                            </span>
                        </label>

                        <button
                            v-if="newThumbnail"
                            @click="clearThumbnail"
                            type="button"
                            class="mt-2 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                        >
                            Cancel new thumbnail
                        </button>
                        <p v-else class="field-subtext mt-2">Max 5 MB</p>
                    </div>

                </div>

                <!-- Visibility toggles ─────────────────────────── -->
                <div class="toggle-row">
                    <!-- Online (is_published) -->
                    <label class="toggle-item group">
                        <input v-model="form.is_published" type="checkbox" class="sr-only" />
                        <div
                            :class="[
                                'toggle-track',
                                form.is_published
                                    ? 'bg-calm-lavender-500 border-calm-lavender-600'
                                    : 'bg-platinum-300 dark:bg-abyss-500 border-platinum-400 dark:border-abyss-400'
                            ]"
                        >
                            <div
                                :class="[
                                    'toggle-thumb',
                                    form.is_published ? 'translate-x-4' : 'translate-x-0'
                                ]"
                            ></div>
                        </div>
                        <div>
                            <p class="font-semibold text-sm text-abyss-800 dark:text-platinum-100
                                       group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                Online
                            </p>
                            <p class="field-subtext">Visible to students immediately</p>
                        </div>
                    </label>

                    <div class="w-px self-stretch bg-platinum-300 dark:bg-abyss-500 hidden md:block"></div>

                    <!-- Priority (is_featured) -->
                    <label class="toggle-item group">
                        <input v-model="form.is_featured" type="checkbox" class="sr-only" />
                        <div
                            :class="[
                                'toggle-track',
                                form.is_featured
                                    ? 'bg-calm-lavender-500 border-calm-lavender-600'
                                    : 'bg-platinum-300 dark:bg-abyss-500 border-platinum-400 dark:border-abyss-400'
                            ]"
                        >
                            <div
                                :class="[
                                    'toggle-thumb',
                                    form.is_featured ? 'translate-x-4' : 'translate-x-0'
                                ]"
                            ></div>
                        </div>
                        <div>
                            <p class="font-semibold text-sm text-abyss-800 dark:text-platinum-100
                                       group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                                Priority
                            </p>
                            <p class="field-subtext">Highlighted in the module library</p>
                        </div>
                    </label>
                </div>

            </form>

            <!-- ── FOOTER ─────────────────────────────────────── -->
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
                    :disabled="saving"
                    class="btn-primary btn-3d justify-center flex-1 max-w-[240px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span v-if="!saving">Save Changes</span>
                    <div v-else class="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white"></div>
                </button>
            </footer>

        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useModuleStore } from '@/stores/module';
import {
    FileIcon,
    ImageIcon,
    X as XIcon,
    Pencil as PencilIcon,
    ChevronDown as ChevronDownIcon,
    Upload as UploadIcon
} from 'lucide-vue-next';

const props = defineProps({
    module: { type: Object, required: true }
});

const emit = defineEmits(['saved', 'cancel']);
const moduleStore = useModuleStore();

const form = reactive({
    title: props.module.title,
    description: props.module.description,
    content: props.module.content,
    category: props.module.category,
    difficulty_level: props.module.difficulty_level,
    order: props.module.order,
    is_published: props.module.is_published,
    is_featured: props.module.is_featured
});

const newFile = ref(null);
const newThumbnail = ref(null);
const saving = ref(false);

const fileInput = ref(null);
const thumbnailInput = ref(null);

const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 25 * 1024 * 1024) { alert('Limit 25MB.'); return; }
        newFile.value = file;
    }
};

const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { alert('Limit 5MB.'); return; }
        newThumbnail.value = file;
    }
};

const clearFile = () => { newFile.value = null; if (fileInput.value) fileInput.value.value = ''; };
const clearThumbnail = () => { newThumbnail.value = null; if (thumbnailInput.value) thumbnailInput.value.value = ''; };

const handleSubmit = async () => {
    saving.value = true;
    try {
        await moduleStore.updateModule(props.module.id, form);
        if (newFile.value) await moduleStore.uploadModuleFile(props.module.id, newFile.value);
        if (newThumbnail.value) await moduleStore.uploadThumbnail(props.module.id, newThumbnail.value);
        emit('saved');
    } catch (err) {
        console.error(err);
    } finally {
        saving.value = false;
    }
};
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   MODAL SHELL  —  L1 layer
   Light: platinum-100 on abyss-950/60 scrim
   Dark:  abyss-700  on abyss-950/60 scrim
═══════════════════════════════════════════════════════════ */
.modal-shell {
    @apply relative w-full max-w-4xl mx-auto flex flex-col;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-2xl overflow-hidden;
}

/* ── Header  (L2 — slightly richer than shell) ────────────── */
.modal-header {
    @apply flex items-center justify-between shrink-0;
    @apply px-7 py-5;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-b-2 border-platinum-300 dark:border-abyss-500;
}

/* ── Body (scrollable) ────────────────────────────────────── */
.modal-body {
    @apply flex-1 overflow-y-auto px-7 py-6;
}

/* ── Footer (L2 — matches header depth) ──────────────────── */
.modal-footer {
    @apply flex items-center justify-end gap-3 shrink-0;
    @apply px-7 py-5;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-t-2 border-platinum-300 dark:border-abyss-500;
}

/* ── Close button ─────────────────────────────────────────── */
.close-btn {
    @apply p-2 rounded-xl shrink-0 transition-all duration-150;
    @apply bg-platinum-300 dark:bg-abyss-500;
    @apply border-2 border-platinum-300 dark:border-abyss-400;
    @apply text-platinum-600 dark:text-platinum-400;
    @apply hover:bg-red-50 dark:hover:bg-red-900/20;
    @apply hover:border-red-200 dark:hover:border-red-800/40;
    @apply hover:text-red-500 dark:hover:text-red-400;
}

/* ═══════════════════════════════════════════════════════════
   FIELD GROUP
═══════════════════════════════════════════════════════════ */
.field-group {
    @apply space-y-1.5;
}

/* ═══════════════════════════════════════════════════════════
   SELECT  —  L2 inset: platinum-200 / abyss-600
═══════════════════════════════════════════════════════════ */
.ds-select-wrap {
    @apply relative;
}

.ds-select {
    @apply w-full appearance-none cursor-pointer transition-all duration-150;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply text-abyss-800 dark:text-platinum-200;
    @apply font-medium text-sm;
    @apply rounded-xl px-4 py-3 pr-10;
    @apply focus:outline-none focus:ring-2 focus:ring-calm-lavender-400/40 focus:border-calm-lavender-400;
}

.ds-select-icon {
    @apply absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none;
    @apply w-4 h-4 text-platinum-500 dark:text-platinum-400;
}

/* ═══════════════════════════════════════════════════════════
   ICON BADGE
═══════════════════════════════════════════════════════════ */
.ds-icon-badge {
    @apply p-2.5 rounded-xl border-2 shrink-0 flex items-center justify-center;
}

.ds-icon-badge--lavender {
    @apply bg-calm-lavender-50 dark:bg-calm-lavender-900/20;
    @apply border-calm-lavender-200 dark:border-calm-lavender-800/40;
    @apply text-calm-lavender-600 dark:text-calm-lavender-400;
}

.ds-icon-badge--pink {
    @apply bg-neon-pink-50 dark:bg-neon-pink-900/20;
    @apply border-neon-pink-200 dark:border-neon-pink-800/40;
    @apply text-neon-pink-600 dark:text-neon-pink-400;
}

/* ═══════════════════════════════════════════════════════════
   UPLOAD TILE  —  L2 inset: platinum-200 / abyss-600
═══════════════════════════════════════════════════════════ */
.upload-tile {
    @apply p-4 rounded-xl;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
}

.upload-zone {
    @apply relative flex items-center gap-3 p-3 rounded-xl transition-all duration-150;
    @apply bg-platinum-50 dark:bg-abyss-700;
    @apply border-2 border-dashed border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700;
    @apply hover:bg-calm-lavender-50/50 dark:hover:bg-calm-lavender-900/10;
}

/* ═══════════════════════════════════════════════════════════
   TOGGLE ROW  —  L2 inset: platinum-200 / abyss-600
═══════════════════════════════════════════════════════════ */
.toggle-row {
    @apply flex flex-col md:flex-row items-start md:items-center gap-5 p-4 rounded-xl;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
}

.toggle-item {
    @apply flex items-center gap-3 cursor-pointer flex-1;
}

/* Track & thumb — active colours driven by Vue :class bindings */
.toggle-track {
    @apply relative w-12 h-7 rounded-full shrink-0 border-2 transition-colors duration-200;
}

.toggle-thumb {
    @apply absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform duration-200;
    box-shadow: 0 1px 4px rgba(0,0,0,0.35);
}

/* ═══════════════════════════════════════════════════════════
   FLAT-3D BUTTON MODIFIERS
═══════════════════════════════════════════════════════════ */
.btn-3d {
    @apply border-b-4 border-black/10 active:border-b active:translate-y-px;
}

.btn-3d--secondary {
    @apply border-b-4 border-platinum-400 dark:border-abyss-400 active:border-b active:translate-y-px;
}

/* ═══════════════════════════════════════════════════════════
   MODAL ENTRY ANIMATION  —  no blur filter
═══════════════════════════════════════════════════════════ */
.animate-modal {
    animation: modalEntry 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalEntry {
    from { opacity: 0; transform: scale(0.97) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* ── Scrollbar ───────────────────────────────────────────── */
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
    @apply rounded-full bg-platinum-300 dark:bg-abyss-500;
}

/* ── Select option colors (browser override) ─────────────── */
select option {
    @apply bg-platinum-50 text-abyss-800;
}

.dark select option {
    @apply bg-abyss-600 text-platinum-100;
}
</style>