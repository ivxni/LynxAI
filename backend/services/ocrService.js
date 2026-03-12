const axios = require('axios');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');
const { Mistral } = require('@mistralai/mistralai');
const sizeOf = require('image-size');

/**
 * Process an image with OCR using the Mistral API
 * @param {string} documentId - The ID of the document to process
 * @param {string} userId - The ID of the user who owns the document
 * @returns {Promise<Object>} - The processing result
 */
const processImage = async (documentId, userId) => {
  try {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const processingJob = await ProcessingJob.findOne({ documentId });
    if (!processingJob) {
      throw new Error('Processing job not found');
    }

    processingJob.status = 'processing';
    processingJob.startTime = new Date();
    processingJob.progress = 10;
    await processingJob.save();

    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    const fileType = document.originalFileType || 'image/jpeg';

    processingJob.progress = 30;
    await processingJob.save();

    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    // Call Mistral OCR API with improved parameters for better special character recognition
    const ocrResponse = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        imageUrl: `data:${fileType};base64,${base64Image}`
      },
      include_image_base64: true,
      include_layout_info: true,
      purpose: 'transcription', // 'transcription' often works better for detecting special characters than 'ocr'
      ocr_options: {
        detect_text: true,
        detect_formulas: true, // Enable formula detection for mathematical symbols
        detect_icons: true,    // Better detection of symbols like circled items
        detect_tables: true,
        language: 'de',        // German language hint
        quality: 'high'        // Request high quality OCR
      }
    });

    // Update progress
    processingJob.progress = 70;
    await processingJob.save();

    // Create directory for user documents if it doesn't exist
    const userDir = path.join(__dirname, '..', 'uploads', userId.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Extract content from OCR response
    const pages = ocrResponse.pages || [];
    const markdownContent = pages.map(page => page.markdown || '').join('\n\n');

    // Post-process OCR text to fix common issues with special characters
    const postProcessedMarkdown = postProcessOcrText(markdownContent);
    document.ocrText = postProcessedMarkdown;
    document.status = 'completed';
    document.processingCompletedAt = new Date();
    
    // Create PDF file path
    const pdfFileName = `${document.originalFileName.split('.')[0]}.pdf`;
    const pdfFilePath = path.join(userDir, pdfFileName);

    await createExactPDF(fileBuffer, pdfFilePath, document.originalFileName, ocrResponse);

    document.pdfFileName = pdfFileName;
    document.pdfFileSize = fs.statSync(pdfFilePath).size;
    document.pdfFileUrl = `/uploads/${userId}/${pdfFileName}`;
    
    await document.save();

    // Update job status to completed
    processingJob.status = 'completed';
    processingJob.progress = 100;
    processingJob.endTime = new Date();
    await processingJob.save();

    return {
      document,
      processingJob,
    };
  } catch (error) {
    console.error('OCR processing error details:', error.message, error.stack);

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
      await processingJob.save();
    }

    throw error;
  }
};

/**
 * Post-processes OCR text to fix common issues with special characters
 * @param {string} text - The OCR text to process
 * @returns {string} - The processed text
 */
function postProcessOcrText(text) {
  if (!text) return text;
  
  // Fixes for common OCR errors with special characters
  let processed = text;
  
  // Fix mathematical symbols
  processed = processed.replace(/\$\\cdot\$/g, '·');     // Replace $\cdot$ with ·
  processed = processed.replace(/\$\\odot\$/g, '⊙');     // Replace $\odot$ with ⊙
  processed = processed.replace(/\$\\bullet\$/g, '•');   // Replace $\bullet$ with •
  processed = processed.replace(/\$\\times\$/g, '×');    // Replace $\times$ with ×
  
  // Fix image markdown references that shouldn't be there
  processed = processed.replace(/!\[img-\d+\]\(img-\d+\.(jpe?g|png|gif)\)/gi, '');
  
  // Fix bullet points that might be incorrectly transcribed
  processed = processed.replace(/o\s+(?=\w)/g, '• ');    // Replace "o " at start of items with bullet points
  
  // Improve spacing around special characters
  processed = processed.replace(/(\w)·(\w)/g, '$1 · $2'); // Add spaces around · when between words
  
  return processed;
}

/**
 * Creates a PDF with extracted content from the image
 * @param {Buffer} imageBuffer - The original image buffer
 * @param {string} outputPath - Path where to save the PDF
 * @param {string} fileName - Name of the document
 * @param {Object} ocrResponse - The response from Mistral OCR API
 */
async function createExactPDF(imageBuffer, outputPath, fileName, ocrResponse) {
  try {
    // Create a PDF document with optimized structure for more content on a single page
    const pdfDoc = new PDFDocument({
      margins: {
        top: 40,
        bottom: 40,
        left: 50,
        right: 50
      },
      info: {
        Title: fileName,
        Author: 'SnapOCR OCR',
        Subject: 'OCR Document',
        Keywords: 'OCR, PDF, Document'
      }
    });
    
    // Create write stream
    const writeStream = fs.createWriteStream(outputPath);
    pdfDoc.pipe(writeStream);
    
    // Extract content from OCR response
    const pages = ocrResponse.pages || [];
    
    if (!pages.length) {
      // No OCR data available, embed the original image as fallback
      try {
        pdfDoc.image(imageBuffer, {
          fit: [500, 700],
          align: 'center',
          valign: 'center'
        });
      } catch (imageError) {
        console.error('Failed to embed image:', imageError);
        pdfDoc.fontSize(12).font('Helvetica-Bold').text(
          'Original image could not be embedded.',
          { align: 'center' }
        );
      }
      
      pdfDoc.end();
      
      // Wait for the PDF to be written
      return new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    }

    // Merge all recognized content onto a single page
    let allBlocks = [];
    let allLayouts = [];
    let allMarkdown = '';
    
    pages.forEach(page => {
      if (page.blocks && Array.isArray(page.blocks)) {
        allBlocks = allBlocks.concat(page.blocks);
      }
      if (page.layout && Array.isArray(page.layout)) {
        allLayouts = allLayouts.concat(page.layout);
      }
      if (page.markdown) {
        const processed = postProcessOcrText(page.markdown);
        allMarkdown += processed + '\n\n';
      }
    });
    
    const combinedPage = {
      blocks: allBlocks.length > 0 ? allBlocks : undefined,
      layout: allLayouts.length > 0 ? allLayouts : undefined,
      markdown: allMarkdown || undefined
    };
    
    processPageOptimized(pdfDoc, combinedPage);
    
    // Finalize the PDF
    pdfDoc.end();
    
    // Wait for the PDF to be written
    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.error('Error creating PDF with extracted content:', error);
    throw error;
  }
}

/**
 * Renders a single page into the PDF with compact formatting.
 * Supports structured blocks, layout elements, and markdown fallback.
 */
function processPageOptimized(pdfDoc, page) {
  if (page.blocks && Array.isArray(page.blocks) && page.blocks.length > 0) {
    let currentSection = null;
    let inList = false;
    let isFirstBlock = true;
    
    for (const block of page.blocks) {
      if (block.type === 'text' && block.text) {
        const isBold = block.bold || false;
        const isItalic = block.italic || false;
        let fontSize = block.fontSize ? Math.max(8, block.fontSize * 0.85) : 10;
        const isHeading = isBold || fontSize >= 12;
        
        // Detect German-style salutations for special formatting
        const isGreeting = block.text.match(/^(Sehr geehrte|Liebe|Hallo|Guten Tag|Betreff)/i);
        
        if (isHeading && currentSection !== block.text) {
          if (!isFirstBlock) {
            pdfDoc.moveDown(0.5);
          }
          currentSection = block.text;
          
          pdfDoc.font('Helvetica-Bold').fontSize(Math.min(14, Math.max(12, fontSize)));
          pdfDoc.text(block.text, { align: 'left', lineGap: 2 });
          
          pdfDoc.moveDown(0.3);
          const lineWidth = pdfDoc.widthOfString(block.text);
          pdfDoc
            .moveTo(pdfDoc.x, pdfDoc.y)
            .lineTo(pdfDoc.x + Math.min(lineWidth, 300), pdfDoc.y)
            .lineWidth(0.5)
            .stroke();
          
          pdfDoc.moveDown(0.3);
          inList = false;
        } else if (isGreeting) {
          pdfDoc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
          
          if (!isFirstBlock) {
            pdfDoc.moveDown(0.3);
          }
          
          pdfDoc.text(block.text, { align: 'left', lineGap: 1 });
          pdfDoc.moveDown(0.3);
        } else {
          if (isBold && isItalic) {
            pdfDoc.font('Helvetica-BoldOblique');
          } else if (isBold) {
            pdfDoc.font('Helvetica-Bold');
          } else if (isItalic) {
            pdfDoc.font('Helvetica-Oblique');
          } else {
            pdfDoc.font('Helvetica');
          }
          
          pdfDoc.fontSize(fontSize);
          
          if (!inList && block.text.trim() !== '') {
            const isIndented = block.x > 60;
            
            pdfDoc.text(block.text, {
              align: block.alignment || 'left',
              indent: isIndented ? 15 : 0,
              paragraphGap: 3,
              lineGap: 1
            });
            
            if (block.text.trim() !== '') {
              pdfDoc.moveDown(0.3);
            }
          } else {
            pdfDoc.text(block.text, {
              align: block.alignment || 'left',
              indent: inList ? 15 : 0,
              continued: false,
              lineGap: 1
            });
            pdfDoc.moveDown(0.3);
          }
        }
      } else if (block.type === 'heading' && block.text) {
        const level = block.level || 1;
        const fontSize = level === 1 ? 14 : level === 2 ? 12 : 11;
        
        if (!isFirstBlock) {
          pdfDoc.moveDown(0.5);
        }
        
        pdfDoc.font('Helvetica-Bold').fontSize(fontSize);
        pdfDoc.text(block.text, { align: 'left', lineGap: 2 });
        
        if (level <= 2) {
          pdfDoc.moveDown(0.3);
          const lineWidth = pdfDoc.widthOfString(block.text);
          pdfDoc
            .moveTo(pdfDoc.x, pdfDoc.y)
            .lineTo(pdfDoc.x + Math.min(lineWidth, 300), pdfDoc.y)
            .lineWidth(0.5)
            .stroke();
        }
        
        pdfDoc.moveDown(0.3);
        currentSection = block.text;
        inList = false;
      } else if (block.type === 'list' && block.items && Array.isArray(block.items)) {
        pdfDoc.font('Helvetica').fontSize(10);
        
        block.items.forEach((item, index) => {
          inList = true;
          const bulletPoint = block.ordered ? `${index+1}. ` : '• ';
          
          pdfDoc.text(bulletPoint + item, {
            indent: 15,
            align: 'left',
            paragraphGap: 2,
            lineGap: 1
          });
          
          if (index < block.items.length - 1) {
            pdfDoc.moveDown(0.2);
          }
        });
        
        pdfDoc.moveDown(0.3);
        inList = false;
      }
      
      isFirstBlock = false;
    }
  } else if (page.layout && Array.isArray(page.layout) && page.layout.length > 0) {
    let currentY = pdfDoc.y;
    let columnPositions = [];
    
    // First pass: detect possible columns by analyzing X positions
    page.layout.forEach(element => {
      if (element.x && !columnPositions.includes(element.x)) {
        columnPositions.push(element.x);
      }
    });
    
    // Sort column positions
    columnPositions.sort((a, b) => a - b);
    
    // Determine if we have a table-like structure (3+ columns)
    const hasTableStructure = columnPositions.length >= 3;
    
    // Second pass: add content with better formatting
    for (const element of page.layout) {
      if (element.type === 'text' && element.text) {
        const fontSize = element.fontSize ? Math.max(8, element.fontSize * 0.85) : 10;
        const isBold = element.bold || false;
        const isItalic = element.italic || false;
        
        // Set appropriate font
        if (isBold && isItalic) {
          pdfDoc.font('Helvetica-BoldOblique');
        } else if (isBold) {
          pdfDoc.font('Helvetica-Bold');
        } else if (isItalic) {
          pdfDoc.font('Helvetica-Oblique');
        } else {
          pdfDoc.font('Helvetica');
        }
        
        pdfDoc.fontSize(fontSize);
        
        // If we have a table structure and this element has an X position
        if (hasTableStructure && element.x) {
          // Find which column this belongs to
          const columnIndex = columnPositions.findIndex(pos => Math.abs(pos - element.x) < 10);
          
          if (columnIndex >= 0) {
            // Calculate the width of this column
            const nextColumnX = columnPositions[columnIndex + 1] || pdfDoc.page.width - pdfDoc.page.margins.right;
            const columnWidth = nextColumnX - columnPositions[columnIndex] - 5;
            
            // Calculate x position in the PDF (adjust for margins)
            const pdfX = pdfDoc.page.margins.left + (columnPositions[columnIndex] * 0.75); // Scale factor
            
            // If different row, move down
            if (element.y && currentY !== element.y) {
              currentY = element.y;
              pdfDoc.moveDown(0.2);
            }
            
            // Position text at the correct column
            pdfDoc.text(element.text, pdfX, pdfDoc.y, {
              width: columnWidth,
              align: element.alignment || 'left',
              lineGap: 1
            });
          } else {
            pdfDoc.text(element.text, {
              align: element.alignment || 'left',
              lineGap: 1
            });
            
            pdfDoc.moveDown(0.3);
          }
        } else {
          pdfDoc.text(element.text, {
            align: element.alignment || 'left',
            lineGap: 1
          });
          
          pdfDoc.moveDown(0.3);
        }
      }
    }
  } else if (page.markdown) {
    // Fallback to markdown if no structured blocks
    // Fallback: render raw markdown content
    
    // Parse markdown content
    const lines = page.markdown.split('\n');
    let inList = false;
    let listIndent = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isFirstLine = i === 0;
      
      // Detect headings
      if (line.startsWith('# ')) {
        // Heading 1
        if (!isFirstLine) {
          pdfDoc.moveDown(0.5);
        }
        pdfDoc.fontSize(14).font('Helvetica-Bold').text(line.replace('# ', ''), {
          lineGap: 2
        });
        
        pdfDoc.moveDown(0.3);
        const lineWidth = pdfDoc.widthOfString(line.replace('# ', ''));
        pdfDoc
          .moveTo(pdfDoc.x, pdfDoc.y)
          .lineTo(pdfDoc.x + Math.min(lineWidth, 400), pdfDoc.y)
          .lineWidth(0.5)
          .stroke();
          
        pdfDoc.moveDown(0.3);
        inList = false;
      } else if (line.startsWith('## ')) {
        // Heading 2
        if (!isFirstLine) {
          pdfDoc.moveDown(0.4);
        }
        pdfDoc.fontSize(12).font('Helvetica-Bold').text(line.replace('## ', ''), {
          lineGap: 2
        });
        
        pdfDoc.moveDown(0.3);
        const lineWidth = pdfDoc.widthOfString(line.replace('## ', ''));
        pdfDoc
          .moveTo(pdfDoc.x, pdfDoc.y)
          .lineTo(pdfDoc.x + Math.min(lineWidth, 300), pdfDoc.y)
          .lineWidth(0.5)
          .stroke();
          
        pdfDoc.moveDown(0.3);
        inList = false;
      } else if (line.startsWith('### ')) {
        // Heading 3
        if (!isFirstLine) {
          pdfDoc.moveDown(0.3);
        }
        pdfDoc.fontSize(11).font('Helvetica-Bold').text(line.replace('### ', ''), {
          lineGap: 2
        });
        pdfDoc.moveDown(0.3);
        inList = false;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) {
          pdfDoc.moveDown(0.3);
          listIndent = 15;
          inList = true;
        }
        
        pdfDoc.fontSize(10).font('Helvetica').text(line, { 
          indent: listIndent,
          lineGap: 1
        });
        pdfDoc.moveDown(0.2);
      } else if (line.trim() === '') {
        if (inList) {
          inList = false;
          pdfDoc.moveDown(0.3);
        } else {
          pdfDoc.moveDown(0.5);
        }
      } else {
        const isGreeting = line.match(/^(Sehr geehrte|Liebe|Hallo|Guten Tag|Betreff)/i);
        
        if (isGreeting) {
          if (!isFirstLine) {
            pdfDoc.moveDown(0.3);
          }
          pdfDoc.fontSize(10).font('Helvetica').text(line, { lineGap: 1 });
          pdfDoc.moveDown(0.3);
        } else {
          if (inList) {
            inList = false;
            pdfDoc.moveDown(0.3);
          }
          
          pdfDoc.fontSize(10).font('Helvetica').text(line, {
            paragraphGap: 3,
            lineGap: 1
          });
        }
      }
    }
  }
}

/**
 * Standard OCR processing (refactored from existing processImage function)
 * @param {string} documentId - The ID of the document to process
 * @param {string} userId - The ID of the user who owns the document
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - The processing result
 */
const processOCR = async (documentId, userId, options = {}) => {
  try {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Get the processing job from the database
    const processingJob = await ProcessingJob.findOne({ documentId });
    if (processingJob) {
      processingJob.progress = 30;
      processingJob.currentStep = 'ocr_processing';
      await processingJob.save();
    }

    // Get the file path
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Read the file as base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    const fileType = document.originalFileType || 'image/jpeg';

    // Update progress
    if (processingJob) {
      processingJob.progress = 50;
      await processingJob.save();
    }

    // Initialize Mistral client
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    // Call Mistral OCR API
    const ocrResponse = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        imageUrl: `data:${fileType};base64,${base64Image}`
      },
      include_image_base64: true,
      include_layout_info: true,
      purpose: 'transcription',
      ocr_options: {
        detect_text: true,
        detect_formulas: true,
        detect_icons: true,
        detect_tables: true,
        language: options.language || 'auto',
        quality: 'high'
      }
    });

    // Update progress
    if (processingJob) {
      processingJob.progress = 80;
      await processingJob.save();
    }

    // Extract content from OCR response
    const pages = ocrResponse.pages || [];
    const markdownContent = pages.map(page => page.markdown || '').join('\n\n');
    const postProcessedMarkdown = postProcessOcrText(markdownContent);

    // Create PDF if requested
    let pdfUrl = null;
    if (options.ocrOutputFormat === 'pdf' || !options.ocrOutputFormat) {
      const userDir = path.join(__dirname, '..', 'uploads', userId.toString());
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      const pdfFileName = `${document.originalFileName.split('.')[0]}.pdf`;
      const pdfFilePath = path.join(userDir, pdfFileName);

      await createExactPDF(fileBuffer, pdfFilePath, document.originalFileName, ocrResponse);
      pdfUrl = `/uploads/${userId}/${pdfFileName}`;
    }

    return {
      extractedText: postProcessedMarkdown,
      ocrConfidence: 85, // Estimated confidence
      pdfUrl,
      pageCount: pages.length || 1
    };

  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
};

/**
 * Handwriting OCR processing with specialized settings
 * @param {string} documentId - The ID of the document to process
 * @param {string} userId - The ID of the user who owns the document
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - The processing result
 */
const processHandwriting = async (documentId, userId, options = {}) => {
  try {
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Get the processing job from the database
    const processingJob = await ProcessingJob.findOne({ documentId });
    if (processingJob) {
      processingJob.progress = 30;
      processingJob.currentStep = 'handwriting_ocr';
      await processingJob.save();
    }

    // Get the file path
    const filePath = path.join(__dirname, '..', document.originalFileUrl);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Read the file as base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    const fileType = document.originalFileType || 'image/jpeg';

    // Update progress
    if (processingJob) {
      processingJob.progress = 50;
      await processingJob.save();
    }

    // Initialize Mistral client
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    // Call Mistral OCR API with handwriting-optimized settings
    const ocrResponse = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        imageUrl: `data:${fileType};base64,${base64Image}`
      },
      include_layout_info: true,
      purpose: 'handwriting', // Specialized for handwriting
      ocr_options: {
        detect_text: true,
        detect_handwriting: true, // Focus on handwriting
        language: options.language || 'auto',
        quality: 'high'
      }
    });

    // Update progress
    if (processingJob) {
      processingJob.progress = 80;
      await processingJob.save();
    }

    // Extract content from OCR response
    const pages = ocrResponse.pages || [];
    const markdownContent = pages.map(page => page.markdown || '').join('\n\n');
    const postProcessedMarkdown = postProcessHandwritingText(markdownContent);

    return {
      extractedText: postProcessedMarkdown,
      ocrConfidence: 75, // Lower confidence for handwriting
      pageCount: pages.length || 1
    };

  } catch (error) {
    console.error('Handwriting OCR error:', error);
    throw error;
  }
};

/**
 * Post-processes handwriting OCR text to fix common issues
 * @param {string} text - The OCR text to process
 * @returns {string} - The processed text
 */
function postProcessHandwritingText(text) {
  if (!text) return text;
  
  let processed = text;
  
  // Common handwriting OCR corrections
  processed = processed.replace(/\br\b/g, 'r'); // Fix isolated 'r' characters
  processed = processed.replace(/\bn\b/g, 'n'); // Fix isolated 'n' characters
  processed = processed.replace(/(\w)1(\w)/g, '$1l$2'); // Replace '1' with 'l' between letters
  processed = processed.replace(/(\w)0(\w)/g, '$1o$2'); // Replace '0' with 'o' between letters
  
  // Fix common letter confusions in handwriting
  processed = processed.replace(/rn/g, 'm'); // 'rn' often misread as 'm'
  processed = processed.replace(/cl/g, 'd'); // 'cl' often misread as 'd'
  
  return processed;
}

module.exports = {
  processImage,
  processOCR,
  processHandwriting,
}; 