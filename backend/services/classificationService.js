const fs = require('fs');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');

/**
 * Classify document type automatically
 * @param {string} documentId - The document ID
 * @param {string} userId - The user ID
 * @param {Object} options - Processing options
 */
const classifyDocument = async (documentId, userId, options = {}) => {
  console.log('Document classification started for document:', documentId);
  
  try {
    // Get the document
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Update progress
    const processingJob = await ProcessingJob.findOne({ documentId });
    if (processingJob) {
      processingJob.progress = 30;
      processingJob.currentStep = 'extracting_text_for_classification';
      await processingJob.save();
    }

    // Get file path
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error('Source file not found');
    }

    // Read the file as base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    const fileType = document.originalFileType || 'image/jpeg';

    // Initialize Mistral client
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    // Step 1: Extract text via OCR
    console.log('Step 1: Extracting text for classification...');
    const ocrResponse = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        imageUrl: `data:${fileType};base64,${base64Image}`
      },
      include_layout_info: true,
      ocr_options: {
        detect_text: true,
        detect_formulas: true,
        detect_tables: true,
        language: 'auto',
        quality: 'high'
      }
    });

    // Update progress
    if (processingJob) {
      processingJob.progress = 60;
      processingJob.currentStep = 'classifying_document';
      await processingJob.save();
    }

    // Extract text from OCR response
    const extractedText = ocrResponse.pages?.map(page => page.markdown || '').join('\n\n') || '';
    
    if (!extractedText.trim()) {
      // If no text found, classify based on image characteristics
      return classifyByImageCharacteristics(document.originalFileName);
    }

    console.log('Extracted text length for classification:', extractedText.length);

    // Step 2: Classify using simple text analysis (fallback method)
    const classificationResult = classifyByTextAnalysis(extractedText);

    // Update progress
    if (processingJob) {
      processingJob.progress = 90;
      await processingJob.save();
    }

    console.log('Document classification completed:', classificationResult.category);

    return classificationResult;

  } catch (error) {
    console.error('Document classification error:', error);
    throw error;
  }
};

/**
 * Classify document based on text analysis
 * @param {string} text - Document text
 * @returns {Object} Classification result
 */
const classifyByTextAnalysis = (text) => {
  const lowerText = text.toLowerCase();
  
  // Invoice indicators
  if (lowerText.includes('invoice') || lowerText.includes('rechnung') || 
      lowerText.includes('bill') || lowerText.includes('amount due') ||
      lowerText.includes('total:') || lowerText.includes('subtotal')) {
    return {
      category: 'invoice',
      classificationConfidence: 80,
      alternativeCategories: [{ category: 'receipt', confidence: 60 }],
      suggestedTags: ['billing', 'payment', 'business']
    };
  }
  
  // Receipt indicators
  if (lowerText.includes('receipt') || lowerText.includes('quittung') ||
      lowerText.includes('thank you for your purchase') || lowerText.includes('change:')) {
    return {
      category: 'receipt',
      classificationConfidence: 85,
      alternativeCategories: [{ category: 'invoice', confidence: 50 }],
      suggestedTags: ['purchase', 'payment', 'transaction']
    };
  }
  
  // Contract indicators
  if (lowerText.includes('contract') || lowerText.includes('vertrag') ||
      lowerText.includes('agreement') || lowerText.includes('terms and conditions')) {
    return {
      category: 'contract',
      classificationConfidence: 90,
      alternativeCategories: [{ category: 'legal', confidence: 70 }],
      suggestedTags: ['legal', 'agreement', 'terms']
    };
  }
  
  // Letter indicators
  if (lowerText.includes('dear ') || lowerText.includes('sehr geehrte') ||
      lowerText.includes('sincerely') || lowerText.includes('mit freundlichen grüßen')) {
    return {
      category: 'letter',
      classificationConfidence: 75,
      alternativeCategories: [{ category: 'personal', confidence: 60 }],
      suggestedTags: ['correspondence', 'communication']
    };
  }
  
  // Certificate indicators
  if (lowerText.includes('certificate') || lowerText.includes('zertifikat') ||
      lowerText.includes('certification') || lowerText.includes('hereby certify')) {
    return {
      category: 'certificate',
      classificationConfidence: 85,
      alternativeCategories: [{ category: 'educational', confidence: 60 }],
      suggestedTags: ['certification', 'achievement', 'official']
    };
  }
  
  // Default classification
  return {
    category: 'document',
    classificationConfidence: 60,
    alternativeCategories: [{ category: 'other', confidence: 40 }],
    suggestedTags: ['general', 'document']
  };
};

/**
 * Classify document based on image characteristics (when no text is found)
 * @param {string} filename - Original filename
 * @returns {Object} Classification result
 */
const classifyByImageCharacteristics = (filename) => {
  const lowerFilename = filename.toLowerCase();
  
  // Try to infer from filename
  if (lowerFilename.includes('receipt') || lowerFilename.includes('quittung')) {
    return {
      category: 'receipt',
      classificationConfidence: 70,
      alternativeCategories: [{ category: 'invoice', confidence: 50 }],
      suggestedTags: ['image', 'receipt']
    };
  }
  
  if (lowerFilename.includes('invoice') || lowerFilename.includes('rechnung')) {
    return {
      category: 'invoice',
      classificationConfidence: 70,
      alternativeCategories: [{ category: 'receipt', confidence: 50 }],
      suggestedTags: ['image', 'invoice']
    };
  }
  
  // Default for images without text
  return {
    category: 'other',
    classificationConfidence: 50,
    alternativeCategories: [{ category: 'document', confidence: 40 }],
    suggestedTags: ['image', 'unclassified']
  };
};

module.exports = {
  classifyDocument,
  classifyByTextAnalysis,
  classifyByImageCharacteristics
}; 