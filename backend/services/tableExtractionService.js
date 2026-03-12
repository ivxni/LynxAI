const fs = require('fs');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');

/**
 * Extract tables from document image
 * @param {string} documentId - The document ID
 * @param {string} userId - The user ID
 * @param {Object} options - Processing options
 */
const extractTables = async (documentId, userId, options = {}) => {
  console.log('Table extraction started for document:', documentId);
  
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
      processingJob.currentStep = 'extracting_tables';
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

    // Update progress
    if (processingJob) {
      processingJob.progress = 50;
      await processingJob.save();
    }

    // Initialize Mistral client
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

    // Call Mistral OCR API with table extraction focus
    const ocrResponse = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        imageUrl: `data:${fileType};base64,${base64Image}`
      },
      include_layout_info: true,
      ocr_options: {
        detect_tables: true,
        detect_text: true,
        language: options.language || 'en',
        quality: 'high'
      }
    });

    // Update progress
    if (processingJob) {
      processingJob.progress = 80;
      await processingJob.save();
    }

    // Extract tables from OCR response
    const extractedTables = [];
    
    if (ocrResponse.pages && ocrResponse.pages.length > 0) {
      for (const page of ocrResponse.pages) {
        if (page.blocks) {
          for (const block of page.blocks) {
            if (block.type === 'table' && block.table) {
              const table = {
                headers: block.table.headers || [],
                rows: block.table.rows || [],
                confidence: block.confidence || 85
              };
              extractedTables.push(table);
            }
          }
        }
      }
    }

    // If no structured tables found, try to parse from text
    if (extractedTables.length === 0) {
      const textContent = ocrResponse.pages?.map(page => page.markdown || '').join('\n') || '';
      const parsedTables = parseTablesFromText(textContent);
      extractedTables.push(...parsedTables);
    }

    // Create CSV file if tables found and CSV output requested
    let tableFileUrl = null;
    const outputFormat = options.tableOutputFormat || 'csv';
    
    if (extractedTables.length > 0 && outputFormat === 'csv') {
      tableFileUrl = await createTableFile(extractedTables, userId, document.originalFileName, 'csv');
    }

    console.log(`Table extraction completed. Found ${extractedTables.length} tables`);

    return {
      tables: extractedTables,
      tableFileUrl,
      totalTables: extractedTables.length
    };

  } catch (error) {
    console.error('Table extraction error:', error);
    throw error;
  }
};

/**
 * Parse tables from plain text using heuristics
 * @param {string} text - The text to parse
 * @returns {Array} Array of table objects
 */
const parseTablesFromText = (text) => {
  const tables = [];
  const lines = text.split('\n').filter(line => line.trim());
  
  // Simple heuristic: look for lines with multiple tab/space separations
  const potentialTableLines = lines.filter(line => {
    const parts = line.split(/\s{2,}|\t/).filter(part => part.trim());
    return parts.length >= 2; // At least 2 columns
  });

  if (potentialTableLines.length >= 2) {
    // Try to create a table from these lines
    const tableRows = potentialTableLines.map(line => {
      return line.split(/\s{2,}|\t/).filter(part => part.trim());
    });

    // Use first row as headers if it looks like headers
    const headers = tableRows[0];
    const rows = tableRows.slice(1);

    if (rows.length > 0) {
      tables.push({
        headers,
        rows,
        confidence: 70 // Lower confidence for parsed tables
      });
    }
  }

  return tables;
};

/**
 * Create table file in specified format
 * @param {Array} tables - Array of table objects
 * @param {string} userId - User ID
 * @param {string} originalFileName - Original filename
 * @param {string} format - Output format (csv, json)
 * @returns {string} File URL
 */
const createTableFile = async (tables, userId, originalFileName, format) => {
  try {
    // Create user directory if it doesn't exist
    const userDir = path.join(__dirname, '..', 'uploads', userId.toString());
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    const baseFileName = path.parse(originalFileName).name;
    const outputFileName = `${baseFileName}_tables.${format}`;
    const outputFilePath = path.join(userDir, outputFileName);

    if (format === 'csv') {
      // Create CSV content
      let csvContent = '';
      
      tables.forEach((table, tableIndex) => {
        if (tableIndex > 0) csvContent += '\n\n'; // Separate multiple tables
        
        csvContent += `Table ${tableIndex + 1}\n`;
        
        // Add headers
        if (table.headers && table.headers.length > 0) {
          csvContent += table.headers.map(header => `"${header}"`).join(',') + '\n';
        }
        
        // Add rows
        table.rows.forEach(row => {
          csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
      });

      fs.writeFileSync(outputFilePath, csvContent, 'utf8');
    } else if (format === 'json') {
      // Create JSON content
      const jsonContent = JSON.stringify(tables, null, 2);
      fs.writeFileSync(outputFilePath, jsonContent, 'utf8');
    }

    return `/uploads/${userId}/${outputFileName}`;
  } catch (error) {
    console.error('Error creating table file:', error);
    return null;
  }
};

module.exports = {
  extractTables,
  parseTablesFromText,
  createTableFile
}; 