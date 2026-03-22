const { Classroom, User, Module, ClassroomMember, Quiz, QuizAttempt } = require('../model');
const crypto = require('crypto');


/**
 * Facilitator: Create a new classroom
 */
exports.createClassroom = async (req, res, next) => {
    try {
        const allowedRoles = ['admin', 'educator', 'moderator'];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Forbidden: Only facilitators can create classrooms.' 
            });
        }

        const { name, description } = req.body;

        if (!name) {
            return res.status(422).json({ message: 'Classroom name is required.' });
        }

        // Generate a unique 6-character alphanumeric join code
        const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const classroom = await Classroom.create({
            name: name.trim(),
            description: description ? description.trim() : null,
            join_code: joinCode,
            created_by: req.user.id,
            status: 'active'
        });

        res.status(201).json({
            message: 'Classroom created successfully.',
            classroom
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Student: Join a classroom using a code
 */
exports.joinClassroom = async (req, res, next) => {
    try {
        const { join_code } = req.body;

        if (!join_code) {
            return res.status(422).json({ message: 'Join code is required.' });
        }

        const classroom = await Classroom.findOne({ 
            where: { 
                join_code: join_code.toUpperCase().trim(), 
                status: 'active' 
            } 
        });

        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found or the code is invalid.' });
        }

        if (classroom.created_by === req.user.id) {
            return res.status(400).json({ message: 'You are the facilitator of this class.' });
        }

        const existingMember = await ClassroomMember.findOne({
            where: { classroom_id: classroom.id, user_id: req.user.id }
        });

        if (existingMember) {
            return res.status(400).json({ message: 'You are already a member of this classroom.' });
        }

        await ClassroomMember.create({
            classroom_id: classroom.id,
            user_id: req.user.id
        });

        res.status(200).json({
            message: 'Successfully joined the classroom.',
            classroom: {
                id: classroom.id,
                name: classroom.name
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Shared: Get all classrooms the user is part of (Dashboard List)
 */
exports.getMyClassrooms = async (req, res, next) => {
    try {
        let classrooms = [];
        
        if (req.user.role === 'player') {
            classrooms = await Classroom.findAll({
                include: [
                    {
                        model: User,
                        as: 'students',
                        where: { id: req.user.id },
                        attributes: [],
                        through: { attributes: [] }
                    },
                    {
                        model: User,
                        as: 'facilitator',
                        attributes: ['name', 'email']
                    }
                ],
                order: [['created_at', 'DESC']]
            });
        } else {
            classrooms = await Classroom.findAll({
                where: { created_by: req.user.id },
                include: [{ model: User, as: 'facilitator', attributes: ['name'] }],
                order: [['created_at', 'DESC']]
            });
        }
        
        res.json({ classrooms });
    } catch (error) {
        console.error("GET MY CLASSROOMS ERROR:", error);
        next(error);
    }
};

/**
 * Shared: Get Specific Classroom Details (Members Only)
 * Dito isinasama ang mga modules na kabilang sa classroom.
 */
exports.getClassroomDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const classroom = await Classroom.findByPk(id, {
            include: [
                { model: User, as: 'facilitator', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'students', through: { attributes: [] }, attributes: ['id', 'name'] },
                { 
                    model: Module, 
                    as: 'modules',
                    attributes: ['id', 'title', 'description', 'category', 'difficulty_level']
                }
            ]
        });

        if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

        // SECURITY: Check if user is facilitator or enrolled student
        const isFacilitator = classroom.created_by === userId;
        const isStudent = classroom.students.some(student => student.id === userId);

        if (!isFacilitator && !isStudent) {
            return res.status(403).json({ 
                message: 'Access Denied: You are not a member of this classroom.' 
            });
        }

        res.json({ classroom });
    } catch (error) { next(error); }
};

exports.getClassroomProgress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const facilitatorId = req.user.id;

        // 1. I-verify kung ang classroom ay pagmamay-ari ng facilitator
        const classroom = await Classroom.findByPk(id);
        if (!classroom || classroom.created_by !== facilitatorId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized: You are not the facilitator of this class.' 
            });
        }

        // 2. Kunin ang lahat ng students at ang kanilang quiz attempts sa classroom na ito
        const progressData = await User.findAll({
            include: [
                {
                    model: ClassroomMember,
                    as: 'memberships',
                    where: { classroom_id: id },
                    attributes: []
                },
                {
                    model: QuizAttempt,
                    as: 'quizAttempts',
                    include: [{
                        model: Quiz,
                        as: 'quiz',
                        attributes: ['title'],
                        include: [{ 
                            model: Module, 
                            as: 'module', 
                            where: { classroom_id: id },
                            attributes: ['id', 'title'] 
                        }]
                    }]
                }
            ],
            attributes: ['id', 'name', 'email']
        });

        res.json({ success: true, progress: progressData });
    } catch (error) {
        console.error("Progress Logic Error:", error);
        next(error);
    }
};

/**
 * Facilitator: Create a classroom announcement
 */
exports.createClassroomAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params; // classroom_id
        const { title, content, priority } = req.body;

        // Verify classroom exists and user is the facilitator
        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        const allowedRoles = ['admin', 'educator', 'moderator'];
        if (classroom.created_by !== req.user.id && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: 'Only the classroom facilitator can create announcements.' 
            });
        }

        if (!title || !content) {
            return res.status(422).json({
                message: 'Title and content are required.'
            });
        }

        // Import Announcement model
        const { Announcement } = require('../model');

        const announcement = await Announcement.create({
            title: title.trim(),
            content: content.trim(),
            type: 'classroom',
            classroom_id: parseInt(id),
            created_by: req.user.id,
            priority: priority || 'normal',
            status: 'active'
        });

        res.status(201).json({
            message: 'Announcement created successfully.',
            announcement
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get announcements for a classroom
 */
exports.getClassroomAnnouncements = async (req, res, next) => {
    try {
        const { id } = req.params; // classroom_id
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Verify classroom exists
        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        // Check if user is facilitator or member
        const isFacilitator = classroom.created_by === req.user.id;
        const isMember = await ClassroomMember.findOne({
            where: { classroom_id: id, user_id: req.user.id }
        });

        if (!isFacilitator && !isMember && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'You must be a member of this classroom to view announcements.' 
            });
        }

        const { Announcement } = require('../model');
        const { Op } = require('sequelize');

        const whereClause = { 
            classroom_id: id, 
            type: 'classroom',
            status: 'active',
            [Op.or]: [
                { expires_at: null },
                { expires_at: { [Op.gt]: new Date() } }
            ]
        };

        const { count, rows: announcements } = await Announcement.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'name']
            }],
            order: [
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            announcements,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Facilitator: Update a classroom announcement
 */
exports.updateClassroomAnnouncement = async (req, res, next) => {
    try {
        const { id, announcementId } = req.params;
        const { title, content, priority, status } = req.body;

        // Verify classroom exists and user is the facilitator
        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        if (classroom.created_by !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Only the classroom facilitator can update announcements.' 
            });
        }

        const { Announcement } = require('../model');

        const announcement = await Announcement.findOne({
            where: { id: announcementId, classroom_id: id, type: 'classroom' }
        });

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found.' });
        }

        await announcement.update({
            title: title !== undefined ? title.trim() : announcement.title,
            content: content !== undefined ? content.trim() : announcement.content,
            priority: priority !== undefined ? priority : announcement.priority,
            status: status !== undefined ? status : announcement.status
        });

        res.json({
            message: 'Announcement updated successfully.',
            announcement
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Facilitator: Delete a classroom announcement
 */
exports.deleteClassroomAnnouncement = async (req, res, next) => {
    try {
        const { id, announcementId } = req.params;

        // Verify classroom exists and user is the facilitator
        const classroom = await Classroom.findByPk(id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found.' });
        }

        if (classroom.created_by !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Only the classroom facilitator can delete announcements.' 
            });
        }

        const { Announcement } = require('../model');

        const announcement = await Announcement.findOne({
            where: { id: announcementId, classroom_id: id, type: 'classroom' }
        });

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found.' });
        }

        await announcement.destroy();

        res.json({
            message: 'Announcement deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};