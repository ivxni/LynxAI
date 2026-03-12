const jimp = require('jimp');
const jsQR = require('jsqr');
const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');

/**
 * Scan for QR codes and barcodes in an image
 * @param {string} documentId - The document ID
 * @param {string} userId - The user ID
 * @param {Object} options - Processing options
 */
const scanCodes = async (documentId, userId, options = {}) => {
  console.log('QR/Barcode scanning started for document:', documentId);
  
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
      processingJob.currentStep = 'scanning_codes';
      await processingJob.save();
    }

    // Get file path
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error('Source file not found');
    }

    // Read and process image
    const image = await jimp.read(filePath);
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height
    };

    // Update progress
    if (processingJob) {
      processingJob.progress = 60;
      await processingJob.save();
    }

    const detectedCodes = [];

    // Scan for QR codes
    try {
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      if (qrCode) {
        detectedCodes.push({
          type: 'QR',
          data: qrCode.data,
          format: 'QR',
          confidence: 95 // jsQR doesn't provide confidence, so we use a default high value
        });
        console.log('QR Code detected:', qrCode.data);
      }
    } catch (qrError) {
      console.log('No QR codes found or QR scanning error:', qrError.message);
    }

    // Update progress
    if (processingJob) {
      processingJob.progress = 90;
      await processingJob.save();
    }

    // For now, we'll focus on QR codes. Barcode scanning would require additional libraries
    // like @zxing/library or quagga2, which are more complex to set up

    console.log(`Code scanning completed. Found ${detectedCodes.length} codes`);

    return {
      codes: detectedCodes,
      totalCodes: detectedCodes.length
    };

  } catch (error) {
    console.error('QR/Barcode scanning error:', error);
    throw error;
  }
};

/**
 * Enhanced QR code scanning with multiple orientations and preprocessing
 * @param {Object} imageData - Image data object
 * @returns {Object|null} QR code result or null
 */
const scanQRWithPreprocessing = (imageData) => {
  try {
    // Try scanning the original image
    let result = jsQR(imageData.data, imageData.width, imageData.height);
    if (result) return result;

    // If no QR code found, we could try different preprocessing techniques
    // For now, we'll return null if the basic scan doesn't work
    return null;
  } catch (error) {
    console.log('QR scanning with preprocessing failed:', error.message);
    return null;
  }
};

module.exports = {
  scanCodes,
  scanQRWithPreprocessing
}; 