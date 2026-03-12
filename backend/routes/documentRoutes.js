const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocumentStatus,
  deleteDocument,
  getProcessingJobStatus,
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { validateDocumentStatus } = require('../utils/validators');
const upload = require('../config/multer');

// All routes are protected
router.use(protect);

// Upload a document
router.post('/upload', upload.single('file'), uploadDocument);

// Get all documents
router.get('/', getDocuments);

// Get, update, and delete a document by ID
router.route('/:id')
  .get(getDocumentById)
  .delete(deleteDocument);

// Update document status
router.put('/:id/status', validate(validateDocumentStatus), updateDocumentStatus);

// Get processing job status
router.get('/:id/job', getProcessingJobStatus);

module.exports = router; 