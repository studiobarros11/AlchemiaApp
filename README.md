
# Alchemia - Codex de Reação

Este é o suplemento digital oficial para o RPG **Alchemia: A Ordem dos Elementos**.

## 🚀 Como Rodar Localmente

Para visualizar o app no seu computador, você não deve abrir o `index.html` diretamente. Siga estes passos:

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Abra a pasta do projeto no seu terminal.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o link que aparecerá no terminal (geralmente `http://localhost:5173`).

## 🌐 Como Fazer o Deploy (Colocar na Internet)

1. Crie um repositório no seu GitHub e suba todos os arquivos.
2. Acesse [Vercel.com](https://vercel.com) e conecte sua conta do GitHub.
3. Importe este repositório.
4. **IMPORTANTE:** Nas configurações de "Environment Variables" da Vercel, adicione:
   - Key: `API_KEY`
   - Value: (Sua chave do Google Gemini)
5. Clique em **Deploy**.

## 🛠 Tecnologias
- React 19 + TypeScript
- Tailwind CSS (Estilização)
- Lucide React (Ícones)
- Google Gemini AI (Comentários do Mestre)
- Vite (Build Tool)
