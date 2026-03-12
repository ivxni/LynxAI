import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, Platform, ImageSourcePropType, LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import colors from '../constants/colors';
import { useDocuments } from '../hooks/useDocuments';
import { useTranslation } from '../utils/i18n';
import { UploadFile, ProcessingType } from '../types/document.types';
import useThemeColors from '../utils/useThemeColors';
import ProcessingOptionsModal from '../components/common/ProcessingOptionsModal';

export default function Upload() {
  const router = useRouter();
  const { uploadDocument, getProcessingJobStatus } = useDocuments();
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timer | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [cropSize, setCropSize] = useState({ width: 0, height: 0 });
  const [cropOrigin, setCropOrigin] = useState({ x: 0, y: 0 });
  const [cropDimensions, setCropDimensions] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageLayout, setImageLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showProcessingOptions, setShowProcessingOptions] = useState(false);
  const [selectedProcessingType, setSelectedProcessingType] = useState<ProcessingType | undefined>(undefined);
  const cropImageContainerRef = useRef<View>(null);

  // Set up polling for document status
  useEffect(() => {
    if (uploadedDocId && uploading) {
      // Set up polling to check document status every 3 seconds
      const interval = setInterval(async () => {
        try {
          const job = await getProcessingJobStatus(uploadedDocId);
          console.log('Processing job status:', job.status, 'Progress:', job.progress);
          
          // Update progress
          setProgress(job.progress || 0);
          
          // If job is completed or failed, stop polling and update UI
          if (job.status === 'completed' || job.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
            setUploading(false);
            
            if (job.status === 'completed') {
              Alert.alert(
                t('upload.success'),
                t('upload.successMessage'),
                [
                  {
                    text: t('common.ok'),
                    onPress: () => {
                      // Navigate to history page
                      router.replace('/(app)/history');
                    },
                  },
                ]
              );
            } else {
              Alert.alert(
                t('upload.error'),
                job.errorDetails || t('upload.errorMessage')
              );
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 3000);
      
      setPollingInterval(interval);
      
      // Clean up interval on unmount
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [uploadedDocId, uploading]);

  // Function to measure original image dimensions
  useEffect(() => {
    if (image) {
      Image.getSize(
        image,
        (width, height) => {
          setImageSize({ width, height });
        },
        (error) => {
          console.error('Error getting image size:', error);
        }
      );
    }
  }, [image]);

  // Function to convert screen coordinates to image coordinates
  const screenToImageCoordinates = (screenX: number, screenY: number) => {
    // Calculate image display size and position within container (accounting for resizeMode="contain")
    const containerAspectRatio = containerSize.width / containerSize.height;
    const imageAspectRatio = imageSize.width / imageSize.height;
    
    let displayWidth, displayHeight, offsetX, offsetY;
    
    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider than container (relative to height)
      displayWidth = containerSize.width;
      displayHeight = containerSize.width / imageAspectRatio;
      offsetX = 0;
      offsetY = (containerSize.height - displayHeight) / 2;
    } else {
      // Image is taller than container (relative to width)
      displayHeight = containerSize.height;
      displayWidth = containerSize.height * imageAspectRatio;
      offsetX = (containerSize.width - displayWidth) / 2;
      offsetY = 0;
    }
    
    // Convert screen coordinates to image coordinates
    const imageX = ((screenX - offsetX) / displayWidth) * imageSize.width;
    const imageY = ((screenY - offsetY) / displayHeight) * imageSize.height;
    
    // Ensure coordinates are within image bounds
    return {
      x: Math.max(0, Math.min(imageSize.width, imageX)),
      y: Math.max(0, Math.min(imageSize.height, imageY))
    };
  };

  const pickImage = async () => {
    console.log('pickImage called');
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setCropMode(true);
    }
  };

  const takePhoto = async () => {
    console.log('takePhoto called');
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        t('upload.permissionRequired'),
        t('upload.cameraPermission')
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setCropMode(true);
    }
  };

  const handleProcessingOptionSelect = async (processingType: ProcessingType) => {
    console.log('Processing option selected:', processingType);
    
    // Close modal immediately
    setShowProcessingOptions(false);
    
    // Set processing type and start upload
    setSelectedProcessingType(processingType);
    
         // Use setTimeout to ensure modal closes smoothly
     setTimeout(() => {
       performUpload(processingType);
     }, 50);
  };

  const cropImage = async () => {
    if (!image) return;

    try {
      // Convert screen coordinates to image coordinates
      const originInImage = screenToImageCoordinates(cropOrigin.x, cropOrigin.y);
      const endPointInImage = screenToImageCoordinates(
        cropOrigin.x + cropDimensions.width,
        cropOrigin.y + cropDimensions.height
      );
      
      // Calculate crop area in image coordinates
      const cropArea = {
        originX: Math.min(originInImage.x, endPointInImage.x),
        originY: Math.min(originInImage.y, endPointInImage.y),
        width: Math.abs(endPointInImage.x - originInImage.x),
        height: Math.abs(endPointInImage.y - originInImage.y)
      };

      console.log('Crop Area:', cropArea);
      
      // Ensure we have valid crop dimensions
      if (cropArea.width < 10 || cropArea.height < 10) {
        Alert.alert(
          "Crop area too small",
          "Please select a larger area to crop."
        );
        return;
      }

      // Perform the crop operation
      const manipResult = await ImageManipulator.manipulateAsync(
        image,
        [{ crop: cropArea }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCroppedImage(manipResult.uri);
      setCropMode(false);
    } catch (error) {
      console.error('Error cropping image:', error);
      Alert.alert(
        t('upload.error'),
        "Error cropping image. Please try again."
      );
    }
  };

  const handleCropStart = (x: number, y: number) => {
    setCropOrigin({ x, y });
    setCropDimensions({ width: 0, height: 0 });
  };

  const handleCropMove = (x: number, y: number) => {
    setCropDimensions({
      width: x - cropOrigin.x,
      height: y - cropOrigin.y
    });
  };

  const handleCropEnd = () => {
    // Ensure dimensions are positive
    const width = Math.abs(cropDimensions.width);
    const height = Math.abs(cropDimensions.height);
    
    // Recalculate origin if necessary (if user dragged from right/bottom to left/top)
    const originX = cropDimensions.width < 0 
      ? cropOrigin.x + cropDimensions.width 
      : cropOrigin.x;
    
    const originY = cropDimensions.height < 0 
      ? cropOrigin.y + cropDimensions.height 
      : cropOrigin.y;
    
    setCropOrigin({ x: originX, y: originY });
    setCropDimensions({ width, height });
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const performUpload = async (processingType: ProcessingType) => {
    if (!croppedImage && !image) return;
    
    const imageToUpload = croppedImage || image;
    if (!imageToUpload) return;

    try {
      setUploading(true);
      
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(imageToUpload);
      
      // Create upload file object
      const uploadFile: UploadFile = {
        uri: Platform.OS === 'ios' ? imageToUpload.replace('file://', '') : imageToUpload,
        name: imageToUpload.split('/').pop() || 'image.jpg',
        type: 'image/jpeg', // Adjust based on your image type
      };

      // Upload the document with specified processing type
      console.log('Uploading with processing type:', processingType);
      const result = await uploadDocument(uploadFile, processingType);
      console.log('Upload result:', result);
      
      // Set document ID for polling
      setUploadedDocId(result.document._id);
      setProgress(0);
      
      // Do not show success message here - wait for polling to confirm processing is complete
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert(
        t('upload.error'),
        t('upload.errorMessage')
      );
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!croppedImage && !image) return;
    
    const imageToUpload = croppedImage || image;
    if (!imageToUpload) return;

    // Ensure processing type is selected
    if (!selectedProcessingType) {
      console.log('No processing type selected, showing modal');
      setShowProcessingOptions(true);
      return;
    }

    // Use the performUpload function with the selected type
    await performUpload(selectedProcessingType);
  };

  const showProcessingOptionsModal = () => {
    if (!croppedImage && !image) {
      Alert.alert(
        t('upload.error'),
        'Please select or take a photo first'
      );
      return;
    }
    setShowProcessingOptions(true);
  };

  const renderCropMode = () => {
    if (!image) return null;
    
    return (
      <View style={styles.cropContainer}>
        <View 
          ref={cropImageContainerRef}
          style={styles.cropImageContainer}
          onLayout={handleContainerLayout}
        >
          <Image 
            source={{ uri: image }} 
            style={styles.cropImage} 
            resizeMode="contain"
            onLayout={(e) => {
              // Store the image layout information
              const { x, y, width, height } = e.nativeEvent.layout;
              setImageLayout({ x, y, width, height });
            }}
          />
          
          {/* Crop Area Overlay */}
          <View 
            style={[
              styles.cropAreaOverlay, 
              {
                left: cropOrigin.x,
                top: cropOrigin.y,
                width: cropDimensions.width,
                height: cropDimensions.height,
                borderWidth: 2,
                borderColor: themeColors.primary
              }
            ]} 
          />
          
          {/* Touch Handler View */}
          <View 
            style={styles.cropTouchHandler}
            onTouchStart={(e) => {
              handleCropStart(e.nativeEvent.locationX, e.nativeEvent.locationY);
            }}
            onTouchMove={(e) => {
              handleCropMove(e.nativeEvent.locationX, e.nativeEvent.locationY);
            }}
            onTouchEnd={handleCropEnd}
          />
        </View>
        
        <View style={styles.cropInstructions}>
          <Text style={[styles.cropInstructionsText, { color: themeColors.text }]}>
            {"Draw a rectangle to crop the image"}
          </Text>
        </View>
        
        <View style={styles.previewActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton, { backgroundColor: themeColors.surfaceVariant }]}
            onPress={() => {
              setCropMode(false);
              setImage(null);
            }}
          >
            <MaterialIcons name="close" size={24} color={themeColors.error} />
            <Text style={[styles.actionButtonText, styles.cancelButtonText, { color: themeColors.error }]}>
              {t('common.cancel')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.uploadButton, { backgroundColor: themeColors.surfaceVariant }]}
            onPress={cropImage}
          >
            <MaterialIcons name="content-cut" size={24} color={themeColors.success} />
            <Text style={[styles.actionButtonText, styles.uploadButtonText, { color: themeColors.success }]}>
              {"Crop"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (uploading) {
      return (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.uploadingText, { color: themeColors.text }]}>
            {t('upload.processing')} ({progress}%)
          </Text>
        </View>
      );
    }

    if (cropMode && image) {
      return renderCropMode();
    }

    if (croppedImage || image) {
      const displayImage = croppedImage || image;
      return (
        <View style={styles.previewContainer}>
          {displayImage && (
            <View style={styles.previewImageContainer}>
              <Image 
                source={{ uri: displayImage as string }} 
                style={styles.previewImage}
                resizeMode="contain" 
              />
            </View>
          )}
          <View style={styles.previewActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton, { backgroundColor: themeColors.surfaceVariant }]}
              onPress={() => {
                setImage(null);
                setCroppedImage(null);
              }}
            >
              <MaterialIcons name="close" size={24} color={themeColors.error} />
              <Text style={[styles.actionButtonText, styles.cancelButtonText, { color: themeColors.error }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.uploadButton, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowProcessingOptions(true)}
            >
              <MaterialIcons name="check" size={24} color={themeColors.white} />
              <Text style={[styles.actionButtonText, styles.uploadButtonText, { color: themeColors.white }]}>
                {t('upload.confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.optionButton, { 
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.primary
          }]}
          onPress={pickImage}
        >
          <View style={[styles.optionIconContainer, { backgroundColor: themeColors.surfaceVariant }]}>
            <MaterialIcons name="photo-library" size={40} color={themeColors.primary} />
          </View>
          <Text style={[styles.optionText, { color: themeColors.text }]}>
            {t('upload.selectImage')}
          </Text>
          <Text style={[styles.optionDescription, { color: themeColors.textSecondary }]}>
            {t('upload.selectImageDescription')}
          </Text>
        </TouchableOpacity>

        <View style={styles.optionDivider} />

        <TouchableOpacity 
          style={[styles.optionButton, { 
            backgroundColor: themeColors.surface,
            shadowColor: themeColors.primary
          }]}
          onPress={takePhoto}
        >
          <View style={[styles.optionIconContainer, { backgroundColor: themeColors.surfaceVariant }]}>
            <MaterialIcons name="camera-alt" size={40} color={themeColors.primary} />
          </View>
          <Text style={[styles.optionText, { color: themeColors.text }]}>
            {t('upload.takePhoto')}
          </Text>
          <Text style={[styles.optionDescription, { color: themeColors.textSecondary }]}>
            {t('upload.takePhotoDescription')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const executeImageAction = async () => {
    // This function is now deprecated, keeping for backwards compatibility
    console.log('executeImageAction called - this should not happen anymore');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {t('upload.title')}
        </Text>
      </View>

      {renderContent()}

      <ProcessingOptionsModal
        visible={showProcessingOptions}
        onClose={() => {
          setShowProcessingOptions(false);
        }}
        onSelectOption={handleProcessingOptionSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
    height: 60,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  cancelButton: {},
  cancelButtonText: {},
  uploadButton: {},
  uploadButtonText: {},
  optionsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  optionButton: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  optionDivider: {
    height: 24,
  },
  // New styles for crop mode
  cropContainer: {
    flex: 1,
    padding: 16,
  },
  cropImageContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropImage: {
    width: '100%',
    height: '100%',
  },
  cropAreaOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cropTouchHandler: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cropInstructions: {
    marginTop: 16,
    alignItems: 'center',
  },
  cropInstructionsText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 