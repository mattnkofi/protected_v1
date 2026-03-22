// frontend/src/stores/module.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/utils/api';

export const useModuleStore = defineStore('module', () => {
    // ===== State =====
    const modules = ref([]);
    const featuredModules = ref([]);
    const currentModule = ref(null);
    const stats = ref(null);
    const pagination = ref({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0
    });
    const filters = ref({
        category: null,
        type: null,
        difficulty_level: null,
        search: '',
        is_featured: null,
        classroom_id: null
    });
    const loading = ref(false);
    const error = ref(null);

    // ===== Getters =====
    const modulesByCategory = computed(() => (category) => {
        return modules.value.filter(m => m.category === category);
    });

    const modulesByType = computed(() => (type) => {
        return modules.value.filter(m => m.type === type);
    });

    const hasMorePages = computed(() => {
        return pagination.value.page < pagination.value.totalPages;
    });

    // ===== Actions =====
    
    /**
     * Fetch modules with filters
     */
    async function fetchModules(params = {}) {
        loading.value = true;
        error.value = null;

        try {
            const response = await api.get('/api/modules', {
                params: {
                    ...filters.value,
                    page: pagination.value.page,
                    limit: pagination.value.limit,
                    ...params
                }
            });

            modules.value = response.data.modules;
            pagination.value = response.data.pagination;

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch modules';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Fetch featured modules
     */
    async function fetchFeaturedModules(limit = 6) {
        try {
            const response = await api.get('/api/modules/featured', {
                params: { limit }
            });
            // Ensure it fallbacks to an empty array if data is missing
            featuredModules.value = response.data.modules || [];
            return response.data;
        } catch (err) {
            featuredModules.value = []; // Fallback on error to prevent UI crash
            error.value = err.response?.data?.message || 'Failed to fetch featured modules';
            throw err;
        }
    }

    /**
     * Fetch module statistics
     */
    async function fetchStats() {
        try {
            const response = await api.get('/api/modules/stats');
            stats.value = response.data.stats;
            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch statistics';
            throw err;
        }
    }

    /**
     * Fetch single module by ID
     */
    async function fetchModuleById(id) {
        loading.value = true;
        error.value = null;

        try {
            const response = await api.get(`/api/modules/${id}`);
            currentModule.value = response.data.module;
            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Module not found';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Create new module (With File Support)
     */
    async function createModule(data, files = null) {
        loading.value = true;
        error.value = null;

        try {
            let response;
            // Kung may files, gagamit tayo ng FormData at ang POST /api/modules (Multipart)
            if (files && (files.moduleFile || files.thumbnail)) {
                const formData = new FormData();
                
                // 1. Files
                if (files.moduleFile) formData.append('module_file', files.moduleFile);
                if (files.thumbnail) formData.append('thumbnail', files.thumbnail);

                // 2. Text Data fields
                Object.keys(data).forEach(key => {
                    if (data[key] !== null && data[key] !== undefined) {
                        formData.append(key, data[key]);
                    }
                });

                response = await api.post('/api/modules', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Standard JSON request
                response = await api.post('/api/modules', data);
            }

            if (response.data.success && response.data.module) {
                modules.value.unshift(response.data.module);
            }

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to create module';
            console.error("Module Store Create Error:", error.value);
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Update module metadata
     */
    async function updateModule(id, data) {
        loading.value = true;
        error.value = null;

        try {
            const response = await api.put(`/api/modules/${id}`, data);

            // Update sa listahan
            const index = modules.value.findIndex(m => m.id === id);
            if (index !== -1) {
                modules.value[index] = response.data.module;
            }

            // Update current module kung ito ang naka-open
            if (currentModule.value?.id === id) {
                currentModule.value = response.data.module;
            }

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update module';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Upload/Replace module file specifically
     */
    async function uploadModuleFile(id, file) {
        try {
            const formData = new FormData();
            formData.append('module_file', file);

            const response = await api.post(`/api/modules/${id}/file`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await fetchModuleById(id);
            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to upload file';
            throw err;
        }
    }

    /**
     * Upload/Replace thumbnail specifically
     */
    async function uploadThumbnail(id, file) {
        try {
            const formData = new FormData();
            formData.append('thumbnail', file);

            const response = await api.post(`/api/modules/${id}/thumbnail`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await fetchModuleById(id);
            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to upload thumbnail';
            throw err;
        }
    }

    /**
     * Delete module
     */
    async function deleteModule(id) {
        try {
            await api.delete(`/api/modules/${id}`);
            modules.value = modules.value.filter(m => m.id !== id);
            return true;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to delete module';
            throw err;
        }
    }

    /**
     * Mark module as complete (for Players)
     */
    async function markComplete(id) {
        try {
            await api.post(`/api/modules/${id}/complete`);
            return true;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to mark as complete';
            throw err;
        }
    }

    /**
     * Toggle publish status (Facilitator/Admin)
     */
    async function togglePublish(id) {
        try {
            const response = await api.patch(`/api/modules/${id}/publish`);
            
            const module = modules.value.find(m => m.id === id);
            if (module) {
                module.is_published = response.data.is_published;
            }
            if (currentModule.value?.id === id) {
                currentModule.value.is_published = response.data.is_published;
            }

            return response.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to toggle publish';
            throw err;
        }
    }

    /**
     * Update filters and re-fetch
     */
    async function setFilters(newFilters) {
        filters.value = { ...filters.value, ...newFilters };
        pagination.value.page = 1; // Reset to first page on filter change
        await fetchModules();
    }

    /**
     * Load more modules (Pagination)
     */
    async function loadNextPage() {
        if (hasMorePages.value) {
            pagination.value.page += 1;
            const response = await fetchModules();
            // Optional: I-append ang bagong modules sa listahan imbes na palitan lahat
            // modules.value = [...modules.value, ...response.modules];
        }
    }

    /**
     * Clear all filters
     */
    function resetFilters() {
        filters.value = {
            category: null,
            type: null,
            difficulty_level: null,
            search: '',
            is_featured: null,
            classroom_id: null
        };
        pagination.value.page = 1;
    }

    return {
        // State
        modules,
        featuredModules,
        currentModule,
        stats,
        pagination,
        filters,
        loading,
        error,

        // Getters
        modulesByCategory,
        modulesByType,
        hasMorePages,

        // Actions
        fetchModules,
        fetchFeaturedModules,
        fetchStats,
        fetchModuleById,
        createModule,
        updateModule,
        uploadModuleFile,
        uploadThumbnail,
        deleteModule,
        markComplete,
        togglePublish,
        setFilters,
        loadNextPage,
        resetFilters
    };
});