<template>
  <div class="page-wrapper animate-in">

    <!-- Page Header -->
    <div class="page-header">
      <div class="space-y-1.5">
        <p class="section-eyebrow">Redemption Center</p>
        <h1 class="page-title">
          WGAD <span class="brand-gradient-text">Rewards</span>
        </h1>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="stat-pill">
          <Flame class="w-5 h-5 text-vawc-orange-500 shrink-0" />
          <div>
            <p class="stat-pill-label">Available XP</p>
            <p class="stat-pill-value text-calm-lavender-600 dark:text-calm-lavender-400">
              {{ authStore.user?.gamification?.experience_points?.toLocaleString() || 0 }}
            </p>
          </div>
        </div>

        <router-link :to="{ name: 'user.my-inventory' }" class="btn-secondary group">
          <Package class="w-4 h-4 group-hover:rotate-6 transition-transform" />
          <span class="hidden sm:inline">My Inventory</span>
        </router-link>
      </div>
    </div>

    <!-- Rewards Grid -->
    <div v-if="rewards.length > 0" class="space-y-5">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        <div
          v-for="item in paginatedRewards"
          :key="item.id"
          class="item-card group"
          :class="{ 'opacity-60': !canAfford(item) || item.stock_quantity <= 0 }"
        >
          <!-- Stock badge -->
          <div class="absolute top-2 right-2 z-10">
            <span v-if="item.stock_quantity > 0" class="badge badge-muted">
              {{ item.stock_quantity }} left
            </span>
            <span v-else class="badge badge-red">Sold out</span>
          </div>

          <!-- Image -->
          <div class="item-image-wrap">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Gift class="w-7 h-7 text-platinum-400 dark:text-platinum-600 group-hover:text-calm-lavender-400 transition-colors" />
            </div>
          </div>

          <!-- Content -->
          <div class="p-3.5 flex flex-col flex-1 gap-2">
            <h3 class="font-madimione text-sm text-abyss-800 dark:text-platinum-200 leading-snug line-clamp-2 group-hover:text-calm-lavender-600 dark:group-hover:text-calm-lavender-400 transition-colors">
              {{ item.title }}
            </h3>

            <div class="mt-auto pt-2.5 border-t-2 border-platinum-200 dark:border-abyss-500 flex items-center justify-between gap-2">
              <div>
                <p class="font-dosis text-[10px] font-semibold uppercase tracking-wide text-platinum-500">XP Cost</p>
                <p class="font-dosis text-xs font-bold leading-none"
                   :class="canAfford(item) ? 'text-calm-lavender-600 dark:text-calm-lavender-400' : 'text-platinum-500'">
                  {{ item.xp_required.toLocaleString() }}
                </p>
              </div>

              <button
                @click="claimReward(item)"
                :disabled="!canAfford(item) || item.stock_quantity <= 0"
                :class="['redeem-btn', canAfford(item) && item.stock_quantity > 0 ? 'redeem-btn-active' : 'redeem-btn-disabled']"
                :title="canAfford(item) ? 'Redeem Item' : 'Not enough XP'"
              >
                <ArrowRight v-if="canAfford(item) && item.stock_quantity > 0" class="w-3.5 h-3.5" />
                <Lock v-else class="w-3 h-3 opacity-60" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AppPagination
        v-model="currentPage"
        :total="rewards.length"
        :page-size="PAGE_SIZE"
        item-label="rewards"
      />
    </div>

    <!-- Empty State -->
    <div v-if="rewards.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <Gift class="w-8 h-8 text-platinum-400" />
      </div>
      <p class="empty-state-title">No rewards available</p>
      <p class="empty-state-desc">Check back later for new items.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Gift, Flame, ArrowRight, Lock, Package } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/utils/useToast';
import axios from '@/utils/api';
import AppPagination from '@/components/ui/AppPagination.vue';

const authStore = useAuthStore();
const toast = useToast();
const rewards = ref([]);

const PAGE_SIZE = 6;
const currentPage = ref(1);

const paginatedRewards = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return rewards.value.slice(start, start + PAGE_SIZE);
});

watch(() => rewards.value.length, () => { currentPage.value = 1; });

const canAfford = (item) => (authStore.user?.gamification?.experience_points || 0) >= item.xp_required;

const loadRewards = async () => {
  try {
    const { data } = await axios.get('/api/rewards/available');
    rewards.value = data;
  } catch (err) { console.error('Asset Load Failure:', err); }
};

const claimReward = async (item) => {
  try {
    const { data } = await axios.post(`/api/rewards/claim/${item.id}`);
    toast.success('Success! Visit the WGAD Office to claim your item.');
    if (authStore.user?.gamification && data.remaining_xp !== undefined) {
      authStore.user.gamification.experience_points = data.remaining_xp;
    }
    loadRewards();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Error executing redemption.');
  }
};

onMounted(loadRewards);
</script>

<style scoped>
@reference "@/style.css";

.redeem-btn {
  @apply w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0;
}

.redeem-btn-active {
  @apply bg-calm-lavender-600 dark:bg-calm-lavender-700 text-white;
  @apply border-2 border-calm-lavender-700 dark:border-calm-lavender-600;
  @apply border-b-4 border-b-calm-lavender-800;
  @apply hover:bg-calm-lavender-700 dark:hover:bg-calm-lavender-600;
  @apply active:border-b-2 active:translate-y-px;
}

.redeem-btn-disabled {
  @apply bg-platinum-200 dark:bg-abyss-600 text-platinum-400 dark:text-platinum-600;
  @apply border-2 border-platinum-300 dark:border-abyss-500;
  @apply cursor-not-allowed;
}

.animate-in {
  animation: fadeSlideUp 0.4s ease-out forwards;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>