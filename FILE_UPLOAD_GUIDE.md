# Proposal File Upload System - Quick Guide

## Overview
Facilitators can now upload supporting documents (PDF/DOCX) for their GAD proposals. Admins can view and download these documents when reviewing proposals.

---

## For Facilitators

### How to Upload a Document

1. **Navigate to Upload Section**
   - Go to sidebar → **GAD Module** → **Upload Document**
   - Or visit: `/facilitator/gad/upload-document`

2. **Select a Proposal**
   - Choose from your submitted proposals in the dropdown
   - View proposal status and current document status

3. **Upload Document**
   - **Drag & drop** a file onto the upload area, OR
   - **Click to browse** and select a file from your computer
   - Supported formats: **PDF**, **DOCX**
   - Maximum file size: **50 MB**

4. **Confirmation**
   - Green success message confirms upload
   - Your proposal will show "Document Uploaded" status
   - Document history updated with timestamp

### Important Notes
- You can upload documents for proposals in any status
- If you upload a new file, it replaces the previous one
- Admins will review your document when evaluating the proposal
- Keep file size under 50 MB for best performance

---

## For Admins

### How to Review Uploaded Documents

1. **View Proposals List**
   - Go to: **Admin Dashboard** → **GAD Module** → **Proposals**
   - All submitted proposals are listed

2. **Open Proposal for Review**
   - Click on a proposal to open the review page
   - You'll see:
     - Proposal title and description
     - **Supporting Document section** (if uploaded)
     - Gender-Fair Language issues
     - Evaluation criteria for scoring

3. **Access the Document**
   - If a document is uploaded, you'll see a **"View Document"** button
   - Click to view document metadata and file details
   - Document info shows: filename, upload date, document key

4. **Review & Score**
   - Evaluate the proposal with the uploaded document in mind
   - Score each evaluation criterion (0 to max points)
   - Add specific comments for each criterion
   - Provide overall feedback and decide: Approve/Reject/Request Revision

5. **Submit Review**
   - Your scores, comments, and feedback are saved
   - Proposal status updates accordingly
   - Facilitator receives notification

---

## API Endpoints

### Upload Document (Facilitator)
```http
POST /api/v1/gad/proposals/:proposal_id/upload-document
Content-Type: multipart/form-data

Body: FormData with 'document' file
Headers: Authorization: Bearer <JWT_TOKEN>

Response: {
  success: true,
  message: "Document uploaded successfully",
  file: {
    key: "gad-documents/123/file_timestamp_filename.pdf",
    name: "HGDG_Proposal.pdf",
    size: 256000,
    mimeType: "application/pdf",
    uploadedAt: "2024-01-15T10:30:00Z"
  }
}
```

### Download/View Document (Admin)
```http
GET /api/v1/gad/proposals/:proposal_id/download-document
Headers: Authorization: Bearer <JWT_TOKEN>

Response: {
  success: true,
  document: {
    fileKey: "gad-documents/123/file_timestamp_filename.pdf",
    uploadedAt: "2024-01-15T10:30:00Z",
    proposal: {
      id: 123,
      title: "Proposal Title",
      submittedBy: 5
    }
  }
}
```

---

## File Upload Flow

```
┌─────────────────────────┐
│   Facilitator Account   │
└────────────┬────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │  Upload Document Page      │
    │  (Select Proposal & File)  │
    └──────────┬─────────────────┘
               │
               ▼
      ┌──────────────────────┐
      │  File Validation     │
      │  - Type: PDF/DOCX    │
      │  - Size: < 50MB      │
      └──────────┬───────────┘
                 │
                 ▼
      ┌──────────────────────────────┐
      │  Upload to Backend           │
      │  POST /proposals/:id/upload   │
      └──────────┬───────────────────┘
                 │
                 ▼
      ┌──────────────────────────────┐
      │  Store File Key in DB        │
      │  (proposal.file_key)         │
      └──────────┬───────────────────┘
                 │
                 ▼
      ┌──────────────────────────────┐
      │ Success: Document Uploaded   │
      └──────────┬───────────────────┘
                 │
                 ▼
      ┌──────────────────────────────┐
      │    Admin Review Proposal     │
      │  - View Uploaded Document    │
      │  - Evaluate & Score          │
      │  - Provide Feedback          │
      └──────────────────────────────┘
```

---

## Database Schema

### Proposal Table - File Support
```sql
-- GAD Proposals Table
CREATE TABLE gad_proposals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  campus_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  file_key VARCHAR(500),           -- ← Document storage key
  status ENUM(...),
  gfl_issues JSON,
  admin_feedback TEXT,
  reviewed_by INT,
  reviewed_date DATETIME,
  submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

---

## File Storage Architecture

### Current Implementation
- File metadata (key, name, size) stored in database
- **Actual files ready for Cloudflare R2 integration** (when R2 credentials configured)

### Directory Structure (When Using Cloudflare R2)
```
gad-documents/
├── 1/
│   ├── 1_1642256400000_HGDG_Proposal_2024.pdf
│   └── 1_1642256500000_HGDG_Revised.pdf
├── 2/
│   └── 2_1642257000000_Gender_Response_Plan.docx
└── 3/
    └── 3_1642257500000_Proposal_Revision.pdf
```

---

## Troubleshooting

### Upload Fails with "Invalid file type"
- Check: Only PDF and DOCX files are supported
- Solution: Convert file to PDF or Word format

### Upload Fails with "File is too large"
- Check: File size limit is 50 MB
- Solution: Compress or split large files

### Admin Can't See Document
- Check: Verify facilitator successfully uploaded file (shows "Document Uploaded" status)
- Check: Refresh the review page
- Check: Ensure admin is logged in with proper permissions

### File Won't Download
- Current: Document metadata is shown (production feature)
- Future: When Cloudflare R2 configured, full file download will work
- Workaround: Contact system administrator to retrieve file

---

## Security & Permissions

| User Type | Action | Allowed |
|-----------|--------|---------|
| Facilitator | Upload to own proposal | ✅ Yes |
| Facilitator | Upload to others' proposals | ❌ No (403 Forbidden) |
| Facilitator | Download own documents | ✅ Yes (via API) |
| Admin | View any proposal document | ✅ Yes |
| Admin | Download proposal documents | ✅ Yes |
| Admin | Upload documents | ❌ No (not admin feature) |
| Guest | Access upload page | ❌ No (requires login) |

---

## File Naming Convention

Uploaded files are stored with auto-generated keys:
```
gad-documents/{proposal_id}/{proposal_id}_{timestamp}_{original_filename}
```

Example:
```
gad-documents/123/123_1642256400000_MyProposal.pdf
gad-documents/123/123_1642256500000_MyProposal_Revised.pdf
```

Benefits:
- Unique identifiers per proposal
- Timestamp prevents filename collisions
- Original filename preserved for reference
- Easy to organize and track versions

---

## Performance Considerations

- **File Upload**: Direct to backend (no S3/Cloudflare required for initial deployment)
- **File Metadata**: Stored in database for instant access
- **Concurrent Uploads**: Supported (FormData multipart)
- **Database Storage**: Only metadata stored (~500 bytes per file)
- **Disk Storage**: Depends on Cloudflare R2 configuration

---

## Next Steps / Enhancements

- [ ] Integrate Cloudflare R2 for actual file storage
- [ ] Add file versioning (track multiple uploads per proposal)
- [ ] Implement file preview (PDF/DOCX in-browser viewer)
- [ ] Add admin download functionality for full files
- [ ] Email notifications when document uploaded/reviewed
- [ ] Archive documents after proposal approval
- [ ] Add file storage quota per user/campus

---

## Support & Questions

For issues with file uploads:
1. Check file type and size
2. Verify proposal is selectable
3. Check browser console for detailed errors
4. Contact admin: admin@institution.edu

---

*File Upload System - Version 1.0*  
*Last Updated: April 2026*
