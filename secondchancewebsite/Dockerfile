FROM node:18.12.1-bullseye-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 9000
CMD ["node", "index.js"]
