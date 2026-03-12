const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    originalFileType: {
      type: String,
      required: true,
    },
    originalFileSize: {
      type: Number,
      required: true,
    },
    originalFileUrl: {
      type: String,
      required: true,
    },
    // Processing type and options
    processingType: {
      type: String,
      enum: [
        'ocr',                    // OCR Text Extraction
        'pdf_convert',            // PNG/JPG to PDF Converter
        'document_scan',          // Document Scanner with enhancement
        'multi_page_pdf',         // Multi-Page PDF Creator
        'image_enhance',          // Image Enhancement
        'qr_barcode_scan',        // QR/Barcode Scanner
        'table_extract',          // Table Extraction
        'handwriting_ocr',        // Handwriting Recognition
        'ocr_translate',          // OCR + Translation
        'document_classify'       // Document Classification
      ],
      default: 'ocr',
    },
    processingOptions: {
      // OCR Options
      language: String,
      ocrOutputFormat: {
        type: String,
        enum: ['text', 'json', 'pdf'],
        default: 'text'
      },
      
      // PDF Options
      pageSize: {
        type: String,
        enum: ['A4', 'Letter', 'Auto'],
        default: 'A4'
      },
      orientation: {
        type: String,
        enum: ['portrait', 'landscape'],
        default: 'portrait'
      },
      quality: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'high'
      },
      
      // Enhancement Options
      autoCorrect: { type: Boolean, default: false },
      sharpen: { type: Boolean, default: false },
      denoise: { type: Boolean, default: false },
      brightness: { type: Number, min: -100, max: 100, default: 0 },
      contrast: { type: Number, min: -100, max: 100, default: 0 },
      
      // Translation Options
      targetLanguage: String,
      sourceLanguage: { type: String, default: 'auto' },
      
      // Table Options
      tableOutputFormat: {
        type: String,
        enum: ['csv', 'excel', 'json'],
        default: 'csv'
      },
      
      // Classification Options
      categories: [String],
    },
    // Output files
    pdfFileName: {
      type: String,
    },
    pdfFileSize: {
      type: Number,
    },
    pdfFileUrl: {
      type: String,
    },
    // Enhanced/processed image for document scanner
    enhancedImageUrl: {
      type: String,
    },
    // Additional output files (CSV, Excel, etc.)
    outputFiles: [{
      type: {
        type: String,
        enum: ['csv', 'excel', 'json', 'txt']
      },
      filename: String,
      url: String,
      size: Number
    }],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    processingStartedAt: {
      type: Date,
      default: Date.now,
    },
    processingCompletedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    // OCR Results
    ocrText: {
      type: String,
    },
    ocrConfidence: {
      type: Number,
      min: 0,
      max: 100
    },
    // QR/Barcode Results
    detectedCodes: [{
      type: {
        type: String,
        enum: ['QR', 'BARCODE']
      },
      data: String,
      format: String,
      confidence: Number
    }],
    // Table Results
    extractedTables: [{
      headers: [String],
      rows: [[String]],
      confidence: Number
    }],
    // Translation Results
    translationResults: {
      originalText: String,
      translatedText: String,
      sourceLanguage: String,
      targetLanguage: String,
      confidence: Number
    },
    // Classification Results
    classificationResults: {
      category: String,
      confidence: Number,
      alternativeCategories: [{
        category: String,
        confidence: Number
      }],
      suggestedTags: [String]
    },
    // Enhancement metadata
    enhancementMetadata: {
      originalSize: {
        width: Number,
        height: Number
      },
      enhancedSize: {
        width: Number,
        height: Number
      },
      appliedFilters: [String],
      qualityScore: Number
    },
    tags: [String],
    isStarred: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    metadata: {
      pageCount: Number,
      dimensions: {
        width: Number,
        height: Number,
      },
      detectedLanguage: String,
      processingTime: Number, // in milliseconds
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field for downloadUrl (maps to pdfFileUrl for backward compatibility)
documentSchema.virtual('downloadUrl').get(function() {
  return this.pdfFileUrl;
});

// Ensure virtual fields are serialized
documentSchema.set('toJSON', { virtuals: true });
documentSchema.set('toObject', { virtuals: true });

// Create indexes for better query performance
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ userId: 1, isArchived: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ processingType: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 