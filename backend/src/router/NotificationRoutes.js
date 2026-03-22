// backend/src/router/NotificationRoutes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controller/NotificationController');
const { Announcement, User } = require('../model');
const { authenticate } = require('../middleware/AuthMiddleware');

// All notification routes require authentication
router.use(authenticate);

// GET /api/v1/notifications/announcements - Get public announcements for all users
router.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.findAll({
            where: { 
                type: 'public',
                status: 'active'
            },
            include: [{ 
                model: User, 
                as: 'author', 
                attributes: ['id', 'name', 'role'] 
            }],
            order: [
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ],
            limit: 10
        });
        res.json({ announcements });
    } catch (error) {
        console.error('Failed to fetch public announcements:', error);
        res.status(500).json({ message: 'Failed to fetch announcements' });
    }
});

// GET /api/v1/notifications - Get all notifications
router.get('/', NotificationController.getNotifications);

// GET /api/v1/notifications/unread-count - Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// PATCH /api/v1/notifications/read-all - Mark all as read
router.patch('/read-all', NotificationController.markAllAsRead);

// PATCH /api/v1/notifications/:id/read - Mark single as read
router.patch('/:id/read', NotificationController.markAsRead);

// DELETE /api/v1/notifications/clear-all - Clear all notifications
router.delete('/clear-all', NotificationController.clearAll);

// DELETE /api/v1/notifications/:id - Delete single notification
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;
