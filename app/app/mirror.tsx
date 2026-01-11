import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

export default function Mirror() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setAudioPermission(status === 'granted');
    })();
  }, []);

  const handlePressStart = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert(
          'Permesso Camera',
          'llucy ha bisogno della camera per mostrarti come uno specchio.'
        );
        return;
      }
    }

    if (!audioPermission) {
      Alert.alert(
        'Permesso Microfono',
        'llucy ha bisogno del microfono per ascoltare la tua voce.'
      );
      return;
    }

    // TODO: Start recording
    setIsRecording(!isRecording);
  };

  // Placeholder when no camera permission
  if (!cameraPermission?.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0a', '#1a0a1a']}
          style={styles.gradient}
        >
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Io sono llucy</Text>
            <Text style={styles.permissionText}>
              Per riflettere insieme, ho bisogno di{'\n'}
              vedere te e ascoltare te.
            </Text>
            <Pressable
              style={styles.permissionButton}
              onPress={requestCameraPermission}
            >
              <Text style={styles.permissionButtonText}>Continua</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera/Mirror */}
      <CameraView
        style={styles.camera}
        facing="front"
      >
        {/* Mirror Frame Overlay */}
        <LinearGradient
          colors={['rgba(184, 137, 94, 0.3)', 'transparent', 'rgba(139, 92, 246, 0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mirrorOverlay}
        />

        {/* llucy Voice Indicator */}
        <View style={styles.topBar}>
          <Text style={styles.llucyLabel}>llucy</Text>
          <Text style={styles.llucySubtext}>Io rifletto con te</Text>
        </View>

        {/* Recording Button */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={handlePressStart}
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
          >
            <View style={styles.recordButtonInner} />
          </Pressable>
          <Text style={styles.recordHint}>
            {isRecording ? 'Sto ascoltando...' : 'Tieni premuto per parlare'}
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradient: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 32,
    color: '#faf7f5',
    marginBottom: 24,
  },
  permissionText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  permissionButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  camera: {
    flex: 1,
  },
  mirrorOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  llucyLabel: {
    fontSize: 24,
    color: '#faf7f5',
    fontWeight: '300',
  },
  llucySubtext: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  recordHint: {
    fontSize: 14,
    color: '#aaa',
  },
});
