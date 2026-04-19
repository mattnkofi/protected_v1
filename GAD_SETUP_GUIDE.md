# GAD Compliance Module - Complete Setup & Implementation Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Configuration](#database-configuration)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)

---

## System Overview

The GAD Compliance Module includes:
- **Gender-Fair Language (GFL) Analysis**: Real-time text analysis to flag non-inclusive terminology
- **Proposal Submission Workflow**: Facilitators submit GAD proposals with language analysis
- **Admin Review System**: Admins review proposals using weighted criteria scoring
- **Document Upload**: Facilitators can upload HGDG files with proposals
- **Multi-Campus Support**: Track proposals across multiple campuses
- **Dashboard & Analytics**: Admin statistics and proposal tracking

### Key Components

**Backend Models:**
- `Campus` - Multi-campus support (Main, North, South)
- `GADProposal` - Proposal submissions with status workflow
- `GADScoringCriteria` - Evaluation framework with weights
- `GADScore` - Individual criterion scores

**Services:**
- `GenderFairLanguageService` - Language analysis with 70+ flagged terms
- `FileStorageService` - Document upload/storage (uses existing FileUploadMiddleware)

---

## Backend Setup

### 1. Environment Variables
Ensure your `.env` file contains:
```env
# Database
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# File Storage (Cloudflare R2)
CLOUDFLARE_BUCKET=your-bucket
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_key

# Server
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret
```

### 2. Create Database Tables

Run Sequelize migrations:
```bash
cd backend

# Generate migrations for GAD models (if not already created)
npx sequelize-cli migration:generate --name create-campus-table
npx sequelize-cli migration:generate --name create-gad-proposal-table
npx sequelize-cli migration:generate --name create-gad-scoring-criteria-table
npx sequelize-cli migration:generate --name create-gad-score-table

# Run migrations
npx sequelize-cli db:migrate
```

**Migration Files Content:**

**Create Campus Table** (`migrations/XXXXXXX-create-campus-table.js`):
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

**Create GAD Proposal Table** (`migrations/XXXXXXX-create-gad-proposal-table.js`):
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
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('gad_proposals');
  }
};
```

**Create GAD Scoring Criteria Table** (`migrations/XXXXXXX-create-gad-scoring-criteria-table.js`):
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

**Create GAD Score Table** (`migrations/XXXXXXX-create-gad-score-table.js`):
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
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('gad_scores');
  }
};
```

### 3. Seed Default Data

Create seeder file: `seeders/XXXXXXX-seed-gad-data.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Create campuses
    await queryInterface.bulkInsert('campuses', [
      { name: 'Main Campus', code: 'MAIN', location: 'Central City', is_active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'North Campus', code: 'NORTH', location: 'North District', is_active: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'South Campus', code: 'SOUTH', location: 'South District', is_active: true, createdAt: new Date(), updatedAt: new Date() }
    ], {});

    // Create scoring criteria
    await queryInterface.bulkInsert('gad_scoring_criterias', [
      {
        criteria_name: 'Language Inclusivity',
        description: 'Uses gender-fair and inclusive language throughout',
        max_points: 25,
        weight: 1.5,
        guidelines: { "excellent": "No gendered terms, uses inclusive pronouns", "poor": "Frequent gendered language" },
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        criteria_name: 'Gender Sensitivity',
        description: 'Demonstrates awareness of gender-specific impacts',
        max_points: 25,
        weight: 1.5,
        guidelines: { "excellent": "Addresses gender-specific challenges and solutions", "poor": "Ignores gender dimensions" },
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        criteria_name: 'Equity & Access',
        description: 'Ensures equitable access and participation',
        max_points: 20,
        weight: 1.3,
        guidelines: { "excellent": "Clear focus on equity for all genders", "poor": "No equity considerations" },
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        criteria_name: 'Implementation Feasibility',
        description: 'Realistic and achievable proposal timeline',
        max_points: 15,
        weight: 1.0,
        guidelines: { "excellent": "Detailed, achievable timeline", "poor": "Vague or unrealistic timeline" },
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        criteria_name: 'Monitoring & Evaluation',
        description: 'Clear metrics to measure success',
        max_points: 15,
        weight: 1.2,
        guidelines: { "excellent": "Specific KPIs and evaluation methods", "poor": "No evaluation framework" },
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('gad_scoring_criterias', null, {});
    await queryInterface.bulkDelete('campuses', null, {});
  }
};
```

Run seeder:
```bash
npx sequelize-cli db:seed:all
```

### 4. Verify Backend Setup

```bash
# Start the backend server
cd backend
npm install
npm start

# Test API endpoints
curl http://localhost:3000/api/v1/gad/campuses
curl http://localhost:3000/api/v1/gad/scoring-criteria
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. API Configuration

Ensure your API base URL is configured in `frontend/src/utils/api.js`:

```javascript
const baseURL = process.env.VITE_API_URL || 'http://localhost:3000/api/v1';
```

Add to `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Router Configuration

Routes are already added to:
- `frontend/src/router/authenticatedPages/admin_pages.js`
- `frontend/src/router/authenticatedPages/facilitator_pages.js`

### 4. Component Files Created

**Components:**
- `src/components/gad/GADSubmitProposal.vue` - Facilitator submission form
- `src/components/gad/GADProposalList.vue` - Browse proposals
- `src/components/gad/GADLanguageAnalyzer.vue` - Standalone analyzer
- `src/components/gad/GADDashboard.vue` - Admin overview
- `src/components/gad/GADReviewProposal.vue` - Admin scoring
- `src/components/gad/GADDocumentUpload.vue` - File upload interface

**Views:**
- `src/views/gad/` - View wrappers for above components
- `src/views/admin/` - Admin-specific views
- `src/views/GADLanguageAnalyzer.vue` - Shared analyzer view

### 5. Sidebar Integration

Menu items added to:
- **AdminSidebar.vue**: GAD Compliance section with Dashboard, Proposals, Language Check
- **FacilitatorSidebar.vue**: GAD Module section with Submit, My Proposals, Upload Document, Language Check

---

## Database Configuration

### Tables Overview

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `campuses` | Campus information | id, name, code, location, is_active |
| `gad_proposals` | Proposal submissions | id, user_id, campus_id, title, status, file_key |
| `gad_scoring_criterias` | Evaluation criteria | id, criteria_name, max_points, weight |
| `gad_scores` | Individual criterion scores | id, proposal_id, criteria_id, points_awarded |

### Relationships

```
User (1) ──→ (M) GADProposal
Campus (1) ──→ (M) GADProposal
GADProposal (1) ──→ (M) GADScore
GADScoringCriteria (1) ──→ (M) GADScore
User (1) ──→ (M) GADScore (as evaluator)
```

---

## Testing & Verification

### 1. Test Backend API

```bash
# Get campuses
curl -X GET http://localhost:3000/api/v1/gad/campuses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get scoring criteria
curl -X GET http://localhost:3000/api/v1/gad/scoring-criteria \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test language analysis
curl -X POST http://localhost:3000/api/v1/gad/analyze-language \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "The chairman and his team discussed the proposal"}'

# Submit a proposal
curl -X POST http://localhost:3000/api/v1/gad/proposals/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Proposal",
    "description": "This is a test proposal with inclusive language",
    "campus_id": 1
  }'
```

### 2. Test Frontend

```bash
# Start frontend dev server
cd frontend
npm run dev

# Navigate to:
# - Facilitator: /facilitator/gad/submit
# - Facilitator: /facilitator/gad/proposals
# - Facilitator: /facilitator/gad/upload-document
# - Facilitator: /facilitator/gad/language-analyzer
# - Admin: /admin/gad/dashboard
# - Admin: /admin/gad/proposals
# - Admin: /admin/gad/language-analyzer
```

### 3. Complete Workflow Test

**As Facilitator:**
1. Navigate to "Submit Proposal" (via sidebar or /facilitator/gad/submit)
2. Fill in title and description with sample text
3. Select a campus
4. Observe real-time GFL analysis
5. Submit the proposal
6. Navigate to "My Proposals" to see submitted proposal
7. Go to "Upload Document" tab
8. Select the proposal from dropdown
9. Upload a PDF or DOCX file (HGDG sample)
10. Verify upload success

**As Admin:**
1. Navigate to "GAD Dashboard" (/admin/gad/dashboard)
2. View statistics: Total, Approved, Pending, Rejected counts
3. See "Pending Review" proposals list
4. Click on a proposal to review details
5. Go to "Proposals" tab and find the proposal
6. Click "Review" button
7. Review proposal details and GFL issues
8. Score each criterion using sliders
9. Add admin feedback
10. Submit review and update status

---

## Features Deep Dive

### Language Analyzer Improvements

The improved `GenderFairLanguageService` now includes:

**✅ What's Fixed:**
- Regex escaping for special characters
- Position-based duplicate removal (longest terms first)
- Context-aware pronoun detection
- Reduced false positives

**Issues Detected:**
1. **Gendered Terms** (70+ flagged): chairman, spokesman, manpower, businesswoman, etc.
2. **Generic Pronouns** (context-sensitive): "his", "he" in universal contexts
3. **Compound Phrases**: "chairman" in "chairmanship", "man" in "management"

**Severity Levels:**
- `high`: "chairman", "spokesman", "manpower"
- `medium`: "businessman", "policeman", "stewardess"
- `low`: Generic pronouns in specific contexts

### Document Upload

**Supported Formats:** PDF, DOCX (max 50MB)

**Workflow:**
1. Facilitator selects proposal from list
2. Chooses PDF/DOCX file via drag-drop or file picker
3. File validated (type, size)
4. Uploaded to server with multipart/form-data
5. File key stored in `gad_proposals.file_key`
6. Admin can access document during review

**Storage Options:**
- Current: Local file storage (update to Cloudflare R2 as needed)
- File key format: `gad-documents/{proposal_id}/{timestamp}_{filename}`

### Proposal Workflow

```
SUBMITTED → UNDER_REVIEW → {
  REJECTED_WITH_FEEDBACK → REVISED → UNDER_REVIEW → ...
  APPROVED → APPROVED_FINAL
}
```

**Statuses:**
- `submitted`: Initial submission by facilitator
- `under_review`: Admin is reviewing
- `rejected_with_feedback`: Admin feedback provided, revision needed
- `revised`: Facilitator resubmitted after feedback
- `approved`: Admin approved the proposal
- `approved_final`: Final approval status

### Scoring System

**Weighted Criteria (100 total points):**
1. Language Inclusivity (25 pts, weight 1.5)
2. Gender Sensitivity (25 pts, weight 1.5)
3. Equity & Access (20 pts, weight 1.3)
4. Implementation Feasibility (15 pts, weight 1.0)
5. Monitoring & Evaluation (15 pts, weight 1.2)

**Weighted Score Calculation:**
```
Weighted Score = Σ(points_awarded × weight) / Σ(max_points × weight) × 100
```

---

## Troubleshooting

### Backend Issues

**Problem: Database migration fails**
```bash
# Solution: Check database credentials
npx sequelize-cli db:authenticate

# Rollback and retry
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

**Problem: API returns 404 for /gad routes**
```bash
# Solution: Verify routes are imported in app.js
# Check: backend/src/app.js has:
const gadRoutes = require('./router/GADRoutes');
app.use('/api/v1/gad', gadRoutes);
```

**Problem: Authentication fails on endpoints**
```bash
# Solution: Verify JWT token is passed in Authorization header
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/v1/gad/campuses
```

### Frontend Issues

**Problem: Language analyzer not showing results**
```
1. Check browser console for API errors
2. Verify VITE_API_URL is set correctly
3. Ensure backend is running on correct port
4. Check CORS settings in backend
```

**Problem: File upload fails**
```
1. Verify FileUploadMiddleware is imported in app.js
2. Check file size < 50MB
3. Verify file format is PDF or DOCX
4. Check multipart/form-data header is set
```

**Problem: Routes not accessible**
```
1. Verify user is authenticated
2. Check role-based access (facilitator vs admin)
3. Clear browser cache and reload
4. Check router configuration in authenticatedPages/
```

### Common Error Messages

| Error | Solution |
|-------|----------|
| "Unauthorized: You do not own this proposal" | Ensure you're logged in with correct user account |
| "Campus not found" | Verify campus_id exists in database |
| "File is too large" | Keep file under 50MB |
| "Invalid file type" | Upload only PDF or DOCX files |
| "Proposal not found" | Verify proposal_id exists and belongs to user |

---

## Next Steps

1. ✅ **Database Setup** - Create tables and seed data
2. ✅ **Backend Testing** - Test all API endpoints
3. ✅ **Frontend Testing** - Test all views and components
4. ✅ **Integration Testing** - Complete end-to-end workflow
5. ✅ **Production Deployment** - Deploy to production environment

---

## Support & Documentation

For additional help:
- Check browser console for error messages
- Review backend logs: `npm run dev` output
- Test API endpoints using Postman or curl
- Verify database tables using MySQL client

**API Documentation**: All endpoints documented in `backend/src/router/GADRoutes.js`

**Component Documentation**: Each Vue component has JSDoc comments explaining props, events, and methods.

---

*GAD Compliance Module - Version 1.0*
*Last Updated: 2024*
