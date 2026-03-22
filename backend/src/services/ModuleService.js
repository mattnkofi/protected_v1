const { Module, User, ModuleView, Classroom, Sequelize } = require('../model');
const FileStorageService = require('./FileStorageService');
const { Op } = require('sequelize');

/**
 * Module Service - Business logic for module management
 */
class ModuleService {
    /**
     * Create a new module
     */
    async createModule(data, createdBy) {
        try {
            const moduleData = {
                title: data.title,
                description: data.description,
                content: data.content,
                type: data.type || 'lesson',
                category: data.category || 'general',
                difficulty_level: data.difficulty_level || 'beginner',
                age_group: data.age_group,
                classroom_id: data.classroom_id || null,
                order: data.order || 0,
                is_published: data.is_published || false,
                is_featured: data.is_featured || false,
                required_modules: data.required_modules || [],
                tags: data.tags || [],
                metadata: data.metadata || {},
                created_by: createdBy
            };

            const module = await Module.create(moduleData);

            return {
                success: true,
                module: module.toJSON()
            };
        } catch (error) {
            console.error('ModuleService.createModule error:', error);
            throw error;
        }
    }

    /**
     * Upload module file (PDF/DOCX)
     */
    async uploadModuleFile(moduleId, fileBuffer, mimetype, originalFilename, uploadedBy) {
        try {
            const module = await Module.findByPk(moduleId);
            if (!module) throw new Error('Module not found');

            if (module.file_key) {
                await FileStorageService.deleteFile(module.file_key).catch(err => {
                    console.warn('Failed to delete old module file:', err);
                });
            }

            const uploadResult = await FileStorageService.uploadModuleFile(
                fileBuffer,
                moduleId,
                'resource',
                mimetype,
                originalFilename,
                { uploadedBy }
            );

            await module.update({
                file_key: uploadResult.key,
                file_name: originalFilename,
                file_type: mimetype,
                file_size: uploadResult.size,
                updated_by: uploadedBy
            });

            return {
                success: true,
                file: {
                    url: uploadResult.url,
                    name: originalFilename,
                    type: mimetype,
                    size: uploadResult.size
                }
            };
        } catch (error) {
            console.error('ModuleService.uploadModuleFile error:', error);
            throw error;
        }
    }

    /**
     * Upload module thumbnail
     */
    async uploadModuleThumbnail(moduleId, fileBuffer, mimetype, originalFilename, uploadedBy) {
        try {
            const module = await Module.findByPk(moduleId);
            if (!module) throw new Error('Module not found');

            if (module.thumbnail_key) {
                await FileStorageService.deleteFile(module.thumbnail_key).catch(err => {
                    console.warn('Failed to delete old thumbnail:', err);
                });
            }

            const uploadResult = await FileStorageService.uploadModuleFile(
                fileBuffer,
                moduleId,
                'thumbnail',
                mimetype,
                originalFilename,
                { uploadedBy }
            );

            await module.update({
                thumbnail_key: uploadResult.key,
                updated_by: uploadedBy
            });

            return {
                success: true,
                thumbnail: { url: uploadResult.url }
            };
        } catch (error) {
            console.error('ModuleService.uploadModuleThumbnail error:', error);
            throw error;
        }
    }

    /**
     * Update module metadata
     */
    async updateModule(moduleId, data, updatedBy) {
        try {
            const module = await Module.findByPk(moduleId);
            if (!module) throw new Error('Module not found');

            const updateData = { updated_by: updatedBy };
            const allowedFields = [
                'title', 'description', 'content', 'type', 'category',
                'difficulty_level', 'age_group', 'classroom_id',
                'order', 'is_published', 'is_featured', 'required_modules',
                'tags', 'metadata'
            ];

            allowedFields.forEach(field => {
                if (data[field] !== undefined) {
                    updateData[field] = data[field];
                }
            });

            await module.update(updateData);

            return {
                success: true,
                module: module.toJSON()
            };
        } catch (error) {
            console.error('ModuleService.updateModule error:', error);
            throw error;
        }
    }

    /**
     * Delete module (soft delete)
     */
    async deleteModule(moduleId) {
        try {
            const module = await Module.findByPk(moduleId);
            if (!module) throw new Error('Module not found');

            await module.destroy();

            return {
                success: true,
                message: 'Module deleted successfully'
            };
        } catch (error) {
            console.error('ModuleService.deleteModule error:', error);
            throw error;
        }
    }

    /**
     * Permanently delete module and files
     */
    async permanentlyDeleteModule(moduleId) {
        try {
            const module = await Module.findByPk(moduleId, { paranoid: false });
            if (!module) throw new Error('Module not found');

            if (module.file_key) {
                await FileStorageService.deleteFile(module.file_key).catch(err => {
                    console.error('Failed to delete module file:', err);
                });
            }

            if (module.thumbnail_key) {
                await FileStorageService.deleteFile(module.thumbnail_key).catch(err => {
                    console.error('Failed to delete thumbnail:', err);
                });
            }

            await module.destroy({ force: true });

            return {
                success: true,
                message: 'Module permanently deleted'
            };
        } catch (error) {
            console.error('ModuleService.permanentlyDeleteModule error:', error);
            throw error;
        }
    }

    /**
     * Get module by ID
     */
    async getModuleById(moduleId, includeUnpublished = false) {
        try {
            const module = await Module.findByPk(moduleId, {
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Classroom,
                        as: 'classroom',
                        attributes: ['id', 'name']
                    }
                ]
            });

            if (!module) throw new Error('Module not found');

            if (!module.is_published && !includeUnpublished) {
                throw new Error('Access denied. Module is not published.');
            }

            return {
                success: true,
                module: module.toJSON()
            };
        } catch (error) {
            console.error('ModuleService.getModuleById error:', error);
            throw error;
        }
    }

    /**
     * Get all modules with filtering
     */
    async getModules(filters = {}) {
    try {
        const where = {};
        
        // 1. HANDLE all_accessible flag - return both public AND accessible classroom modules
        if (filters.all_accessible === true) {
            const allowedIds = Array.isArray(filters.accessibleClassroomIds) 
                ? filters.accessibleClassroomIds.map(id => Number(id)) 
                : [];
            
            // Return modules where classroom_id is NULL (public) OR in accessible classrooms
            where[Op.or] = [
                { classroom_id: null },
                ...(allowedIds.length > 0 ? [{ classroom_id: { [Op.in]: allowedIds } }] : [])
            ];
        } else if (filters.classroom_id !== undefined) {
            // Kung ang pinasa ay 'null' na string o null na object, Public modules ang hanapin
            if (filters.classroom_id === 'null' || filters.classroom_id === null) {
                where.classroom_id = null; 
            } else {
                // Kung may classroom_id, i-verify kung authorized ang user (logic from previous fix)
                const reqId = Number(filters.classroom_id);
                const allowedIds = Array.isArray(filters.accessibleClassroomIds) 
                    ? filters.accessibleClassroomIds.map(id => Number(id)) 
                    : [];
                
                if (!allowedIds.includes(reqId)) {
                    where.classroom_id = -1; // Force empty result
                } else {
                    where.classroom_id = reqId;
                }
            }
        } else {
            // DEFAULT: Ipakita ang Public Modules kung walang filter na binigay
            where.classroom_id = null;
        }

        // 2. Publish status logic
        if (!filters.includeUnpublished) {
            where.is_published = true;
        }
            // 3. Search and Category Filters
            if (filters.category) where.category = filters.category;
            if (filters.difficulty_level) where.difficulty_level = filters.difficulty_level;
            
            if (filters.search) {
                where[Op.or] = [
                    { title: { [Op.like]: `%${filters.search}%` } },
                    { description: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            const page = parseInt(filters.page) || 1;
            const limit = parseInt(filters.limit) || 20;
            const offset = (page - 1) * limit;

            const { count, rows } = await Module.findAndCountAll({
                where,
                include: [{
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }],
                order: [['created_at', 'DESC']],
                limit,
                offset,
                distinct: true
            });

            return {
                success: true,
                modules: rows.map(m => m.toJSON()),
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            console.error('ModuleService.getModules error:', error);
            throw error;
        }
    }

    /**
     * Publish/unpublish module
     */
    async togglePublish(moduleId, updatedBy) {
        try {
            const module = await Module.findByPk(moduleId);
            if (!module) throw new Error('Module not found');

            const newStatus = !module.is_published;
            await module.update({ 
                is_published: newStatus,
                published_at: newStatus ? new Date() : null,
                updated_by: updatedBy 
            });

            return {
                success: true,
                is_published: module.is_published,
                message: module.is_published ? 'Module published' : 'Module unpublished'
            };
        } catch (error) {
            console.error('ModuleService.togglePublish error:', error);
            throw error;
        }
    }

    /**
     * Increment view count (Unique per user)
     */
    async incrementViewCount(moduleId, userId) {
        if (!userId) return;

        try {
            const [view, created] = await ModuleView.findOrCreate({
                where: { module_id: moduleId, user_id: userId }
            });

            if (created) {
                const module = await Module.findByPk(moduleId);
                if (module) {
                    await module.increment('view_count', { by: 1 });
                }
            }
        } catch (error) {
            console.error('ModuleService.incrementViewCount error:', error);
        }
    }

    /**
     * Get module statistics
     */
    async getModuleStats() {
        try {
            const statsByCategory = await Module.findAll({
                attributes: [
                    'category',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ],
                where: { is_published: true },
                group: ['category']
            });

            const totalModules = await Module.count({ where: { is_published: true } });
            const totalViews = await Module.sum('view_count', { where: { is_published: true } });

            return {
                success: true,
                stats: {
                    total_modules: totalModules,
                    total_views: totalViews || 0,
                    by_category: statsByCategory
                }
            };
        } catch (error) {
            console.error('ModuleService.getModuleStats error:', error);
            throw error;
        }
    }
}

module.exports = new ModuleService();