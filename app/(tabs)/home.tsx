import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { router } from 'expo-router';
import { Plus, Target } from 'lucide-react-native';
import { useState } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolate,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Modo desenvolvedor - remover antes do lançamento na App Store
const __DEV__ = true;

export default function Home() {
  const [userIsPremium, setUserIsPremium] = useState(false); // Mockado - pode ser alterado para testar
  const consumed = 1250;
  const goal = 2000;
  const percentage = (consumed / goal) * 100;
  
  const progress = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    progress.value = withTiming(percentage / 100, { duration: 1500 });
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = 377 * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const handlePlusPress = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    
    if (userIsPremium) {
      router.push('/camera');
    } else {
      router.push('/subscription');
    }
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const recentMeals = [
    { name: 'Café da manhã', calories: 420, time: '08:30' },
    { name: 'Almoço', calories: 680, time: '12:45' },
    { name: 'Lanche', calories: 150, time: '15:20' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Usuário!</Text>
          <Text style={styles.date}>Hoje, {new Date().toLocaleDateString('pt-BR')}</Text>
        </View>

        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardTitle}>Progresso Diário</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.circleContainer}>
              <Svg width="160" height="160" style={styles.progressRing}>
                <Circle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#333333"
                  strokeWidth="8"
                  fill="transparent"
                />
                <AnimatedCircle
                  cx="80"
                  cy="80"
                  r="60"
                  stroke="#ffffff"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="377"
                  strokeLinecap="round"
                  animatedProps={animatedProps}
                  transform="rotate(-90 80 80)"
                />
              </Svg>
              <View style={styles.progressText}>
                <Text style={styles.consumedText}>{consumed}</Text>
                <Text style={styles.kcalText}>kcal</Text>
              </View>
            </View>
          </View>

          <View style={styles.goalInfo}>
            <Text style={styles.goalText}>Meta: {goal} kcal</Text>
            <Text style={styles.percentageText}>{Math.round(percentage)}% da meta</Text>
          </View>
        </View>

        {/* Recent Meals */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Refeições Recentes</Text>
          {recentMeals.map((meal, index) => (
            <View key={index} style={styles.mealCard}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
              <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Botão de modo desenvolvedor - REMOVER ANTES DO LANÇAMENTO */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.devButton}
          onPress={() => setUserIsPremium(!userIsPremium)}
        >
          <Text style={styles.devButtonText}>
            {userIsPremium ? 'DEV: Premium ON' : 'DEV: Premium OFF'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Floating Action Button */}
      <Animated.View style={[styles.fab, buttonStyle]}>
        <TouchableOpacity style={styles.fabButton} onPress={handlePlusPress}>
          <Plus size={32} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#888888',
  },
  mainCard: {
    backgroundColor: '#111111',
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222222',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    transform: [{ rotate: '-90deg' }],
  },
  progressText: {
    position: 'absolute',
    alignItems: 'center',
  },
  consumedText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  kcalText: {
    fontSize: 14,
    color: '#888888',
    marginTop: -4,
  },
  goalInfo: {
    alignItems: 'center',
  },
  goalText: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  recentSection: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 14,
    color: '#888888',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabButton: {
    width: 64,
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devButton: {
    position: 'absolute',
    bottom: 200,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  devButtonText: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.7,
  },
});