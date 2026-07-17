import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProcessingOverlay({ progress = 0 }) {
  const spinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    
    return () => {
      spinValue.stopAnimation();
    };
  }, []);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
          <Ionicons name="scan" size={40} color="#4A90E2" />
        </Animated.View>
        
        <Text style={styles.title}>Scanning Receipt</Text>
        <Text style={styles.subtitle}>Extracting details...</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
        
        <View style={styles.steps}>
          <View style={styles.step}>
            <View style={[styles.stepIcon, styles.stepActive]}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </View>
            <Text style={styles.stepText}>Captured</Text>
          </View>
          
          <View style={styles.stepLine} />
          
          <View style={styles.step}>
            <View style={[styles.stepIcon, progress > 33 && styles.stepActive]}>
              <Ionicons name="text" size={16} color={progress > 33 ? "#FFF" : "#666"} />
            </View>
            <Text style={styles.stepText}>OCR</Text>
          </View>
          
          <View style={styles.stepLine} />
          
          <View style={styles.step}>
            <View style={[styles.stepIcon, progress > 66 && styles.stepActive]}>
              <Ionicons name="checkmark" size={16} color={progress > 66 ? "#FFF" : "#666"} />
            </View>
            <Text style={styles.stepText}>Categorizing</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 1000,
  },
  overlay: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '85%',
  },
  spinner: {
    marginBottom: 25,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#AAA',
    fontSize: 14,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 3,
  },
  progressText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepActive: {
    backgroundColor: '#4A90E2',
  },
  stepText: {
    color: '#AAA',
    fontSize: 10,
    textAlign: 'center',
  },
  stepLine: {
    height: 2,
    backgroundColor: '#333',
    flex: 1,
    marginHorizontal: 5,
  },
});
