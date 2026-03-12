const mongoose = require('mongoose');

const processingJobSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentStep: {
      type: String,
      default: 'initializing'
    },
    mistralJobId: {
      type: String,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    errorDetails: {
      type: String,
    },
    result: {
      // OCR Results
      extractedText: String,
      ocrConfidence: Number,
      
      // PDF Results
      pdfUrl: String,
      pageCount: Number,
      
      // Enhancement Results
      enhancedImageUrl: String,
      enhancementMetrics: {
        originalSize: { width: Number, height: Number },
        enhancedSize: { width: Number, height: Number },
        appliedFilters: [String],
        qualityScore: Number
      },
      
      // QR/Barcode Results
      codes: [{
        type: { type: String, enum: ['QR', 'BARCODE'] },
        data: String,
        format: String
      }],
      
      // Table Results
      tables: [{
        rows: [[String]],
        headers: [String],
        tableConfidence: Number
      }],
      tableFileUrl: String,
      
      // Translation Results
      originalText: String,
      translatedText: String,
      sourceLanguage: String,
      targetLanguage: String,
      
      // Classification Results
      category: String,
      classificationConfidence: Number,
      suggestedTags: [String]
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
processingJobSchema.index({ documentId: 1 });
processingJobSchema.index({ userId: 1 });
processingJobSchema.index({ status: 1 });
processingJobSchema.index({ processingType: 1 });

const ProcessingJob = mongoose.model('ProcessingJob', processingJobSchema);

module.exports = ProcessingJob; 