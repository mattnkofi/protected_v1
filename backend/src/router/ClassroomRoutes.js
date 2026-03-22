const express = require('express');
const router = express.Router();
const classroomController = require('../controller/ClassroomController');
const { authenticate, requireRole } = require('../middleware/AuthMiddleware');

// Lahat ng routes dito kailangan ng login
router.use(authenticate);

/**
 * 1. Specific Static Routes
 */

// Kunin ang classrooms ng current user
router.get('/my-classrooms', classroomController.getMyClassrooms);

// Facilitator: Gumawa ng bagong classroom
router.post('/create', requireRole(['educator', 'moderator', 'admin']), classroomController.createClassroom);

// Student: Mag-join sa classroom gamit ang code
router.post('/join', requireRole('player'), classroomController.joinClassroom);

/**
 * 2. Feature-Specific Dynamic Routes
 * Nilalagay ito bago ang general /:id para hindi mag-conflict
 */

// BAGONG ROUTE: Kunin ang progress ng mga estudyante sa isang classroom
// URL: /api/classrooms/1/progress
router.get('/:id/progress', requireRole(['educator', 'moderator', 'admin']), classroomController.getClassroomProgress);

// Classroom Announcements Routes
router.post('/:id/announcements', requireRole(['educator', 'moderator', 'admin']), classroomController.createClassroomAnnouncement);
router.get('/:id/announcements', classroomController.getClassroomAnnouncements);
router.put('/:id/announcements/:announcementId', requireRole(['educator', 'moderator', 'admin']), classroomController.updateClassroomAnnouncement);
router.delete('/:id/announcements/:announcementId', requireRole(['educator', 'moderator', 'admin']), classroomController.deleteClassroomAnnouncement);


/**
 * 3. General Dynamic Parameter Routes (Dapat laging huli)
 */

// Kunin ang detalye ng specific classroom base sa ID
router.get('/:id', classroomController.getClassroomDetails);

module.exports = router;