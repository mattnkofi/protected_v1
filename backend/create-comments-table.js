const sequelize = require('./src/config/db');

async function createCommentsTable() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS gad_proposal_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        admin_id INT NOT NULL,
        comment_text LONGTEXT NOT NULL,
        comment_type ENUM('feedback', 'question', 'suggestion', 'issue') DEFAULT 'feedback',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proposal_id) REFERENCES gad_proposals(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_proposal_id (proposal_id),
        INDEX idx_admin_id (admin_id)
      )
    `);
    console.log('✅ gad_proposal_comments table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    process.exit(1);
  }
}

createCommentsTable();
