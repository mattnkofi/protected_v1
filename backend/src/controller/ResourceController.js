const { ResourceItem, Campus, User } = require('../model');
const { Op } = require('sequelize');

exports.getResources = async (req, res, next) => {
    try {
        const { campus_id, type, search } = req.query;
        const where = { is_active: true };

        if (campus_id) where.campus_id = campus_id;
        if (type) where.type = type;
        if (search) {
            where.title = { [Op.like]: `%${search}%` };
        }

        const resources = await ResourceItem.findAll({
            where,
            include: [
                { model: Campus, as: 'campus' },
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
            ],
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            resources
        });
    } catch (error) {
        next(error);
    }
};

exports.createResource = async (req, res, next) => {
    try {
        const { title, description, type, link_url, campus_id } = req.body;

        if (!title || !link_url) {
            return res.status(400).json({
                success: false,
                message: 'Title and link are required.'
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

        const resource = await ResourceItem.create({
            title: title.trim(),
            description: description ? description.trim() : null,
            type: type || 'other',
            link_url: link_url.trim(),
            campus_id: campus_id || null,
            created_by: req.user.id,
            is_active: true
        });

        return res.status(201).json({
            success: true,
            resource
        });
    } catch (error) {
        next(error);
    }
};
