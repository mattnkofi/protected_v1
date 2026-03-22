const ModuleService = require('../services/ModuleService');
const { validateModuleFile, validateThumbnail } = require('../middleware/FileUploadMiddleware');
const { Module, User, Classroom, ClassroomMember, Sequelize } = require('../model');
const { Op } = require('sequelize');

class ModuleController {
    /**
     * Facilitator: Create a basic module record
     */
    async createModule(req, res, next) {
        try {
            const { title, classroom_id } = req.body;
            const userId = req.user.id;

            if (!title) {
                return res.status(400).json({ success: false, message: 'Title is required' });
            }

            // Verify classroom ownership kung may classroom_id na binigay
            if (classroom_id && classroom_id !== 'null') {
                const classroom = await Classroom.findByPk(classroom_id);
                if (!classroom || classroom.created_by !== userId) {
                    return res.status(403).json({ success: false, message: 'Unauthorized: You are not the facilitator of this classroom' });
                }
            }

            const result = await ModuleService.createModule(req.body, userId);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Facilitator: Combined File Upload and Module Creation (Multipart Form)
     */
    async createModuleWithFiles(req, res, next) {
        let createdModuleId = null;
        try {
            const userId = req.user.id;
            const { title, classroom_id } = req.body;

            if (!title) {
                return res.status(400).json({ success: false, message: 'Title is required' });
            }

            // 1. Verify classroom ownership
            if (classroom_id && classroom_id !== 'null') {
                const classroom = await Classroom.findByPk(classroom_id);
                if (!classroom || classroom.created_by !== userId) {
                    return res.status(403).json({ success: false, message: 'Access Denied: You do not own this classroom' });
                }
            }

            // 2. Initial Creation
            const moduleResult = await ModuleService.createModule(req.body, userId);
            const moduleId = moduleResult.module.id;
            createdModuleId = moduleId;

            const files = req.files;
            const uploadResults = {};

            // 3. Handle Module File (PDF/Word)
            if (files?.module_file?.[0]) {
                const moduleFile = files.module_file[0];
                const validation = validateModuleFile(moduleFile);
                if (!validation.valid) {
                    await ModuleService.permanentlyDeleteModule(moduleId);
                    return res.status(400).json({ success: false, message: validation.error });
                }
                const uploadRes = await ModuleService.uploadModuleFile(moduleId, moduleFile.buffer, moduleFile.mimetype, moduleFile.originalname, userId);
                uploadResults.file = uploadRes.file;
            }

            // 4. Handle Thumbnail
            if (files?.thumbnail?.[0]) {
                const thumbnail = files.thumbnail[0];
                const validation = validateThumbnail(thumbnail);
                if (validation.valid) {
                    const uploadRes = await ModuleService.uploadModuleThumbnail(moduleId, thumbnail.buffer, thumbnail.mimetype, thumbnail.originalname, userId);
                    uploadResults.thumbnail = uploadRes.thumbnail;
                }
            }

            const updatedModule = await ModuleService.getModuleById(moduleId, true);
            
            return res.status(201).json({ 
                success: true, 
                message: 'Module created successfully', 
                module: updatedModule.module, 
                uploads: uploadResults 
            });

        } catch (error) {
            if (createdModuleId) {
                await ModuleService.permanentlyDeleteModule(createdModuleId).catch(() => {});
            }
            console.error("CreateModuleWithFiles Error:", error);
            next(error);
        }
    }

    /**
     * Get List: Filters by classroom_id, search, and category
     */
    async getModules(req, res, next) {
    try {
        const { classroom_id, all_accessible } = req.query;
        const userId = req.user.id;

        // Kunin ang accessible IDs para sa security check (para sa classroom-specific modules)
        const facilitatedClasses = await Classroom.findAll({ where: { created_by: userId }, attributes: ['id'] });
        const memberClasses = await ClassroomMember.findAll({ where: { user_id: userId }, attributes: ['classroom_id'] });

        const accessibleIds = [
            ...facilitatedClasses.map(c => Number(c.id)),
            ...memberClasses.map(m => Number(m.classroom_id))
        ];

        const filters = {
            ...req.query,
            // Support all_accessible flag to get both public and classroom modules
            all_accessible: all_accessible === 'true',
            // Siguraduhing napapasa ang 'null' nang tama
            classroom_id: (classroom_id === undefined || classroom_id === 'null') ? null : classroom_id,
            accessibleClassroomIds: [...new Set(accessibleIds)],
            includeUnpublished: ['admin', 'educator', 'moderator'].includes(req.user.role)
        };

        const result = await ModuleService.getModules(filters);
        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error("ModuleController.getModules Error:", error);
        next(error);
    }
}

    /**
     * Get Single Module with Standardized Access Control
     */
async getModuleById(req, res, next) {
    try {
        const { id } = req.params;
        const currentUserId = Number(req.user.id);
        const userRole = req.user.role;

        const moduleData = await Module.findByPk(id, {
            include: [{
                model: Classroom,
                as: 'classroom',
                include: [{ model: User, as: 'students', attributes: ['id'] }]
            }]
        });

        if (!moduleData) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // 1. PUBLIC MODULE CHECK (No Classroom ID)
        if (!moduleData.classroom_id) {
            return res.status(200).json({ success: true, module: moduleData });
        }

        // 2. CLASSROOM MODULE CHECK
        const classroom = moduleData.classroom;
        if (!classroom) {
            return res.status(404).json({ success: false, message: 'Classroom association missing' });
        }

        const isFacilitator = Number(classroom.created_by) === currentUserId;
        const isMember = classroom.students && classroom.students.some(s => Number(s.id) === currentUserId);
        const isAdmin = userRole === 'admin';

        if (isFacilitator || isMember || isAdmin) {
            // View count logic for players
            if (userRole === 'player') {
                ModuleService.incrementViewCount(id, currentUserId).catch(() => {});
            }
            return res.status(200).json({ success: true, module: moduleData });
        }

        return res.status(403).json({ 
            success: false, 
            message: 'Access Denied: You are not part of this classroom.' 
        });

    } catch (error) {
        console.error("Module Access Error:", error);
        next(error);
    }
}
    /**
     * Facilitator Dashboard List
     */
    async getFacilitatorModules(req, res, next) {
        try {
            const modules = await Module.findAll({
                where: { created_by: req.user.id },
                attributes: [
                    'id', 'title', 'description', 'is_published', 'created_at', 'classroom_id',
                    [Sequelize.literal(`(SELECT COUNT(*) FROM ModuleViews WHERE ModuleViews.module_id = Module.id)`), 'views_count'],
                    [Sequelize.literal(`(SELECT COUNT(DISTINCT user_id) FROM QuizAttempts WHERE QuizAttempts.module_id = Module.id)`), 'takers_count']
                ],
                include: [{ model: Classroom, as: 'classroom', attributes: ['name'] }],
                order: [['created_at', 'DESC']]
            });
            return res.status(200).json({ success: true, modules });
        } catch (error) {
            next(error);
        }
    }

    async updateModule(req, res, next) {
        try {
            const { id } = req.params;
            const module = await Module.findByPk(id);
            if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

            if (module.created_by !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'You do not have permission to edit this module' });
            }

            const result = await ModuleService.updateModule(id, req.body, req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteModule(req, res, next) {
        try {
            const { id } = req.params;
            const module = await Module.findByPk(id);
            if (!module) return res.status(404).json({ success: false, message: 'Module not found' });

            if (module.created_by !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Permission denied' });
            }

            const result = await ModuleService.deleteModule(id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async togglePublish(req, res, next) {
        try {
            const result = await ModuleService.togglePublish(req.params.id, req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getStats(req, res, next) {
        try {
            const result = await ModuleService.getModuleStats();
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ModuleController();