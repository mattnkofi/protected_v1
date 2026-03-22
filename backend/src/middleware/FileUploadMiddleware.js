// src/middleware/FileUploadMiddleware.js
const multer = require('multer');
const path = require('path');

/**
 * File Upload Middleware for Module Resources
 * ONLY accepts PDF and Word documents for modules, and Images for thumbnails
 */

// ==================== CONFIGURATION ====================

const FILE_CONFIG = {
    // Allowed MIME types (PDF and Word only)
    allowedMimeTypes: [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ],

    // Allowed extensions
    allowedExtensions: ['.pdf', '.doc', '.docx'],

    // File size limits (in bytes)
    maxFileSize: 25 * 1024 * 1024, // 25MB

    // Field names - Siguraduhing tugma ito sa iyong Store at Controller
    fields: {
        moduleFile: 'module_file',
        thumbnail: 'thumbnail'
    }
};

// ==================== MULTER CONFIGURATION ====================

// Memory storage (we'll process the buffer and upload to Cloudflare R2)
const storage = multer.memoryStorage();

// File filter - validates file type
const fileFilter = (req, file, cb) => {
    const fieldName = file.fieldname;

    // Validation para sa Module File (PDF/Word)
    if (fieldName === FILE_CONFIG.fields.moduleFile) {
        if (FILE_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
            const ext = path.extname(file.originalname).toLowerCase();
            if (FILE_CONFIG.allowedExtensions.includes(ext)) {
                return cb(null, true);
            }
        }
        return cb(new Error('Invalid file type. Only PDF and Word documents (.pdf, .doc, .docx) are allowed.'), false);
    }
    
    // Validation para sa Thumbnail (Images)
    else if (fieldName === FILE_CONFIG.fields.thumbnail) {
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedImageTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('Invalid thumbnail type. Only images (JPEG, PNG, WebP) are allowed.'), false);
    }

    return cb(null, true); // Allow other fields to pass through Multer
};

// ==================== MULTER INSTANCE ====================

// Ito ang generic multer instance na gagamitin natin
const multerInstance = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: FILE_CONFIG.maxFileSize,
    }
});

// ==================== ERROR HANDLER ====================

const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: `File size exceeds the maximum limit of 25MB`
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected field in upload. Please check field names.'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
        }
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

// ==================== MIDDLEWARE WRAPPERS ====================

/**
 * Ito ang 'upload' object na tinatawag sa iyong ModuleRoutes.js
 * Naglalaman ito ng fields, single, at array methods mula sa Multer
 */
const upload = {
    // Para sa pag-create ng module na may dalawang magkaibang files
    fields: (fieldsArray) => {
        const uploadMiddleware = multerInstance.fields(fieldsArray);
        return (req, res, next) => {
            uploadMiddleware(req, res, (err) => {
                if (err) return handleUploadError(err, req, res, next);
                next();
            });
        };
    },
    // Para sa single file uploads
    single: (fieldName) => {
        const uploadMiddleware = multerInstance.single(fieldName);
        return (req, res, next) => {
            uploadMiddleware(req, res, (err) => {
                if (err) return handleUploadError(err, req, res, next);
                next();
            });
        };
    }
};

// ==================== VALIDATION HELPERS ====================

const validateModuleFile = (file) => {
    if (!file) return { valid: false, error: 'No file provided' };
    const ext = path.extname(file.originalname).toLowerCase();
    if (!FILE_CONFIG.allowedMimeTypes.includes(file.mimetype) || !FILE_CONFIG.allowedExtensions.includes(ext)) {
        return { valid: false, error: 'Only PDF and Word documents are allowed.' };
    }
    return { valid: true };
};

const validateThumbnail = (file) => {
    if (!file) return { valid: false, error: 'No thumbnail provided' };
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedImageTypes.includes(file.mimetype)) {
        return { valid: false, error: 'Only images (JPEG, PNG, WebP) are allowed.' };
    }
    return { valid: true };
};

// ==================== EXPORTS ====================

module.exports = {
    // Ito ang kailangan ng ModuleRoutes.js (destructured as { upload })
    upload, 
    
    // Iba pang helpers
    validateModuleFile,
    validateThumbnail,
    FILE_CONFIG
};