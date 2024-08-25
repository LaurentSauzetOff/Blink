# Utiliser l'image officielle Node.js comme image de base
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json dans le conteneur
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du projet dans le conteneur
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Exposer le port sur lequel l'application va écouter
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "run", "dev"]
