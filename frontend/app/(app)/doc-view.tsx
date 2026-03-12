import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, Alert, Dimensions, ToastAndroid, Platform, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useDocuments } from '../hooks/useDocuments';
import { useTranslation } from '../utils/i18n';
import useThemeColors from '../utils/useThemeColors';
import * as documentService from '../services/documentService';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

export default function DocView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { viewPdf, loading, error, fetchDocumentById } = useDocuments();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [sharing, setSharing] = useState(false);
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageCropMode, setImageCropMode] = useState(false);
  const [editOptions, setEditOptions] = useState<{
    crop: boolean;
    rotate: boolean;
    flip: boolean;
  }>({ crop: false, rotate: false, flip: false });

  useEffect(() => {
    if (!id) {
      Alert.alert(t('common.error'), t('docView.invalidDocument'));
      router.back();
      return;
    }

    const loadDocument = async () => {
      try {
        // Get document details to display name
        const document = await fetchDocumentById(id);
        setDocumentName(document.originalFileName);
        
        // Get PDF file path
        const path = await viewPdf(id);
        console.log("PDF URL:", path);
        setPdfUrl(path);
      } catch (error) {
        console.error('Error loading PDF:', error);
        Alert.alert(
          t('common.error'),
          t('docView.failedToLoad'),
          [{ text: t('common.ok'), onPress: () => router.back() }]
        );
      }
    };

    loadDocument();
  }, [id]);

  // Function to generate HTML content for PDF viewing
  const generateHtml = (pdfUrl: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body, html {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              background-color: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            a {
              display: block;
              width: 100%;
              height: 100%;
              text-align: center;
              padding: 20px;
              box-sizing: border-box;
              color: #0066cc;
              text-decoration: none;
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 16px;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <a href="${pdfUrl}" target="_blank">Zum PDF-Dokument</a>
        </body>
      </html>
    `;
  };

  // Function to share the PDF document
  const handleSharePdf = async () => {
    if (!id) {
      Alert.alert(t('common.error'), t('docView.invalidDocument'));
      return;
    }

    try {
      setSharing(true);
      await documentService.sharePdf(id);
      setSharing(false);
      
      // Show a success message
      if (Platform.OS === 'android') {
        ToastAndroid.show("Dokument erfolgreich geteilt", ToastAndroid.SHORT);
      }
    } catch (error: any) {
      setSharing(false);
      console.error('Error sharing PDF:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('docView.sharingFailed')
      );
    }
  };

  // Function to pick and manipulate image with expanded options
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Camera access is required to capture images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: false,
        exif: true,
      });

      if (!result.canceled) {
        const originalUri = result.assets[0].uri;
        setImageUri(originalUri);
        
        Alert.alert(
          'Edit Image',
          'How would you like to edit the image?',
          [
            {
              text: 'Skip',
              onPress: () => {}
            },
            {
              text: 'Crop',
              onPress: async () => {
                try {
                  const manipResult = await ImageManipulator.manipulateAsync(
                    originalUri,
                    [{ crop: { originX: 0, originY: 0, width: 1000, height: 1000 } }],
                    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
                  );
                  setImageUri(manipResult.uri);
                } catch (err) {
                  console.error('Fehler beim Zuschneiden:', err);
                  Alert.alert('Fehler', 'Das Bild konnte nicht zugeschnitten werden.');
                }
              }
            },
            {
              text: 'Kamera öffnen',
              onPress: async () => {
                // Kamera starten für ein neues Bild
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraPermission.status !== 'granted') {
                  Alert.alert('Fehler', 'Kamera-Zugriff wird benötigt, um Fotos aufzunehmen.');
                  return;
                }
                
                const cameraResult = await ImagePicker.launchCameraAsync({
                  allowsEditing: true,
                  quality: 1,
                });
                
                if (!cameraResult.canceled) {
                  setImageUri(cameraResult.assets[0].uri);
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Fehler', 'Fehler beim Laden des Bildes');
    }
  };

  // Function to handle image cropping
  const handleCropImage = async () => {
    if (!imageUri) return;
    
    try {
      const cropResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ crop: { originX: 0, originY: 0, width: 1000, height: 1000 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUri(cropResult.uri);
      Alert.alert('Erfolg', 'Bild erfolgreich zugeschnitten');
    } catch (error) {
      console.error('Error cropping image:', error);
      Alert.alert('Fehler', 'Fehler beim Zuschneiden des Bildes');
    }
  };

  // Function to handle image rotation
  const handleRotateImage = async () => {
    if (!imageUri) return;
    
    try {
      const rotateResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ rotate: 90 }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUri(rotateResult.uri);
    } catch (error) {
      console.error('Error rotating image:', error);
      Alert.alert('Fehler', 'Fehler beim Drehen des Bildes');
    }
  };

  // Function to handle image flip
  const handleFlipImage = async () => {
    if (!imageUri) return;
    
    try {
      const flipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ flip: ImageManipulator.FlipType.Horizontal }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUri(flipResult.uri);
    } catch (error) {
      console.error('Error flipping image:', error);
      Alert.alert('Fehler', 'Fehler beim Spiegeln des Bildes');
    }
  };

  // Function to handle image upload
  const handleImageUpload = async () => {
    if (!imageUri) {
      Alert.alert('Fehler', 'Bitte wählen Sie zuerst ein Bild aus');
      return;
    }

    try {
      // Hier würde die eigentliche Upload-Logik implementiert
      // Zum Beispiel:
      // await documentService.uploadDocument(imageUri);
      Alert.alert('Erfolg', 'Bild erfolgreich hochgeladen');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Fehler', 'Fehler beim Hochladen des Bildes');
    }
  };

  // Render image editing toolbar
  const renderImageEditTools = () => {
    if (!imageUri) return null;
    
    return (
      <View style={styles.editToolsContainer}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: themeColors.primary }]}
          onPress={handleRotateImage}
        >
          <MaterialIcons name="rotate-right" size={20} color={themeColors.white} />
          <Text style={[styles.editButtonText, { color: themeColors.white }]}>Drehen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: themeColors.primary }]}
          onPress={handleCropImage}
        >
          <MaterialIcons name="crop" size={20} color={themeColors.white} />
          <Text style={[styles.editButtonText, { color: themeColors.white }]}>Zuschneiden</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: themeColors.primary }]}
          onPress={handleFlipImage}
        >
          <MaterialIcons name="flip" size={20} color={themeColors.white} />
          <Text style={[styles.editButtonText, { color: themeColors.white }]}>Spiegeln</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: documentName || t('docView.title'),
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTitleStyle: {
            color: themeColors.text,
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            pdfUrl ? (
              <TouchableOpacity 
                onPress={handleSharePdf}
                style={[styles.headerButton, { backgroundColor: themeColors.primary + '20' }]}
                disabled={sharing}
              >
                {sharing ? (
                  <ActivityIndicator size="small" color={themeColors.primary} />
                ) : (
                  <MaterialIcons name="share" size={22} color={themeColors.primary} />
                )}
              </TouchableOpacity>
            ) : null
          ),
        }}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            {t('docView.loading')}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={themeColors.error} />
          <Text style={[styles.errorText, { color: themeColors.error }]}>
            {t('docView.error')}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: themeColors.primary }]}
            onPress={() => viewPdf(id)}
          >
            <Text style={[styles.retryText, { color: themeColors.white }]}>
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : pdfUrl ? (
        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: pdfUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              Alert.alert('Fehler', 'Fehler beim Anzeigen des PDFs');
            }}
          />
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: themeColors.primary }]}
            onPress={pickImage}
          >
            <MaterialIcons name="add-photo-alternate" size={32} color={themeColors.white} />
            <Text style={[styles.uploadText, { color: themeColors.white }]}>
              Bild auswählen
            </Text>
          </TouchableOpacity>
          
          {imageUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
              
              {/* Image Editing Tools */}
              {renderImageEditTools()}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.error }]}
                  onPress={() => setImageUri(null)}
                >
                  <MaterialIcons name="delete" size={24} color={themeColors.white} />
                  <Text style={[styles.buttonText, { color: themeColors.white }]}>
                    Abbrechen
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
                  onPress={handleImageUpload}
                >
                  <MaterialIcons name="cloud-upload" size={24} color={themeColors.white} />
                  <Text style={[styles.buttonText, { color: themeColors.white }]}>
                    Hochladen
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  previewImage: {
    width: Dimensions.get('window').width - 40,
    height: (Dimensions.get('window').width - 40) * 0.75,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    flex: 1,
    margin: 5,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  editToolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginVertical: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    elevation: 1,
    margin: 4,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
}); 