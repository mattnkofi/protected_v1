<template>
    <div class="page-wrapper animate-in font-poppins">

        <!-- Page Header -->
        <div class="page-header">
            <div class="space-y-1.5">
                <p class="section-eyebrow">Personal Collection</p>
                <h1 class="page-title">
                    My <span class="brand-gradient-text">Inventory</span>
                </h1>
            </div>

            <div class="flex items-center gap-3 shrink-0">
                <!-- Item count chip -->
                <div class="stat-pill">
                    <CheckCircle class="w-5 h-5 text-safety-teal-500 shrink-0" />
                    <div>
                        <p class="stat-pill-label">Total Items</p>
                        <p class="stat-pill-value text-calm-lavender-600 dark:text-calm-lavender-400">
                            {{ inventory.length }}
                        </p>
                    </div>
                </div>

                <!-- Shop link -->
                <router-link :to="{ name: 'user.rewards-shop' }" class="btn-primary group">
                    <span class="hidden sm:inline">Visit Shop</span>
                    <ArrowRight class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </router-link>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-24 gap-3">
            <div class="spinner"></div>
            <p class="loading-text">Loading your inventory…</p>
        </div>

        <!-- Inventory Grid -->
        <div v-else-if="inventory.length > 0" class="space-y-5">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            <div v-for="item in paginatedInventory" :key="item.id" class="item-card group">

                <!-- Owned badge -->
                <div class="absolute top-2 right-2 z-10">
                    <span class="flex items-center gap-1 px-2 py-0.5
                                 bg-safety-teal-500 text-white text-[10px] font-medium rounded-md">
                        <CheckCircle class="w-3 h-3" />
                        Owned
                    </span>
                </div>

                <!-- Image -->
                <div class="item-image-wrap">
                    <img
                        v-if="item.reward?.image_url"
                        :src="item.reward.image_url"
                        class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                        @error="handleImageError"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                        <Gift class="w-7 h-7 text-platinum-400 dark:text-platinum-600
                                    group-hover:text-calm-lavender-400 transition-colors" />
                    </div>
                </div>

                <!-- Content -->
                <div class="p-3.5 flex flex-col flex-1 gap-2">
                    <h3 class="text-sm font-semibold text-abyss-800 dark:text-platinum-200
                               leading-snug line-clamp-2
                               group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400
                               transition-colors">
                        {{ item.reward?.title || 'Unknown Reward' }}
                    </h3>

                    <div class="mt-auto pt-2.5 border-t-2 border-platinum-200 dark:border-abyss-500
                                flex items-center justify-between gap-1">
                        <div>
                            <p class="font-mplusrounded text-[10px] text-platinum-500">Unlocked</p>
                            <p class="text-xs font-medium text-abyss-700 dark:text-platinum-300">
                                {{ formatDate(item.claimed_at) }}
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="font-mplusrounded text-[10px] text-platinum-500">XP Value</p>
                            <p class="text-xs font-semibold text-calm-lavender-600 dark:text-calm-lavender-400">
                                {{ item.reward?.xp_cost?.toLocaleString() || 0 }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            <AppPagination
                v-model="currentPage"
                :total="inventory.length"
                :page-size="PAGE_SIZE"
                item-label="items"
            />
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
            <div class="empty-state-icon">
                <PackageOpen class="w-8 h-8 text-platinum-400" />
            </div>
            <p class="empty-state-title">Your inventory is empty</p>
            <p class="empty-state-desc">Visit the rewards shop to redeem your XP!</p>
            <router-link :to="{ name: 'user.rewards-shop' }" class="btn-primary mx-auto mt-5">
                <span>Browse Rewards</span>
                <ArrowRight class="w-4 h-4" />
            </router-link>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Package, Gift, CheckCircle, PackageOpen, ArrowRight, Loader2 } from 'lucide-vue-next';
import { useToast } from '@/utils/useToast';
import axios from '@/utils/api';
import AppPagination from '@/components/ui/AppPagination.vue';

const toast = useToast();
const inventory = ref([]);
const isLoading = ref(true);

const PAGE_SIZE = 5;
const currentPage = ref(1);

const paginatedInventory = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return inventory.value.slice(start, start + PAGE_SIZE);
});

watch(() => inventory.value.length, () => { currentPage.value = 1; });

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const handleImageError = (event) => {
    event.target.style.display = 'none';
};

const loadInventory = async () => {
    isLoading.value = true;
    try {
        const { data } = await axios.get('/api/rewards/my-inventory');
        inventory.value = data.inventory || [];
    } catch (err) {
        console.error('Failed to load inventory:', err);
        toast.error('Failed to load your inventory');
    } finally {
        isLoading.value = false;
    }
};

onMounted(loadInventory);
</script>

<style scoped>
@reference "@/style.css";

/* ═══════════════════════════════════════════════════════════
   PAGE WRAPPER
═══════════════════════════════════════════════════════════ */
.page-wrapper {
    @apply space-y-6 text-abyss-800 dark:text-platinum-100;
}

/* ═══════════════════════════════════════════════════════════
   STAT PILL  —  L1 stamped chip
═══════════════════════════════════════════════════════════ */
.stat-pill {
    @apply flex items-center gap-3;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply rounded-xl px-4 py-2.5;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/50;
    @apply transition-colors duration-150;
}

.stat-pill-label {
    @apply font-mplusrounded text-xs text-platinum-500 uppercase tracking-wide;
}

.stat-pill-value {
    @apply text-lg font-bold leading-none mt-0.5;
}

/* ═══════════════════════════════════════════════════════════
   ITEM CARD  —  L1: platinum-100 / abyss-700
   border-2 replaces shadow + 1px border
═══════════════════════════════════════════════════════════ */
.item-card {
    @apply relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200;
    @apply bg-platinum-100 dark:bg-abyss-700;
    @apply border-2 border-platinum-300 dark:border-abyss-500;
    @apply hover:border-calm-lavender-200 dark:hover:border-calm-lavender-800/60;
    @apply hover:-translate-y-0.5;
}

/* ═══════════════════════════════════════════════════════════
   IMAGE WRAP  —  L2 inset: platinum-200 / abyss-600
═══════════════════════════════════════════════════════════ */
.item-image-wrap {
    @apply h-28 lg:h-32 relative overflow-hidden shrink-0;
    @apply bg-platinum-200 dark:bg-abyss-600;
    @apply group-hover:bg-calm-lavender-50 dark:group-hover:bg-calm-lavender-900/10;
    @apply transition-colors;
}

/* ═══════════════════════════════════════════════════════════
   ENTRY ANIMATION
═══════════════════════════════════════════════════════════ */
.animate-in {
    animation: fadeSlideUp 0.4s ease-out forwards;
}

@keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
}
</style>