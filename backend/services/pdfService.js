const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
// const sizeOf = require('image-size').default || require('image-size');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');

/**
 * Convert image to PDF
 * @param {string} documentId - The document ID
 * @param {string} userId - The user ID
 * @param {Object} options - Processing options
 */
const convertToPDF = async (documentId, userId, options = {}) => {
  console.log('PDF conversion started for document:', documentId);
  
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
      processingJob.currentStep = 'converting_to_pdf';
      await processingJob.save();
    }

    // Get file path
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error('Source file not found');
    }

    // Create user directory if it doesn't exist
    const userDir = path.join(__dirname, '..', 'uploads', userId.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Get image dimensions (using default A4 size if sizeOf is not available)
    let dimensions = { width: 595, height: 842 }; // A4 default
    try {
      // Try to get actual image dimensions if possible
      // For now, we'll use default dimensions to avoid dependency issues
      console.log('Using default PDF dimensions:', dimensions);
    } catch (error) {
      console.log('Using default dimensions due to sizeOf error:', error.message);
    }

    // Update progress
    if (processingJob) {
      processingJob.progress = 50;
      await processingJob.save();
    }

    // Create PDF
    const pdfFileName = `${path.parse(document.originalFileName).name}.pdf`;
    const pdfFilePath = path.join(userDir, pdfFileName);
    
    await createPDFFromImage(filePath, pdfFilePath, dimensions, options);

    // Update progress
    if (processingJob) {
      processingJob.progress = 90;
      await processingJob.save();
    }

    // Get PDF file stats
    const pdfStats = fs.statSync(pdfFilePath);
    const pdfUrl = `/uploads/${userId}/${pdfFileName}`;

    console.log('PDF created successfully:', pdfFilePath);

    return {
      pdfUrl,
      pageCount: 1,
      fileSize: pdfStats.size,
      filename: pdfFileName
    };

  } catch (error) {
    console.error('PDF conversion error:', error);
    throw error;
  }
};

/**
 * Create multi-page PDF from multiple images
 * @param {string} documentId - The document ID
 * @param {string} userId - The user ID
 * @param {Object} options - Processing options
 */
const createMultiPagePDF = async (documentId, userId, options = {}) => {
  console.log('Multi-page PDF creation started for document:', documentId);
  
  try {
    // This would typically handle multiple images
    // For now, we'll create a single-page PDF and return it
    return await convertToPDF(documentId, userId, options);
  } catch (error) {
    console.error('Multi-page PDF creation error:', error);
    throw error;
  }
};

/**
 * Create PDF from image with specified options
 * @param {string} imagePath - Path to the source image
 * @param {string} outputPath - Path for the output PDF
 * @param {Object} dimensions - Image dimensions
 * @param {Object} options - PDF creation options
 */
const createPDFFromImage = async (imagePath, outputPath, dimensions, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // PDF options
      const pageSize = options.pageSize || 'A4';
      const orientation = options.orientation || 'portrait';
      const quality = options.quality || 'high';

      // Calculate page dimensions
      let pageWidth, pageHeight;
      
      if (pageSize === 'A4') {
        pageWidth = orientation === 'portrait' ? 595.28 : 841.89;
        pageHeight = orientation === 'portrait' ? 841.89 : 595.28;
      } else if (pageSize === 'Letter') {
        pageWidth = orientation === 'portrait' ? 612 : 792;
        pageHeight = orientation === 'portrait' ? 792 : 612;
      } else { // Auto
        // Use image dimensions with some padding (fallback to A4 if dimensions not available)
        const padding = 40;
        pageWidth = (dimensions.width || 595) + padding;
        pageHeight = (dimensions.height || 842) + padding;
      }

      // Create PDF document
      const pdfDoc = new PDFDocument({
        size: [pageWidth, pageHeight],
        margins: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20
        },
        info: {
          Title: path.basename(imagePath),
          Author: 'SnapOCR',
          Subject: 'Converted Image',
          Keywords: 'PDF, Image, Conversion'
        }
      });

      // Create write stream
      const writeStream = fs.createWriteStream(outputPath);
      pdfDoc.pipe(writeStream);

      // Calculate image fit options based on quality setting
      const maxWidth = pageWidth - 40;
      const maxHeight = pageHeight - 40;
      
      let fitOptions;
      if (quality === 'high') {
        fitOptions = [maxWidth, maxHeight];
      } else if (quality === 'medium') {
        fitOptions = [maxWidth * 0.8, maxHeight * 0.8];
      } else { // low
        fitOptions = [maxWidth * 0.6, maxHeight * 0.6];
      }

      // Add image to PDF
      pdfDoc.image(imagePath, {
        fit: fitOptions,
        align: 'center',
        valign: 'center'
      });

      // Finalize PDF
      pdfDoc.end();

      // Wait for completion
      writeStream.on('finish', () => {
        console.log('PDF creation completed');
        resolve();
      });

      writeStream.on('error', (error) => {
        console.error('PDF write error:', error);
        reject(error);
      });

    } catch (error) {
      console.error('PDF creation error:', error);
      reject(error);
    }
  });
};

module.exports = {
  convertToPDF,
  createMultiPagePDF,
  createPDFFromImage
}; 