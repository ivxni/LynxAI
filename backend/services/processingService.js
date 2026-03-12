const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');
const ocrService = require('./ocrService');
const pdfService = require('./pdfService');
const imageEnhancementService = require('./imageEnhancementService');
const qrBarcodeService = require('./qrBarcodeService');
const tableExtractionService = require('./tableExtractionService');
const translationService = require('./translationService');
const classificationService = require('./classificationService');
const path = require('path');
const fs = require('fs');

/**
 * Main processing function that routes to the appropriate service based on processing type
 * @param {string} documentId - The document ID
 * @param {string} userId - The user ID
 * @param {string} processingType - The type of processing to perform
 * @param {Object} processingOptions - Options for processing
 */
const processDocument = async (documentId, userId, processingType, processingOptions = {}) => {
  console.log(`Starting processing for document ${documentId}, type: ${processingType}`);
  
  try {
    // Get the document and processing job
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const processingJob = await ProcessingJob.findOne({ documentId });
    if (!processingJob) {
      throw new Error('Processing job not found');
    }

    // Update job status to processing
    processingJob.status = 'processing';
    processingJob.startTime = new Date();
    processingJob.progress = 10;
    processingJob.currentStep = 'starting';
    await processingJob.save();

    // Update document status
    document.status = 'processing';
    document.processingStartedAt = new Date();
    await document.save();

    let result;
    const startTime = Date.now();

    // Route to appropriate processing service
    switch (processingType) {
      case 'ocr':
        result = await ocrService.processOCR(documentId, userId, processingOptions);
        break;
      
      case 'pdf_convert':
        result = await pdfService.convertToPDF(documentId, userId, processingOptions);
        break;
      
      case 'document_scan':
        result = await imageEnhancementService.scanDocument(documentId, userId, processingOptions);
        break;
      
      case 'multi_page_pdf':
        result = await pdfService.createMultiPagePDF(documentId, userId, processingOptions);
        break;
      
      case 'image_enhance':
        result = await imageEnhancementService.enhanceImage(documentId, userId, processingOptions);
        break;
      
      case 'qr_barcode_scan':
        result = await qrBarcodeService.scanCodes(documentId, userId, processingOptions);
        break;
      
      case 'table_extract':
        result = await tableExtractionService.extractTables(documentId, userId, processingOptions);
        break;
      
      case 'handwriting_ocr':
        result = await ocrService.processHandwriting(documentId, userId, processingOptions);
        break;
      
      case 'ocr_translate':
        result = await translationService.ocrAndTranslate(documentId, userId, processingOptions);
        break;
      
      case 'document_classify':
        result = await classificationService.classifyDocument(documentId, userId, processingOptions);
        break;
      
      default:
        throw new Error(`Unsupported processing type: ${processingType}`);
    }

    const processingTime = Date.now() - startTime;

    // Update document with results
    await updateDocumentWithResults(document, result, processingTime);

    // Update job status to completed
    processingJob.status = 'completed';
    processingJob.progress = 100;
    processingJob.endTime = new Date();
    processingJob.currentStep = 'completed';
    processingJob.result = result;
    await processingJob.save();

    console.log(`Processing completed for document ${documentId} in ${processingTime}ms`);
    
    return {
      document: await Document.findById(documentId),
      processingJob,
    };

  } catch (error) {
    console.error('Processing error:', error);
    
    // Update document status to failed
    const document = await Document.findById(documentId);
    if (document) {
      document.status = 'failed';
      document.errorMessage = error.message;
      await document.save();
    }

    // Update job status to failed
    const processingJob = await ProcessingJob.findOne({ documentId });
    if (processingJob) {
      processingJob.status = 'failed';
      processingJob.errorDetails = error.message;
      processingJob.endTime = new Date();
      processingJob.currentStep = 'failed';
      await processingJob.save();
    }

    throw error;
  }
};

/**
 * Update document with processing results
 * @param {Object} document - The document to update
 * @param {Object} result - The processing result
 * @param {number} processingTime - Processing time in milliseconds
 */
const updateDocumentWithResults = async (document, result, processingTime) => {
  // Update common fields
  document.status = 'completed';
  document.processingCompletedAt = new Date();
  document.metadata = document.metadata || {};
  document.metadata.processingTime = processingTime;

  // Update specific fields based on result type
  if (result.extractedText) {
    document.ocrText = result.extractedText;
    document.ocrConfidence = result.ocrConfidence;
  }

  if (result.pdfUrl) {
    document.pdfFileUrl = result.pdfUrl;
    document.metadata.pageCount = result.pageCount;
  }

  if (result.enhancedImageUrl) {
    document.enhancedImageUrl = result.enhancedImageUrl;
    document.enhancementMetadata = result.enhancementMetrics;
  }

  if (result.codes && result.codes.length > 0) {
    document.detectedCodes = result.codes;
  }

  if (result.tables && result.tables.length > 0) {
    document.extractedTables = result.tables;
    if (result.tableFileUrl) {
      document.outputFiles = document.outputFiles || [];
      document.outputFiles.push({
        type: 'csv',
        filename: path.basename(result.tableFileUrl),
        url: result.tableFileUrl,
        size: fs.existsSync(result.tableFileUrl) ? fs.statSync(result.tableFileUrl).size : 0
      });
    }
  }

  if (result.translatedText) {
    document.translationResults = {
      originalText: result.originalText,
      translatedText: result.translatedText,
      sourceLanguage: result.sourceLanguage,
      targetLanguage: result.targetLanguage,
      confidence: result.confidence
    };
  }

  if (result.category) {
    document.classificationResults = {
      category: result.category,
      confidence: result.classificationConfidence,
      alternativeCategories: result.alternativeCategories || [],
      suggestedTags: result.suggestedTags || []
    };
    
    // Add suggested tags to document tags
    if (result.suggestedTags && result.suggestedTags.length > 0) {
      document.tags = [...new Set([...(document.tags || []), ...result.suggestedTags])];
    }
  }

  await document.save();
};

module.exports = {
  processDocument,
  updateDocumentWithResults
}; 