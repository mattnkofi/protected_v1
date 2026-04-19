'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create campuses
    await queryInterface.bulkInsert('campuses', [
      { 
        name: 'Main Campus', 
        code: 'MAIN', 
        location: 'Central City', 
        is_active: true, 
        created_at: new Date(), 
        updated_at: new Date() 
      },
      { 
        name: 'North Campus', 
        code: 'NORTH', 
        location: 'North District', 
        is_active: true, 
        created_at: new Date(), 
        updated_at: new Date() 
      },
      { 
        name: 'South Campus', 
        code: 'SOUTH', 
        location: 'South District', 
        is_active: true, 
        created_at: new Date(), 
        updated_at: new Date() 
      }
    ]);

    // Create scoring criteria
    await queryInterface.bulkInsert('gad_scoring_criterias', [
      {
        criteria_name: 'Language Inclusivity',
        description: 'Uses gender-fair and inclusive language throughout',
        max_points: 25,
        weight: 1.5,
        guidelines: JSON.stringify({ 
          excellent: 'No gendered terms, uses inclusive pronouns', 
          good: 'Mostly inclusive with minor issues',
          fair: 'Some gendered language present',
          poor: 'Frequent gendered language' 
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        criteria_name: 'Gender Sensitivity',
        description: 'Demonstrates awareness of gender-specific impacts',
        max_points: 25,
        weight: 1.5,
        guidelines: JSON.stringify({ 
          excellent: 'Thoroughly addresses gender-specific challenges', 
          good: 'Good understanding of gender dimensions',
          fair: 'Basic awareness of gender issues',
          poor: 'Ignores gender dimensions' 
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        criteria_name: 'Equity & Access',
        description: 'Ensures equitable access and participation',
        max_points: 20,
        weight: 1.3,
        guidelines: JSON.stringify({ 
          excellent: 'Clear focus on equity for all genders', 
          good: 'Good equity considerations',
          fair: 'Some equity focus',
          poor: 'No equity considerations' 
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        criteria_name: 'Implementation Feasibility',
        description: 'Realistic and achievable proposal timeline',
        max_points: 15,
        weight: 1.0,
        guidelines: JSON.stringify({ 
          excellent: 'Detailed, achievable timeline with resources', 
          good: 'Realistic timeline and approach',
          fair: 'Somewhat feasible but needs clarification',
          poor: 'Vague or unrealistic timeline' 
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        criteria_name: 'Monitoring & Evaluation',
        description: 'Clear metrics to measure success',
        max_points: 15,
        weight: 1.2,
        guidelines: JSON.stringify({ 
          excellent: 'Specific KPIs and detailed evaluation methods', 
          good: 'Clear evaluation framework',
          fair: 'Basic evaluation approach',
          poor: 'No evaluation framework' 
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('gad_scoring_criterias', null, {});
    await queryInterface.bulkDelete('campuses', null, {});
  }
};
