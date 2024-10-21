# Usar uma imagem base do Node.js
FROM node:18

# Definir o diretório de trabalho
WORKDIR /

# Copiar o package.json e package-lock.json para o diretório de trabalho
COPY package.json package-lock.json ./

# Instalar as dependências da aplicação
RUN npm install

# Copiar todo o restante do código da aplicação para o diretório de trabalho
COPY . .

# Expor a porta que a aplicação usará
EXPOSE 3010

# Comando para iniciar a aplicação
CMD ["npm", "run", "dev"]
