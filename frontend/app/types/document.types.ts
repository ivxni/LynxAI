export interface Document {
  _id: string;
  // Original file info
  originalFileName: string;
  originalFileType: string;
  originalFileSize: number;
  originalFileUrl: string;
  
  // Backward compatibility
  filename?: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
  
  // Processing info
  processingType: ProcessingType;
  processingOptions?: ProcessingOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed'; // Backward compatibility
  
  // Output files
  pdfFileName?: string;
  pdfFileSize?: number;
  pdfFileUrl?: string;
  downloadUrl?: string; // Virtual field from backend
  
  // OCR results
  ocrText?: string;
  ocrConfidence?: number;
  extractedText?: string; // Backward compatibility
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  
  // Error handling
  errorMessage?: string;
  
  // Other fields
  previewUrl?: string;
  metadata?: {
    pages?: number;
    pageCount?: number;
    language?: string;
    confidence?: number;
    processingTime?: number;
    outputFormat?: string;
    enhancement?: EnhancementMetadata;
    translation?: TranslationMetadata;
    classification?: ClassificationMetadata;
  };
}

export interface ProcessingJob {
  _id: string;
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  processingType: ProcessingType;
  errorDetails?: string;
  createdAt: string;
  updatedAt: string;
  result?: ProcessingResult;
}

export interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  loading: boolean;
  error: string | null;
}

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

// New types for processing options
export type ProcessingType = 
  | 'ocr'                    // OCR Text Extraction
  | 'pdf_convert'            // PNG/JPG to PDF Converter
  | 'document_scan'          // Document Scanner with enhancement
  | 'multi_page_pdf'         // Multi-Page PDF Creator
  | 'image_enhance'          // Image Enhancement
  | 'qr_barcode_scan'        // QR/Barcode Scanner
  | 'table_extract'          // Table Extraction
  | 'handwriting_ocr'        // Handwriting Recognition
  | 'ocr_translate'          // OCR + Translation
  | 'document_classify';     // Document Classification

export interface ProcessingOptions {
  // OCR Options
  language?: string;
  ocrOutputFormat?: 'text' | 'json' | 'pdf';
  
  // PDF Options
  pageSize?: 'A4' | 'Letter' | 'Auto';
  orientation?: 'portrait' | 'landscape';
  quality?: 'low' | 'medium' | 'high';
  
  // Enhancement Options
  autoCorrect?: boolean;
  sharpen?: boolean;
  denoise?: boolean;
  brightness?: number; // -100 to 100
  contrast?: number;   // -100 to 100
  
  // Multi-page Options
  pageOrder?: number[];
  
  // Translation Options
  targetLanguage?: string;
  sourceLanguage?: 'auto' | string;
  
  // Table Options
  tableOutputFormat?: 'csv' | 'excel' | 'json';
  
  // Classification Options
  categories?: string[];
}

export interface ProcessingResult {
  // OCR Results
  extractedText?: string;
  ocrConfidence?: number;
  
  // PDF Results
  pdfUrl?: string;
  pageCount?: number;
  
  // Enhancement Results
  enhancedImageUrl?: string;
  enhancementMetrics?: EnhancementMetadata;
  
  // QR/Barcode Results
  codes?: Array<{
    type: 'QR' | 'BARCODE';
    data: string;
    format?: string;
  }>;
  
  // Table Results
  tables?: Array<{
    rows: string[][];
    headers?: string[];
    tableConfidence?: number;
  }>;
  tableFileUrl?: string;
  
  // Translation Results
  originalText?: string;
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  
  // Classification Results
  category?: string;
  classificationConfidence?: number;
  suggestedTags?: string[];
}

export interface EnhancementMetadata {
  originalSize: { width: number; height: number };
  enhancedSize: { width: number; height: number };
  appliedFilters: string[];
  qualityScore?: number;
}

export interface TranslationMetadata {
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  wordCount: number;
}

export interface ClassificationMetadata {
  category: string;
  confidence: number;
  alternativeCategories: Array<{
    category: string;
    confidence: number;
  }>;
  suggestedTags: string[];
}

// Processing option definitions for UI
export interface ProcessingOptionDefinition {
  id: ProcessingType;
  title: string;
  description: string;
  icon: string;
  isPremium: boolean;
  estimatedTime: string;
  supportedFormats: string[];
  features: string[];
}

export const PROCESSING_OPTIONS: ProcessingOptionDefinition[] = [
  {
    id: 'ocr',
    title: 'OCR Text Extraction',
    description: 'Extract text from images and documents',
    icon: 'text-fields',
    isPremium: false,
    estimatedTime: '10-30 seconds',
    supportedFormats: ['JPG', 'PNG', 'PDF'],
    features: ['Text extraction', 'Multiple languages', 'High accuracy']
  },
  {
    id: 'pdf_convert',
    title: 'Image to PDF',
    description: 'Convert images to PDF format',
    icon: 'picture-as-pdf',
    isPremium: false,
    estimatedTime: '5-15 seconds',
    supportedFormats: ['JPG', 'PNG'],
    features: ['High quality PDF', 'Custom page size', 'Compression options']
  },
  {
    id: 'document_scan',
    title: 'Document Scanner',
    description: 'Auto-detect edges, correct perspective, enhance quality',
    icon: 'document-scanner',
    isPremium: true,
    estimatedTime: '15-45 seconds',
    supportedFormats: ['JPG', 'PNG'],
    features: ['Edge detection', 'Perspective correction', 'Auto-enhancement']
  },
  {
    id: 'multi_page_pdf',
    title: 'Multi-Page PDF',
    description: 'Combine multiple images into one PDF',
    icon: 'collections',
    isPremium: true,
    estimatedTime: '20-60 seconds',
    supportedFormats: ['JPG', 'PNG'],
    features: ['Multiple images', 'Custom order', 'Page management']
  },
  {
    id: 'image_enhance',
    title: 'Image Enhancement',
    description: 'Improve image quality with AI enhancement',
    icon: 'auto-fix-high',
    isPremium: true,
    estimatedTime: '30-90 seconds',
    supportedFormats: ['JPG', 'PNG'],
    features: ['AI enhancement', 'Noise reduction', 'Sharpening']
  },
  {
    id: 'qr_barcode_scan',
    title: 'QR & Barcode Scanner',
    description: 'Detect and extract QR codes and barcodes',
    icon: 'qr-code-scanner',
    isPremium: true,
    estimatedTime: '5-20 seconds',
    supportedFormats: ['JPG', 'PNG'],
    features: ['QR codes', 'Multiple barcode formats', 'Batch processing']
  },
  {
    id: 'table_extract',
    title: 'Table Extraction',
    description: 'Extract tables and export as CSV/Excel',
    icon: 'table-view',
    isPremium: true,
    estimatedTime: '30-120 seconds',
    supportedFormats: ['JPG', 'PNG', 'PDF'],
    features: ['Table detection', 'CSV/Excel export', 'Data formatting']
  },
  {
    id: 'handwriting_ocr',
    title: 'Handwriting Recognition',
    description: 'Convert handwritten text to digital text',
    icon: 'edit',
    isPremium: true,
    estimatedTime: '45-180 seconds',
    supportedFormats: ['JPG', 'PNG'],
    features: ['Handwriting OCR', 'Multiple languages', 'Cursive support']
  },
  {
    id: 'ocr_translate',
    title: 'OCR + Translation',
    description: 'Extract text and translate to another language',
    icon: 'translate',
    isPremium: true,
    estimatedTime: '30-90 seconds',
    supportedFormats: ['JPG', 'PNG', 'PDF'],
    features: ['Text extraction', '100+ languages', 'Auto-detection']
  },
  {
    id: 'document_classify',
    title: 'Document Classification',
    description: 'Automatically categorize document types',
    icon: 'category',
    isPremium: true,
    estimatedTime: '10-30 seconds',
    supportedFormats: ['JPG', 'PNG', 'PDF'],
    features: ['Auto-categorization', 'Smart tagging', 'Document type detection']
  }
];

// Create a default export with a React component
import React from 'react';

const DocumentTypesComponent: React.FC = () => {
  return null;
};

export default DocumentTypesComponent; 