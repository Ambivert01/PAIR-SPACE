FROM node:20-alpine

WORKDIR /app

# install dependencies first (layer cache)
COPY package*.json ./
COPY services/api/package*.json ./services/api/
RUN npm install --workspace=services/api --omit=dev

# copy source
COPY services/api ./services/api
COPY modules ./modules
COPY shared ./shared
COPY plugins ./plugins

# uploads directory
RUN mkdir -p services/api/uploads/profile \
             services/api/uploads/chat \
             services/api/uploads/memory \
             services/api/uploads/audio \
             services/api/uploads/video \
             services/api/uploads/temp

EXPOSE 5000

CMD ["node", "services/api/src/server.js"]
