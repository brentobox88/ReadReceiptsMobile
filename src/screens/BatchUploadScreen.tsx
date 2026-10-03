import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { createBatch, uploadToBatch, pollBatchUntilComplete } from '../api/batches';

const BatchUploadScreen = () => {
  const navigation = useNavigation();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_URL = 'https://readreceipts-api-sxyz.onrender.com';

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please grant gallery access to upload receipts.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map(asset => asset.uri);
      setSelectedImages(uris);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...selectedImages];
    updated.splice(index, 1);
    setSelectedImages(updated);
  };

        const uploadBatch = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select at least one receipt image.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Step 1: Create a batch
      const batchResponse = await createBatch(`Batch ${new Date().toLocaleDateString()}`);
      const batchId = batchResponse.batch_id;
      
      console.log('?? Batch created:', batchId);

      // Step 2: Prepare files for upload
      const files = selectedImages.map((uri, index) => ({
        uri,
        name: `receipt_${Date.now()}_${index}.jpg`,
      }));

      // Step 3: Upload files to batch
      const uploadResponse = await uploadToBatch(batchId, files);
      console.log('?? Upload response:', uploadResponse);

      // Step 4: Poll for progress
      const finalProgress = await pollBatchUntilComplete(
        batchId,
        (progress) => {
          const percent = progress.progress_percent || 0;
          setUploadProgress(percent);
          console.log(`? Progress: ${percent}%`);
        }
      );

      setLoading(false);

      // Step 5: Show result
      Alert.alert(
        'Batch Complete',
        `${finalProgress.processed_files} of ${finalProgress.total_files} receipts processed`,
        [
          {
            text: 'View Receipts',
            onPress: () => (navigation as any).navigate('MainTabs', { screen: 'Receipts' })
          }
        ]
      );

    } catch (error: any) {
      console.error('Batch upload error:', error);
      setLoading(false);
      Alert.alert('Error', error.message || 'Batch upload failed');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2196F3']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Batch Upload</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {selectedImages.length === 0 ? (
          <TouchableOpacity style={styles.selectButton} onPress={pickImages}>
            <Ionicons name="images-outline" size={64} color="#4CAF50" />
            <Text style={styles.selectText}>Tap to select receipts</Text>
            <Text style={styles.selectSubtext}>Choose multiple images from your gallery</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.previewGrid}>
              {selectedImages.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                    <Ionicons name="close-circle" size={24} color="#F44336" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.addButton} onPress={pickImages}>
              <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
              <Text style={styles.addButtonText}>Add More</Text>
            </TouchableOpacity>
          </>
        )}

        {loading && (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.progressText}>Uploading... {Math.round(uploadProgress)}%</Text>
          </View>
        )}
      </ScrollView>

      {selectedImages.length > 0 && !loading && (
        <TouchableOpacity style={styles.uploadButton} onPress={uploadBatch}>
          <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>Upload {selectedImages.length} Receipts</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  selectSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  imageContainer: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

export default BatchUploadScreen;





