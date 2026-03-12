import React, { createContext, useState, ReactNode } from 'react';
import documentService from '../services/documentService';
import { Document, ProcessingJob, DocumentState, UploadFile, ProcessingType } from '../types/document.types';

// Create context with default values
interface DocumentContextType extends DocumentState {
  fetchDocuments: () => Promise<Document[]>;
  fetchDocumentById: (id: string) => Promise<Document>;
  uploadDocument: (file: UploadFile, processingType?: ProcessingType) => Promise<{document: Document, processingJob: ProcessingJob}>;
  updateDocumentStatus: (id: string, status: 'processing' | 'completed' | 'failed') => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  getProcessingJobStatus: (id: string) => Promise<ProcessingJob>;
  viewPdf: (id: string) => Promise<string>;
}

const defaultContext: DocumentContextType = {
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,
  fetchDocuments: async () => { throw new Error('Not implemented'); },
  fetchDocumentById: async () => { throw new Error('Not implemented'); },
  uploadDocument: async () => { throw new Error('Not implemented'); },
  updateDocumentStatus: async () => { throw new Error('Not implemented'); },
  deleteDocument: async () => { throw new Error('Not implemented'); },
  getProcessingJobStatus: async () => { throw new Error('Not implemented'); },
  viewPdf: async () => { throw new Error('Not implemented'); },
};

export const DocumentContext = createContext<DocumentContextType>(defaultContext);

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);

  // Fetch all documents
  const fetchDocuments = async (): Promise<Document[]> => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
      return data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch documents');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch document by ID
  const fetchDocumentById = async (id: string): Promise<Document> => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.getDocumentById(id);
      setCurrentDocument(data);
      return data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch document');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Upload document
  const uploadDocument = async (file: UploadFile, processingType: ProcessingType = 'ocr'): Promise<{document: Document, processingJob: ProcessingJob}> => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.uploadDocument(file, processingType);
      // Add the new document to the documents list
      setDocuments((prevDocuments) => [data.document, ...prevDocuments]);
      return data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to upload document');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update document status
  const updateDocumentStatus = async (id: string, status: 'processing' | 'completed' | 'failed'): Promise<Document> => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.updateDocumentStatus(id, status);
      // Update the document in the documents list
      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) => (doc._id === id ? data : doc))
      );
      // Update current document if it's the one being updated
      if (currentDocument && currentDocument._id === id) {
        setCurrentDocument(data);
      }
      return data;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update document status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete document
  const deleteDocument = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await documentService.deleteDocument(id);
      // Remove the document from the documents list
      setDocuments((prevDocuments) =>
        prevDocuments.filter((doc) => doc._id !== id)
      );
      // Clear current document if it's the one being deleted
      if (currentDocument && currentDocument._id === id) {
        setCurrentDocument(null);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete document');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get processing job status
  const getProcessingJobStatus = async (id: string): Promise<ProcessingJob> => {
    try {
      return await documentService.getProcessingJobStatus(id);
    } catch (error: any) {
      throw error;
    }
  };

  // View PDF document
  const viewPdf = async (id: string): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const pdfPath = await documentService.downloadPdfFile(id);
      return pdfPath;
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to view PDF');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        currentDocument,
        loading,
        error,
        fetchDocuments,
        fetchDocumentById,
        uploadDocument,
        updateDocumentStatus,
        deleteDocument,
        getProcessingJobStatus,
        viewPdf,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

// Add default export
export default DocumentProvider; 