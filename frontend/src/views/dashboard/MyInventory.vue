<template>
  <div class="page-wrapper animate-in">

    <!-- Page Header -->
    <div class="page-header">
      <div class="space-y-1.5">
        <p class="section-eyebrow">Personal Collection</p>
        <h1 class="page-title">
          My <span class="brand-gradient-text">Inventory</span>
        </h1>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <div class="stat-pill">
          <CheckCircle class="w-5 h-5 text-safety-teal-500 shrink-0" />
          <div>
            <p class="stat-pill-label">Total Items</p>
            <p class="stat-pill-value text-calm-lavender-600 dark:text-calm-lavender-400">
              {{ inventory.length }}
            </p>
          </div>
        </div>

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
          <div class="coupon-card overflow-hidden">
            <div class="coupon-watermark">
              <img :src="protectEdLogo" alt="ProtectEd logo watermark" />
            </div>

            <div class="coupon-topbar">
              <div class="coupon-kicker-wrap">
                <p class="coupon-kicker">Reward Pass</p>
                <h3 class="coupon-title">
                  {{ item.reward?.title || 'Unknown Reward' }}
                </h3>
              </div>

              <div class="coupon-brand-stack">
                <div class="coupon-brand-mark">
                  <img :src="protectEdLogo" alt="ProtectEd logo" />
                </div>

                <button class="coupon-download-btn" type="button" @click="downloadCoupon(item)">
                  <Download class="w-3.5 h-3.5" />
                  PNG
                </button>
              </div>
            </div>

            <div class="coupon-body">
              <div class="coupon-rail">
                <div class="coupon-art-wrap">
                  <div class="coupon-art-frame">
                    <img
                      v-if="item.reward?.image_url"
                      :src="item.reward.image_url"
                      class="coupon-art"
                      @error="handleImageError"
                    />
                    <div v-else class="coupon-art-fallback">
                      <Gift class="w-8 h-8 text-calm-lavender-500" />
                    </div>
                  </div>
                </div>

                <div class="coupon-badge-row">
                  <span class="ticket-chip ticket-chip-green">
                    <CheckCircle class="w-3 h-3" />
                    Owned
                  </span>
                  <span class="ticket-chip ticket-chip-gold">{{ couponCode(item) }}</span>
                </div>
              </div>

              <div class="coupon-copy">
                <div class="coupon-glance">
                  <div class="coupon-glance-label">XP</div>
                  <div class="coupon-glance-value">{{ item.reward?.xp_cost?.toLocaleString() || 0 }}</div>
                </div>

                <div class="coupon-meta">
                  <div class="coupon-meta-stack">
                    <p class="coupon-meta-label">Done</p>
                    <p class="coupon-meta-value">{{ formatDate(item.claimed_at) }}</p>
                  </div>
                  <div class="text-right">
                    <p class="coupon-meta-label">Code</p>
                    <p class="coupon-meta-value coupon-code">{{ couponCode(item) }}</p>
                  </div>
                </div>

                <div class="coupon-footer">
                  <div class="coupon-ribbon">Redeem</div>
                  <div class="coupon-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
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
import { Gift, CheckCircle, PackageOpen, ArrowRight, Download } from 'lucide-vue-next';
import { useToast } from '@/utils/useToast';
import axios from '@/utils/api';
import AppPagination from '@/components/ui/AppPagination.vue';
import protectEdLogo from '@/assets/ProtectEdLogo.svg';

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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const couponCode = (item) => {
  const idPart = String(item?.reward?.id || item?.id || '0000').padStart(4, '0');
  return `STU-${idPart}`;
};

const imageToDataUrl = async (src) => {
  const response = await fetch(src);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const downloadCoupon = async (item) => {
  try {
    const rewardTitle = item.reward?.title || 'Reward';
    const couponTitle = rewardTitle.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'reward';
    const filename = `${couponTitle}-coupon.png`;

    const logoDataUrl = await imageToDataUrl(protectEdLogo);
    const rewardImageDataUrl = item.reward?.image_url ? await imageToDataUrl(item.reward.image_url) : null;

    const width = 1400;
    const height = 800;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#09111f" />
            <stop offset="40%" stop-color="#2a1658" />
            <stop offset="100%" stop-color="#ff7a59" />
          </linearGradient>
          <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fffaf7" />
            <stop offset="100%" stop-color="#f4ecff" />
          </linearGradient>
          <linearGradient id="accentA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#7c3aed" />
            <stop offset="100%" stop-color="#22c55e" />
          </linearGradient>
          <linearGradient id="accentB" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#040510" flood-opacity="0.28" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#bg)" />
        <circle cx="1280" cy="100" r="150" fill="#22c55e" fill-opacity="0.18" />
        <circle cx="150" cy="130" r="110" fill="#06b6d4" fill-opacity="0.20" />
        <circle cx="1120" cy="650" r="200" fill="#f59e0b" fill-opacity="0.18" />
        <rect x="90" y="130" width="1220" height="540" rx="44" fill="url(#panel)" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2" filter="url(#shadow)" />

        <g opacity="0.10" transform="translate(430 145) rotate(-10 320 320)">
          <image href="${logoDataUrl}" x="0" y="0" width="640" height="640" preserveAspectRatio="xMidYMid meet" />
        </g>

        <rect x="90" y="130" width="18" height="540" rx="9" fill="url(#accentA)" />
        <rect x="1262" y="130" width="18" height="540" rx="9" fill="url(#accentB)" />
        <line x1="445" y1="170" x2="445" y2="630" stroke="#d8c7ff" stroke-width="3" stroke-dasharray="10 14" />

        <g transform="translate(150 182)">
          <text x="0" y="0" fill="#ffffff" font-family="Poppins, Arial, sans-serif" font-size="24" font-weight="800" letter-spacing="6">REWARD PASS</text>
          <text x="0" y="56" fill="#fffaf7" font-family="Madimi One, Georgia, serif" font-size="54" font-weight="700">${rewardTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
          <rect x="0" y="92" width="246" height="10" rx="5" fill="url(#accentB)" />
          <text x="0" y="124" fill="#fdf2ff" font-family="M PLUS Rounded 1c, Arial, sans-serif" font-size="24" font-weight="700">${couponCode(item)}</text>
        </g>

        <g transform="translate(140 250)">
          <rect x="0" y="0" width="320" height="320" rx="34" fill="#ffffff" stroke="#f0e4ff" stroke-width="4" />
          <rect x="18" y="18" width="284" height="284" rx="26" fill="#dbeafe" />
          ${rewardImageDataUrl ? `<image href="${rewardImageDataUrl}" x="18" y="18" width="284" height="284" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 round 26)" />` : ''}
          ${rewardImageDataUrl ? '' : `<g transform="translate(160 160)"><circle r="46" fill="#ffffff" fill-opacity="0.75" /><polygon points="0,-28 8,-6 30,-6 12,6 18,28 0,14 -18,28 -12,6 -30,-6 -8,-6" fill="#7c3aed" /></g>`}
        </g>

        <g transform="translate(520 238)">
          <text x="0" y="0" fill="#6b21a8" font-family="Dosis, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="4">XP</text>
          <text x="0" y="54" fill="#1a1730" font-family="Poppins, Arial, sans-serif" font-size="58" font-weight="800">${Number(item.reward?.xp_cost || 0).toLocaleString()}</text>

          <text x="0" y="128" fill="#6b21a8" font-family="Dosis, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="4">UNLOCKED</text>
          <text x="0" y="180" fill="#1a1730" font-family="M PLUS Rounded 1c, Arial, sans-serif" font-size="28" font-weight="700">${formatDate(item.claimed_at)}</text>

          <rect x="0" y="226" width="510" height="84" rx="22" fill="#0f172a" />
          <rect x="18" y="244" width="164" height="48" rx="18" fill="url(#accentA)" />
          <text x="100" y="274" text-anchor="middle" fill="#ffffff" font-family="Dosis, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="3">REDEEM</text>
          <text x="214" y="274" fill="#ffffff" font-family="M PLUS Rounded 1c, Arial, sans-serif" font-size="22" font-weight="700">${couponTitle}</text>
        </g>

        <g transform="translate(1140 182)">
          <circle cx="74" cy="74" r="72" fill="#ffffff" />
          <circle cx="74" cy="74" r="66" fill="#f5edff" />
          <image href="${logoDataUrl}" x="28" y="28" width="92" height="92" preserveAspectRatio="xMidYMid meet" />
        </g>

        <g transform="translate(1120 572)">
          <rect x="0" y="0" width="212" height="56" rx="28" fill="#22c55e" />
          <text x="106" y="35" text-anchor="middle" fill="#ffffff" font-family="Poppins, Arial, sans-serif" font-size="18" font-weight="800" letter-spacing="3">STUDENT PASS</text>
        </g>
      </svg>
    `;

    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Unable to generate coupon image');
          URL.revokeObjectURL(objectUrl);
          return;
        }

        const pngUrl = URL.createObjectURL(blob);
        downloadDataUrl(pngUrl, filename);
        setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
        URL.revokeObjectURL(objectUrl);
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error('Unable to generate coupon image');
    };

    image.src = objectUrl;
  } catch (err) {
    console.error('Failed to download coupon:', err);
    toast.error('Failed to download coupon image');
  }
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

.coupon-card {
  position: relative;
  min-height: 100%;
  border-radius: 1.35rem;
  border: 1px solid rgba(126, 34, 206, 0.13);
  background:
    radial-gradient(circle at top right, rgba(126, 34, 206, 0.12), transparent 28%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 244, 255, 0.92));
  box-shadow:
    0 18px 42px rgba(25, 18, 63, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.dark .coupon-card {
  border-color: rgba(189, 147, 249, 0.16);
  background:
    radial-gradient(circle at top right, rgba(189, 147, 249, 0.14), transparent 30%),
    linear-gradient(145deg, rgba(16, 20, 39, 0.98), rgba(21, 26, 52, 0.92));
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.coupon-watermark {
  position: absolute;
  inset: 50% auto auto 54%;
  width: 82%;
  max-width: 280px;
  transform: translate(-50%, -50%) rotate(-10deg);
  opacity: 0.06;
  pointer-events: none;
  filter: saturate(0.9) contrast(1.05);
}

.coupon-watermark img {
  width: 100%;
  height: auto;
}

.coupon-topbar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.8rem 0.8rem 0.45rem;
}

.coupon-kicker-wrap {
  min-width: 0;
  padding-right: 0.5rem;
}

.coupon-kicker {
  font-family: theme('fontFamily.dosis');
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgb(125 58 237 / 0.92);
}

.dark .coupon-kicker {
  color: rgb(125 211 252 / 0.95);
}

.coupon-title {
  margin-top: 0.2rem;
  font-family: theme('fontFamily.madimione');
  font-size: 1.08rem;
  line-height: 1.15;
  color: rgb(17 24 39);
}

.dark .coupon-title {
  color: rgb(248 250 252);
}

.coupon-brand-mark {
  flex: 0 0 auto;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: linear-gradient(160deg, rgba(126, 34, 206, 0.12), rgba(255, 255, 255, 0.92));
  border: 1px solid rgba(126, 34, 206, 0.12);
  display: grid;
  place-items: center;
  box-shadow: 0 10px 24px rgba(126, 34, 206, 0.14);
}

.dark .coupon-brand-mark {
  background: linear-gradient(160deg, rgba(189, 147, 249, 0.16), rgba(18, 22, 41, 0.95));
  border-color: rgba(189, 147, 249, 0.14);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
}

.coupon-brand-mark img {
  width: 1.55rem;
  height: 1.55rem;
  object-fit: contain;
}

.coupon-brand-stack {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 0.45rem;
}

.coupon-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.42rem 0.7rem;
  border-radius: 9999px;
  border: 1px solid rgba(59, 130, 246, 0.16);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(219, 234, 254, 0.92));
  color: rgb(37 99 235);
  font-family: theme('fontFamily.dosis');
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.12);
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.coupon-download-btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(191, 219, 254, 0.95));
}

.dark .coupon-download-btn {
  border-color: rgba(125, 211, 252, 0.18);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.94));
  color: rgb(186 230 253);
}

.dark .coupon-download-btn:hover {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(56, 189, 248, 0.12));
  color: rgb(224 242 254);
}

.coupon-body {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: 0.7rem;
  padding: 0 0.8rem 0.8rem;
}

.coupon-art-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.coupon-art-frame {
  position: relative;
  width: 100%;
  max-width: 150px;
  aspect-ratio: 1 / 1;
  border-radius: 1.2rem;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.78);
  box-shadow: 0 16px 30px rgba(30, 24, 59, 0.16);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(219, 234, 254, 0.86));
}

.dark .coupon-art-frame {
  border-color: rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, rgba(31, 41, 55, 0.96), rgba(15, 23, 42, 0.82));
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.24);
}

.coupon-art {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.coupon-art-fallback {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.coupon-badge-row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.55rem;
  align-items: start;
  margin-top: 0.3rem;
}

.ticket-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.65rem;
  border-radius: 9999px;
  font-family: theme('fontFamily.dosis');
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.ticket-chip-green {
  background: rgba(34, 197, 94, 0.14);
  color: rgb(22 163 74);
}

.ticket-chip-gold {
  background: rgba(245, 158, 11, 0.16);
  color: rgb(180 83 9);
}

.dark .ticket-chip-green {
  background: rgba(34, 197, 94, 0.18);
  color: rgb(134 239 172);
}

.dark .ticket-chip-gold {
  background: rgba(245, 158, 11, 0.18);
  color: rgb(252 211 77);
}

.coupon-copy {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 0;
}

.coupon-glance {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.35rem 0.05rem 0.2rem;
}

.coupon-glance-label {
  font-family: theme('fontFamily.dosis');
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgb(148 163 184);
}

.coupon-glance-value {
  font-family: 'Poppins', sans-serif;
  font-size: 2.15rem;
  font-weight: 800;
  line-height: 1;
  color: rgb(109 40 217);
}

.dark .coupon-glance-value {
  color: rgb(125 211 252);
}

.coupon-meta-stack {
  text-align: left;
}

.coupon-meta {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.4rem;
}

.dark .coupon-meta {
  border-top-color: rgba(189, 147, 249, 0.22);
}

.coupon-meta-label,
.coupon-footer-label {
  font-family: theme('fontFamily.dosis');
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgb(148 163 184);
}

.coupon-meta-value,
.coupon-footer-value {
  margin-top: 0.1rem;
  font-family: theme('fontFamily.mplusrounded');
  font-size: 0.76rem;
  font-weight: 700;
  color: rgb(26 22 42);
}

.dark .coupon-meta-value,
.dark .coupon-footer-value {
  color: rgb(245 241 255);
}

.coupon-code {
  color: rgb(59 130 246);
}

.dark .coupon-code {
  color: rgb(125 211 252);
}

.coupon-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.coupon-ribbon {
  padding: 0.55rem 0.9rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(6, 182, 212, 0.14));
  border: 1px solid rgba(124, 58, 237, 0.16);
  font-family: theme('fontFamily.dosis');
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(109 40 217);
  text-align: center;
}

.dark .coupon-ribbon {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.16));
  border-color: rgba(125, 211, 252, 0.18);
  color: rgb(224 231 255);
}

.coupon-dots {
  display: flex;
  gap: 0.35rem;
}

.coupon-dots span {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #06b6d4, #8b5cf6, #f59e0b);
}

.coupon-rail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.65rem;
}

@media (max-width: 768px) {
  .coupon-body {
    grid-template-columns: 1fr;
  }

  .coupon-art-frame {
    max-width: 100%;
  }

  .coupon-footer {
    align-items: start;
    flex-direction: column;
  }

  .coupon-brand-stack {
    align-items: end;
  }

  .coupon-glance-value {
    font-size: 1.9rem;
  }
}

.animate-in {
  animation: fadeSlideUp 0.4s ease-out forwards;
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>