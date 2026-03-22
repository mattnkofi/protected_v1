// src/utils/cloudflare.js

/**
 * Cloudflare R2 Utilities
 * 
 * Handles file operations with Cloudflare R2 via backend API
 * - Avatar uploads
 * - File URL construction
 * - Image transformations
 * - File validation
 */

import api from './api';

// ==================== CONFIGURATION ====================

const WORKER_URL = import.meta.env.VITE_R2_PUBLIC_URL || '';

const FILE_LIMITS = {
    avatar: 5 * 1024 * 1024,      // 5MB
    image: 10 * 1024 * 1024,      // 10MB
    document: 25 * 1024 * 1024,   // 25MB
    video: 100 * 1024 * 1024      // 100MB
};

const ALLOWED_TYPES = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx'];

// ==================== FILE VALIDATION ====================

/**
 * Validate file before upload
 */
export function validateFile(file, type = 'image') {
    const errors = [];

    if (!file) {
        errors.push('No file selected');
        return { valid: false, errors };
    }

    // Check file size
    const limit = FILE_LIMITS[type] || FILE_LIMITS.image;
    if (file.size > limit) {
        errors.push(`File size (${formatBytes(file.size)}) exceeds ${formatBytes(limit)} limit`);
    }

    if (file.size === 0) {
        errors.push('File is empty');
    }

    // Check MIME type
    const allTypes = [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.documents];
    if (!allTypes.includes(file.type)) {
        errors.push(`File type "${file.type}" is not allowed`);
    }

    // Check file extension
    const fileName = file.name.toLowerCase();
    const ext = fileName.substring(fileName.lastIndexOf('.'));

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        errors.push(`File extension "${ext}" is not allowed`);
    }

    // Check for double extensions (security)
    const parts = fileName.split('.');
    if (parts.length > 2) {
        errors.push('Multiple file extensions are not allowed');
    }

    // Additional checks for images
    if (type === 'avatar' || type === 'image') {
        if (!ALLOWED_TYPES.images.includes(file.type)) {
            errors.push('Only image files (JPEG, PNG, WebP, GIF) are allowed');
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

// ==================== AVATAR OPERATIONS ====================

/**
 * Upload avatar image
 */
export async function uploadAvatar(file) {
    const validation = validateFile(file, 'avatar');
    if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await api.post('/api/v1/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 30000
        });

        return {
            avatar_url: response.data.avatar_url,
            avatar_key: response.data.avatar_key
        };
    } catch (error) {
        // Handle specific error codes
        if (error.response?.data?.code === 'FILE_TOO_LARGE') {
            throw new Error('Image is too large. Maximum size is 5MB.');
        }
        if (error.response?.data?.code === 'INVALID_FILE_TYPE') {
            throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
        }
        if (error.response?.data?.code === 'RATE_LIMIT_EXCEEDED') {
            throw new Error('Too many uploads. Please wait a moment and try again.');
        }

        throw new Error(error.response?.data?.message || 'Failed to upload avatar');
    }
}

/**
 * Delete avatar
 */
export async function deleteAvatar() {
    try {
        const response = await api.delete('/api/v1/users/avatar');
        return {
            avatar_url: response.data.avatar_url
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete avatar');
    }
}

// ==================== IMAGE TRANSFORMATIONS ====================

/**
 * Get image URL with transformations
 */
export function getImageUrl(url, options = {}) {
    if (!url) return null;

    // If it's a default avatar URL (ui-avatars.com), return as-is
    if (url.includes('ui-avatars.com')) {
        return url;
    }

    // If no transformations requested, return original
    if (!options.width && !options.height && !options.quality && !options.format) {
        return url;
    }

    // Build query parameters for Cloudflare Worker transformations
    const params = new URLSearchParams();

    if (options.width) params.append('w', options.width);
    if (options.height) params.append('h', options.height);
    if (options.quality) params.append('q', options.quality);
    if (options.format) params.append('f', options.format);

    return `${url}?${params.toString()}`;
}

/**
 * Get avatar URL with size optimization
 */
export function getAvatarUrl(url, size = 200) {
    return getImageUrl(url, {
        width: size,
        height: size,
        quality: 85
    });
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(url) {
    return getImageUrl(url, {
        width: 400,
        height: 300,
        quality: 80
    });
}

// ==================== FILE INFO ====================

/**
 * Extract file key from URL
 */
export function extractKeyFromUrl(url) {
    if (!url) return null;

    if (url.startsWith(WORKER_URL)) {
        return url.replace(`${WORKER_URL}/`, '');
    }

    return url;
}

/**
 * Get file metadata from URL
 */
export async function getFileMetadata(url) {
    try {
        const key = extractKeyFromUrl(url);

        const response = await api.get('/api/v1/files/metadata', {
            params: { key }
        });

        return response.data;
    } catch (error) {
        console.error('Failed to get file metadata:', error);
        return null;
    }
}

// ==================== UPLOAD PROGRESS ====================

/**
 * Upload file with progress tracking
 */
export async function uploadWithProgress(file, endpoint, onProgress, fieldName = 'file') {
    const formData = new FormData();
    formData.append(fieldName, file); // <--- Use dynamic field name

    try {
        const response = await api.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percentCompleted);
                }
            }
        });

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Upload failed');
    }
}


// export async function uploadWithProgress(file, endpoint, onProgress) {
//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//         const response = await api.post(endpoint, formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data'
//             },
//             onUploadProgress: (progressEvent) => {
//                 if (onProgress && progressEvent.total) {
//                     const percentCompleted = Math.round(
//                         (progressEvent.loaded * 100) / progressEvent.total
//                     );
//                     onProgress(percentCompleted);
//                 }
//             }
//         });

//         return response.data;
//     } catch (error) {
//         throw new Error(error.response?.data?.message || 'Upload failed');
//     }
// }
// ==================== HELPER FUNCTIONS ====================

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if URL is a Cloudflare R2 URL
 */
export function isR2Url(url) {
    if (!url) return false;
    return url.startsWith(WORKER_URL) || url.includes('.r2.dev');
}

/**
 * Get default avatar URL
 */
export function getDefaultAvatar(name = 'User', size = 200) {
    const params = new URLSearchParams({
        name: encodeURIComponent(name),
        background: 'random',
        color: 'ffffff',
        size: size,
        bold: true
    });

    return `https://ui-avatars.com/api/?${params.toString()}`;
}

/**
 * Preview image file before upload
 */
export function previewImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
}