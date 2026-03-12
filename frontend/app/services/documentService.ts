import api from './api';
import { ENDPOINTS } from '../constants/api';
import { Document, ProcessingJob, UploadFile, ProcessingType } from '../types/document.types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Get all documents
export const getDocuments = async (): Promise<Document[]> => {
  try {
    const response = await api.get(ENDPOINTS.DOCUMENTS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get document by ID
export const getDocumentById = async (id: string): Promise<Document> => {
  try {
    const response = await api.get(ENDPOINTS.DOCUMENT_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload document
export const uploadDocument = async (file: UploadFile, processingType: ProcessingType = 'ocr'): Promise<{document: Document, processingJob: ProcessingJob}> => {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'document.jpg',
      type: file.type || 'image/jpeg',
    } as any);
    
    // Add processing type to form data
    formData.append('processingType', processingType);
    
    const response = await api.post(ENDPOINTS.UPLOAD_DOCUMENT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update document status
export const updateDocumentStatus = async (id: string, status: 'processing' | 'completed' | 'failed'): Promise<Document> => {
  try {
    const response = await api.put(ENDPOINTS.DOCUMENT_STATUS(id), { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete document
export const deleteDocument = async (id: string): Promise<{message: string}> => {
  try {
    const response = await api.delete(ENDPOINTS.DOCUMENT_BY_ID(id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get processing job status
export const getProcessingJobStatus = async (id: string): Promise<ProcessingJob> => {
  try {
    const response = await api.get(`${ENDPOINTS.DOCUMENT_BY_ID(id)}/job`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get PDF file URL for viewing
export const getPdfFileUrl = async (id: string): Promise<string> => {
  try {
    const document = await getDocumentById(id);
    
    // Check for both downloadUrl (virtual field) and pdfFileUrl (actual field)
    const pdfPath = document.downloadUrl || document.pdfFileUrl;
    
    if (!pdfPath) {
      console.error('Document PDF fields:', {
        downloadUrl: document.downloadUrl,
        pdfFileUrl: document.pdfFileUrl,
        status: document.status,
        pdfFileName: document.pdfFileName
      });
      throw new Error('PDF file not found');
    }
    
    // Strip /api suffix from baseURL since pdfPath starts with /uploads
    const baseUrl = api.defaults.baseURL || '';
    const baseUrlWithoutApi = baseUrl.replace(/\/api$/, '');
    const pdfUrl = `${baseUrlWithoutApi}${pdfPath}`;
    
    return pdfUrl;
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw error;
  }
};

// Download PDF file for viewing
export const downloadPdfFile = async (id: string): Promise<string> => {
  try {
    const fileUrl = await getPdfFileUrl(id);
    return fileUrl;
  } catch (error) {
    console.error('Error getting PDF URL:', error);
    throw error;
  }
};

/**
 * Downloads the PDF to the device cache and returns the local file URI.
 */
export const downloadAndSavePdf = async (id: string): Promise<string> => {
  try {
    const document = await getDocumentById(id);
    const pdfPath = document.downloadUrl || document.pdfFileUrl;
    
    if (!pdfPath) {
      throw new Error('PDF file not found');
    }
    
    const baseUrl = api.defaults.baseURL || '';
    const baseUrlWithoutApi = baseUrl.replace(/\/api$/, '');
    const pdfUrl = `${baseUrlWithoutApi}${pdfPath}`;
    
    const fileName = document.pdfFileName || document.filename || 
                    (document.originalFilename || document.originalFileName || 'document').replace(/\.[^\.]+$/, '.pdf');
    
    const localFilePath = `${FileSystem.cacheDirectory}${fileName}`;
    
    const downloadResumable = FileSystem.createDownloadResumable(
      pdfUrl,
      localFilePath
    );
    
    const downloadResult = await downloadResumable.downloadAsync();
    
    if (!downloadResult || !downloadResult.uri) {
      throw new Error('Failed to download file');
    }
    
    return downloadResult.uri;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

/**
 * Shares a PDF document via the native share sheet.
 */
export const sharePdf = async (id: string): Promise<void> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    const localFilePath = await downloadAndSavePdf(id);
    
    await Sharing.shareAsync(localFilePath, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share PDF Document',
      UTI: 'com.adobe.pdf'
    });
  } catch (error) {
    console.error('Error sharing PDF:', error);
    throw error;
  }
};

export default {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocumentStatus,
  deleteDocument,
  getProcessingJobStatus,
  getPdfFileUrl,
  downloadPdfFile,
  downloadAndSavePdf,
  sharePdf,
}; 