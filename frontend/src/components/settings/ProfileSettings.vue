<template>
    <div class="max-w-4xl mx-auto space-y-10">
        
        <!-- Avatar Section -->
        <section class="flex flex-col sm:flex-row items-center sm:items-start gap-8 pb-10 border-b border-slate-200 dark:border-white/5">
            <div class="relative shrink-0">
                <div class="w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-[#0d0d12] border-4 border-white dark:border-white/10 shadow-sm">
                    <img :src="avatarPreview || profileStore.avatarUrl(128)" alt="Profile Avatar" class="w-full h-full object-cover" />
                    
                    <div v-if="profileStore.isUploading" class="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div class="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>

                <label v-if="!pendingFile" class="absolute bottom-0 right-0 p-2.5 bg-purple-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-purple-700 transition-colors">
                    <CameraIcon class="w-5 h-5" />
                    <input type="file" class="hidden" accept="image/jpeg,image/png,image/webp" @change="handleFileSelect" :disabled="profileStore.isUploading" />
                </label>
            </div>

            <div class="flex-1 space-y-4 text-center sm:text-left w-full">
                <div>
                    <h3 class="text-sm font-black uppercase tracking-wider text-black dark:text-white">Profile Picture</h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Upload a picture to make your profile stand out.</p>
                </div>

                <div v-if="pendingFile" class="flex flex-col sm:flex-row gap-3">
                    <button @click="confirmAvatarUpload" class="btn-3d-purple px-4 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                        Save New Avatar
                    </button>
                    <button @click="cancelAvatarSelection" class="px-4 py-2 bg-white dark:bg-[#0d0d12] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        Cancel
                    </button>
                </div>
                <div v-else-if="hasCustomAvatar">
                    <button @click="handleDeleteAvatar" class="text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors">
                        Remove current avatar
                    </button>
                </div>
            </div>
        </section>

        <!-- Public Profile Form -->
        <section class="space-y-6">
            <div>
                <h3 class="text-sm font-black uppercase tracking-wider text-black dark:text-white">Public Profile</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">This information will be displayed on your public profile.</p>
            </div>
            
            <div class="grid gap-6">
                <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Display Name</label>
                    <input v-model="profileData.display_name" type="text" maxlength="100"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>
                
                <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Bio</label>
                    <textarea v-model="profileData.bio" rows="4" maxlength="500"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3 resize-none"></textarea>
                    <p class="text-[10px] text-slate-400 text-right">{{ profileData.bio?.length || 0 }}/500</p>
                </div>
            </div>
        </section>

        <!-- Personal Info Form -->
        <section class="space-y-6 pt-6 border-t border-slate-200 dark:border-white/5">
            <div>
                <h3 class="text-sm font-black uppercase tracking-wider text-black dark:text-white">Personal Information</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Private details used for verification and recovery.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Date of Birth</label>
                    <input v-model="profileData.date_of_birth" type="date" :max="maxBirthDate"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>

                <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Sex</label>
                    <select v-model="profileData.sex" 
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3">
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Gender Identity (Optional)</label>
                    <input v-model="profileData.gender_identity" type="text"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>

                <div class="space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone Number</label>
                    <input v-model="profileData.phone_number" type="tel" placeholder="+639XXXXXXXXX"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>
            </div>
        </section>

        <!-- Address Info Form -->
        <section class="space-y-6 pt-6 border-t border-slate-200 dark:border-white/5">
            <div>
                <h3 class="text-sm font-black uppercase tracking-wider text-black dark:text-white">Address</h3>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Used for emergency contact purposes.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div class="md:col-span-6 space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Address Line 1</label>
                    <input v-model="profileData.address_line1" type="text"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>
                <div class="md:col-span-6 space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Address Line 2</label>
                    <input v-model="profileData.address_line2" type="text"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>
                <div class="md:col-span-2 space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">City</label>
                    <input v-model="profileData.city" type="text"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>
                <div class="md:col-span-2 space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Province</label>
                    <input v-model="profileData.province" type="text"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>
                <div class="md:col-span-2 space-y-2">
                    <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Postal Code</label>
                    <input v-model="profileData.postal_code" type="text"
                        class="block w-full rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d12] text-black dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 text-sm px-4 py-3" />
                </div>
            </div>
        </section>

        <!-- Action Buttons -->
        <div class="pt-6 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3">
            <button type="button" @click="resetForm" 
                class="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0d0d12] border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                Reset
            </button>
            <button @click="saveProfile" :disabled="isSaving"
                class="btn-3d-purple px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                <div v-if="isSaving" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Camera as CameraIcon } from 'lucide-vue-next'; // Fixed import name
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/utils/useToast';

const profileStore = useProfileStore();
const authStore = useAuthStore();
const toast = useToast();

const isSaving = ref(false);
const avatarPreview = ref(null);
const pendingFile = ref(null);

const profileData = ref({
    display_name: '',
    bio: '',
    date_of_birth: '',
    sex: '',
    gender_identity: '',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Philippines',
    avatar_url: ''
});

// Helpers
const formatDateForInput = (isoDate) => isoDate ? isoDate.split('T')[0] : '';
const fillProfileData = (sourceData) => {
    if (!sourceData) return;
    profileData.value = { ...sourceData };
    if (sourceData.date_of_birth) profileData.value.date_of_birth = formatDateForInput(sourceData.date_of_birth);
};

const hasCustomAvatar = computed(() => profileStore.profile?.avatar_url && !profileStore.profile.avatar_url.includes('ui-avatars.com'));

const maxBirthDate = computed(() => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
});

const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age;
};

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    avatarPreview.value = URL.createObjectURL(file);
    pendingFile.value = file;
    event.target.value = '';
};

const confirmAvatarUpload = async () => {
    if (!pendingFile.value) return;
    const success = await profileStore.uploadAvatar(pendingFile.value);
    if (success) { pendingFile.value = null; avatarPreview.value = null; }
};

const cancelAvatarSelection = () => { pendingFile.value = null; avatarPreview.value = null; };
const handleDeleteAvatar = async () => { if (confirm('Are you sure you want to remove your avatar?')) await profileStore.deleteAvatar(); };

const saveProfile = async () => {
    if (profileData.value.date_of_birth && calculateAge(profileData.value.date_of_birth) < 13) {
        toast.error('You must be at least 13 years old to use ProtectED');
        return;
    }
    const phoneRegex = /^\+639\d{9}$/;
    if (profileData.value.phone_number && !phoneRegex.test(profileData.value.phone_number)) {
        toast.error('Please use the format +639XXXXXXXXX for phone number');
        return;
    }
    isSaving.value = true;
    await profileStore.updateProfile(profileData.value);
    isSaving.value = false;
};

const resetForm = () => { if (profileStore.profile) fillProfileData(profileStore.profile); avatarPreview.value = null; };

onMounted(async () => {
    if (!profileStore.profile && authStore.user) await profileStore.fetchProfile(authStore.user.id);
    if (profileStore.profile) fillProfileData(profileStore.profile);
});

watch(() => profileStore.profile, (newP) => { if (newP) fillProfileData(newP); }, { deep: true });
</script>

<style scoped>
/* No Custom CSS needed, using pure Tailwind */
</style>