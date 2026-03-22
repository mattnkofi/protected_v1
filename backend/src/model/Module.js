// backend/src/model/Module.js
module.exports = (sequelize, DataTypes) => {
    const Module = sequelize.define('Module', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'Module title is required' },
                len: {
                    args: [3, 255],
                    msg: 'Title must be between 3 and 255 characters'
                }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: true
        },
        // Link sa Classroom table (NULL kung Public)
        classroom_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Classrooms',
                key: 'id'
            }
        },
        category: {
            type: DataTypes.ENUM('gad', 'sexual_health', 'vawc', 'general'),
            allowNull: false,
            defaultValue: 'general',
            validate: {
                isIn: {
                    args: [['gad', 'sexual_health', 'vawc', 'general']],
                    msg: 'Invalid category'
                }
            }
        },
        difficulty_level: {
            type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
            allowNull: false,
            defaultValue: 'beginner'
        },
        age_group: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        // File Details para sa Cloudflare R2
        file_key: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'R2 storage key for PDF/DOCX file'
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        file_type: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        file_size: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        thumbnail_key: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        // JSON fields para sa flexibility
        required_modules: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {}
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        view_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        completion_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'Modules',
        paranoid: true, // Para sa Soft Deletes
        indexes: [
            { fields: ['category'] },
            { fields: ['is_published'] },
            { fields: ['classroom_id'] },
            { fields: ['created_by'] }
        ]
    });

    // ==================== ASSOCIATIONS ====================
    Module.associate = function (models) {
        Module.belongsTo(models.User, {
            foreignKey: 'created_by',
            as: 'creator'
        });

        Module.belongsTo(models.Classroom, {
            foreignKey: 'classroom_id',
            as: 'classroom'
        });

        Module.hasMany(models.Quiz, {
            foreignKey: 'module_id',
            as: 'quizzes',
            onDelete: 'CASCADE'
        });

        Module.hasMany(models.ModuleView, {
            foreignKey: 'module_id',
            as: 'views',
            onDelete: 'CASCADE'
        });
    };

    // ==================== INSTANCE METHODS ====================

    // I-generate ang URL para sa file
    Module.prototype.getFileUrl = function () {
        if (!this.file_key) return null;
        try {
            const fileStorageService = require('../services/FileStorageService');
            return fileStorageService.constructUrl(this.file_key);
        } catch (error) {
            return null;
        }
    };

    // I-generate ang URL para sa thumbnail
    Module.prototype.getThumbnailUrl = function () {
        if (!this.thumbnail_key) return null;
        try {
            const fileStorageService = require('../services/FileStorageService');
            return fileStorageService.constructUrl(this.thumbnail_key);
        } catch (error) {
            return null;
        }
    };

    // I-custom ang JSON output para sa frontend
    Module.prototype.toJSON = function () {
        const values = { ...this.get() };
        
        values.file_url = this.getFileUrl();
        values.thumbnail_url = this.getThumbnailUrl();
        
        // Itago ang internal keys para sa security
        delete values.file_key;
        delete values.thumbnail_key;
        
        return values;
    };

    // ==================== HOOKS ====================

    // Pag-delete ng files sa storage bago i-destroy ang record
    Module.beforeDestroy(async (module) => {
        try {
            const fileStorageService = require('../services/FileStorageService');
            if (module.file_key) await fileStorageService.deleteFile(module.file_key);
            if (module.thumbnail_key) await fileStorageService.deleteFile(module.thumbnail_key);
        } catch (error) {
            console.error('File cleanup error:', error);
        }
    });

    return Module;
};