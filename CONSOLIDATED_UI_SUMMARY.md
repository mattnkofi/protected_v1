# GAD Module - Consolidated UI Summary

## What Changed

### 📦 **Single Sidebar Icon**
The GAD Module now has **just 2 sidebar items** instead of 4:

**Old Navigation:**
- Submit Proposal
- My Proposals  
- Upload Document
- Language Check

**New Navigation:**
- **My Proposals** (✨ NEW - consolidated manager)
- **Language Check** (unchanged)

---

## 🎯 **My Proposals Interface** (Consolidated)

One unified page where facilitators can:

### 1. **Submit New Proposal**
- Select campus
- Enter title and description
- **Real-time language analysis** (shows issues as you type)
- Submit button (automatic analysis included)

### 2. **Manage Your Proposals**
Each proposal card shows:
- **Title & Description**
- **Status** (Submitted, Under Review, Approved, etc.)
- **Submission Date**
- **Document Upload Area**
  - Drag-drop zone
  - File validation (PDF/DOCX, max 50MB)
  - Current document status
  - Upload button
- **Admin Feedback** (if reviewed)

### 3. **File Storage**
Files are stored in database with:
- **Key Format**: `gad-documents/{proposal_id}/{timestamp}_{filename}`
- **Example**: `gad-documents/5/5_1642256400000_HGDG_Plan.pdf`
- **Ready for**: Cloudflare R2 integration

---

## 📍 **Routes Updated**

### Facilitator Routes
```
/facilitator/gad/manage          ← NEW: Consolidated proposal manager
/facilitator/gad/language-analyzer  ← Keep: Text analyzer
```

### Admin Routes (unchanged)
```
/admin/gad/dashboard             ← View all proposals
/admin/gad/proposals             ← List to review
/admin/gad/proposals/:id/review  ← Review & score proposals
```

---

## 💾 **Database Storage**

### Proposal Table - File Column
```sql
file_key VARCHAR(500)
-- Stores: gad-documents/{proposal_id}/{timestamp}_{filename}
```

### Example Data Flow
1. **Facilitator uploads PDF** → `HGDG_Plan.pdf`
2. **System creates key** → `gad-documents/5/5_1642256400000_HGDG_Plan.pdf`
3. **Stores in DB** → proposal.file_key = key
4. **Admin views** → Shows filename and upload date
5. **Admin can download** → File metadata available

---

## 🔄 **Complete User Flow**

### Facilitator
```
Sidebar: My Proposals
    ↓
Submit New Proposal Form
    ↓
View Your Proposals List
    ↓
Upload Document (Drag-Drop)
    ↓
See Upload Status ✓
    ↓
Admin Reviews
    ↓
Receive Feedback
```

### Admin
```
Sidebar: GAD Dashboard
    ↓
View All Proposals
    ↓
Click to Review
    ↓
See Proposal + Document
    ↓
Score & Provide Feedback
    ↓
Submit Review
    ↓
Facilitator Gets Feedback
```

---

## 🚀 **Key Features**

✅ **Single Icon for All Proposal Management**
- No need to switch between submit/upload/view pages
- Everything in one place

✅ **Inline Document Upload**
- Upload while viewing proposal status
- Upload multiple documents over time
- See upload history

✅ **Real-Time Language Analysis**
- As you type proposal, get instant feedback
- See problematic terms highlighted
- Fix issues before submitting

✅ **Database Storage**
- File metadata stored in proposal.file_key
- Document status visible to facilitator
- Admin can view document info during review

✅ **Simplified Navigation**
- 2 items per user role
- Clear separation: Management vs Analysis

---

## 📋 **Files Modified**

**Frontend Components:**
- ✨ `components/gad/GADProposalManager.vue` - **NEW: Consolidated component**
- ✨ `views/gad/GADProposalManager.vue` - **NEW: Wrapper view**
- `components/facilitator/FacilitatorSidebar.vue` - Updated routes & icons
- `components/gad/GADReviewProposal.vue` - Already shows documents
- `router/authenticatedPages/facilitator_pages.js` - Consolidated routes

**Backend (No changes needed):**
- `controller/GADController.js` - Already supports file upload
- `model/GADProposal.js` - Already has file_key column
- Routes - Already working

---

## 📦 **Component Props & Methods**

### GADProposalManager.vue
**Data:**
- `newProposal` - Form for new submission
- `proposals` - List of user's proposals
- `campuses` - Available campuses
- `pendingFiles` - Files ready to upload per proposal
- `uploading` - Upload status per proposal

**Methods:**
- `submitProposal()` - Submit new proposal
- `uploadDocument(proposalId)` - Upload file
- `analyzePreview()` - Real-time language check
- `handleFileSelect()` - File input handler
- `handleDrop()` - Drag-drop handler

---

## 🎨 **UI Layout**

```
┌─────────────────────────────────────┐
│         My Proposals                │
│  (Submit, Upload, View, Manage)     │
├─────────────────────────────────────┤
│                                     │
│  📝 Submit New Proposal Section      │
│  ├─ Campus Dropdown                 │
│  ├─ Title Input                     │
│  ├─ Description Textarea            │
│  ├─ 🔍 Real-time Language Preview   │
│  └─ [Submit Proposal]               │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Your Proposals (List)              │
│  ├─ Proposal 1                      │
│  │  ├─ Status: Submitted ✓          │
│  │  ├─ 📄 Drag-Drop Upload Area     │
│  │  ├─ [Upload Button]              │
│  │  └─ Admin Feedback (if any)      │
│  │                                  │
│  ├─ Proposal 2                      │
│  │  ├─ Status: Under Review         │
│  │  ├─ 📄 Document: HGDG_Plan.pdf ✓ │
│  │  └─ Admin Feedback: (pending)    │
│  │                                  │
│  └─ Proposal 3 ...                  │
│                                     │
└─────────────────────────────────────┘
```

---

## ⚡ **Performance Notes**

- **Single component** reduces loading overhead
- **Real-time analysis** debounced on description change
- **Drag-drop interface** improves UX
- **Database storage only** (metadata, not files)
- **File validation** before upload (prevents bad requests)

---

## 🔐 **Security**

✅ **Authorization checks:**
- Only proposal owner can upload
- Only admins can review
- File size limits enforced (50MB)
- File type validation (PDF/DOCX only)

✅ **Data integrity:**
- File key stored with proposal
- Timestamp prevents filename collisions
- Proposal ID in path for quick validation

---

## 🎯 **Status at a Glance**

| Feature | Status | Details |
|---------|--------|---------|
| Consolidated UI | ✅ Done | Single page for submit + upload + view |
| Database Storage | ✅ Done | file_key column, ready to store |
| File Upload API | ✅ Done | POST /api/v1/gad/proposals/:id/upload-document |
| File Download API | ✅ Done | GET /api/v1/gad/proposals/:id/download-document |
| Admin Review | ✅ Done | Shows document in review page |
| Sidebar Navigation | ✅ Done | Reduced to 2 items for GAD module |
| Real-time Analysis | ✅ Done | Language check as user types |

---

## 🚀 **Ready to Use**

The consolidated interface is **production-ready**. Facilitators can:
1. Click **My Proposals** in sidebar
2. Submit a new proposal
3. Upload documents right below each proposal
4. See admin feedback when reviews are done

All files are stored in the database with full metadata for tracking.

---

*Consolidated UI Update - Version 2.0*  
*Last Updated: April 2026*
