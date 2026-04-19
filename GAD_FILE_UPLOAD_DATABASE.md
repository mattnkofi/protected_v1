# GAD Proposal File Upload - Database Integration

## Implementation Overview

The GAD proposal file upload now uses the same **FileStorageService** pattern as the modules system. This means files are actually uploaded to Cloudflare R2 (or local storage), not just metadata stored.

---

## How It Works

### 1. **Facilitator Uploads File**
```
Facilitator selects file (PDF/DOCX)
    ↓
Frontend validates (type, size)
    ↓
Frontend sends to: POST /api/v1/gad/proposals/{id}/upload-document
    ↓
Backend middleware validates again
    ↓
FileStorageService processes & uploads file
    ↓
File key stored in database
    ↓
Success response with download URL
```

### 2. **File Storage Structure**
```
Cloudflare R2 Bucket:
├── gad-documents/
│   ├── 1/
│   │   ├── document/
│   │   │   ├── 1710234567890-abc123.pdf
│   │   │   └── 1710234667890-def456.docx
│   ├── 2/
│   │   └── document/
│   │       └── 1710234767890-ghi789.pdf
```

**Key Format:** `gad-documents/{proposalId}/document/{timestamp}-{hash}.{ext}`

---

## Backend Implementation

### FileStorageService - New uploadDocument Method
```javascript
async uploadDocument(fileBuffer, proposalId, documentType, mimetype, originalFilename, options = {})
```

**What it does:**
- ✅ Validates file type (PDF, DOCX, images)
- ✅ Processes files (compresses images if needed)
- ✅ Generates unique key with timestamp
- ✅ Uploads to Cloudflare R2
- ✅ Returns: key, URL, size, uploadedAt timestamp

**Returns:**
```javascript
{
    key: "gad-documents/1/document/1710234567890-abc123.pdf",
    url: "https://r2.yourdomain.com/gad-documents/1/document/1710234567890-abc123.pdf",
    size: 256000,
    contentType: "application/pdf",
    uploadedAt: "2024-03-12T10:30:00.000Z"
}
```

### GADController - Updated Methods

**uploadProposalDocument:**
```javascript
// 1. Validate proposal ownership
// 2. Call FileStorageService.uploadDocument()
// 3. Store file_key in proposal.file_key
// 4. Return upload result with download URL
```

**downloadProposalDocument:**
```javascript
// 1. Get proposal with file_key
// 2. Construct public URL from file_key
// 3. Return URL for downloading from R2
```

---

## Database Changes

### GADProposal Table - file_key Column
```sql
file_key VARCHAR(500)
-- Stores: gad-documents/1/document/1710234567890-abc123.pdf
```

**Example Data:**
| id | user_id | title | file_key |
|----|---------|-------|----------|
| 1 | 5 | Gender Initiative | gad-documents/1/document/1710234567890-abc123.pdf |
| 2 | 7 | Equity Program | gad-documents/2/document/1710234667890-def456.docx |

---

## API Endpoints

### Upload Document
```http
POST /api/v1/gad/proposals/{proposal_id}/upload-document
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body: FormData with 'document' file

Response (200):
{
  "success": true,
  "message": "Document uploaded successfully",
  "file": {
    "key": "gad-documents/1/document/1710234567890-abc123.pdf",
    "url": "https://r2.yourdomain.com/gad-documents/1/document/1710234567890-abc123.pdf",
    "name": "HGDG_Proposal.pdf",
    "size": 256000,
    "mimeType": "application/pdf",
    "uploadedAt": "2024-03-12T10:30:00.000Z"
  }
}
```

### Download Document
```http
GET /api/v1/gad/proposals/{proposal_id}/download-document
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "document": {
    "fileKey": "gad-documents/1/document/1710234567890-abc123.pdf",
    "downloadUrl": "https://r2.yourdomain.com/gad-documents/1/document/1710234567890-abc123.pdf",
    "uploadedAt": "2024-03-12T10:30:00.000Z",
    "proposal": {
      "id": 1,
      "title": "Gender Initiative",
      "submittedBy": 5
    }
  }
}
```

---

## File Upload Flow (Step by Step)

### Frontend (Vue Component)
```javascript
// 1. User selects file
const file = event.target.files[0];

// 2. Validate locally
if (file.size > 50*1024*1024) reject "Too large";
if (!['pdf','docx'].includes(ext)) reject "Invalid type";

// 3. Create FormData
const formData = new FormData();
formData.append('document', file);

// 4. Send to backend
const response = await axios.post(
    `/api/v1/gad/proposals/${proposalId}/upload-document`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
);

// 5. Handle response
successMessage.value = response.data.message;
// File URL available at: response.data.file.url
```

### Backend (Node.js)
```javascript
// 1. Middleware validates file
//    - Type: PDF, DOCX only
//    - Size: max 50MB
//    - Non-null

// 2. Controller receives request
//    - Verify proposal exists
//    - Verify user owns proposal

// 3. FileStorageService uploads
const uploadResult = await fileStorageService.uploadDocument(
    req.file.buffer,
    proposal_id,
    'document',
    req.file.mimetype,
    req.file.originalname,
    { userId }
);

// 4. Save to database
await proposal.update({
    file_key: uploadResult.key  // "gad-documents/1/document/..."
});

// 5. Return response with download URL
return { file: { 
    key: uploadResult.key,
    url: uploadResult.url,  // https://r2.yourdomain.com/...
    ...
}}
```

---

## Configuration Required

### Environment Variables (.env)
```env
# Cloudflare R2
R2_ENDPOINT=https://[account-id].r2.cloudflarestorage.com
R2_BUCKET_NAME=your-bucket-name
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key

# Public URL for accessing files
R2_PUBLIC_URL=https://r2.yourdomain.com
# OR
WORKER_URL=https://files.yourdomain.com
```

### File Upload Middleware
```javascript
// backend/src/middleware/FileUploadMiddleware.js
const upload = multer({ 
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Used in routes:
router.post(
    '/proposals/:proposal_id/upload-document',
    authenticate,
    upload.single('document'),  // ← expects 'document' field
    gadController.uploadProposalDocument
);
```

---

## Frontend Component - GADProposalManager.vue

The component already handles:
- ✅ Drag-drop file selection
- ✅ File validation (type & size)
- ✅ Upload progress tracking
- ✅ Success/error messaging
- ✅ File preview before upload
- ✅ Document history display

**Upload method:**
```javascript
const uploadDocument = async (proposalId) => {
    const file = pendingFiles.value[proposalId];
    const formData = new FormData();
    formData.append('document', file);

    const response = await axios.post(
        `/api/v1/gad/proposals/${proposalId}/upload-document`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    // Show download URL if available
    if (response.data.file.url) {
        console.log('Download at:', response.data.file.url);
    }
};
```

---

## Security Features

✅ **Authorization:** Only proposal owner can upload
✅ **File Validation:** Type & size checked twice (frontend + backend)
✅ **MIME Type Check:** Prevents executable files
✅ **Size Limits:** 50MB maximum per file
✅ **User Tracking:** Upload tracked with userId
✅ **Unique Keys:** Timestamp + hash prevents collisions
✅ **Database Integrity:** File key stored with proposal

---

## Integration with Admin Review

When admin reviews a proposal:

1. **Admin sees:** "Document Uploaded" status
2. **Admin can:** Download file using download URL
3. **Admin scores:** With document in context
4. **Admin feedback:** Stored in admin_feedback field

**Admin Review Component:**
```javascript
// Shows document if file_key exists
if (proposal.file_key) {
    <div>Document: {{ proposal.file_key.split('/').pop() }}</div>
    <a :href="downloadUrl">Download Document</a>
}
```

---

## Testing Upload

### With Curl
```bash
curl -X POST http://localhost:8080/api/v1/gad/proposals/1/upload-document \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "document=@/path/to/file.pdf"

# Response includes:
# {
#   "success": true,
#   "file": {
#     "key": "gad-documents/1/document/1710234567890-abc123.pdf",
#     "url": "https://r2.yourdomain.com/...",
#     ...
#   }
# }
```

### With Frontend UI
1. Go to: `/facilitator/gad/manage`
2. Submit a proposal
3. See it in your proposals list
4. Drag-drop a PDF/DOCX file
5. Click "Upload Document"
6. See success message with file status

---

## File Size & Performance

| Component | Size | Notes |
|-----------|------|-------|
| Single PDF | < 25MB | Typical proposal document |
| Single DOCX | < 10MB | MS Word document |
| R2 Bucket | Unlimited | Scales automatically |
| Database | ~500 bytes | Only stores file key |
| Upload Time | ~1-5 sec | Depends on file size & network |

---

## Troubleshooting

### Upload Fails: "Invalid file type"
- ✅ Solution: Only PDF and DOCX supported
- Check file extension and MIME type

### Upload Fails: "File too large"
- ✅ Solution: Max 50MB per file
- Compress large PDFs before uploading

### Download URL 404
- ✅ Check: R2_PUBLIC_URL configured in .env
- ✅ Check: File exists in R2 bucket
- ✅ Check: Permissions on bucket allow public read

### File Not in Database
- ✅ Check: FileStorageService upload succeeded
- ✅ Check: file_key saved to proposal.file_key
- Run: SELECT * FROM gad_proposals WHERE file_key IS NOT NULL;

---

## Summary

| Feature | Before | After |
|---------|--------|-------|
| File Upload | Metadata only | Full file in R2 + metadata in DB |
| Storage | Database only | Cloudflare R2 |
| Download URL | N/A | Available in response |
| File Limit | 50MB (frontend only) | 50MB enforced (backend middleware) |
| Uniqueness | Filename only | Timestamp + hash |
| Admin Access | File key only | Download URL + file access |

---

*Database File Upload Integration - Version 1.0*  
*Last Updated: April 2026*
*Status: Production Ready*
