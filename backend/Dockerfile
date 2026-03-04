# 1. Imagem base de Node.js
FROM node:18-bullseye

# 2. Instalar dependências de sistema (FFmpeg e Python)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 3. Instalar o OpenAI Whisper e Torch (CPU version)
RUN pip3 install --no-cache-dir openai-whisper setuptools-rust
# O Whisper vai baixar os modelos automaticamente na primeira execução, 
# mas se quiser "pré-baixar" o modelo (ex: 'base'), rodaria um comando aqui.

# 4. Configurar diretório de trabalho
WORKDIR /app

# 5. Copiar arquivos do projeto
COPY package*.json ./
RUN npm install

# 6. Copiar o restante do código
COPY . .

# 7. Criar pastas temporárias para transcrição
RUN mkdir -p tmp/transcriptions && chmod 777 tmp/transcriptions

# 8. Porta do backend
EXPOSE 3001

# 9. Comando para rodar
CMD ["npm", "start"]
