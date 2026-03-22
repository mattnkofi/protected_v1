// src/controller/AdminController.js
const { 
    User, Module, Classroom, ClassroomMember, Quiz, QuizAttempt,
    Badge, UserGamification, Announcement, Notification
} = require('../model');
const { Op, fn, col, literal } = require('sequelize');
const PDFDocument = require('pdfkit');

/**
 * Admin: Get system analytics/stats
 */
exports.getAnalytics = async (req, res, next) => {
    try {
        // Ensure requester is admin
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only administrators can access analytics.'
            });
        }

        // Get current date and last month date
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Total users count
        const totalUsers = await User.count();
        
        // New users this month
        const newUsersThisMonth = await User.count({
            where: {
                created_at: { [Op.gte]: thisMonthStart }
            }
        });

        // Users by role
        const usersByRole = await User.findAll({
            attributes: [
                'role',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['role'],
            raw: true
        });

        // Parse role counts
        const roleCounts = {
            students: 0,
            educators: 0,
            moderators: 0,
            admins: 0
        };
        usersByRole.forEach(r => {
            if (r.role === 'student') roleCounts.students = parseInt(r.count);
            else if (r.role === 'educator') roleCounts.educators = parseInt(r.count);
            else if (r.role === 'moderator') roleCounts.moderators = parseInt(r.count);
            else if (r.role === 'admin') roleCounts.admins = parseInt(r.count);
        });

        // Total facilitators (educators + moderators)
        const totalFacilitators = roleCounts.educators + roleCounts.moderators;

        // Module stats
        const totalModules = await Module.count();
        const publishedModules = await Module.count({
            where: { is_published: true }
        });
        const modulesThisMonth = await Module.count({
            where: {
                created_at: { [Op.gte]: thisMonthStart }
            }
        });

        // Classroom stats
        const totalClassrooms = await Classroom.count();
        const activeClassrooms = await Classroom.count({
            where: { status: 'active' }
        });

        // Quiz stats
        const totalQuizzes = await Quiz.count();
        const totalQuizAttempts = await QuizAttempt.count();

        // Badge stats
        const totalBadges = await Badge.count();

        // Calculate growth percentages
        const lastMonthUsers = await User.count({
            where: {
                created_at: {
                    [Op.gte]: lastMonthStart,
                    [Op.lt]: thisMonthStart
                }
            }
        });
        const userGrowth = lastMonthUsers > 0 
            ? Math.round(((newUsersThisMonth - lastMonthUsers) / lastMonthUsers) * 100) 
            : 100;

        // Recent activity summary
        const recentUsers = await User.findAll({
            attributes: ['id', 'name', 'role', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        const recentModules = await Module.findAll({
            attributes: ['id', 'title', 'is_published', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        res.json({
            success: true,
            analytics: {
                users: {
                    total: totalUsers,
                    newThisMonth: newUsersThisMonth,
                    growth: userGrowth,
                    byRole: roleCounts
                },
                facilitators: {
                    total: totalFacilitators,
                    educators: roleCounts.educators,
                    moderators: roleCounts.moderators
                },
                modules: {
                    total: totalModules,
                    published: publishedModules,
                    newThisMonth: modulesThisMonth
                },
                classrooms: {
                    total: totalClassrooms,
                    active: activeClassrooms
                },
                quizzes: {
                    total: totalQuizzes,
                    totalAttempts: totalQuizAttempts
                },
                badges: {
                    total: totalBadges
                },
                recentActivity: {
                    users: recentUsers,
                    modules: recentModules
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Create a public announcement
 */
exports.createAnnouncement = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only administrators can create public announcements.'
            });
        }

        const { title, content, priority, expires_at } = req.body;

        if (!title || !content) {
            return res.status(422).json({
                message: 'Title and content are required.'
            });
        }

        const announcement = await Announcement.create({
            title: title.trim(),
            content: content.trim(),
            type: 'public',
            created_by: req.user.id,
            priority: priority || 'normal',
            expires_at: expires_at || null,
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
 * Admin: Get all public announcements
 */
exports.getPublicAnnouncements = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = { type: 'public' };
        
        if (status) {
            whereClause.status = status;
        }

        // For non-admins, only show active and non-expired
        if (!req.user || req.user.role !== 'admin') {
            whereClause.status = 'active';
            whereClause[Op.or] = [
                { expires_at: null },
                { expires_at: { [Op.gt]: new Date() } }
            ];
        }

        const { count, rows: announcements } = await Announcement.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'name', 'email']
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
 * Admin: Update an announcement
 */
exports.updateAnnouncement = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only administrators can update announcements.'
            });
        }

        const { id } = req.params;
        const { title, content, priority, status, expires_at } = req.body;

        const announcement = await Announcement.findOne({
            where: { id, type: 'public' }
        });

        if (!announcement) {
            return res.status(404).json({
                message: 'Announcement not found.'
            });
        }

        await announcement.update({
            title: title !== undefined ? title.trim() : announcement.title,
            content: content !== undefined ? content.trim() : announcement.content,
            priority: priority !== undefined ? priority : announcement.priority,
            status: status !== undefined ? status : announcement.status,
            expires_at: expires_at !== undefined ? expires_at : announcement.expires_at
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
 * Admin: Delete an announcement
 */
exports.deleteAnnouncement = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only administrators can delete announcements.'
            });
        }

        const { id } = req.params;

        const announcement = await Announcement.findOne({
            where: { id, type: 'public' }
        });

        if (!announcement) {
            return res.status(404).json({
                message: 'Announcement not found.'
            });
        }

        await announcement.destroy();

        res.json({
            message: 'Announcement deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get chart data for analytics graphs
 */
exports.getChartData = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only administrators can access chart data.'
            });
        }

        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        // Get monthly user registrations for last 6 months
        const monthlyUsers = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            
            const count = await User.count({
                where: {
                    created_at: {
                        [Op.gte]: monthStart,
                        [Op.lte]: monthEnd
                    }
                }
            });
            
            monthlyUsers.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                count
            });
        }

        // Get monthly module creation for last 6 months
        const monthlyModules = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            
            const count = await Module.count({
                where: {
                    created_at: {
                        [Op.gte]: monthStart,
                        [Op.lte]: monthEnd
                    }
                }
            });
            
            monthlyModules.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                count
            });
        }

        // Get monthly quiz attempts for last 6 months
        const monthlyQuizAttempts = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            
            const count = await QuizAttempt.count({
                where: {
                    created_at: {
                        [Op.gte]: monthStart,
                        [Op.lte]: monthEnd
                    }
                }
            });
            
            monthlyQuizAttempts.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                count
            });
        }

        // User role distribution
        const usersByRole = await User.findAll({
            attributes: [
                'role',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['role'],
            raw: true
        });

        const roleDistribution = usersByRole.map(r => ({
            role: r.role.charAt(0).toUpperCase() + r.role.slice(1),
            count: parseInt(r.count)
        }));

        // Module status distribution
        const publishedCount = await Module.count({ where: { is_published: true } });
        const draftCount = await Module.count({ where: { is_published: false } });
        const moduleStatus = [
            { status: 'Published', count: publishedCount },
            { status: 'Draft', count: draftCount }
        ];

        // Classroom status distribution
        const activeClassrooms = await Classroom.count({ where: { status: 'active' } });
        const archivedClassrooms = await Classroom.count({ where: { status: 'archived' } });
        const classroomStatus = [
            { status: 'Active', count: activeClassrooms },
            { status: 'Archived', count: archivedClassrooms }
        ];

        res.json({
            success: true,
            chartData: {
                monthlyUsers,
                monthlyModules,
                monthlyQuizAttempts,
                roleDistribution,
                moduleStatus,
                classroomStatus
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Generate downloadable report
 */
exports.generateReport = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only administrators can generate reports.'
            });
        }

        const now = new Date();
        const reportDate = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const reportTime = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Gather all data for report
        const totalUsers = await User.count();
        const totalModules = await Module.count();
        const publishedModules = await Module.count({ where: { is_published: true } });
        const totalClassrooms = await Classroom.count();
        const activeClassrooms = await Classroom.count({ where: { status: 'active' } });
        const totalQuizzes = await Quiz.count();
        const totalQuizAttempts = await QuizAttempt.count();
        const totalBadges = await Badge.count();

        // Users by role
        const usersByRole = await User.findAll({
            attributes: ['role', [fn('COUNT', col('id')), 'count']],
            group: ['role'],
            raw: true
        });

        // Recent users (last 30 days)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentUsers = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'created_at'],
            where: { created_at: { [Op.gte]: thirtyDaysAgo } },
            order: [['created_at', 'DESC']],
            limit: 15,
            raw: true
        });

        // All modules
        const modules = await Module.findAll({
            attributes: ['id', 'title', 'is_published', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 10,
            raw: true
        });

        // All classrooms
        const classrooms = await Classroom.findAll({
            attributes: ['id', 'name', 'join_code', 'status', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 10,
            raw: true
        });

        // Create PDF document
        const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 50,
            bufferPages: true,
            info: {
                Title: 'ProtectEd Analytics Report',
                Author: 'ProtectEd Admin System',
                Subject: 'System Analytics Report'
            }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ProtectEd_Report_${now.toISOString().split('T')[0]}.pdf"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Colors matching the purple theme
        const primaryColor = '#7C3AED';
        const secondaryColor = '#8B5CF6';
        const darkText = '#1F2937';
        const lightText = '#6B7280';
        const successColor = '#10B981';
        const warningColor = '#F59E0B';

        // ===== HEADER =====
        doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
        
        doc.fillColor('#FFFFFF')
           .fontSize(28)
           .font('Helvetica-Bold')
           .text('ProtectEd', 50, 35);
        
        doc.fontSize(12)
           .font('Helvetica')
           .text('Analytics Report', 50, 70);
        
        doc.fontSize(10)
           .text(`Generated: ${reportDate} at ${reportTime}`, 50, 90);

        // Right side - Report badge
        doc.roundedRect(doc.page.width - 150, 40, 100, 40, 5)
           .fillAndStroke('#FFFFFF', '#FFFFFF');
        doc.fillColor(primaryColor)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('OFFICIAL', doc.page.width - 145, 52, { width: 90, align: 'center' });
        doc.fontSize(8)
           .font('Helvetica')
           .text('REPORT', doc.page.width - 145, 65, { width: 90, align: 'center' });

        let yPos = 150;

        // ===== EXECUTIVE SUMMARY =====
        doc.fillColor(darkText)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Executive Summary', 50, yPos);
        
        yPos += 25;
        
        doc.fillColor(lightText)
           .fontSize(10)
           .font('Helvetica')
           .text('This report provides a comprehensive overview of the ProtectEd platform analytics, including user statistics, content metrics, and engagement data.', 50, yPos, { width: 495 });

        yPos += 40;

        // ===== KEY METRICS GRID =====
        doc.fillColor(darkText)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Key Metrics', 50, yPos);

        yPos += 20;

        // Draw metrics boxes (2x4 grid)
        const metrics = [
            { label: 'Total Users', value: totalUsers.toString(), color: primaryColor },
            { label: 'Total Modules', value: totalModules.toString(), color: secondaryColor },
            { label: 'Published Modules', value: publishedModules.toString(), color: successColor },
            { label: 'Total Classrooms', value: totalClassrooms.toString(), color: primaryColor },
            { label: 'Active Classrooms', value: activeClassrooms.toString(), color: successColor },
            { label: 'Total Quizzes', value: totalQuizzes.toString(), color: secondaryColor },
            { label: 'Quiz Attempts', value: totalQuizAttempts.toString(), color: warningColor },
            { label: 'Total Badges', value: totalBadges.toString(), color: primaryColor }
        ];

        const boxWidth = 115;
        const boxHeight = 60;
        const gap = 10;

        metrics.forEach((metric, index) => {
            const col = index % 4;
            const row = Math.floor(index / 4);
            const x = 50 + (col * (boxWidth + gap));
            const y = yPos + (row * (boxHeight + gap));

            // Box background
            doc.roundedRect(x, y, boxWidth, boxHeight, 5)
               .fillAndStroke('#F3F4F6', '#E5E7EB');
            
            // Colored top bar
            doc.rect(x, y, boxWidth, 4).fill(metric.color);

            // Value
            doc.fillColor(darkText)
               .fontSize(20)
               .font('Helvetica-Bold')
               .text(metric.value, x + 10, y + 15, { width: boxWidth - 20 });

            // Label
            doc.fillColor(lightText)
               .fontSize(8)
               .font('Helvetica')
               .text(metric.label, x + 10, y + 40, { width: boxWidth - 20 });
        });

        yPos += (2 * (boxHeight + gap)) + 20;

        // ===== USERS BY ROLE =====
        doc.fillColor(darkText)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Users by Role', 50, yPos);

        yPos += 20;

        // Simple horizontal bar chart
        const roleColors = {
            'admin': '#EF4444',
            'educator': '#3B82F6',
            'moderator': '#F59E0B',
            'player': '#10B981'
        };

        const totalRoleCount = usersByRole.reduce((sum, r) => sum + parseInt(r.count), 0);

        usersByRole.forEach((role, index) => {
            const percentage = totalRoleCount > 0 ? (parseInt(role.count) / totalRoleCount * 100) : 0;
            const barWidth = Math.max(percentage * 3, 20);

            // Role label
            doc.fillColor(darkText)
               .fontSize(10)
               .font('Helvetica')
               .text(role.role.charAt(0).toUpperCase() + role.role.slice(1), 50, yPos + (index * 25), { width: 80 });

            // Bar
            doc.roundedRect(130, yPos + (index * 25) - 2, barWidth, 16, 3)
               .fill(roleColors[role.role] || primaryColor);

            // Count
            doc.fillColor(darkText)
               .fontSize(10)
               .font('Helvetica-Bold')
               .text(`${role.count} (${percentage.toFixed(1)}%)`, 140 + barWidth, yPos + (index * 25));
        });

        yPos += (usersByRole.length * 25) + 30;

        // ===== NEW PAGE FOR TABLES =====
        doc.addPage();
        yPos = 50;

        // ===== RECENT USERS TABLE =====
        doc.fillColor(darkText)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Recent Users (Last 30 Days)', 50, yPos);

        yPos += 25;

        // Table header
        doc.rect(50, yPos, 495, 25).fill('#F3F4F6');
        doc.fillColor(darkText)
           .fontSize(9)
           .font('Helvetica-Bold');
        doc.text('Name', 55, yPos + 8, { width: 150 });
        doc.text('Email', 210, yPos + 8, { width: 150 });
        doc.text('Role', 365, yPos + 8, { width: 70 });
        doc.text('Joined', 440, yPos + 8, { width: 100 });

        yPos += 25;

        // Table rows
        recentUsers.forEach((user, index) => {
            const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
            doc.rect(50, yPos, 495, 20).fill(bgColor);
            
            doc.fillColor(darkText)
               .fontSize(8)
               .font('Helvetica');
            doc.text(user.name?.substring(0, 25) || 'N/A', 55, yPos + 6, { width: 150 });
            doc.text(user.email?.substring(0, 28) || 'N/A', 210, yPos + 6, { width: 150 });
            doc.text(user.role || 'N/A', 365, yPos + 6, { width: 70 });
            doc.text(new Date(user.created_at).toLocaleDateString(), 440, yPos + 6, { width: 100 });

            yPos += 20;
        });

        yPos += 30;

        // ===== MODULES TABLE =====
        doc.fillColor(darkText)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Recent Modules', 50, yPos);

        yPos += 25;

        // Table header
        doc.rect(50, yPos, 495, 25).fill('#F3F4F6');
        doc.fillColor(darkText)
           .fontSize(9)
           .font('Helvetica-Bold');
        doc.text('ID', 55, yPos + 8, { width: 40 });
        doc.text('Title', 100, yPos + 8, { width: 250 });
        doc.text('Status', 355, yPos + 8, { width: 80 });
        doc.text('Created', 440, yPos + 8, { width: 100 });

        yPos += 25;

        // Table rows
        modules.forEach((mod, index) => {
            const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
            doc.rect(50, yPos, 495, 20).fill(bgColor);
            
            doc.fillColor(darkText)
               .fontSize(8)
               .font('Helvetica');
            doc.text(mod.id.toString(), 55, yPos + 6, { width: 40 });
            doc.text(mod.title?.substring(0, 45) || 'N/A', 100, yPos + 6, { width: 250 });
            
            // Status badge
            const statusColor = mod.is_published ? successColor : warningColor;
            const statusText = mod.is_published ? 'Published' : 'Draft';
            doc.roundedRect(355, yPos + 3, 55, 14, 3).fill(statusColor);
            doc.fillColor('#FFFFFF')
               .fontSize(7)
               .font('Helvetica-Bold')
               .text(statusText, 357, yPos + 6, { width: 51, align: 'center' });
            
            doc.fillColor(darkText)
               .fontSize(8)
               .font('Helvetica')
               .text(new Date(mod.created_at).toLocaleDateString(), 440, yPos + 6, { width: 100 });

            yPos += 20;
        });

        yPos += 30;

        // ===== CLASSROOMS TABLE =====
        doc.fillColor(darkText)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Recent Classrooms', 50, yPos);

        yPos += 25;

        // Table header
        doc.rect(50, yPos, 495, 25).fill('#F3F4F6');
        doc.fillColor(darkText)
           .fontSize(9)
           .font('Helvetica-Bold');
        doc.text('ID', 55, yPos + 8, { width: 40 });
        doc.text('Name', 100, yPos + 8, { width: 200 });
        doc.text('Code', 305, yPos + 8, { width: 70 });
        doc.text('Status', 380, yPos + 8, { width: 60 });
        doc.text('Created', 445, yPos + 8, { width: 100 });

        yPos += 25;

        // Table rows
        classrooms.forEach((cls, index) => {
            const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
            doc.rect(50, yPos, 495, 20).fill(bgColor);
            
            doc.fillColor(darkText)
               .fontSize(8)
               .font('Helvetica');
            doc.text(cls.id.toString(), 55, yPos + 6, { width: 40 });
            doc.text(cls.name?.substring(0, 35) || 'N/A', 100, yPos + 6, { width: 200 });
            doc.fillColor(primaryColor)
               .font('Helvetica-Bold')
               .text(cls.join_code || 'N/A', 305, yPos + 6, { width: 70 });
            
            // Status badge
            const statusColor = cls.status === 'active' ? successColor : lightText;
            doc.roundedRect(380, yPos + 3, 50, 14, 3).fill(statusColor);
            doc.fillColor('#FFFFFF')
               .fontSize(7)
               .font('Helvetica-Bold')
               .text(cls.status || 'N/A', 382, yPos + 6, { width: 46, align: 'center' });
            
            doc.fillColor(darkText)
               .fontSize(8)
               .font('Helvetica')
               .text(new Date(cls.created_at).toLocaleDateString(), 445, yPos + 6, { width: 100 });

            yPos += 20;
        });

        // ===== FOOTER =====
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            
            // Footer line
            doc.moveTo(50, doc.page.height - 50)
               .lineTo(doc.page.width - 50, doc.page.height - 50)
               .stroke('#E5E7EB');

            // Footer text
            doc.fillColor(lightText)
               .fontSize(8)
               .font('Helvetica')
               .text(
                   'ProtectEd Analytics Report - Confidential',
                   50,
                   doc.page.height - 35,
                   { width: 300 }
               );
            
            doc.text(
                `Page ${i + 1} of ${range.count}`,
                doc.page.width - 150,
                doc.page.height - 35,
                { width: 100, align: 'right' }
            );
        }

        // Flush pages to finalize
        doc.flushPages();

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Report generation error:', error);
        next(error);
    }
};

/**
 * Admin: Get all students with gamification details
 */
exports.getStudents = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only administrators can access student data.'
            });
        }

        const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {
            role: 'player'
        };

        // Filter by account status
        if (status && status !== 'all') {
            whereClause.account_status = status;
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: students } = await User.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'name', 'email', 'created_at', 'email_verified_at', 'account_status', 'suspended_until', 'suspension_reason'],
            include: [{
                model: UserGamification,
                as: 'gamification',
                attributes: ['experience_points', 'current_title', 'level']
            }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            students: students.map(s => ({
                id: s.id,
                name: s.name,
                email: s.email,
                joined: s.created_at,
                verified: !!s.email_verified_at,
                xp: s.gamification?.experience_points || 0,
                level: s.gamification?.level || 1,
                title: s.gamification?.current_title || 'Novice',
                account_status: s.account_status || 'active',
                suspended_until: s.suspended_until,
                suspension_reason: s.suspension_reason
            })),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Export all students as PDF
 */
exports.exportStudents = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                message: 'Only administrators can export student data.'
            });
        }

        const now = new Date();
        const reportDate = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const reportTime = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Get all students
        const students = await User.findAll({
            where: { role: 'player' },
            attributes: ['id', 'name', 'email', 'created_at', 'email_verified_at'],
            include: [{
                model: UserGamification,
                as: 'gamification',
                attributes: ['experience_points', 'current_title', 'level']
            }],
            order: [['created_at', 'DESC']]
        });

        // Stats
        const totalStudents = students.length;
        const verifiedStudents = students.filter(s => s.email_verified_at).length;
        const pendingStudents = totalStudents - verifiedStudents;
        const totalXP = students.reduce((sum, s) => sum + (s.gamification?.experience_points || 0), 0);
        const avgXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;

        // Create PDF document
        const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 50,
            bufferPages: true,
            info: {
                Title: 'ProtectEd Students Report',
                Author: 'ProtectEd Admin System',
                Subject: 'Students Directory Export'
            }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ProtectEd_Students_${now.toISOString().split('T')[0]}.pdf"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Colors matching the purple theme
        const primaryColor = '#7C3AED';
        const secondaryColor = '#8B5CF6';
        const darkText = '#1F2937';
        const lightText = '#6B7280';
        const successColor = '#10B981';
        const warningColor = '#F59E0B';

        // ===== HEADER =====
        doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
        
        doc.fillColor('#FFFFFF')
           .fontSize(28)
           .font('Helvetica-Bold')
           .text('ProtectEd', 50, 35);
        
        doc.fontSize(12)
           .font('Helvetica')
           .text('Students Directory Report', 50, 70);
        
        doc.fontSize(10)
           .text(`Generated: ${reportDate} at ${reportTime}`, 50, 90);

        // Right side - Report badge
        doc.roundedRect(doc.page.width - 150, 40, 100, 40, 5)
           .fillAndStroke('#FFFFFF', '#FFFFFF');
        doc.fillColor(primaryColor)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('STUDENTS', doc.page.width - 145, 52, { width: 90, align: 'center' });
        doc.fontSize(8)
           .font('Helvetica')
           .text('REPORT', doc.page.width - 145, 65, { width: 90, align: 'center' });

        let yPos = 150;

        // ===== SUMMARY STATS =====
        doc.fillColor(darkText)
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('Summary Statistics', 50, yPos);

        yPos += 25;

        const stats = [
            { label: 'Total Students', value: totalStudents.toString(), color: primaryColor },
            { label: 'Verified', value: verifiedStudents.toString(), color: successColor },
            { label: 'Pending', value: pendingStudents.toString(), color: warningColor },
            { label: 'Average XP', value: avgXP.toLocaleString(), color: secondaryColor }
        ];

        const boxWidth = 115;
        const boxHeight = 55;
        const gap = 10;

        stats.forEach((stat, index) => {
            const x = 50 + (index * (boxWidth + gap));

            doc.roundedRect(x, yPos, boxWidth, boxHeight, 5)
               .fillAndStroke('#F3F4F6', '#E5E7EB');
            
            doc.rect(x, yPos, boxWidth, 4).fill(stat.color);

            doc.fillColor(darkText)
               .fontSize(20)
               .font('Helvetica-Bold')
               .text(stat.value, x + 10, yPos + 12, { width: boxWidth - 20 });

            doc.fillColor(lightText)
               .fontSize(8)
               .font('Helvetica')
               .text(stat.label, x + 10, yPos + 38, { width: boxWidth - 20 });
        });

        yPos += boxHeight + 30;

        // ===== STUDENTS TABLE =====
        doc.fillColor(darkText)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Student Directory', 50, yPos);

        yPos += 25;

        // Table header
        doc.rect(50, yPos, 495, 25).fill('#F3F4F6');
        doc.fillColor(darkText)
           .fontSize(8)
           .font('Helvetica-Bold');
        doc.text('Name', 55, yPos + 9, { width: 130 });
        doc.text('Email', 190, yPos + 9, { width: 140 });
        doc.text('Level', 335, yPos + 9, { width: 40 });
        doc.text('XP', 380, yPos + 9, { width: 50 });
        doc.text('Status', 435, yPos + 9, { width: 50 });
        doc.text('Joined', 490, yPos + 9, { width: 55 });

        yPos += 25;

        // Table rows (max 25 per page)
        const maxRowsPerPage = 22;
        let rowCount = 0;

        students.forEach((student, index) => {
            if (rowCount >= maxRowsPerPage) {
                doc.addPage();
                yPos = 50;
                rowCount = 0;

                // Re-draw table header on new page
                doc.rect(50, yPos, 495, 25).fill('#F3F4F6');
                doc.fillColor(darkText)
                   .fontSize(8)
                   .font('Helvetica-Bold');
                doc.text('Name', 55, yPos + 9, { width: 130 });
                doc.text('Email', 190, yPos + 9, { width: 140 });
                doc.text('Level', 335, yPos + 9, { width: 40 });
                doc.text('XP', 380, yPos + 9, { width: 50 });
                doc.text('Status', 435, yPos + 9, { width: 50 });
                doc.text('Joined', 490, yPos + 9, { width: 55 });
                yPos += 25;
            }

            const bgColor = rowCount % 2 === 0 ? '#FFFFFF' : '#FAFAFA';
            doc.rect(50, yPos, 495, 22).fill(bgColor);
            
            doc.fillColor(darkText)
               .fontSize(8)
               .font('Helvetica');
            doc.text(student.name?.substring(0, 22) || 'N/A', 55, yPos + 7, { width: 130 });
            doc.text(student.email?.substring(0, 24) || 'N/A', 190, yPos + 7, { width: 140 });
            doc.text((student.gamification?.level || 1).toString(), 335, yPos + 7, { width: 40 });
            doc.text((student.gamification?.experience_points || 0).toLocaleString(), 380, yPos + 7, { width: 50 });
            
            // Status badge
            const verified = !!student.email_verified_at;
            const statusColor = verified ? successColor : warningColor;
            const statusText = verified ? 'Verified' : 'Pending';
            doc.roundedRect(435, yPos + 4, 45, 14, 3).fill(statusColor);
            doc.fillColor('#FFFFFF')
               .fontSize(6)
               .font('Helvetica-Bold')
               .text(statusText, 437, yPos + 8, { width: 41, align: 'center' });
            
            doc.fillColor(darkText)
               .fontSize(8)
               .font('Helvetica')
               .text(new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }), 490, yPos + 7, { width: 55 });

            yPos += 22;
            rowCount++;
        });

        // ===== FOOTER =====
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
            doc.switchToPage(i);
            
            doc.moveTo(50, doc.page.height - 50)
               .lineTo(doc.page.width - 50, doc.page.height - 50)
               .stroke('#E5E7EB');

            doc.fillColor(lightText)
               .fontSize(8)
               .font('Helvetica')
               .text(
                   'ProtectEd Students Report - Confidential',
                   50,
                   doc.page.height - 35,
                   { width: 300 }
               );
            
            doc.text(
                `Page ${i + 1} of ${range.count}`,
                doc.page.width - 150,
                doc.page.height - 35,
                { width: 100, align: 'right' }
            );
        }

        doc.flushPages();
        doc.end();

    } catch (error) {
        console.error('Students export error:', error);
        next(error);
    }
};

/**
 * Admin: Get single user details
 */
exports.getUserDetails = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { userId } = req.params;

        const user = await User.findByPk(userId, {
            attributes: [
                'id', 'username', 'email', 'role', 'account_status',
                'suspended_until', 'suspension_reason', 'email_verified_at',
                'created_at', 'last_active_at'
            ],
            include: [{
                model: UserGamification,
                as: 'gamification',
                attributes: ['level', 'experience_points', 'gems']
            }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user details error:', error);
        next(error);
    }
};

/**
 * Admin: Update user account status (ban, suspend, deactivate, reactivate)
 */
exports.updateUserStatus = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { userId } = req.params;
        const { status, reason, suspended_until } = req.body;

        // Validate status
        const validStatuses = ['active', 'deactivated', 'suspended', 'banned'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be: active, deactivated, suspended, or banned.' 
            });
        }

        // Find user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Prevent admin from modifying other admins
        if (user.role === 'admin' && user.id !== req.user.id) {
            return res.status(403).json({ 
                message: 'Cannot modify another admin account.' 
            });
        }

        // Prevent self-suspension/ban
        if (user.id === req.user.id && ['suspended', 'banned', 'deactivated'].includes(status)) {
            return res.status(400).json({ 
                message: 'Cannot deactivate, suspend, or ban your own account.' 
            });
        }

        // Build update data
        const updateData = {
            account_status: status,
            suspension_reason: null,
            suspended_until: null
        };

        // Handle suspension specifics
        if (status === 'suspended') {
            if (!suspended_until) {
                return res.status(400).json({ 
                    message: 'Suspension end date is required.' 
                });
            }
            updateData.suspended_until = new Date(suspended_until);
            updateData.suspension_reason = reason || 'Account suspended by administrator.';
        } else if (status === 'banned') {
            updateData.suspension_reason = reason || 'Account banned by administrator.';
        }

        await user.update(updateData);

        // Create notification for the user
        await Notification.create({
            user_id: user.id,
            title: `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: getStatusNotificationMessage(status, reason, suspended_until),
            type: 'system',
            is_read: false
        });

        res.json({
            message: `User account ${status} successfully.`,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                account_status: status,
                suspension_reason: updateData.suspension_reason,
                suspended_until: updateData.suspended_until
            }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        next(error);
    }
};

/**
 * Admin: Ban a user
 */
exports.banUser = async (req, res, next) => {
    req.body.status = 'banned';
    return exports.updateUserStatus(req, res, next);
};

/**
 * Admin: Suspend a user temporarily
 */
exports.suspendUser = async (req, res, next) => {
    req.body.status = 'suspended';
    return exports.updateUserStatus(req, res, next);
};

/**
 * Admin: Deactivate a user
 */
exports.deactivateUser = async (req, res, next) => {
    req.body.status = 'deactivated';
    return exports.updateUserStatus(req, res, next);
};

/**
 * Admin: Reactivate a user account
 */
exports.reactivateUser = async (req, res, next) => {
    req.body.status = 'active';
    return exports.updateUserStatus(req, res, next);
};

/**
 * Admin: Bulk update user statuses
 */
exports.bulkUpdateUserStatus = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { userIds, status, reason, suspended_until } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'User IDs array is required.' });
        }

        const validStatuses = ['active', 'deactivated', 'suspended', 'banned'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be: active, deactivated, suspended, or banned.' 
            });
        }

        // Filter out admin users and self
        const users = await User.findAll({
            where: {
                id: { [Op.in]: userIds },
                role: { [Op.ne]: 'admin' }
            }
        });

        const filteredIds = users
            .filter(u => u.id !== req.user.id)
            .map(u => u.id);

        if (filteredIds.length === 0) {
            return res.status(400).json({ 
                message: 'No valid users to update.' 
            });
        }

        // Build update data
        const updateData = {
            account_status: status,
            suspension_reason: status === 'banned' || status === 'suspended' ? 
                (reason || `Account ${status} by administrator.`) : null,
            suspended_until: status === 'suspended' && suspended_until ? 
                new Date(suspended_until) : null
        };

        await User.update(updateData, {
            where: { id: { [Op.in]: filteredIds } }
        });

        // Create notifications for affected users
        const notifications = filteredIds.map(userId => ({
            user_id: userId,
            title: `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            message: getStatusNotificationMessage(status, reason, suspended_until),
            type: 'system',
            is_read: false
        }));

        await Notification.bulkCreate(notifications);

        res.json({
            message: `${filteredIds.length} user(s) updated to ${status}.`,
            updated_count: filteredIds.length
        });
    } catch (error) {
        console.error('Bulk update user status error:', error);
        next(error);
    }
};

/**
 * Admin: Get user activity logs (recent actions)
 */
exports.getUserActivityLogs = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get recent quiz attempts
        const quizAttempts = await QuizAttempt.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            limit: 10,
            include: [{
                model: Quiz,
                as: 'quiz',
                attributes: ['id', 'title']
            }]
        });

        // Get classroom memberships
        const classroomMemberships = await ClassroomMember.findAll({
            where: { user_id: userId },
            include: [{
                model: Classroom,
                as: 'classroom',
                attributes: ['id', 'name', 'code']
            }]
        });

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                last_active_at: user.last_active_at,
                created_at: user.created_at
            },
            quiz_attempts: quizAttempts,
            classroom_memberships: classroomMemberships
        });
    } catch (error) {
        console.error('Get user activity logs error:', error);
        next(error);
    }
};

// Helper function for notification messages
function getStatusNotificationMessage(status, reason, suspendedUntil) {
    switch (status) {
        case 'banned':
            return `Your account has been permanently banned. ${reason ? `Reason: ${reason}` : ''} If you believe this is an error, please contact support.`;
        case 'suspended':
            const until = suspendedUntil ? new Date(suspendedUntil).toLocaleDateString() : 'indefinitely';
            return `Your account has been temporarily suspended until ${until}. ${reason ? `Reason: ${reason}` : ''} Please contact support if you have questions.`;
        case 'deactivated':
            return `Your account has been deactivated. ${reason ? `Reason: ${reason}` : ''} Contact support to reactivate.`;
        case 'active':
            return 'Your account has been reactivated. You now have full access to the platform.';
        default:
            return 'Your account status has been updated.';
    }
}

module.exports = exports;
