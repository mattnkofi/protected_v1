const express = require('express');
const router = express.Router();
const moduleController = require('../controller/ModuleController');
const { authenticate, requireRole } = require('../middleware/AuthMiddleware');
const { upload } = require('../middleware/FileUploadMiddleware');

// ==========================================
// Public & Shared Routes
// ==========================================

// Mahalaga: I-verify kung ang 'getStats' ay exist sa ModuleController
router.get('/featured', moduleController.getStats); 
router.get('/stats', moduleController.getStats);

// Ang '/' route ay dapat tumuturo sa 'getModules'
router.get('/', authenticate, moduleController.getModules);

// Ang ':id' route ay dapat nasa huli
router.get('/:id', authenticate, moduleController.getModuleById);

// ==========================================
// Protected Routes (Facilitator/Admin Only)
// ==========================================
const canManageModules = requireRole(['educator', 'moderator', 'admin']);

router.get('/facilitator/my-modules', authenticate, canManageModules, moduleController.getFacilitatorModules);

router.post(
    '/', 
    authenticate,
    canManageModules, 
    upload.fields([
        { name: 'module_file', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    moduleController.createModuleWithFiles
);

module.exports = router;