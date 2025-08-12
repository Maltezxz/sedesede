export interface NutritionData {
  foodName: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  sugar: number;
  vitamins: string[];
  confidence: number;
}

export interface AnalysisResult {
  success: boolean;
  data?: NutritionData;
  error?: string;
}</parameter>