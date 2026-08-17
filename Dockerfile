FROM node:20-alpine
WORKDIR /app
RUN mkdir -p uploads
COPY package.json package-lock.json* ./
RUN npm ci --production
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
