const { sequelize } = require('./src/model');

async function verifyDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Check campuses table
    const campuses = await sequelize.query('SELECT * FROM campuses', { raw: true });
    console.log('\n✅ Campuses table found with', campuses[0].length, 'records:');
    campuses[0].forEach(c => {
      console.log(`  - ${c.name} (${c.code})`);
    });

    // Check gad_scoring_criterias table
    const criterias = await sequelize.query('SELECT * FROM gad_scoring_criterias', { raw: true });
    console.log('\n✅ Scoring Criterias table found with', criterias[0].length, 'records:');
    criterias[0].forEach(c => {
      console.log(`  - ${c.criteria_name} (${c.max_points} points)`);
    });

    // Check gad_proposals table
    const proposals = await sequelize.query('SELECT * FROM gad_proposals', { raw: true });
    console.log('\n✅ GAD Proposals table found (ready for proposals)');

    // Check gad_scores table
    const scores = await sequelize.query('SELECT * FROM gad_scores', { raw: true });
    console.log('GAD Scores table found (ready for scoring)\n');

    console.log('All GAD module tables are set up correctly!');
    process.exit(0);
  } catch (error) {
    console.error('Error verifying database:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
