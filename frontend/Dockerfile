# Estágio 1: Compilação (Build)
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Estágio 2: Produção (Servidor Web Nginx)
FROM nginx:alpine

# Copia os arquivos compilados do Vue para a pasta pública do Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]