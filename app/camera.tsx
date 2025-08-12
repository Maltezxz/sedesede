import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Camera, RotateCcw, Check } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export default function CameraScreen() {
  // Todos os hooks devem ser chamados primeiro, antes de qualquer return condicional
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photoTaken, setPhotoTaken] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const shutterScale = useSharedValue(1);
  const confirmScale = useSharedValue(1);

  // Hooks de animação devem ser chamados antes de qualquer return condicional
  const shutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterScale.value }],
  }));

  const confirmStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmScale.value }],
  }));

  const handlePermissionRequest = async () => {
    try {
      await requestPermission();
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
    }
  };

  // Agora podemos fazer verificações condicionais após todos os hooks
  if (!permission) {
    // Camera permissions are still loading - show loading state
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#ffffff" strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Câmera</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Inicializando câmera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#ffffff" strokeWidth={1.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Câmera</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#ffffff" strokeWidth={1} />
          <Text style={styles.permissionTitle}>
            Precisamos acessar sua câmera
          </Text>
          <Text style={styles.permissionText}>
            Para analisar os alimentos, precisamos{'\n'}
            da permissão para usar a câmera
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={handlePermissionRequest}
          >
            <Text style={styles.permissionButtonText}>
              Permitir Acesso
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      shutterScale.value = withSpring(0.9, {}, () => {
        shutterScale.value = withSpring(1);
      });
      
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        setPhotoTaken(true);
        
        // Navegar para análise com a imagem capturada
        setTimeout(() => {
          router.push({
            pathname: '/analysis',
            params: { imageUri: photo.uri }
          });
        }, 500);
      } catch (error) {
        console.error('Erro ao tirar foto:', error);
        Alert.alert('Erro', 'Não foi possível capturar a foto. Tente novamente.');
      }
    }
  };

  const confirmPhoto = () => {
    confirmScale.value = withSpring(0.95, {}, () => {
      confirmScale.value = withSpring(1);
    });
  };

  const retakePhoto = () => {
    setPhotoTaken(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escanear Alimento</Text>
        <TouchableOpacity 
          style={styles.flipButton} 
          onPress={toggleCameraFacing}
        >
          <RotateCcw size={20} color="#ffffff" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
        >
          {/* Camera Overlay */}
          <View style={styles.overlay}>
            {/* Top Instructions */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                {photoTaken 
                  ? 'Foto capturada! Confirme para analisar'
                  : 'Posicione o alimento no centro da tela'
                }
              </Text>
            </View>

            {/* Center Focus Area */}
            <View style={styles.focusArea}>
              <View style={styles.focusCorner} />
              <View style={[styles.focusCorner, styles.focusCornerTopRight]} />
              <View style={[styles.focusCorner, styles.focusCornerBottomLeft]} />
              <View style={[styles.focusCorner, styles.focusCornerBottomRight]} />
            </View>

            {/* Bottom Controls */}
            <View style={styles.controlsContainer}>
              {photoTaken ? (
                <View style={styles.photoControls}>
                  <TouchableOpacity 
                    style={styles.retakeButton}
                    onPress={retakePhoto}
                  >
                    <Text style={styles.retakeButtonText}>Repetir</Text>
                  </TouchableOpacity>
                  
                  <Animated.View style={confirmStyle}>
                    <TouchableOpacity 
                      style={styles.confirmButton}
                      onPress={confirmPhoto}
                    >
                      <Check size={24} color="#000000" strokeWidth={2} />
                      <Text style={styles.confirmButtonText}>Analisar</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              ) : (
                <Animated.View style={[styles.shutterContainer, shutterStyle]}>
                  <TouchableOpacity 
                    style={styles.shutterButton}
                    onPress={takePicture}
                  >
                    <View style={styles.shutterInner} />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </CameraView>
      </View>

      {/* Bottom Tip */}
      <View style={styles.tipContainer}>
        <Text style={styles.tipText}>
          💡 Dica: Mantenha o alimento bem iluminado para melhor precisão
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  flipButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#888888',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  cameraContainer: {
    flex: 1,
    margin: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#222222',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  instructionsContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  focusArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  focusCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#ffffff',
    borderWidth: 3,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    top: -60,
    left: -60,
  },
  focusCornerTopRight: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    top: -60,
    right: -60,
    left: 'auto',
  },
  focusCornerBottomLeft: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderTopWidth: 0,
    borderRightWidth: 0,
    bottom: -60,
    top: 'auto',
    left: -60,
  },
  focusCornerBottomRight: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    bottom: -60,
    right: -60,
    top: 'auto',
    left: 'auto',
  },
  controlsContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  shutterContainer: {
    alignItems: 'center',
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  photoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  retakeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  confirmButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  tipContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#000000',
  },
  tipText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
});