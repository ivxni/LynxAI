const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const processingService = require('../services/processingService');
const subscriptionService = require('../services/subscriptionService');

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Get processing type from request
  const processingType = req.body.processingType || 'ocr';
  
  // Validate processing type
  const validProcessingTypes = [
    'ocr', 'pdf_convert', 'document_scan', 'multi_page_pdf',
    'image_enhance', 'qr_barcode_scan', 'table_extract',
    'handwriting_ocr', 'ocr_translate', 'document_classify'
  ];
  
  if (!validProcessingTypes.includes(processingType)) {
    res.status(400);
    throw new Error(`Invalid processing type: ${processingType}`);
  }

  // Check if user has reached document limit
  let subscriptionCheck;
  try {
    subscriptionCheck = await subscriptionService.canProcessDocument(req.user._id);
    
    if (!subscriptionCheck.canProcess) {
      res.status(403);
      throw new Error(`Document limit reached (${subscriptionCheck.usedDocuments}/${subscriptionCheck.totalDocuments}). Please upgrade to premium for more documents.`);
    }
  } catch (error) {
    res.status(403);
    throw new Error(error.message || 'Unable to process document due to subscription limits.');
  }

  // Check if processing type is allowed for user's subscription
  const userPlan = subscriptionCheck.plan;
  const premiumOnlyTypes = [
    'document_scan', 'multi_page_pdf', 'image_enhance', 
    'qr_barcode_scan', 'table_extract', 'handwriting_ocr', 
    'ocr_translate', 'document_classify'
  ];
  
  if (premiumOnlyTypes.includes(processingType) && userPlan === 'free') {
    res.status(403);
    throw new Error(`Processing type '${processingType}' requires a premium subscription.`);
  }

  console.log(`Creating document with processing type: ${processingType}`);

  // Get processing options from request body
  const processingOptions = {};
  if (req.body.language) processingOptions.language = req.body.language;
  if (req.body.targetLanguage) processingOptions.targetLanguage = req.body.targetLanguage;
  if (req.body.sourceLanguage) processingOptions.sourceLanguage = req.body.sourceLanguage;
  if (req.body.pageSize) processingOptions.pageSize = req.body.pageSize;
  if (req.body.orientation) processingOptions.orientation = req.body.orientation;
  if (req.body.quality) processingOptions.quality = req.body.quality;

  // Create document record
  const document = await Document.create({
    userId: req.user._id,
    originalFileName: req.file.originalname,
    originalFileType: req.file.mimetype,
    originalFileSize: req.file.size,
    originalFileUrl: `/uploads/${req.user._id}/${req.file.filename}`,
    processingType: processingType,
    processingOptions: processingOptions,
    status: 'pending',
  });

  // Create processing job
  const processingJob = await ProcessingJob.create({
    documentId: document._id,
    userId: req.user._id,
    processingType: processingType,
    status: 'pending',
  });

  console.log(`Created document ${document._id} and processing job ${processingJob._id} for ${processingType}`);

  // Increment document usage count
  try {
    await subscriptionService.incrementDocumentCount(req.user._id);
  } catch (error) {
    console.error('Error incrementing document count:', error);
    // We'll continue with the process even if count increment fails
  }

  // Start processing in the background using the new processing service
  setTimeout(async () => {
    try {
      console.log(`Starting ${processingType} processing for document ${document._id}`);
      await processingService.processDocument(document._id, req.user._id, processingType, processingOptions);
    } catch (error) {
      console.error(`Background ${processingType} processing error:`, error);
    }
  }, 0);

  res.status(201).json({
    document: {
      _id: document._id,
      originalFileName: document.originalFileName,
      processingType: document.processingType,
      status: document.status,
    },
    processingJob: {
      _id: processingJob._id,
      processingType: processingJob.processingType,
      status: processingJob.status,
    },
  });
};

// @desc    Get all documents for a user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  const documents = await Document.find({ userId: req.user._id })
    .sort({ createdAt: -1 });

  res.json(documents);
};

// @desc    Get a document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the user
  if (document.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this document');
  }

  res.json(document);
};

// @desc    Update document status
// @route   PUT /api/documents/:id/status
// @access  Private
const updateDocumentStatus = async (req, res) => {
  const { status } = req.body;

  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the user
  if (document.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this document');
  }

  document.status = status;

  if (status === 'completed') {
    document.processingCompletedAt = Date.now();
  }

  const updatedDocument = await document.save();

  res.json(updatedDocument);
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the user
  if (document.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this document');
  }

  // Delete the file from the server
  if (document.originalFileUrl) {
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  if (document.pdfFileUrl) {
    const pdfPath = path.join(__dirname, '..', document.pdfFileUrl);
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
  }

  // Delete the document and associated processing jobs
  await ProcessingJob.deleteMany({ documentId: document._id });
  await document.deleteOne();

  res.json({ message: 'Document removed' });
};

// @desc    Get processing job status
// @route   GET /api/documents/:id/job
// @access  Private
const getProcessingJobStatus = async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  // Check if the document belongs to the user
  if (document.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this document');
  }

  const processingJob = await ProcessingJob.findOne({ documentId: document._id });

  if (!processingJob) {
    res.status(404);
    throw new Error('Processing job not found');
  }

  res.json(processingJob);
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocumentStatus,
  deleteDocument,
  getProcessingJobStatus,
}; 