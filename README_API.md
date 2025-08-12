# Configuração da API OpenAI

## Como configurar a chave da API

1. **Obtenha sua chave da API OpenAI:**
   - Acesse: https://platform.openai.com/api-keys
   - Faça login ou crie uma conta
   - Clique em "Create new secret key"
   - Copie a chave gerada

2. **Configure no projeto:**
   - Crie um arquivo `.env` na raiz do projeto (mesmo nível do package.json)
   - Adicione a seguinte linha:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sua_chave_aqui
   ```
   - Substitua `sua_chave_aqui` pela chave real que você copiou

3. **Exemplo do arquivo .env:**
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sk-1234567890abcdef...
   ```

4. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

## Debug

O app agora inclui logs detalhados para debug. Você pode ver:

- Status da configuração da API
- Processamento da imagem
- Resposta da OpenAI
- Dados analisados

## Funcionalidades

- ✅ Captura de fotos
- ✅ Análise com IA
- ✅ Exibição de dados nutricionais
- ✅ Logs de debug
- ✅ Tratamento de erros

## Estrutura dos dados retornados

```json
{
  "foodName": "Nome do alimento",
  "calories": 300,
  "macros": {
    "protein": 20,
    "carbs": 30,
    "fat": 10
  },
  "sugar": 5,
  "vitamins": ["A", "C", "D"],
  "confidence": 85
}
``` 