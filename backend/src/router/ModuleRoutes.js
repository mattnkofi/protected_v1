const express = require('express');
const router = express.Router();
const moduleController = require('../controller/ModuleController');
const { authenticate, requireRole } = require('../middleware/AuthMiddleware');
const { upload } = require('../middleware/FileUploadMiddleware');
const { Classroom } = require('../model');

// ==========================================
// Public & Shared Routes
// ==========================================

// Mahalaga: I-verify kung ang 'getStats' ay exist sa ModuleController
router.get('/featured', moduleController.getStats); 
router.get('/stats', moduleController.getStats);

// Ang '/' route ay dapat tumuturo sa 'getModules'
router.get('/', authenticate, moduleController.getModules);

// ==========================================
// Protected Routes (Facilitator/Admin Only)
// ==========================================
const canManageModules = requireRole(['educator', 'moderator', 'admin']);

const canManageModulesOrOwnClassroom = async (req, res, next) => {
    const privilegedRoles = ['educator', 'moderator', 'admin'];
    const role = req.user?.role === 'facilitator' ? 'educator' : req.user?.role;

    if (privilegedRoles.includes(role)) {
        return next();
    }

    const classroomId = req.body?.classroom_id;
    if (!classroomId || classroomId === 'null') {
        return res.status(403).json({
            message: 'You do not have permission to access this resource.',
            code: 'INSUFFICIENT_PERMISSIONS',
            required_role: privilegedRoles,
            current_role: req.user?.role
        });
    }

    const classroom = await Classroom.findByPk(classroomId);
    if (classroom && Number(classroom.created_by) === Number(req.user.id)) {
        return next();
    }

    return res.status(403).json({
        message: 'You do not have permission to access this resource.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_role: privilegedRoles,
        current_role: req.user?.role
    });
};

router.get('/facilitator/my-modules', authenticate, canManageModules, moduleController.getFacilitatorModules);

router.put('/:id', authenticate, canManageModules, moduleController.updateModule);
router.delete('/:id', authenticate, canManageModules, moduleController.deleteModule);
router.patch('/:id/publish', authenticate, canManageModules, moduleController.togglePublish);

router.post(
    '/', 
    authenticate,
    canManageModulesOrOwnClassroom,
    upload.fields([
        { name: 'module_file', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    moduleController.createModuleWithFiles
);

// Ang ':id' route ay dapat nasa huli para hindi ma-shadow ang specific routes.
router.get('/:id', authenticate, moduleController.getModuleById);

module.exports = router;