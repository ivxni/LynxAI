const fs = require('fs');
const path = require('path');
const { Mistral } = require('@mistralai/mistralai');
const Document = require('../models/Document');
const ProcessingJob = require('../models/ProcessingJob');

/**
 * Perform OCR and translate the extracted text
 * @param {string} documentId - The document ID
 * @param {string} userId - The user ID
 * @param {Object} options - Processing options
 */
const ocrAndTranslate = async (documentId, userId, options = {}) => {
  console.log('OCR + Translation started for document:', documentId);
  
  try {
    // Get the document
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Update progress
    const processingJob = await ProcessingJob.findOne({ documentId });
    if (processingJob) {
      processingJob.progress = 20;
      processingJob.currentStep = 'ocr_extraction';
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

    // Step 1: Perform OCR
    console.log('Step 1: Performing OCR...');
    const ocrResponse = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        imageUrl: `data:${fileType};base64,${base64Image}`
      },
      include_layout_info: true,
      ocr_options: {
        detect_text: true,
        language: options.sourceLanguage === 'auto' ? 'auto' : options.sourceLanguage || 'auto',
        quality: 'high'
      }
    });

    // Update progress
    if (processingJob) {
      processingJob.progress = 60;
      processingJob.currentStep = 'text_translation';
      await processingJob.save();
    }

    // Extract text from OCR response
    const extractedText = ocrResponse.pages?.map(page => page.markdown || '').join('\n\n') || '';
    
    if (!extractedText.trim()) {
      throw new Error('No text found in the image to translate');
    }

    console.log('Extracted text length:', extractedText.length);

    // Step 2: Translate the text
    const targetLanguage = options.targetLanguage || 'en';
    const sourceLanguage = options.sourceLanguage || 'auto';
    
    console.log(`Step 2: Translating from ${sourceLanguage} to ${targetLanguage}...`);
    
    const translationResponse = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'user',
          content: `Please translate the following text to ${getLanguageName(targetLanguage)}. Only return the translated text, no explanations or additional comments:

${extractedText}`
        }
      ],
      temperature: 0.1, // Low temperature for consistent translations
      max_tokens: 4000
    });

    const translatedText = translationResponse.choices?.[0]?.message?.content || '';
    
    if (!translatedText.trim()) {
      throw new Error('Translation failed - no translated text received');
    }

    // Update progress
    if (processingJob) {
      processingJob.progress = 90;
      await processingJob.save();
    }

    // Detect source language if it was auto
    const detectedSourceLanguage = sourceLanguage === 'auto' ? detectLanguage(extractedText) : sourceLanguage;

    console.log('Translation completed successfully');

    return {
      extractedText,
      translatedText,
      sourceLanguage: detectedSourceLanguage,
      targetLanguage,
      confidence: 85, // Estimated confidence
      wordCount: extractedText.split(/\s+/).length
    };

  } catch (error) {
    console.error('OCR + Translation error:', error);
    throw error;
  }
};

/**
 * Get language name from language code
 * @param {string} langCode - Language code (e.g., 'en', 'de', 'es')
 * @returns {string} Language name
 */
const getLanguageName = (langCode) => {
  const languageMap = {
    'en': 'English',
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'no': 'Norwegian',
    'da': 'Danish',
    'fi': 'Finnish',
    'pl': 'Polish',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'tr': 'Turkish'
  };
  
  return languageMap[langCode] || langCode;
};

/**
 * Simple language detection based on common words/patterns
 * @param {string} text - Text to analyze
 * @returns {string} Detected language code
 */
const detectLanguage = (text) => {
  const lowerText = text.toLowerCase();
  
  // German indicators
  if (lowerText.includes('der ') || lowerText.includes('die ') || lowerText.includes('das ') || 
      lowerText.includes('und ') || lowerText.includes('ist ') || lowerText.includes('ein ')) {
    return 'de';
  }
  
  // Spanish indicators
  if (lowerText.includes('el ') || lowerText.includes('la ') || lowerText.includes('los ') || 
      lowerText.includes('las ') || lowerText.includes('es ') || lowerText.includes('un ')) {
    return 'es';
  }
  
  // French indicators
  if (lowerText.includes('le ') || lowerText.includes('la ') || lowerText.includes('les ') || 
      lowerText.includes('et ') || lowerText.includes('est ') || lowerText.includes('une ')) {
    return 'fr';
  }
  
  // Default to English
  return 'en';
};

/**
 * Translate text only (without OCR)
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @param {string} sourceLanguage - Source language code
 * @returns {Object} Translation result
 */
const translateText = async (text, targetLanguage, sourceLanguage = 'auto') => {
  try {
    const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    
    const translationResponse = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'user',
          content: `Please translate the following text to ${getLanguageName(targetLanguage)}. Only return the translated text, no explanations or additional comments:

${text}`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });

    const translatedText = translationResponse.choices?.[0]?.message?.content || '';
    const detectedSourceLanguage = sourceLanguage === 'auto' ? detectLanguage(text) : sourceLanguage;

    return {
      originalText: text,
      translatedText,
      sourceLanguage: detectedSourceLanguage,
      targetLanguage,
      confidence: 85,
      wordCount: text.split(/\s+/).length
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

module.exports = {
  ocrAndTranslate,
  translateText,
  getLanguageName,
  detectLanguage
}; 