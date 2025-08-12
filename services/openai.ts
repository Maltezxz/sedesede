import OpenAI from 'openai';
import * as FileSystem from 'expo-file-system';
import { NutritionData, AnalysisResult } from '../types/nutrition';

// Verificar se a chave da API está disponível
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
}) : null;

export async function analyzeFood(imageUri: string): Promise<AnalysisResult> {
  try {
    console.log('=== INICIANDO ANÁLISE DE ALIMENTO ===');
    console.log('URI da imagem:', imageUri);
    
    if (!apiKey) {
      console.error('❌ Chave da API OpenAI não configurada');
      return {
        success: false,
        error: 'Chave da API OpenAI não configurada. Configure EXPO_PUBLIC_OPENAI_API_KEY no arquivo .env',
      };
    }

    if (!openai) {
      console.error('❌ Cliente OpenAI não inicializado');
      return {
        success: false,
        error: 'Cliente OpenAI não inicializado',
      };
    }

    console.log('✅ Chave da API configurada, lendo arquivo da imagem...');
    
    // Verificar se o arquivo existe
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      console.error('❌ Arquivo de imagem não encontrado:', imageUri);
      return {
        success: false,
        error: 'Arquivo de imagem não encontrado',
      };
    }

    console.log('✅ Arquivo encontrado, tamanho:', fileInfo.size, 'bytes');
    
    // Converter imagem para base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('✅ Imagem convertida para base64, tamanho:', base64Image.length, 'caracteres');

    console.log('🔄 Enviando para OpenAI...');
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analise esta imagem de alimento e retorne APENAS um JSON válido com as seguintes informações nutricionais:

{
  "foodName": "nome do alimento identificado",
  "calories": número_de_calorias_estimadas,
  "macros": {
    "protein": gramas_de_proteína,
    "carbs": gramas_de_carboidratos,
    "fat": gramas_de_gordura
  },
  "sugar": gramas_de_açúcar,
  "vitamins": ["lista", "das", "principais", "vitaminas"],
  "confidence": porcentagem_de_confiança_na_análise
}

Seja preciso nas estimativas baseando-se no tamanho aparente da porção. Retorne APENAS o JSON, sem texto adicional.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    console.log('✅ Resposta recebida da OpenAI');
    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('❌ Resposta vazia da OpenAI');
      throw new Error('Resposta vazia da OpenAI');
    }

    console.log('📄 Conteúdo da resposta:', content);

    // Limpar e processar a resposta
    let cleanedContent = content.trim();
    
    // Remover possíveis caracteres especiais no início e fim
    cleanedContent = cleanedContent.replace(/^[`'"]+|[`'"]+$/g, '');
    
    // Tentar encontrar JSON válido na resposta
    let jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Não foi possível encontrar JSON válido na resposta:', cleanedContent);
      throw new Error('Resposta não contém JSON válido');
    }
    
    let jsonString = jsonMatch[0];
    
    try {
      // Parse do JSON retornado
      const nutritionData: NutritionData = JSON.parse(jsonString);
      
      // Validação básica dos dados
      if (!nutritionData.foodName || typeof nutritionData.calories !== 'number') {
        console.error('❌ Dados inválidos retornados pela IA:', nutritionData);
        throw new Error('Dados inválidos retornados pela IA');
      }

      console.log('✅ Análise concluída com sucesso:', nutritionData);

      return {
        success: true,
        data: nutritionData,
      };
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', parseError);
      console.error('❌ JSON tentado:', jsonString);
      throw new Error(`Erro ao processar resposta da IA: ${parseError instanceof Error ? parseError.message : 'Erro desconhecido'}`);
    }

  } catch (error) {
    console.error('❌ Erro na análise OpenAI:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido na análise',
    };
  }
}