import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Base64 from '../utils/base64';

const ENCRYPTION_KEY_STORAGE_KEY = 'user_encryption_key';

/**
 * Client-side file encryption using XOR cipher.
 * Provides a basic layer of protection for documents in transit and at rest.
 * For production use, replace with a proper cryptographic library (e.g., AES-256).
 */

function simpleEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

/** XOR decryption is symmetric with encryption. */
function simpleDecrypt(encrypted: string, key: string): string {
  return simpleEncrypt(encrypted, key);
}

function generateSimpleKey(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters.charAt(randomIndex);
  }
  return key;
}

/**
 * Retrieves or generates a per-user encryption key.
 * Keys are stored in AsyncStorage (mobile) or localStorage (web).
 */
export const getUserEncryptionKey = async (): Promise<string> => {
  try {
    let key: string | null;
    
    if (Platform.OS === 'web') {
      key = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
    } else {
      key = await AsyncStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
    }
    
    if (!key) {
      key = generateSimpleKey(64);
      
      if (Platform.OS === 'web') {
        localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, key);
      } else {
        await AsyncStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, key);
      }
    }
    
    return key;
  } catch (error) {
    console.error('Error getting encryption key:', error);
    throw new Error('Failed to get encryption key');
  }
};

/** Derives a short fingerprint from a key for integrity verification. */
function simpleFingerprint(key: string): string {
  return key.substring(0, 5) + key.substring(key.length - 5);
}

/**
 * Encrypts a file using XOR cipher and stores it as a JSON envelope
 * containing the Base64-encoded ciphertext and metadata.
 */
export const encryptFile = async (fileUri: string): Promise<{encryptedUri: string, keyFingerprint: string}> => {
  try {
    const key = await getUserEncryptionKey();
    const keyFingerprint = simpleFingerprint(key);
    
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    const encrypted = simpleEncrypt(fileContent, key);
    
    const encryptedData = JSON.stringify({
      content: Base64.encode(encrypted),
      version: '1.0'
    });
    
    const tempDir = `${FileSystem.cacheDirectory || ''}encrypted_files/`;
    const fileName = `encrypted_${Date.now()}.enc`;
    const encryptedUri = tempDir + fileName;
    
    await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true }).catch(() => {});
    await FileSystem.writeAsStringAsync(encryptedUri, encryptedData);
    
    return { encryptedUri, keyFingerprint };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt file');
  }
};

/**
 * Wraps encryption with file metadata for upload.
 * Returns the encrypted URI, size, fingerprint, and format version.
 */
export const prepareSecureUpload = async (fileUri: string) => {
  try {
    const { encryptedUri, keyFingerprint } = await encryptFile(fileUri);
    const fileInfo = await FileSystem.getInfoAsync(encryptedUri);
    
    let fileSize = 0;
    if (fileInfo.exists) {
      const fileInfoWithSize = fileInfo as FileSystem.FileInfo & { size: number };
      fileSize = fileInfoWithSize.size || 0;
    }
    
    return {
      uri: encryptedUri,
      fileSize,
      keyFingerprint,
      encryptionVersion: '1.0'
    };
  } catch (error) {
    console.error('Error preparing secure upload:', error);
    throw new Error('Failed to prepare file for secure upload');
  }
};

/**
 * Decrypts a previously encrypted file.
 * Supports both the JSON envelope format and raw Base64 fallback
 * for files received directly from the server.
 */
export const decryptFile = async (encryptedFileUri: string, keyFingerprint?: string): Promise<string> => {
  try {
    const key = await getUserEncryptionKey();
    
    if (keyFingerprint) {
      const currentKeyFingerprint = simpleFingerprint(key);
      if (currentKeyFingerprint !== keyFingerprint) {
        console.warn(`Key fingerprint mismatch: expected ${keyFingerprint}, got ${currentKeyFingerprint}`);
      }
    }
    
    const encryptedDataString = await FileSystem.readAsStringAsync(encryptedFileUri);
    let encryptedContent;
    
    try {
      const encryptedData = JSON.parse(encryptedDataString);
      
      if (!encryptedData.content) {
        throw new Error('Invalid encryption format: content field missing');
      }
      
      encryptedContent = Base64.decode(encryptedData.content);
    } catch (parseError) {
      // Fallback: file may not be in JSON envelope format (e.g., received from server)
      try {
        encryptedContent = Base64.decode(encryptedDataString);
      } catch (base64Error) {
        encryptedContent = encryptedDataString;
      }
    }
    
    let decryptedContent;
    try {
      decryptedContent = simpleDecrypt(encryptedContent, key);
    } catch (decryptError) {
      console.error('Primary decryption failed:', decryptError);
      
      try {
        const rawContent = Base64.decode(encryptedDataString);
        decryptedContent = simpleDecrypt(rawContent, key);
      } catch (fallbackError) {
        console.error('Fallback decryption failed:', fallbackError);
        throw new Error('Decryption failed: unrecognized file format');
      }
    }
    
    // Validate whether decrypted output is Base64-encoded binary (likely an image)
    let isValidBase64 = false;
    try {
      const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      isValidBase64 = base64Regex.test(decryptedContent.replace(/\s/g, ''));
      
      if (isValidBase64) {
        const sample = decryptedContent.substring(0, 100);
        Base64.decode(sample);
      }
    } catch {
      isValidBase64 = false;
    }
    
    const tempDir = `${FileSystem.cacheDirectory || ''}decrypted_files/`;
    const fileName = `decrypted_${Date.now()}.jpg`;
    const decryptedUri = tempDir + fileName;
    
    await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true }).catch(() => {});
    
    if (isValidBase64) {
      await FileSystem.writeAsStringAsync(
        decryptedUri,
        decryptedContent,
        { encoding: FileSystem.EncodingType.Base64 }
      );
    } else {
      await FileSystem.writeAsStringAsync(decryptedUri, decryptedContent);
      
      // Attempt Base64 write as fallback in case the validation was a false negative
      const fallbackUri = tempDir + `fallback_${Date.now()}.jpg`;
      try {
        await FileSystem.writeAsStringAsync(
          fallbackUri,
          decryptedContent,
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        const fallbackInfo = await FileSystem.getInfoAsync(fallbackUri);
        if (fallbackInfo.exists && (fallbackInfo as any).size > 100) {
          return fallbackUri;
        }
      } catch {
        // Fallback write failed, use the original text file
      }
    }
    
    return decryptedUri;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt file: ' + (error instanceof Error ? error.message : String(error)));
  }
};

export default {
  getUserEncryptionKey,
  encryptFile,
  prepareSecureUpload,
  decryptFile
};
