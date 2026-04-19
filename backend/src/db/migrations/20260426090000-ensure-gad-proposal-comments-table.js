'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const safeAddIndex = async (table, columns, options) => {
      try {
        await queryInterface.addIndex(table, columns, options);
      } catch (error) {
        const message = error?.message || '';
        const code = error?.original?.code;
        if (
          message.includes('Duplicate key name') ||
          message.includes('already exists') ||
          code === 'ER_DUP_KEYNAME'
        ) {
          return;
        }
        throw error;
      }
    };

    const rawTables = await queryInterface.showAllTables();
    const tables = (rawTables || [])
      .map((t) => {
        if (typeof t === 'string') return t;
        if (!t || typeof t !== 'object') return '';
        return t.tableName || t.TABLE_NAME || t.name || t[0] || '';
      })
      .filter(Boolean)
      .map((t) => String(t).toLowerCase());

    const hasCommentsTable = tables.includes('gad_proposal_comments');

    if (!hasCommentsTable) {
      await queryInterface.createTable('gad_proposal_comments', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        proposal_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'gad_proposals',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        admin_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        comment_text: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        comment_type: {
          type: Sequelize.ENUM('feedback', 'question', 'suggestion', 'issue'),
          defaultValue: 'feedback'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });
    }

    await safeAddIndex('gad_proposal_comments', ['proposal_id'], {
      name: 'idx_gad_proposal_comments_proposal_id'
    });
    await safeAddIndex('gad_proposal_comments', ['admin_id'], {
      name: 'idx_gad_proposal_comments_admin_id'
    });
  },

  async down(queryInterface) {
    const rawTables = await queryInterface.showAllTables();
    const tables = (rawTables || [])
      .map((t) => {
        if (typeof t === 'string') return t;
        if (!t || typeof t !== 'object') return '';
        return t.tableName || t.TABLE_NAME || t.name || t[0] || '';
      })
      .filter(Boolean)
      .map((t) => String(t).toLowerCase());

    if (tables.includes('gad_proposal_comments')) {
      await queryInterface.dropTable('gad_proposal_comments');
    }
  }
};
