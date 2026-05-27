FROM node:20-alpine

WORKDIR /usr/src/app

# Copia apenas os arquivos de dependências primeiro (otimiza o cache do Docker)
COPY package*.json ./

RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

EXPOSE 3000