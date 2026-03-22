<template>
    <div class="group relative bg-white dark:bg-abyss-700 border-2 border-platinum-200 dark:border-abyss-500 rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:border-calm-lavender-300 dark:hover:border-calm-lavender-700 hover:-translate-y-0.5"
        @click="$emit('view', module.id)">

        <!-- Thumbnail -->
        <div class="relative h-40 overflow-hidden bg-platinum-100 dark:bg-abyss-800 shrink-0">
            <img v-if="module.thumbnail_url"
                :src="module.thumbnail_url"
                :alt="module.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div v-else class="w-full h-full flex items-center justify-center">
                <BookOpen class="w-10 h-10 text-platinum-300 dark:text-abyss-500" />
            </div>

            <!-- Category & Featured Badges -->
            <div class="absolute top-3 left-3 flex gap-1.5">
                <span class="badge badge-lavender text-xs">
                    {{ formatCategory(module.category) }}
                </span>
                <span v-if="module.is_featured" class="badge badge-pink text-xs">
                    Featured
                </span>
            </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex-1 flex flex-col justify-between gap-4">

            <!-- Title & Description -->
            <div class="space-y-1.5">
                <h3 class="font-bold text-base text-slate-800 dark:text-platinum-100 line-clamp-2 leading-snug group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
                    {{ module.title }}
                </h3>
                <p class="field-subtext line-clamp-2 leading-relaxed">
                    {{ module.description || 'No description provided for this module.' }}
                </p>
            </div>

            <!-- Meta & CTA -->
            <div class="space-y-3 pt-3 border-t border-platinum-200 dark:border-abyss-500">
                <!-- Meta row -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-platinum-500 dark:text-platinum-600">
                        <BarChart2 class="w-4 h-4 text-calm-lavender-500 dark:text-calm-lavender-400 shrink-0" />
                        <span class="font-medium text-sm capitalize">{{ module.difficulty_level || 'General' }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-platinum-500 dark:text-platinum-600">
                        <EyeIcon class="w-4 h-4 shrink-0" />
                        <span class="font-medium text-sm">{{ module.view_count || 0 }} reads</span>
                    </div>
                </div>

                <!-- CTA Button -->
                <button class="btn-primary w-full justify-center">
                    <PlayIcon class="w-4 h-4 fill-current shrink-0" />
                    <span>Open Module</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Star, Eye as EyeIcon, Play as PlayIcon, BookOpen, BarChart2 } from 'lucide-vue-next';

defineProps({
    module: { type: Object, required: true }
});

defineEmits(['view']);

const formatCategory = (category) => {
    const map = { 'gad': 'Culture', 'sexual_health': 'Health', 'vawc': 'Safety', 'general': 'Standard' };
    return map[category] || 'General';
};
</script>

<style scoped>
@reference "@/style.css";

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>