# GAD Module - Database Setup Quick Reference

## TL;DR - Quick Setup (5 minutes)

```bash
# 1. Navigate to backend
cd backend

# 2. Create migration files (MANUAL - see below)
# Copy the migration files provided in MIGRATION_FILES.sql

# 3. Run migrations
npx sequelize-cli db:migrate

# 4. Seed default data
npx sequelize-cli db:seed:all

# 5. Verify
mysql -u root -p your_database < verify.sql

# 6. Start server
npm start
```

---

## Detailed Setup Steps

### Step 1: Verify Database Connection

```bash
cd backend

# Test database connection
npx sequelize-cli db:authenticate
```

Expected output: `Connection successful!`

### Step 2: Create Migration Files

Run these commands to generate migration file stubs:

```bash
# Generate migrations with auto-created timestamps
npx sequelize-cli migration:generate --name create-campus-table
npx sequelize-cli migration:generate --name create-gad-proposal-table
npx sequelize-cli migration:generate --name create-gad-scoring-criteria-table
npx sequelize-cli migration:generate --name create-gad-score-table
npx sequelize-cli migration:generate --name seed-gad-data
```

This creates files in `backend/db/migrations/` like:
- `XXXXXXX-create-campus-table.js`
- `XXXXXXX-create-gad-proposal-table.js`
- etc.

### Step 3: Replace Migration Content

Copy the following SQL into each migration file:

**File 1: `migrations/XXXXXXX-create-campus-table.js`**
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('campuses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      code: { type: Sequelize.STRING(10), allowNull: false, unique: true },
      location: { type: Sequelize.STRING(255) },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('campuses');
  }
};
```

**File 2: `migrations/XXXXXXX-create-gad-proposal-table.js`**
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gad_proposals', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      campus_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'campuses', key: 'id' }
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      status: { 
        type: Sequelize.ENUM('submitted', 'under_review', 'rejected_with_feedback', 'revised', 'approved', 'approved_final'),
        defaultValue: 'submitted'
      },
      gfl_issues: { type: Sequelize.JSON },
      admin_feedback: { type: Sequelize.TEXT },
      file_key: { type: Sequelize.STRING(500) },
      reviewed_by: { type: Sequelize.INTEGER },
      reviewed_date: { type: Sequelize.DATE },
      submission_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Create indexes for performance
    await queryInterface.addIndex('gad_proposals', ['user_id']);
    await queryInterface.addIndex('gad_proposals', ['campus_id']);
    await queryInterface.addIndex('gad_proposals', ['status']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('gad_proposals');
  }
};
```

**File 3: `migrations/XXXXXXX-create-gad-scoring-criteria-table.js`**
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gad_scoring_criterias', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      criteria_name: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT },
      max_points: { type: Sequelize.INTEGER, defaultValue: 10 },
      weight: { type: Sequelize.DECIMAL(5, 2), defaultValue: 1.0 },
      guidelines: { type: Sequelize.JSON },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('gad_scoring_criterias');
  }
};
```

**File 4: `migrations/XXXXXXX-create-gad-score-table.js`**
```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gad_scores', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      proposal_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'gad_proposals', key: 'id' },
        onDelete: 'CASCADE'
      },
      criteria_id: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'gad_scoring_criterias', key: 'id' }
      },
      scored_by: { 
        type: Sequelize.INTEGER, 
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      points_awarded: { type: Sequelize.INTEGER, defaultValue: 0 },
      evaluator_comment: { type: Sequelize.TEXT },
      scored_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // Create indexes
    await queryInterface.addIndex('gad_scores', ['proposal_id']);
    await queryInterface.addIndex('gad_scores', ['criteria_id']);
    await queryInterface.addIndex('gad_scores', ['scored_by']);
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('gad_scores');
  }
};
```

### Step 4: Run Migrations

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Expected output:
# Sequelize CLI [Node: 16.x.x, CLI: 6.x.x, ORM: 6.x.x]
# Loaded configuration file "...
# Using environment "development"
# == XXXXXXX-create-campus-table: migrating =====
# ...successfully
# == XXXXXXX-create-gad-proposal-table: migrating =====
# ...successfully
# ...
```

### Step 5: Create Seeder File

Generate seeder:
```bash
npx sequelize-cli seed:generate --name seed-gad-data
```

Copy this into `seeders/XXXXXXX-seed-gad-data.js`:

```javascript
'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Create campuses
    await queryInterface.bulkInsert('campuses', [
      { 
        name: 'Main Campus', 
        code: 'MAIN', 
        location: 'Central City', 
        is_active: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'North Campus', 
        code: 'NORTH', 
        location: 'North District', 
        is_active: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        name: 'South Campus', 
        code: 'SOUTH', 
        location: 'South District', 
        is_active: true, 
        createdAt: new Date(), 
        updatedAt: new Date() 
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
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
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
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('gad_scoring_criterias', null, {});
    await queryInterface.bulkDelete('campuses', null, {});
  }
};
```

### Step 6: Run Seeder

```bash
npx sequelize-cli db:seed:all

# Expected output:
# Sequelize CLI [Node: 16.x.x, CLI: 6.x.x, ORM: 6.x.x]
# Loaded configuration file "..."
# Using environment "development"
# == XXXXXXX-seed-gad-data: seeding =====
# ...successfully
```

### Step 7: Create Comments Table (Optional - Already Exists)

The `gad_proposal_comments` table is automatically created for admin feedback on proposals:

```sql
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
);
```

**Comment Types:**
- `feedback`: General feedback on the proposal
- `question`: Questions about the proposal content
- `suggestion`: Suggestions for improvement
- `issue`: Issues or concerns found

### Step 8: Verify Database

```bash
# Connect to MySQL and verify
mysql -u root -p

# In MySQL:
USE your_database;
SHOW TABLES;
DESC campuses;
SELECT * FROM campuses;
SELECT * FROM gad_scoring_criterias;
```

Expected output:
```
mysql> SELECT * FROM campuses;
+----+---------------+-------+------------------+-----------+---------------------+---------------------+
| id | name          | code  | location         | is_active | createdAt           | updatedAt           |
+----+---------------+-------+------------------+-----------+---------------------+---------------------+
|  1 | Main Campus   | MAIN  | Central City     |         1 | 2024-01-15 10:00:00 | 2024-01-15 10:00:00 |
|  2 | North Campus  | NORTH | North District   |         1 | 2024-01-15 10:00:00 | 2024-01-15 10:00:00 |
|  3 | South Campus  | SOUTH | South District   |         1 | 2024-01-15 10:00:00 | 2024-01-15 10:00:00 |
+----+---------------+-------+------------------+-----------+---------------------+---------------------+
```

### Step 8: Start Server

```bash
npm start

# Expected output:
# Server running on http://localhost:3000
# Database connected
```

---

## Testing API Endpoints

Once the database is set up and server is running:

### 1. Get Campuses
```bash
curl -X GET http://localhost:3000/api/v1/gad/campuses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "success": true,
  "campuses": [
    { "id": 1, "name": "Main Campus", "code": "MAIN", ... },
    { "id": 2, "name": "North Campus", "code": "NORTH", ... },
    { "id": 3, "name": "South Campus", "code": "SOUTH", ... }
  ]
}
```

### 2. Get Scoring Criteria
```bash
curl -X GET http://localhost:3000/api/v1/gad/scoring-criteria \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected Response:
{
  "success": true,
  "criteria": [
    { "id": 1, "criteria_name": "Language Inclusivity", "max_points": 25, ... },
    { "id": 2, "criteria_name": "Gender Sensitivity", "max_points": 25, ... },
    ...
  ]
}
```

### 3. Test Language Analysis
```bash
curl -X POST http://localhost:3000/api/v1/gad/analyze-language \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The chairman and his team will discuss the proposal with everyone"
  }'

# Expected Response (issues found):
{
  "success": true,
  "totalIssues": 2,
  "issues": [
    {
      "term": "chairman",
      "suggestion": "chair or chairperson",
      "severity": "high",
      ...
    },
    {
      "term": "his",
      "suggestion": "their",
      "severity": "low",
      ...
    }
  ],
  "gflScore": 80
}
```

---

## Troubleshooting Database Issues

### Issue: "relation does not exist" error
```bash
# Solution: Run migrations
npx sequelize-cli db:migrate
```

### Issue: Foreign key constraint fails
```bash
# Solution: Ensure users table exists and seeds data first
# Edit seeder to add users before GAD models (if needed)
```

### Issue: Undo last migration
```bash
# Undo last migration
npx sequelize-cli db:migrate:undo

# Undo all migrations
npx sequelize-cli db:migrate:undo:all
```

### Issue: Reset entire database
```bash
# DROP all tables and restart
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

---

## Database Schema Diagram

```
┌─────────────┐
│    users    │
├─────────────┤
│ id (PK)     │
│ name        │
│ email       │
│ role        │
└──────┬──────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ gad_proposals│  │  gad_scores  │  │ gad_scores   │
├──────────────┤  ├──────────────┤  │ (as reviewer)│
│ id (PK)      │  │ id (PK)      │  └──────────────┘
│ user_id (FK) │  │ proposal_id  │
│ campus_id(FK)│  │ criteria_id  │
│ title        │  │ scored_by(FK)│
│ description  │  │ points       │
│ status       │  │ comment      │
│ file_key     │  └──────────────┘
│ gfl_issues   │         ▲
│ admin_...    │         │
└──────┬───────┘         │
       │                 │
       │        ┌────────┴──────────┐
       │        │                   │
       ▼        ▼                   │
  ┌─────────────────┐     ┌──────────────────────┐
  │   campuses      │     │gad_scoring_criterias │
  ├─────────────────┤     ├──────────────────────┤
  │ id (PK)         │     │ id (PK)              │
  │ name            │     │ criteria_name        │
  │ code            │     │ description          │
  │ location        │     │ max_points           │
  │ is_active       │     │ weight               │
  └─────────────────┘     │ guidelines           │
                          │ is_active            │
                          └──────────────────────┘
```

---

## Status Codes & Meanings

| Code | Meaning | When to Use |
|------|---------|------------|
| `submitted` | Initial submission | Facilitator submits proposal |
| `under_review` | Admin is reviewing | Admin opens proposal for review |
| `rejected_with_feedback` | Needs revision | Admin identifies issues, feedback provided |
| `revised` | Resubmitted after feedback | Facilitator uploads revised version |
| `approved` | Admin approved | Admin scores and approves proposal |
| `approved_final` | Final approval status | Administrative closure |

---

## Quick Reference: Common Commands

```bash
# Database Operations
npx sequelize-cli db:authenticate          # Test DB connection
npx sequelize-cli db:migrate                # Run pending migrations
npx sequelize-cli db:migrate:undo           # Undo last migration
npx sequelize-cli db:migrate:undo:all       # Undo all migrations
npx sequelize-cli db:seed:all               # Run all seeders
npx sequelize-cli db:seed:undo:all          # Undo all seeders

# Generate Files
npx sequelize-cli migration:generate --name migration-name
npx sequelize-cli seed:generate --name seed-name

# Server
npm start                                   # Start server
npm run dev                                 # Start with nodemon
npm test                                    # Run tests
```

---

## Expected File Sizes

After setup, expect:
- `campuses` table: ~300 bytes (3 rows)
- `gad_scoring_criterias` table: ~2 KB (5 rows)
- `gad_proposals` table: Empty (grows with submissions)
- `gad_scores` table: Empty (grows with reviews)
- `gad_proposal_comments` table: Empty (grows with admin feedback)

Total initial size: < 1 MB

---

## Comments System

### Features
- **Admin Comments**: Administrators can add comments to proposals for feedback, questions, suggestions, or issues
- **Facilitator Notifications**: Facilitators can view all comments on their proposals
- **Comment Types**: feedback, question, suggestion, issue
- **Real-time Updates**: Comments display with timestamps and author information
- **Delete Comments**: Authors (admins who created the comment) can delete their own comments
- **Comment Badges**: Proposal cards show the total number of comments for quick reference

### API Endpoints

#### Get Proposal Comments
```bash
curl -X GET http://localhost:8080/api/v1/gad/proposals/{proposalId}/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
{
  "success": true,
  "comments": [
    {
      "id": 1,
      "proposal_id": 1,
      "admin_id": 2,
      "comment_text": "Great proposal with a few suggestions...",
      "comment_type": "feedback",
      "created_at": "2024-04-20T10:30:00Z",
      "updated_at": "2024-04-20T10:30:00Z",
      "admin": {
        "id": 2,
        "name": "Admin User"
      }
    }
  ]
}
```

#### Add Comment (Admin Only)
```bash
curl -X POST http://localhost:8080/api/v1/gad/proposals/{proposalId}/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment_text": "Please revise the language in section 3...",
    "comment_type": "suggestion"
  }'

# Response:
{
  "success": true,
  "comment": {
    "id": 1,
    "proposal_id": 1,
    "admin_id": 2,
    "comment_text": "Please revise the language in section 3...",
    "comment_type": "suggestion",
    "created_at": "2024-04-20T10:30:00Z",
    "updated_at": "2024-04-20T10:30:00Z",
    "admin": {
      "id": 2,
      "name": "Admin User"
    }
  }
}
```

#### Delete Comment (Admin Only - Owner)
```bash
curl -X DELETE http://localhost:8080/api/v1/gad/comments/{commentId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

### Frontend Integration
- Comments are displayed in the proposal details modal for both facilitators and admins
- Facilitators see a refresh button to manually load new comments
- New comments are highlighted with a "NEW" badge and pulsing border
- Comment count badge appears on proposal cards showing total comments
- Notifications appear when comments are successfully added or deleted
- Color-coded comment types for quick visual identification:
  - **Feedback**: Blue
  - **Question**: Purple
  - **Suggestion**: Emerald/Green
  - **Issue**: Red

---

*Database Setup Guide - Version 1.0*
*Last Updated: April 2026*
