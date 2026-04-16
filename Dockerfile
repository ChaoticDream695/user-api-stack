FROM node:24-alpine
# Métadonnées
LABEL maintainer="student-project"
LABEL description="User Management API"
LABEL version="1.0.0"
# Créer répertoire applicatif
WORKDIR /app
# Copier fichiers de dépendances
COPY package*.json ./
# Installer dépendances de production
RUN npm ci --only=production && \
npm cache clean --force
# Copier le code source
COPY . .
# Créer utilisateur non-root pour sécurité
RUN addgroup -S appgroup && \
adduser -S appuser -G appgroup && \
chown -R appuser:appgroup /app
# Basculer vers utilisateur non-root
USER appuser
# Exposer le port 3000
EXPOSE 3000
# Health check
HEALTHCHECK --interval=30s --timeout=3s \
CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
# Commande de démarrage
CMD ["node", "server.js"]