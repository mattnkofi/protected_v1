// src/router/AdminRoutes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controller/AdminController');
const { authenticate } = require('../middleware/AuthMiddleware');

// All routes require authentication
router.use(authenticate);

// Analytics
router.get('/analytics', AdminController.getAnalytics);
router.get('/analytics/charts', AdminController.getChartData);
router.get('/reports/download', AdminController.generateReport);
router.get('/students', AdminController.getStudents);
router.get('/students/export', AdminController.exportStudents);

// User Management
router.get('/users/:userId', AdminController.getUserDetails);
router.put('/users/:userId/status', AdminController.updateUserStatus);
router.post('/users/:userId/ban', AdminController.banUser);
router.post('/users/:userId/suspend', AdminController.suspendUser);
router.post('/users/:userId/deactivate', AdminController.deactivateUser);
router.post('/users/:userId/reactivate', AdminController.reactivateUser);
router.post('/users/bulk-status', AdminController.bulkUpdateUserStatus);
router.get('/users/:userId/activity', AdminController.getUserActivityLogs);

// Public Announcements (Admin only)
router.post('/announcements', AdminController.createAnnouncement);
router.get('/announcements', AdminController.getPublicAnnouncements);
router.put('/announcements/:id', AdminController.updateAnnouncement);
router.delete('/announcements/:id', AdminController.deleteAnnouncement);

module.exports = router;
