// src/components/ImageDisplay.tsx
import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface ImageDisplayProps {
  imageUri?: string | null;
  thumbnail?: boolean;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUri,
  thumbnail = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (!imageUri) {
    return null;
  }

  return (
    <>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)} 
        activeOpacity={0.8}
        style={thumbnail ? styles.thumbnailContainer : styles.fullContainer}
      >
        <Image
          source={{ uri: imageUri }}
          style={thumbnail ? styles.thumbnailImage : styles.fullImage}
          resizeMode="cover"
        />
      </TouchableOpacity>

      {/* Full-screen modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close-circle" size={44} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.modalImageContainer}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnailImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  fullContainer: {
    width: '100%',
    marginBottom: 12,
  },
  fullImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  modalImageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width * 0.95,
    height: height * 0.85,
  },
});

export default ImageDisplay;
