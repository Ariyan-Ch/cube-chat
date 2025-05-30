# 1) Base image
FROM node:18-alpine

# 2) Create app dir
WORKDIR /app

# 3) Install deps
COPY package*.json ./
RUN npm install

# 4) Copy source
COPY . .

# 5) Expose dev server port
EXPOSE 8080

# 6) Start in dev mode
CMD ["npm", "run", "dev"]
