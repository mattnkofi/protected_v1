<template>
    <div class="p-8 space-y-8 font-['Poppins'] text-white">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-black uppercase tracking-tighter italic">GAD Inventory</h1>
                <p class="text-[10px] text-gray-500 uppercase tracking-widest">Manage tangible rewards and stocks</p>
            </div>
            <button @click="openCreateModal" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                Add New Item
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="reward in rewards" :key="reward.id" class="bg-[#0d0d12] border border-white/5 rounded-[2.5rem] p-6 relative overflow-hidden group">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
                
                <div class="relative z-10 space-y-4">
                    <div class="h-40 bg-white/5 rounded-3xl overflow-hidden flex items-center justify-center border border-white/5">
                        <img v-if="reward.image_url" :src="reward.image_url" class="object-cover w-full h-full" />
                        <PackageIcon v-else class="w-12 h-12 text-gray-700" />
                    </div>
                    
                    <div>
                        <h3 class="font-black uppercase tracking-tight text-lg">{{ reward.title }}</h3>
                        <p class="text-[10px] text-gray-500 uppercase italic">{{ reward.xp_required }} XP Required</p>
                    </div>

                    <div class="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                        <div class="flex flex-col">
                            <span class="text-[8px] font-black text-gray-600 uppercase">Stock Level</span>
                            <span :class="['text-sm font-black', reward.stock_quantity < 5 ? 'text-rose-500' : 'text-violet-400']">
                                {{ reward.stock_quantity }} PCS LEFT
                            </span>
                        </div>
                        <button @click="editStock(reward)" class="p-2 bg-white/5 rounded-xl hover:bg-purple-500/10 hover:text-purple-400 transition-all">
                            <PlusIcon class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Package as PackageIcon, Plus as PlusIcon } from 'lucide-vue-next';
import axios from '@/utils/api';

const rewards = ref([]);

const loadRewards = async () => {
    try {
        const { data } = await axios.get('/api/rewards');
        rewards.value = data;
    } catch (err) { console.error(err); }
};

onMounted(loadRewards);
</script>