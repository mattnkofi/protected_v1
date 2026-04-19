const crypto = require('crypto');
const { PurpleDeskReport, Campus } = require('../model');
const EncryptionService = require('../services/EncryptionService');

const STATUS_VALUES = ['submitted', 'in_review', 'resolved'];

async function generateUniqueTrackingCode() {
    for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        const exists = await PurpleDeskReport.findOne({ where: { tracking_code: code } });
        if (!exists) return code;
    }
    throw new Error('Unable to generate a unique tracking code');
}

exports.submitReport = async (req, res, next) => {
    try {
        const { message, campus_id, category } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Report message is required.'
            });
        }

        if (campus_id) {
            const campus = await Campus.findByPk(campus_id);
            if (!campus) {
                return res.status(404).json({
                    success: false,
                    message: 'Campus not found.'
                });
            }
        }

        const trackingCode = await generateUniqueTrackingCode();
        const encryptedPayload = EncryptionService.encrypt(JSON.stringify({
            message: message.trim()
        }));

        await PurpleDeskReport.create({
            tracking_code: trackingCode,
            campus_id: campus_id || null,
            category: category || null,
            encrypted_payload: encryptedPayload,
            status: 'submitted'
        });

        return res.status(201).json({
            success: true,
            tracking_code: trackingCode,
            message: 'Report submitted. Keep your tracking code to check status.'
        });
    } catch (error) {
        next(error);
    }
};

exports.getReportStatus = async (req, res, next) => {
    try {
        const { tracking_code } = req.params;
        const normalizedCode = tracking_code.trim().toUpperCase();
        const report = await PurpleDeskReport.findOne({ where: { tracking_code: normalizedCode } });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Tracking code not found.'
            });
        }

        return res.status(200).json({
            success: true,
            tracking_code: report.tracking_code,
            status: report.status,
            submitted_at: report.created_at
        });
    } catch (error) {
        next(error);
    }
};

exports.getReports = async (req, res, next) => {
    try {
        const { status, campus_id } = req.query;
        const where = {};
        if (status) where.status = status;
        if (campus_id) where.campus_id = campus_id;

        const reports = await PurpleDeskReport.findAll({
            where,
            include: [{ model: Campus, as: 'campus' }],
            order: [['created_at', 'DESC']]
        });

        const sanitizedReports = reports.map((report) => {
            const plainReport = report.get({ plain: true });
            let reportMessage = null;

            try {
                const decryptedPayload = EncryptionService.decrypt(plainReport.encrypted_payload);
                const parsedPayload = JSON.parse(decryptedPayload);
                reportMessage = parsedPayload.message || null;
            } catch (error) {
                reportMessage = null;
            }

            return {
                ...plainReport,
                report_message: reportMessage
            };
        });

        return res.status(200).json({
            success: true,
            reports: sanitizedReports
        });
    } catch (error) {
        next(error);
    }
};

exports.updateReportStatus = async (req, res, next) => {
    try {
        const { report_id } = req.params;
        const { status } = req.body;

        if (!STATUS_VALUES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Use one of: ${STATUS_VALUES.join(', ')}`
            });
        }

        const report = await PurpleDeskReport.findByPk(report_id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found.'
            });
        }

        await report.update({ status });

        return res.status(200).json({
            success: true,
            report
        });
    } catch (error) {
        next(error);
    }
};
