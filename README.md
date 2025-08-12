# Bolt Expo Starter - App de Análise Nutricional

Um aplicativo React Native/Expo que utiliza inteligência artificial para analisar alimentos através de fotos e fornecer informações nutricionais detalhadas.

## 🚀 Funcionalidades

- 📸 Captura de fotos de alimentos
- 🤖 Análise com IA usando OpenAI
- 📊 Exibição de dados nutricionais detalhados
- 🔍 Logs de debug para desenvolvimento
- ⚡ Interface moderna e responsiva

## 🛠️ Tecnologias

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **OpenAI API** - Análise de imagens com IA
- **React Navigation** - Navegação entre telas
- **Expo Camera** - Captura de fotos

## 📦 Instalação

1. **Clone o repositório:**
   ```bash
   git clone [URL_DO_SEU_REPOSITORIO]
   cd bolt-expo-starter
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure a API OpenAI:**
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione sua chave da API:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=sua_chave_aqui
   ```

4. **Execute o projeto:**
   ```bash
   npm run dev
   ```

## 🔧 Configuração da API

Veja o arquivo `README_API.md` para instruções detalhadas sobre como configurar a chave da API OpenAI.

## 📱 Como usar

1. Abra o aplicativo
2. Tire uma foto do alimento que deseja analisar
3. Aguarde a análise da IA
4. Visualize as informações nutricionais detalhadas

## 📊 Estrutura dos dados

O aplicativo retorna informações nutricionais no seguinte formato:

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

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Seu Nome - [seu-email@exemplo.com]

---

⭐ Se este projeto te ajudou, considere dar uma estrela! 