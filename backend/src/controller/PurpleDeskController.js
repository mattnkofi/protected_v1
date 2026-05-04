const crypto = require('crypto');
const { Op } = require('sequelize');
const { PurpleDeskReport, Campus } = require('../model');
const EncryptionService = require('../services/EncryptionService');

const generateTrackingCode = async () => {
	let attempts = 0;
	while (attempts < 5) {
		const code = crypto.randomBytes(4).toString('hex').toUpperCase();
		const existing = await PurpleDeskReport.findOne({ where: { tracking_code: code } });
		if (!existing) return code;
		attempts += 1;
	}
	throw new Error('Unable to generate tracking code. Please retry.');
};

exports.submitReport = async (req, res, next) => {
	try {
		const { message, campus_id, category } = req.body;
		if (!message || !String(message).trim()) {
			return res.status(400).json({ message: 'Report message is required.' });
		}

		const trackingCode = await generateTrackingCode();
		const encryptedPayload = EncryptionService.encrypt({ message: String(message).trim() });

		const report = await PurpleDeskReport.create({
			tracking_code: trackingCode,
			campus_id: campus_id || null,
			category: category || null,
			encrypted_payload: encryptedPayload,
			status: 'submitted'
		});

		res.status(201).json({
			message: 'Report submitted successfully.',
			tracking_code: report.tracking_code
		});
	} catch (error) {
		next(error);
	}
};

exports.getReportStatus = async (req, res, next) => {
	try {
		const { tracking_code } = req.params;
		const report = await PurpleDeskReport.findOne({ where: { tracking_code } });
		if (!report) {
			return res.status(404).json({ message: 'Tracking code not found.' });
		}

		res.json({
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
		const { campus_id, status } = req.query;
		const where = {};
		if (campus_id) where.campus_id = campus_id;
		if (status) where.status = status;

		const reports = await PurpleDeskReport.findAll({
			where,
			include: [
				{ model: Campus, as: 'campus', attributes: ['id', 'name'] }
			],
			order: [['created_at', 'DESC']]
		});

		const mapped = reports.map((report) => {
			let message = null;
			try {
				const payload = EncryptionService.decrypt(report.encrypted_payload);
				message = payload?.message || null;
			} catch (error) {
				message = null;
			}

			return {
				id: report.id,
				tracking_code: report.tracking_code,
				campus_id: report.campus_id,
				campus: report.campus,
				category: report.category,
				status: report.status,
				report_message: message,
				created_at: report.created_at,
				updated_at: report.updated_at
			};
		});

		res.json({ reports: mapped });
	} catch (error) {
		next(error);
	}
};

exports.updateReportStatus = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { status } = req.body;
		const allowedStatuses = ['submitted', 'in_review', 'resolved'];

		if (!allowedStatuses.includes(status)) {
			return res.status(400).json({ message: 'Invalid status value.' });
		}

		const report = await PurpleDeskReport.findByPk(id);
		if (!report) {
			return res.status(404).json({ message: 'Report not found.' });
		}

		await report.update({ status });
		res.json({ message: 'Status updated.' });
	} catch (error) {
		next(error);
	}
};
