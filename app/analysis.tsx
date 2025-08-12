import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { ArrowLeft, Check, Camera } from 'lucide-react-native';
import { analyzeFood } from '../services/openai';
import { AnalysisResult } from '../types/nutrition';

export default function Analysis() {
  const [stage, setStage] = useState<'loading' | 'result'>('loading');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const params = useLocalSearchParams();
  const imageUri = params.imageUri as string;
  
  // Loading animations
  const loadingRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const dotOpacity1 = useSharedValue(0.3);
  const dotOpacity2 = useSharedValue(0.3);
  const dotOpacity3 = useSharedValue(0.3);
  
  // Result animations
  const resultOpacity = useSharedValue(0);
  const resultTranslateY = useSharedValue(50);

  useEffect(() => {
    // Set captured image from params
    if (imageUri) {
      setCapturedImage(imageUri);
    }

    // Start loading animations
    loadingRotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );
    
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );

    // Animated dots
    const animateDots = () => {
      dotOpacity1.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.3, { duration: 300 })
      );
      
      setTimeout(() => {
        dotOpacity2.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        );
      }, 200);
      
      setTimeout(() => {
        dotOpacity3.value = withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.3, { duration: 300 })
        );
      }, 400);
    };

    const interval = setInterval(animateDots, 1200);

    // Analyze the image with OpenAI
    const performAnalysis = async () => {
      try {
        if (imageUri) {
          console.log('Iniciando análise com URI:', imageUri);
          const result = await analyzeFood(imageUri);
          console.log('Resultado da análise:', result);
          setAnalysisData(result);
        } else {
          console.log('Nenhuma URI de imagem fornecida');
        }
      } catch (error) {
        console.error('Erro na análise:', error);
        Alert.alert('Erro', 'Não foi possível analisar a imagem. Tente novamente.');
      }
    };

    // Start analysis after a short delay
    setTimeout(async () => {
      clearInterval(interval);
      await performAnalysis();
      runOnJS(setStage)('result');
      
      // Animate result appearance
      resultOpacity.value = withTiming(1, { duration: 600 });
      resultTranslateY.value = withTiming(0, { duration: 600 });
    }, 3000);

    return () => clearInterval(interval);
  }, [imageUri]);

  const loadingRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dotOpacity1.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dotOpacity2.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dotOpacity3.value,
  }));

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
    transform: [{ translateY: resultTranslateY.value }],
  }));

  const mockResult = {
    foodName: 'Prato de Salada Caesar',
    calories: 680,
    macros: {
      protein: 28,
      carbs: 35,
      fat: 45,
    },
    sugar: 12,
    vitamins: ['A', 'C', 'K', 'Folato'],
    confidence: 92,
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
        <Text style={styles.headerTitle}>Análise IA</Text>
        <View style={styles.placeholder} />
      </View>

      {stage === 'loading' ? (
        /* Loading Stage */
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingCircle, pulseStyle]}>
            <Animated.View style={[styles.spinner, loadingRotationStyle]}>
              <Camera size={40} color="#ffffff" strokeWidth={1.5} />
            </Animated.View>
          </Animated.View>

          <Text style={styles.loadingTitle}>Analisando imagem...</Text>
          
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, dot1Style]} />
            <Animated.View style={[styles.dot, dot2Style]} />
            <Animated.View style={[styles.dot, dot3Style]} />
          </View>

          <Text style={styles.loadingSubtext}>
            Nossa IA está identificando os alimentos{'\n'}
            e calculando as informações nutricionais
          </Text>
        </View>
      ) : (
        /* Result Stage */
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.resultContainer, resultStyle]}>
            {/* Success Icon */}
            <View style={styles.successIcon}>
              <Check size={32} color="#ffffff" strokeWidth={2} />
            </View>

            {/* Food Image */}
            {capturedImage ? (
              <Image source={{ uri: capturedImage }} style={styles.foodImage} />
            ) : (
              <View style={styles.foodImagePlaceholder}>
                <Text style={styles.foodImageText}>🥗</Text>
              </View>
            )}

            {/* Food Information */}
            <Text style={styles.foodName}>
              {analysisData?.success && analysisData.data?.foodName 
                ? analysisData.data.foodName 
                : mockResult.foodName}
            </Text>
            <Text style={styles.confidenceText}>
              {analysisData?.success && analysisData.data?.confidence 
                ? `${analysisData.data.confidence}% de precisão`
                : `${mockResult.confidence}% de precisão`}
            </Text>

            {/* Calories */}
            <View style={styles.caloriesCard}>
              <Text style={styles.caloriesNumber}>
                {analysisData?.success && analysisData.data?.calories 
                  ? analysisData.data.calories 
                  : mockResult.calories}
              </Text>
              <Text style={styles.caloriesLabel}>kcal estimadas</Text>
            </View>

            {/* Macros */}
            <View style={styles.macrosContainer}>
              <Text style={styles.macrosTitle}>Macronutrientes</Text>
              
              <View style={styles.macrosGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>
                    {analysisData?.success && analysisData.data?.macros?.protein 
                      ? analysisData.data.macros.protein 
                      : mockResult.macros.protein}g
                  </Text>
                  <Text style={styles.macroLabel}>Proteínas</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>
                    {analysisData?.success && analysisData.data?.macros?.carbs 
                      ? analysisData.data.macros.carbs 
                      : mockResult.macros.carbs}g
                  </Text>
                  <Text style={styles.macroLabel}>Carboidratos</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>
                    {analysisData?.success && analysisData.data?.macros?.fat 
                      ? analysisData.data.macros.fat 
                      : mockResult.macros.fat}g
                  </Text>
                  <Text style={styles.macroLabel}>Gorduras</Text>
                </View>
              </View>
            </View>

            {/* Sugar */}
            <View style={styles.sugarContainer}>
              <Text style={styles.sugarTitle}>Açúcar</Text>
              <View style={styles.sugarCard}>
                <Text style={styles.sugarValue}>
                  {analysisData?.success && analysisData.data?.sugar 
                    ? analysisData.data.sugar 
                    : mockResult.sugar}g
                </Text>
                <Text style={styles.sugarLabel}>açúcar total</Text>
              </View>
            </View>

            {/* Vitamins */}
            <View style={styles.vitaminsContainer}>
              <Text style={styles.vitaminsTitle}>Vitaminas Principais</Text>
              <View style={styles.vitaminsGrid}>
                {(analysisData?.success && analysisData.data?.vitamins 
                  ? analysisData.data.vitamins 
                  : mockResult.vitamins)?.map((vitamin: string, index: number) => (
                  <View key={index} style={styles.vitaminItem}>
                    <Text style={styles.vitaminText}>Vitamina {vitamin}</Text>
                  </View>
                ))}
              </View>
            </View>

           

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => router.back()}
              >
                <Text style={styles.saveButtonText}>Adicionar ao Histórico</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => setStage('loading')}
              >
                <Text style={styles.retryButtonText}>Analisar Novamente</Text>
              </TouchableOpacity>
            </View>

            {/* Disclaimer */}
            {(!analysisData || !analysisData.success) && (
              <Text style={styles.disclaimer}>
                {analysisData?.error || '⚠️ Configure sua chave OpenAI no arquivo .env para análise real'}
              </Text>
            )}
          </Animated.View>
        </ScrollView>
      )}
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
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingCircle: {
    width: 120,
    height: 120,
    backgroundColor: '#111111',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#222222',
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
  },
  resultContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#22c55e',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  foodImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 24,
  },
  foodImagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#111111',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222222',
  },
  foodImageText: {
    fontSize: 80,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 14,
    color: '#22c55e',
    textAlign: 'center',
    marginBottom: 24,
  },
  caloriesCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222222',
  },
  caloriesNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#888888',
    marginTop: 4,
  },
  macrosContainer: {
    marginBottom: 32,
  },
  macrosTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  macroItem: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
  },
  sugarContainer: {
    marginBottom: 24,
  },
  sugarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  sugarCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  sugarValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sugarLabel: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  vitaminsContainer: {
    marginBottom: 32,
  },
  vitaminsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  vitaminsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  vitaminItem: {
    backgroundColor: '#111111',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#222222',
  },
  vitaminText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  saveButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  retryButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  disclaimer: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
  debugContainer: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#222222',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
});